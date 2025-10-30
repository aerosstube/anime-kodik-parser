import axios, { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import {
	TokenError,
	ServiceError,
	PostArgumentsError,
	NoResults,
	UnexpectedBehavior,
	DecryptionFailure
} from './errors';
import { AnimeResult, Translation, AnimeInfo, IdType } from '../types';
const base64 = require('base-64');

interface UrlParams {
    d: string;
    d_sign: string;
    pd: string;
    pd_sign: string;
    ref_sign: string;
}

interface VideoData {
    links: {
        [quality: string]: Array<{ src: string }>;
    };
}

export class KodikParser {
    private readonly LXML_WORKS: boolean = true;
    private readonly TOKEN: string;
    private readonly USE_LXML: boolean;
    private _crypt_step: number | null = null;

    /**
     * Парсер для плеера Kodik
     */
    constructor(token: string | null = null, use_lxml: boolean = false) {
        if (token === null) {
            try {
                // В TypeScript мы не можем вызвать статический метод в конструкторе синхронно
                // Поэтому требуем передачи токена или используем createParser
                throw new ServiceError('Токен должен быть передан в конструктор или используйте createParser()');
            } catch (ex) {
                throw new ServiceError('Произошла ошибка при попытке автоматического получения токена kodik', { cause: ex });
            }
        }
        this.TOKEN = token;
        if (!this.LXML_WORKS && use_lxml) {
            throw new Error('Параметр use_lxml установлен в true, однако при попытке импорта lxml произошла ошибка');
        }
        this.USE_LXML = use_lxml;
    }

    async apiRequest(endpoint: string, filters: Record<string, unknown> = {}, parameters: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
        if (!['search', 'list', 'translations'].includes(endpoint)) {
            throw new PostArgumentsError(`Неизвестный эндпоинт. Ожидался один из "search", "list", "translations". Получен: "${endpoint}"`);
        }
        if (!this.TOKEN) {
            throw new TokenError('Токен kodik не указан');
        }
        const payload = { token: this.TOKEN, ...filters, ...parameters };
        const url = `https://kodikapi.com/${endpoint}`;
        let data: Record<string, unknown>;
        try {
            const resp: AxiosResponse = await axios.post(url, new URLSearchParams(payload));
            data = resp.data;
        } catch (e: unknown) {
            const error = e as { response?: { status?: string } };
            throw new ServiceError(`Произошла ошибка при запросе к kodik api. Ожидался код "200", получен: "${error.response?.status || 'нет ответа'}"`, { cause: e });
        }
        if ('error' in data && data['error'] === 'Отсутствует или неверный токен') {
            throw new TokenError('Отсутствует или неверный токен');
        } else if ('error' in data) {
            throw new ServiceError(data['error'] as string);
        }
        if (data['total'] === 0) {
            throw new NoResults('Сервер вернул ответ с пустым списком результатов.');
        }
        return data;
    }

    async baseSearch(
        title: string, 
        limit: number = 50, 
        include_material_data: boolean = true, 
        anime_status: string | null = null, 
        strict: boolean = false
    ): Promise<Record<string, unknown>> {
        try {
            const payload: Record<string, string> = {
                title: strict ? title + ' ' : title,
                limit: limit.toString(),
                with_material_data: include_material_data ? 'true' : 'false',
                strict: strict ? 'true' : 'false'
            };
            if (anime_status === 'released' || anime_status === 'ongoing') {
                payload['anime_status'] = anime_status;
            }
            const data = await this.apiRequest('search', payload);
            return data;
        } catch (e) {
            if (e instanceof NoResults) {
                throw new NoResults(`По запросу "${title}" ничего не найдено`);
            }
            throw e;
        }
    }

    async baseSearchById(
        id: string, 
        id_type: IdType, 
        limit: number = 50, 
        include_material_data: boolean = true
    ): Promise<Record<string, unknown>> {
        if (!['shikimori', 'kinopoisk', 'imdb'].includes(id_type)) {
            throw new PostArgumentsError(`Поддерживаются только id shikimori, kinopoisk, imdb. Получено: ${id_type}`);
        }
        try {
            const data = await this.apiRequest('search', {
                [`${id_type}_id`]: id,
                limit: limit.toString(),
                with_material_data: include_material_data ? 'true' : 'false'
            });
            return data;
        } catch (e) {
            if (e instanceof NoResults) {
                throw new NoResults(`По id ${id_type} "${id}" ничего не найдено`);
            }
            throw e;
        }
    }

    async getList(
        limit_per_page: number = 50,
        pages_to_parse: number = 1,
        include_material_data: boolean = true,
        anime_status: string | null = null,
        only_anime: boolean = false,
        start_from: string | null = null
    ): Promise<[AnimeResult[], string | null]> {
        let results: Record<string, unknown>[] = [];
        let next_page: string | null = start_from;
        const payload: Record<string, string> = {
            token: this.TOKEN,
            limit: limit_per_page.toString(),
            with_material_data: include_material_data ? 'true' : 'false'
        };
        if (anime_status === 'released' || anime_status === 'ongoing') {
            payload['anime_status'] = anime_status;
        }
        for (let i = 0; i < pages_to_parse; i++) {
            if (next_page !== null && next_page !== undefined) {
                payload['next'] = next_page;
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
            if ('next_page' in data) {
                next_page = (data['next_page'] as string).substring((data['next_page'] as string).lastIndexOf('=') + 1);
            } else {
                next_page = null;
            }
            results = results.concat(data['results'] as Record<string, unknown>[]);
        }
        return [await this._prettifyData(results, only_anime), next_page];
    }

    async search(
        title: string,
        limit: number | null = null,
        include_material_data: boolean = true,
        anime_status: string | null = null,
        strict: boolean = false,
        only_anime: boolean = false
    ): Promise<AnimeResult[]> {
        let search_data: Record<string, unknown>;
        if (limit === null || limit === undefined) {
            search_data = await this.baseSearch(title, 50, include_material_data, anime_status, strict);
        } else {
            search_data = await this.baseSearch(title, limit, include_material_data, anime_status, strict);
        }
        return await this._prettifyData(search_data['results'] as Record<string, unknown>[], only_anime);
    }

    async searchById(id: string | number, id_type: IdType, limit: number | null = null): Promise<AnimeResult[]> {
        let idStr: string;
        if (typeof id === 'number') {
            idStr = id.toString();
        } else if (typeof id === 'string') {
            idStr = id;
        } else {
            throw new Error(`Для id ожидался тип string или number, получен "${typeof id}"`);
        }
        let search_data: Record<string, unknown>;
        if (limit === null || limit === undefined) {
            search_data = await this.baseSearchById(idStr, id_type, 50, true);
        } else {
            search_data = await this.baseSearchById(idStr, id_type, limit, true);
        }
        return await this._prettifyData(search_data['results'] as Record<string, unknown>[]);
    }

    private async _prettifyData(results: Record<string, unknown>[], only_anime: boolean = false): Promise<AnimeResult[]> {
        const data: AnimeResult[] = [];
        const added_titles: string[] = [];
        for (const res of results) {
            if (only_anime && !['anime-serial', 'anime'].includes(res['type'] as string)) {
                continue;
            }
            if (!added_titles.includes(res['title'] as string)) {
                const additional_data: Record<string, unknown> = {};
                for (const k in res) {
                    if (!['title', 'type', 'year', 'screenshots', 'translation',
                        'shikimori_id', 'kinopoisk_id', 'imdb_id', 'worldart_link',
                        'id', 'link', 'title_orig', 'other_title', 'created_at',
                        'updated_at', 'quality', 'material_data', 'link'].includes(k)) {
                        additional_data[k] = res[k];
                    }
                }
                data.push({
                    title: res['title'] as string,
                    title_orig: res['title_orig'] as string,
                    other_title: 'other_title' in res ? res['other_title'] as string | null : null,
                    type: res['type'] as string,
                    year: res['year'] as number,
                    screenshots: res['screenshots'] as string[],
                    shikimori_id: 'shikimori_id' in res ? res['shikimori_id'] as string | null : null,
                    kinopoisk_id: 'kinopoisk_id' in res ? res['kinopoisk_id'] as string | null : null,
                    imdb_id: 'imdb_id' in res ? res['imdb_id'] as string | null : null,
                    worldart_link: 'worldart_link' in res ? res['worldart_link'] as string | null : null,
                    additional_data: additional_data,
                    material_data: 'material_data' in res ? res['material_data'] : null,
                    link: res['link'] as string
                });
                added_titles.push(res['title'] as string);
            }
        }
        return data;
    }

    async translations(id: string | number, id_type: IdType): Promise<Translation[]> {
        const info = await this.getInfo(id, id_type);
        return info.translations;
    }

    async seriesCount(id: string | number, id_type: IdType): Promise<number> {
        const info = await this.getInfo(id, id_type);
        return info.series_count;
    }

    private async _linkToInfo(id: string, id_type: IdType, https: boolean = true): Promise<string> {
        if (!this.TOKEN) {
            throw new TokenError('Токен kodik не указан');
        }
        let serv: string;
        if (id_type === 'shikimori') {
            serv = `https://kodikapi.com/get-player?title=Player&hasPlayer=false&url=https%3A%2F%2Fkodikdb.com%2Ffind-player%3FshikimoriID%3D${id}&token=${this.TOKEN}&shikimoriID=${id}`;
        } else if (id_type === 'kinopoisk') {
            serv = `https://kodikapi.com/get-player?title=Player&hasPlayer=false&url=https%3A%2F%2Fkodikdb.com%2Ffind-player%3FkinopoiskID%3D${id}&token=${this.TOKEN}&kinopoiskID=${id}`;
        } else if (id_type === 'imdb') {
            serv = `https://kodikapi.com/get-player?title=Player&hasPlayer=false&url=https%3A%2F%2Fkodikdb.com%2Ffind-player%3FkinopoiskID%3D${id}&token=${this.TOKEN}&imdbID=${id}`;
        } else {
            throw new Error('Неизвестный тип id');
        }
        let data: Record<string, unknown>;
        try {
            const resp: AxiosResponse = await axios.get(serv);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении ссылки на данные', { cause: e });
        }
        if ('error' in data && data['error'] === 'Отсутствует или неверный токен') {
            throw new TokenError('Отсутствует или неверный токен');
        } else if ('error' in data) {
            throw new ServiceError(data['error'] as string);
        }
        if (!data['found']) {
            throw new NoResults(`Нет данных по ${id_type} id "${id}"`);
        }
        return (https ? 'https:' : 'http:') + (data['link'] as string);
    }

    async getInfo(id: string | number, id_type: IdType): Promise<AnimeInfo> {
        let idStr: string;
        if (typeof id === 'number') {
            idStr = id.toString();
        } else if (typeof id === 'string') {
            idStr = id;
        } else {
            throw new Error(`Для id ожидался тип string или number, получен "${typeof id}"`);
        }
        const link = await this._linkToInfo(idStr, id_type);
        let data: string;
        try {
            const resp: AxiosResponse = await axios.get(link);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении страницы данных', { cause: e });
        }
        let $: ReturnType<typeof load>;
        if (this.USE_LXML) {
            $ = load(data, { xmlMode: true });
        } else {
            $ = load(data);
        }
        if (this._isSerial(link)) {
            let series_count = 0;
            try {
                series_count = $('div.serial-series-box select option').length;
            } catch (e) {
                series_count = 0;
            }
            let translations_div: ReturnType<ReturnType<typeof load>> | null;
            try {
                translations_div = $('div.serial-translations-box select option');
            } catch (e) {
                translations_div = null;
            }
            return {
                series_count: series_count,
                translations: this._generateTranslationsDict(translations_div || $(''), $)
            };
        } else if (this._isVideo(link)) {
            let translations_div: ReturnType<ReturnType<typeof load>> | null;
            try {
                translations_div = $('div.movie-translations-box select option');
            } catch (e) {
                translations_div = null;
            }
            return {
                series_count: 0,
                translations: this._generateTranslationsDict(translations_div || $(''), $)
            };
        } else {
            throw new UnexpectedBehavior('Ссылка на данные не была распознана как ссылка на сериал или фильм');
        }
    }

    private _isSerial(iframe_url: string): boolean {
        const idx = iframe_url.indexOf('.info/');
        if (idx === -1 || idx + 6 >= iframe_url.length) return false;
        return iframe_url[idx + 6] === 's';
    }

    private _isVideo(iframe_url: string): boolean {
        const idx = iframe_url.indexOf('.info/');
        if (idx === -1 || idx + 6 >= iframe_url.length) return false;
        return iframe_url[idx + 6] === 'v';
    }

    private _generateTranslationsDict(translations_div: ReturnType<ReturnType<typeof load>>, $: ReturnType<typeof load>): Translation[] {
        if (translations_div && translations_div.length > 0) {
            const translations: Translation[] = [];
            translations_div.each(function (this: any) {
                const translation = $(this);
                let type = translation.attr('data-translation-type');
                if (type === 'voice') {
                    type = 'озвучка';
                } else if (type === 'subtitles') {
                    type = 'субтитры';
                }
                translations.push({
                    id: translation.attr('data-id') || '0',
                    title: translation.text().trim(),
                    type: type || 'Неизвестно',
                    is_voice: type === 'озвучка'
                });
            });
            return translations;
        } else {
            return [{ id: '0', title: 'Неизвестно', type: 'Неизвестно', is_voice: false }];
        }
    }

    async getLink(
        id: string | number, 
        id_type: IdType, 
        seria_num: number, 
        translation_id: string | number
    ): Promise<[string, number]> {
        let idStr: string;
        if (typeof id === 'number') {
            idStr = id.toString();
        } else if (typeof id === 'string') {
            idStr = id;
        } else {
            throw new Error(`Для id ожидался тип string или number, получен "${typeof id}"`);
        }
        
        let seriaNum: number;
        if (typeof seria_num === 'string' && /^\d+$/.test(seria_num)) {
            seriaNum = parseInt(seria_num, 10);
        } else if (typeof seria_num === 'number') {
            seriaNum = seria_num;
        } else {
            throw new Error(`Для seria_num ожидался тип number, получен "${typeof seria_num}"`);
        }
        
        let translationIdStr: string;
        if (typeof translation_id === 'number') {
            translationIdStr = translation_id.toString();
        } else if (typeof translation_id === 'string') {
            translationIdStr = translation_id;
        } else {
            throw new Error(`Для translation_id ожидался тип string или number, получен "${typeof translation_id}"`);
        }

        const link = await this._linkToInfo(idStr, id_type);
        let data: string;
        try {
            const resp: AxiosResponse = await axios.get(link);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении страницы данных', { cause: e });
        }
        let $: ReturnType<typeof load>;
        if (this.USE_LXML) {
            $ = load(data, { xmlMode: true });
        } else {
            $ = load(data);
        }
        let urlParamsIdx = data.indexOf('urlParams');
        let urlParams: UrlParams;
        if (urlParamsIdx !== -1) {
            let urlParamsStr = data.substring(urlParamsIdx + 13);
            urlParamsStr = urlParamsStr.substring(0, urlParamsStr.indexOf(';') - 1);
            urlParams = JSON.parse(urlParamsStr);
        } else {
            throw new UnexpectedBehavior('urlParams не найден');
        }
        let container: ReturnType<ReturnType<typeof load>>, media_hash: string | null, media_id: string | null, url: string, soup: ReturnType<typeof load>, script_url: string;
        if (translationIdStr !== '0' && seriaNum !== 0) {
            container = $('div.serial-translations-box select');
            media_hash = null;
            media_id = null;
            container.find('option').each(function (this: any) {
                if ($(this).attr('data-id') === translationIdStr) {
                    media_hash = $(this).attr('data-media-hash') || null;
                    media_id = $(this).attr('data-media-id') || null;
                }
            });
            url = `https://kodik.info/serial/${media_id}/${media_hash}/720p?min_age=16&first_url=false&season=1&episode=${seriaNum}`;
            const resp2: AxiosResponse = await axios.get(url);
            data = resp2.data;
            if (this.USE_LXML) {
                soup = load(data, { xmlMode: true });
            } else {
                soup = load(data);
            }
        } else if (translationIdStr !== '0' && seriaNum === 0) {
            container = $('div.movie-translations-box select');
            media_hash = null;
            media_id = null;
            container.find('option').each(function (this: any) {
                if ($(this).attr('data-id') === translationIdStr) {
                    media_hash = $(this).attr('data-media-hash') || null;
                    media_id = $(this).attr('data-media-id') || null;
                }
            });
            url = `https://kodik.info/video/${media_id}/${media_hash}/720p?min_age=16&first_url=false&season=1&episode=${seriaNum}`;
            const resp2: AxiosResponse = await axios.get(url);
            data = resp2.data;
            if (this.USE_LXML) {
                soup = load(data, { xmlMode: true });
            } else {
                soup = load(data);
            }
        } else {
            soup = $;
        }
        script_url = soup('script').eq(1).attr('src') || '';
        const hash_container = soup('script').eq(4).text();
        let video_type = hash_container.substring(hash_container.indexOf(".type = '") + 9);
        video_type = video_type.substring(0, video_type.indexOf("'"));
        let video_hash = hash_container.substring(hash_container.indexOf(".hash = '") + 9);
        video_hash = video_hash.substring(0, video_hash.indexOf("'"));
        let video_id = hash_container.substring(hash_container.indexOf(".id = '") + 7);
        video_id = video_id.substring(0, video_id.indexOf("'"));
        const [link_data, max_quality] = await this._getLinkWithData(video_type, video_hash, video_id, urlParams, script_url);
        const download_url = String(link_data).replace('https:', '').slice(0, -25);
        return [download_url, max_quality];
    }

    private async _getLinkWithData(
        video_type: string, 
        video_hash: string, 
        video_id: string, 
        urlParams: UrlParams, 
        script_url: string
    ): Promise<[string, number]> {
        const params = {
            hash: video_hash,
            id: video_id,
            type: video_type,
            d: urlParams.d,
            d_sign: urlParams.d_sign,
            pd: urlParams.pd,
            pd_sign: urlParams.pd_sign,
            ref: '',
            ref_sign: urlParams.ref_sign,
            bad_user: 'true',
            cdn_is_working: 'true'
        };
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const post_link = await this._getPostLink(script_url);
        let data: VideoData;
        try {
            const resp: AxiosResponse = await axios.post(`https://kodik.info${post_link}`, new URLSearchParams(params), { headers: headers });
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении ссылки на видео', { cause: e });
        }
        const data_url = data.links['360'][0].src;
        let url: string;
        if (data_url.includes('mp4:hls:manifest.m3u8')) {
            url = data_url;
        } else {
            url = this._convert(data_url);
        }
        const max_quality = Math.max(...Object.keys(data.links).map(x => parseInt(x, 10)));
        return [url, max_quality];
    }

    private _convertChar(char: string, num: number): string {
        const low = char === char.toLowerCase();
        const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (alph.includes(char.toUpperCase())) {
            let ch = alph[(alph.indexOf(char.toUpperCase()) + num) % alph.length];
            return low ? ch.toLowerCase() : ch;
        } else {
            return char;
        }
    }

    private _convert(string: string): string {
        if (this._crypt_step !== null) {
            let crypted_url = Array.from(string).map(i => this._convertChar(i, this._crypt_step!)).join('');
            let padding = (4 - (crypted_url.length % 4)) % 4;
            crypted_url += '='.repeat(padding);
            try {
                let result = base64.decode(crypted_url);
                if (result.includes('mp4:hls:manifest.m3u8')) {
                    return result;
                }
            } catch (e) {}
        }
        for (let rot = 0; rot < 26; rot++) {
            let crypted_url = Array.from(string).map(i => this._convertChar(i, rot)).join('');
            let padding = (4 - (crypted_url.length % 4)) % 4;
            crypted_url += '='.repeat(padding);
            try {
                let result = base64.decode(crypted_url);
                if (result.includes('mp4:hls:manifest.m3u8')) {
                    this._crypt_step = rot;
                    return result;
                }
            } catch (e) {
                continue;
            }
        }
        throw new DecryptionFailure('Не удалось расшифровать ссылку');
    }

    private async _getPostLink(script_url: string): Promise<string> {
        let data: string;
        try {
            const resp: AxiosResponse = await axios.get('https://kodik.info' + script_url);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении post link');
        }
        let idx = data.indexOf('$.ajax');
        if (idx === -1) throw new UnexpectedBehavior('$.ajax не найден');
        let url = data.substring(idx + 30, data.indexOf('cache:!1') - 3);
        return base64.decode(url);
    }

    static async getToken(): Promise<string> {
        const script_url = 'https://kodik-add.com/add-players.min.js?v=2';
        let data: string;
        try {
            const resp: AxiosResponse = await axios.get(script_url);
            data = resp.data;
        } catch (e) {
            throw new ServiceError('Ошибка при получении токена');
        }
        let idx = data.indexOf('token=');
        if (idx === -1) throw new ServiceError('token не найден');
        let token = data.substring(idx + 6 + 1);
        token = token.substring(0, token.indexOf('"'));
        return token;
    }
} 