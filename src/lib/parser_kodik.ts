import axios, { AxiosResponse } from 'axios';
import { load, CheerioAPI, Cheerio } from 'cheerio';
import type { AnyNode } from 'domhandler';
import * as base64 from 'base-64';
import {
    TokenError,
    ServiceError,
    PostArgumentsError,
    NoResults,
    UnexpectedBehavior,
    DecryptionFailure,
} from './errors';
import { AnimeResult, Translation, AnimeInfo, IdType } from '../types';

// --- Internal types ---

interface UrlParams {
    d: string;
    d_sign: string;
    pd: string;
    pd_sign: string;
    ref_sign: string;
}

interface VideoLinks {
    [quality: string]: Array<{ src: string }>;
}

interface VideoData {
    links: VideoLinks;
}

// --- Constants ---

const KODIK_API_BASE = 'https://kodikapi.com';
const KODIK_PLAYER_BASE = 'https://kodik.info';
const KODIK_DB_BASE = 'https://kodikdb.com';
const TOKEN_SCRIPT_URL = 'https://kodik-add.com/add-players.min.js?v=2';

const VALID_ENDPOINTS = ['search', 'list', 'translations'] as const;
const VALID_ID_TYPES: IdType[] = ['shikimori', 'kinopoisk', 'imdb'];
const ANIME_TYPES = ['anime-serial', 'anime'];

const KNOWN_FIELDS = new Set([
    'title', 'type', 'year', 'screenshots', 'translation',
    'shikimori_id', 'kinopoisk_id', 'imdb_id', 'worldart_link',
    'id', 'link', 'title_orig', 'other_title', 'created_at',
    'updated_at', 'quality', 'material_data',
]);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// --- Helpers ---

function toStringId(id: string | number): string {
    if (typeof id === 'number') return id.toString();
    if (typeof id === 'string') return id;

    throw new PostArgumentsError(`Для id ожидался тип string или number, получен "${typeof id}"`);
}

function extractBetween(text: string, startMarker: string, endMarker: string): string | null {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return null;

    const valueStart = startIdx + startMarker.length;
    const endIdx = text.indexOf(endMarker, valueStart);
    if (endIdx === -1) return null;

    return text.substring(valueStart, endIdx);
}

// --- Main parser ---

export class KodikParser {
    private readonly TOKEN: string;
    private readonly USE_LXML: boolean;
    private _crypt_step: number | null = null;

    constructor(token: string | null = null, use_lxml: boolean = false) {
        if (!token) {
            throw new ServiceError(
                'Токен должен быть передан в конструктор или используйте createParser()',
            );
        }

        this.TOKEN = token;
        this.USE_LXML = use_lxml;
    }

    // --- Public API methods ---

    async apiRequest(
        endpoint: string,
        filters: Record<string, unknown> = {},
        parameters: Record<string, unknown> = {},
    ): Promise<Record<string, unknown>> {
        if (!(VALID_ENDPOINTS as readonly string[]).includes(endpoint)) {
            throw new PostArgumentsError(
                `Неизвестный эндпоинт. Ожидался один из: ${VALID_ENDPOINTS.join(', ')}. Получен: "${endpoint}"`,
            );
        }

        if (!this.TOKEN) {
            throw new TokenError('Токен kodik не указан');
        }

        const payload = { token: this.TOKEN, ...filters, ...parameters };
        const url = `${KODIK_API_BASE}/${endpoint}`;

        let data: Record<string, unknown>;

        try {
            const resp: AxiosResponse = await axios.post(
                url,
                new URLSearchParams(payload as Record<string, string>),
            );
            data = resp.data;
        } catch (e) {
            const status = (e as { response?: { status?: number } }).response?.status ?? 'нет ответа';

            throw new ServiceError(
                `Ошибка при запросе к kodik api. Код: "${status}"`,
                { cause: e },
            );
        }

        this.validateApiResponse(data);

        return data;
    }

    async search(
        title: string,
        limit: number | null = null,
        include_material_data: boolean = true,
        anime_status: string | null = null,
        strict: boolean = false,
        only_anime: boolean = false,
    ): Promise<AnimeResult[]> {
        const searchData = await this.baseSearch(
            title, limit ?? 50, include_material_data, anime_status, strict,
        );

        return this.prettifyData(searchData['results'] as Record<string, unknown>[], only_anime);
    }

    async searchById(
        id: string | number,
        id_type: IdType,
        limit: number | null = null,
    ): Promise<AnimeResult[]> {
        const idStr = toStringId(id);
        const searchData = await this.baseSearchById(idStr, id_type, limit ?? 50, true);

        return this.prettifyData(searchData['results'] as Record<string, unknown>[]);
    }

    async getList(
        limit_per_page: number = 50,
        pages_to_parse: number = 1,
        include_material_data: boolean = true,
        anime_status: string | null = null,
        only_anime: boolean = false,
        start_from: string | null = null,
    ): Promise<[AnimeResult[], string | null]> {
        let allResults: Record<string, unknown>[] = [];
        let nextPage: string | null = start_from;

        const payload: Record<string, string> = {
            token: this.TOKEN,
            limit: limit_per_page.toString(),
            with_material_data: include_material_data ? 'true' : 'false',
        };

        if (anime_status === 'released' || anime_status === 'ongoing') {
            payload['anime_status'] = anime_status;
        }

        for (let i = 0; i < pages_to_parse; i++) {
            if (nextPage) {
                payload['next'] = nextPage;
            }

            let data: Record<string, unknown>;

            try {
                data = await this.apiRequest('list', payload);
            } catch (e) {
                if (e instanceof NoResults) {
                    data = { results: [] };
                } else {
                    throw e;
                }
            }

            nextPage = this.extractNextPage(data);
            allResults = allResults.concat(data['results'] as Record<string, unknown>[]);
        }

        return [this.prettifyData(allResults, only_anime), nextPage];
    }

    async getInfo(id: string | number, id_type: IdType): Promise<AnimeInfo> {
        const idStr = toStringId(id);
        const link = await this.fetchPlayerLink(idStr, id_type);
        const html = await this.fetchHtml(link, 'Ошибка при получении страницы данных');
        const $ = this.parseHtml(html);

        if (this.isSerial(link)) {
            return this.parseSerialInfo($);
        }

        if (this.isVideo(link)) {
            return this.parseVideoInfo($);
        }

        throw new UnexpectedBehavior('Ссылка не распознана как ссылка на сериал или фильм');
    }

    async translations(id: string | number, id_type: IdType): Promise<Translation[]> {
        const info = await this.getInfo(id, id_type);

        return info.translations;
    }

    async seriesCount(id: string | number, id_type: IdType): Promise<number> {
        const info = await this.getInfo(id, id_type);

        return info.series_count;
    }

    async getLink(
        id: string | number,
        id_type: IdType,
        seria_num: number,
        translation_id: string | number,
    ): Promise<[string, number]> {
        const idStr = toStringId(id);
        const seriaNum = this.parseSeriaNum(seria_num);
        const translationIdStr = toStringId(translation_id);

        const playerLink = await this.fetchPlayerLink(idStr, id_type);
        let html = await this.fetchHtml(playerLink, 'Ошибка при получении страницы данных');
        let $ = this.parseHtml(html);

        const urlParams = this.extractUrlParams(html);

        if (translationIdStr !== '0') {
            const resolved = this.resolveTranslation($, translationIdStr, seriaNum);

            if (resolved) {
                html = await this.fetchHtml(resolved.url, 'Ошибка при получении страницы серии');
                $ = this.parseHtml(html);
            }
        }

        const videoInfo = this.extractVideoInfo($);
        const [linkData, maxQuality] = await this.fetchVideoLink(videoInfo, urlParams, $);
        const downloadUrl = String(linkData).replace('https:', '').slice(0, -25);

        return [downloadUrl, maxQuality];
    }

    static async getToken(): Promise<string> {
        let data: string;

        try {
            const resp: AxiosResponse = await axios.get(TOKEN_SCRIPT_URL);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении токена', { cause: e });
        }

        const token = extractBetween(data, "token=", '"');

        if (!token) {
            const tokenAlt = extractBetween(data, 'token="', '"');

            if (!tokenAlt) {
                throw new ServiceError('token не найден в скрипте');
            }

            return tokenAlt;
        }

        return token.startsWith('"') ? token.substring(1) : token;
    }

    // --- Search helpers ---

    private async baseSearch(
        title: string,
        limit: number,
        include_material_data: boolean,
        anime_status: string | null,
        strict: boolean,
    ): Promise<Record<string, unknown>> {
        const payload: Record<string, string> = {
            title: strict ? title + ' ' : title,
            limit: limit.toString(),
            with_material_data: include_material_data ? 'true' : 'false',
            strict: strict ? 'true' : 'false',
        };

        if (anime_status === 'released' || anime_status === 'ongoing') {
            payload['anime_status'] = anime_status;
        }

        try {
            return await this.apiRequest('search', payload);
        } catch (e) {
            if (e instanceof NoResults) {
                throw new NoResults(`По запросу "${title}" ничего не найдено`);
            }

            throw e;
        }
    }

    private async baseSearchById(
        id: string,
        id_type: IdType,
        limit: number,
        include_material_data: boolean,
    ): Promise<Record<string, unknown>> {
        if (!VALID_ID_TYPES.includes(id_type)) {
            throw new PostArgumentsError(
                `Поддерживаются только id: ${VALID_ID_TYPES.join(', ')}. Получено: ${id_type}`,
            );
        }

        try {
            return await this.apiRequest('search', {
                [`${id_type}_id`]: id,
                limit: limit.toString(),
                with_material_data: include_material_data ? 'true' : 'false',
            });
        } catch (e) {
            if (e instanceof NoResults) {
                throw new NoResults(`По id ${id_type} "${id}" ничего не найдено`);
            }

            throw e;
        }
    }

    // --- Data formatting ---

    private prettifyData(
        results: Record<string, unknown>[],
        only_anime: boolean = false,
    ): AnimeResult[] {
        const data: AnimeResult[] = [];
        const seenTitles = new Set<string>();

        for (const res of results) {
            const type = res['type'] as string;

            if (only_anime && !ANIME_TYPES.includes(type)) {
                continue;
            }

            const title = res['title'] as string;

            if (seenTitles.has(title)) {
                continue;
            }

            seenTitles.add(title);

            const additionalData: Record<string, unknown> = {};

            for (const key in res) {
                if (!KNOWN_FIELDS.has(key)) {
                    additionalData[key] = res[key];
                }
            }

            data.push({
                title,
                title_orig: res['title_orig'] as string,
                other_title: (res['other_title'] as string | null) ?? null,
                type,
                year: res['year'] as number,
                screenshots: res['screenshots'] as string[],
                shikimori_id: (res['shikimori_id'] as string | null) ?? null,
                kinopoisk_id: (res['kinopoisk_id'] as string | null) ?? null,
                imdb_id: (res['imdb_id'] as string | null) ?? null,
                worldart_link: (res['worldart_link'] as string | null) ?? null,
                additional_data: additionalData,
                material_data: (res['material_data'] as Record<string, unknown>) ?? null,
                link: res['link'] as string,
            });
        }

        return data;
    }

    // --- Player page helpers ---

    private async fetchPlayerLink(id: string, id_type: IdType): Promise<string> {
        if (!this.TOKEN) {
            throw new TokenError('Токен kodik не указан');
        }

        const idParamMap: Record<IdType, string> = {
            shikimori: 'shikimoriID',
            kinopoisk: 'kinopoiskID',
            imdb: 'imdbID',
        };

        const paramName = idParamMap[id_type];

        if (!paramName) {
            throw new PostArgumentsError(`Неизвестный тип id: ${id_type}`);
        }

        const findUrl = encodeURIComponent(
            `https://${KODIK_DB_BASE.replace('https://', '')}/find-player?${paramName}=${id}`,
        );
        const url = `${KODIK_API_BASE}/get-player?title=Player&hasPlayer=false&url=${findUrl}&token=${this.TOKEN}&${paramName}=${id}`;

        let data: Record<string, unknown>;

        try {
            const resp: AxiosResponse = await axios.get(url);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении ссылки на данные', { cause: e });
        }

        if ('error' in data && data['error'] === 'Отсутствует или неверный токен') {
            throw new TokenError('Отсутствует или неверный токен');
        }

        if ('error' in data) {
            throw new ServiceError(data['error'] as string);
        }

        if (!data['found']) {
            throw new NoResults(`Нет данных по ${id_type} id "${id}"`);
        }

        return 'https:' + (data['link'] as string);
    }

    private async fetchHtml(url: string, errorMessage: string): Promise<string> {
        try {
            const resp: AxiosResponse = await axios.get(url);

            return resp.data;
        } catch (e) {
            throw new ServiceError(errorMessage, { cause: e });
        }
    }

    private parseHtml(html: string): CheerioAPI {
        return this.USE_LXML
            ? load(html, { xmlMode: true })
            : load(html);
    }

    // --- Content type detection ---

    private isSerial(iframeUrl: string): boolean {
        const idx = iframeUrl.indexOf('.info/');

        return idx !== -1 && idx + 6 < iframeUrl.length && iframeUrl[idx + 6] === 's';
    }

    private isVideo(iframeUrl: string): boolean {
        const idx = iframeUrl.indexOf('.info/');

        return idx !== -1 && idx + 6 < iframeUrl.length && iframeUrl[idx + 6] === 'v';
    }

    // --- Info parsing ---

    private parseSerialInfo($: CheerioAPI): AnimeInfo {
        const seriesCount = $('div.serial-series-box select option').length;
        const translationsDiv = $('div.serial-translations-box select option');

        return {
            series_count: seriesCount,
            translations: this.parseTranslations(translationsDiv, $),
        };
    }

    private parseVideoInfo($: CheerioAPI): AnimeInfo {
        const translationsDiv = $('div.movie-translations-box select option');

        return {
            series_count: 0,
            translations: this.parseTranslations(translationsDiv, $),
        };
    }

    private parseTranslations(elements: Cheerio<AnyNode>, $: CheerioAPI): Translation[] {
        if (!elements || elements.length === 0) {
            return [{ id: '0', title: 'Неизвестно', type: 'Неизвестно', is_voice: false }];
        }

        const translations: Translation[] = [];

        elements.each(function (this: AnyNode) {
            const el = $(this);
            const rawType = el.attr('data-translation-type');

            const type = rawType === 'voice'
                ? 'озвучка'
                : rawType === 'subtitles'
                    ? 'субтитры'
                    : 'Неизвестно';

            translations.push({
                id: el.attr('data-id') || '0',
                title: el.text().trim(),
                type,
                is_voice: type === 'озвучка',
            });
        });

        return translations;
    }

    // --- Link extraction ---

    private parseSeriaNum(value: number | string): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'string' && /^\d+$/.test(value)) return parseInt(value, 10);

        throw new PostArgumentsError(`Для seria_num ожидался тип number, получен "${typeof value}"`);
    }

    private extractUrlParams(html: string): UrlParams {
        const paramsStr = extractBetween(html, "urlParams = '", "';");

        if (!paramsStr) {
            throw new UnexpectedBehavior('urlParams не найден на странице');
        }

        return JSON.parse(paramsStr) as UrlParams;
    }

    private resolveTranslation(
        $: CheerioAPI,
        translationId: string,
        seriaNum: number,
    ): { url: string } | null {
        const isSerial = seriaNum !== 0;

        const selector = isSerial
            ? 'div.serial-translations-box select'
            : 'div.movie-translations-box select';

        const contentType = isSerial ? 'serial' : 'video';
        const container = $(selector);

        let mediaHash: string | null = null;
        let mediaId: string | null = null;

        container.find('option').each(function (this: AnyNode) {
            const el = $(this);

            if (el.attr('data-id') === translationId) {
                mediaHash = el.attr('data-media-hash') || null;
                mediaId = el.attr('data-media-id') || null;
            }
        });

        if (!mediaId || !mediaHash) {
            return null;
        }

        const url = `${KODIK_PLAYER_BASE}/${contentType}/${mediaId}/${mediaHash}/720p?min_age=16&first_url=false&season=1&episode=${seriaNum}`;

        return { url };
    }

    private extractVideoInfo(
        $: CheerioAPI,
    ): { type: string; hash: string; id: string; scriptUrl: string } {
        const scriptUrl = $('script').eq(1).attr('src') || '';
        const scriptText = $('script').eq(4).text();

        const videoType = extractBetween(scriptText, ".type = '", "'");
        const videoHash = extractBetween(scriptText, ".hash = '", "'");
        const videoId = extractBetween(scriptText, ".id = '", "'");

        if (!videoType || !videoHash || !videoId) {
            throw new UnexpectedBehavior('Не удалось извлечь video type/hash/id из скрипта');
        }

        return { type: videoType, hash: videoHash, id: videoId, scriptUrl };
    }

    private async fetchVideoLink(
        videoInfo: { type: string; hash: string; id: string; scriptUrl: string },
        urlParams: UrlParams,
        $: CheerioAPI,
    ): Promise<[string, number]> {
        const params = {
            hash: videoInfo.hash,
            id: videoInfo.id,
            type: videoInfo.type,
            d: urlParams.d,
            d_sign: urlParams.d_sign,
            pd: urlParams.pd,
            pd_sign: urlParams.pd_sign,
            ref: '',
            ref_sign: urlParams.ref_sign,
            bad_user: 'true',
            cdn_is_working: 'true',
        };

        const postLink = await this.getPostLink(videoInfo.scriptUrl);

        let data: VideoData;

        try {
            const resp: AxiosResponse = await axios.post(
                `${KODIK_PLAYER_BASE}${postLink}`,
                new URLSearchParams(params),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
            );
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении ссылки на видео', { cause: e });
        }

        if (!data.links || !data.links['360'] || !data.links['360'][0]) {
            throw new UnexpectedBehavior('Ответ не содержит ссылки на видео в ожидаемом формате');
        }

        const rawUrl = data.links['360'][0].src;
        const url = rawUrl.includes('mp4:hls:manifest.m3u8') ? rawUrl : this.decryptUrl(rawUrl);
        const maxQuality = Math.max(...Object.keys(data.links).map(q => parseInt(q, 10)));

        return [url, maxQuality];
    }

    // --- Decryption ---

    private decryptChar(char: string, shift: number): string {
        const isLower = char === char.toLowerCase();
        const upper = char.toUpperCase();
        const idx = ALPHABET.indexOf(upper);

        if (idx === -1) {
            return char;
        }

        const shifted = ALPHABET[(idx + shift) % ALPHABET.length];

        return isLower ? shifted.toLowerCase() : shifted;
    }

    private decryptUrl(encoded: string): string {
        if (this._crypt_step !== null) {
            const result = this.tryDecrypt(encoded, this._crypt_step);

            if (result) {
                return result;
            }
        }

        for (let shift = 0; shift < 26; shift++) {
            const result = this.tryDecrypt(encoded, shift);

            if (result) {
                this._crypt_step = shift;

                return result;
            }
        }

        throw new DecryptionFailure('Не удалось расшифровать ссылку');
    }

    private tryDecrypt(encoded: string, shift: number): string | null {
        const rotated = Array.from(encoded).map(ch => this.decryptChar(ch, shift)).join('');
        const padding = (4 - (rotated.length % 4)) % 4;
        const padded = rotated + '='.repeat(padding);

        try {
            const decoded = base64.decode(padded);

            return decoded.includes('mp4:hls:manifest.m3u8') ? decoded : null;
        } catch {
            return null;
        }
    }

    // --- Script parsing ---

    private async getPostLink(scriptUrl: string): Promise<string> {
        let data: string;

        try {
            const resp: AxiosResponse = await axios.get(`${KODIK_PLAYER_BASE}${scriptUrl}`);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении post link', { cause: e });
        }

        const ajaxIdx = data.indexOf('$.ajax');

        if (ajaxIdx === -1) {
            throw new UnexpectedBehavior('$.ajax не найден в скрипте');
        }

        const encodedUrl = data.substring(ajaxIdx + 30, data.indexOf('cache:!1') - 3);

        return base64.decode(encodedUrl);
    }

    // --- Validation ---

    private validateApiResponse(data: Record<string, unknown>): void {
        if ('error' in data && data['error'] === 'Отсутствует или неверный токен') {
            throw new TokenError('Отсутствует или неверный токен');
        }

        if ('error' in data) {
            throw new ServiceError(data['error'] as string);
        }

        if (data['total'] === 0) {
            throw new NoResults('Сервер вернул ответ с пустым списком результатов.');
        }
    }

    private extractNextPage(data: Record<string, unknown>): string | null {
        if (!('next_page' in data) || !data['next_page']) {
            return null;
        }

        const nextPageUrl = data['next_page'] as string;
        const eqIdx = nextPageUrl.lastIndexOf('=');

        return eqIdx !== -1 ? nextPageUrl.substring(eqIdx + 1) : null;
    }
}
