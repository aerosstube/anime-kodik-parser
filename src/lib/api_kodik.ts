import { KodikParser } from './parser_kodik';
import { AnimeResult, SearchResponse } from '../types';

// --- Константы (enums) ---

export enum OrderList {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortList {
    YEAR = 'year',
    CREATED_AT = 'created_at',
    UPDATED_AT = 'updated_at',
    KINOPOISK_RATING = 'kinopoisk_rating',
    IMDB_RATING = 'imdb_rating',
    SHIKIMORI_RATING = 'shikimori_rating',
}

export enum AnimeKind {
    TV = 'tv',
    TV13 = 'tv13',
    TV24 = 'tv24',
    TV48 = 'tv48',
    MOVIE = 'movie',
    SPECIAL = 'special',
    OVA = 'ova',
    ONA = 'ona',
    MUSIC = 'music',
}

export enum Types {
    FOREIGN_MOVIE = 'foreign-movie',
    SOVIET_CARTOON = 'soviet-cartoon',
    FOREIGN_CARTOON = 'foreign-cartoon',
    RUSSIAN_CARTOON = 'russian-cartoon',
    ANIME = 'anime',
    RUSSIAN_MOVIE = 'russian-movie',
    CARTOON_SERIAL = 'cartoon-serial',
    DOCUMENTARY_SERIAL = 'documentary-serial',
    RUSSIAN_SERIAL = 'russian-serial',
    FOREIGN_SERIAL = 'foreign-serial',
    ANIME_SERIAL = 'anime-serial',
    MULTI_PART_FILM = 'multi-part-film',
}

export enum AnimeGenres {
    MILITARY = 'Военное',
    DRAMA = 'Драма',
    HISTORY = 'Исторический',
    ACTION = 'Экшен',
    ADVENTURES = 'Приключения',
    SENEN = 'Сёнен',
    FANTASY = 'Фэнтези',
    COMEDY = 'Комедия',
    MARTIAL_ARTS = 'Боевые искусства',
    ROMANCE = 'Романтика',
    PSYCHOLOGICAL = 'Психологическое',
    THRILLER = 'Триллер',
    EVERYDAY_LIFE = 'Повседневность',
    SUPERNATURAL = 'Сверхъестественное',
    SPORT = 'Спорт',
    SCHOOL = 'Школа',
    MUSIC = 'Музыка',
    FANTASTIKA = 'Фантастика',
    SAMURAI = 'Самураи',
}

// --- API Response ---

export class Response {
    public readonly total: number;
    public readonly time: string;
    public readonly results: AnimeResult[];

    constructor(rawData: Record<string, unknown>) {
        this.total = (rawData['total'] as number) ?? 0;
        this.time = (rawData['time'] as string) ?? '';
        const rawResults = rawData['results'];
        this.results = Array.isArray(rawResults) ? rawResults as AnimeResult[] : [];
    }
}

// --- API Builder ---

export class Api {
    static Order = OrderList;
    static Sort = SortList;
    static AnimeKind = AnimeKind;
    static Types = Types;
    static AnimeGenres = AnimeGenres;

    protected token: string | null;
    protected allow_warnings: boolean;
    protected args: Record<string, unknown>;
    protected endpoint: string | null;

    constructor(
        token: string | null = null,
        allow_warnings: boolean = true,
        _args: Record<string, unknown> = {},
        _endpoint: string | null = null,
    ) {
        this.token = token;
        this.allow_warnings = allow_warnings;
        this.args = _args;
        this.endpoint = _endpoint;
    }

    title(value: string): this {
        this.args['title'] = value;
        return this;
    }

    limit(value: number = 50): this {
        this.args['limit'] = value;
        return this;
    }

    year(value: number): this {
        this.args['year'] = value;
        return this;
    }

    anime_kind(kind: string): this {
        this.args['anime_kind'] = kind;
        return this;
    }

    genres(values: string[]): this {
        this.args['genres'] = values;
        return this;
    }

    anime_genres(values: string[]): this {
        this.args['anime_genres'] = values;
        return this;
    }

    shikimori_id(id: string): this {
        this.args['shikimori_id'] = id;
        return this;
    }

    kinopoisk_id(id: string): this {
        this.args['kinopoisk_id'] = id;
        return this;
    }

    imdb_id(id: string): this {
        this.args['imdb_id'] = id;
        return this;
    }

    async execute_async(return_json: boolean = false): Promise<SearchResponse> {
        const parser = new KodikParser(this.token);
        const data = await parser.apiRequest(this.endpoint || 'search', this.args);

        if (return_json) {
            return data as unknown as SearchResponse;
        }

        return new Response(data) as unknown as SearchResponse;
    }

    execute(): SearchResponse {
        throw new Error('Синхронный execute не поддерживается. Используйте execute_async');
    }
}

// --- Specialized builders ---

export class KodikSearch extends Api {
    constructor(
        token: string | null = null,
        allow_warnings: boolean = true,
        _args: Record<string, unknown> = {},
    ) {
        super(token, allow_warnings, _args, 'search');
    }
}

export class KodikList extends Api {
    constructor(
        token: string | null = null,
        allow_warnings: boolean = true,
        _args: Record<string, unknown> = {},
    ) {
        super(token, allow_warnings, _args, 'list');
    }

    sort(value: string): this {
        this.args['sort'] = value;
        return this;
    }

    order(value: string): this {
        this.args['order'] = value;
        return this;
    }
}
