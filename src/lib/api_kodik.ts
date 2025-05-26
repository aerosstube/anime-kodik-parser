import { KodikParser } from './parser_kodik';
import { AnimeResult, SearchResponse } from '../types';

export class OrderList {
    static readonly ASC = 'asc';
    static readonly DESC = 'desc';

    static getList(): string[] {
        return [OrderList.ASC, OrderList.DESC];
    }
}

export class SortList {
    static readonly YEAR = 'year';
    static readonly CREATED_AT = 'created_at';
    static readonly UPDATED_AT = 'updated_at';
    static readonly KINOPOISK_RATING = 'kinopoisk_rating';
    static readonly IMDB_RATING = 'imdb_rating';
    static readonly SHIKIMORI_RATING = 'shikimori_rating';

    static getList(): string[] {
        return [
            SortList.YEAR, SortList.CREATED_AT, SortList.UPDATED_AT,
            SortList.KINOPOISK_RATING, SortList.IMDB_RATING, SortList.SHIKIMORI_RATING
        ];
    }
}

export class AnimeKind {
    static readonly TV = 'tv';
    static readonly TV13 = 'tv13';
    static readonly TV24 = 'tv24';
    static readonly TV48 = 'tv48';
    static readonly MOVIE = 'movie';
    static readonly SPECIAL = 'special';
    static readonly OVA = 'ova';
    static readonly ONA = 'ona';
    static readonly MUSIC = 'music';

    static getList(): string[] {
        return [
            AnimeKind.TV, AnimeKind.TV13, AnimeKind.TV24, AnimeKind.TV48,
            AnimeKind.MOVIE, AnimeKind.SPECIAL, AnimeKind.OVA, AnimeKind.ONA, AnimeKind.MUSIC
        ];
    }
}

export class Types {
    static readonly FOREIGN_MOVIE = "foreign-movie";
    static readonly SOVIET_CARTOON = "soviet-cartoon";
    static readonly FOREIGN_CARTOON = "foreign-cartoon";
    static readonly RUSSIAN_CARTOON = "russian-cartoon";
    static readonly ANIME = "anime";
    static readonly RUSSIAN_MOVIE = "russian-movie";
    static readonly CARTOON_SERIAL = "cartoon-serial";
    static readonly DOCUMENTARY_SERIAL = "documentary-serial";
    static readonly RUSSIAN_SERIAL = "russian-serial";
    static readonly FOREIGN_SERIAL = "foreign-serial";
    static readonly ANIME_SERIAL = "anime-serial";
    static readonly MULTI_PART_FILM = "multi-part-film";

    static getList(): string[] {
        return [
            Types.FOREIGN_MOVIE, Types.SOVIET_CARTOON, Types.FOREIGN_CARTOON, Types.RUSSIAN_CARTOON, Types.ANIME,
            Types.RUSSIAN_MOVIE, Types.CARTOON_SERIAL, Types.DOCUMENTARY_SERIAL, Types.RUSSIAN_SERIAL,
            Types.FOREIGN_SERIAL, Types.ANIME_SERIAL, Types.MULTI_PART_FILM
        ];
    }
}

export class AnimeGenres {
    static readonly MILITARY = "Военное";
    static readonly DRAMA = "Драма";
    static readonly HISTORY = "Исторический";
    static readonly ACTION = "Экшен";
    static readonly ADVENTURES = "Приключения";
    static readonly SENEN = "Сёнен";
    static readonly FANTASY = "Фэнтези";
    static readonly COMEDY = "Комедия";
    static readonly MARTIAL_ARTS = "Боевые искусства";
    static readonly ROMANCE = "Романтика";
    static readonly PSYCHOLOGICAL = "Психологическое";
    static readonly THRILLER = "Триллер";
    static readonly EVERYDAY_LIFE = "Повседневность";
    static readonly SUPERNATURAL = "Сверхъестественное";
    static readonly SPORT = "Спорт";
    static readonly SCHOOL = "Школа";
    static readonly MUSIC = "Музыка";
    static readonly FANTASTIKA = "Фантастика";
    static readonly SAMURAI = "Самураи";

    static getList(): string[] {
        return [
            AnimeGenres.MILITARY, AnimeGenres.DRAMA, AnimeGenres.HISTORY, AnimeGenres.ACTION,
            AnimeGenres.ADVENTURES, AnimeGenres.SENEN, AnimeGenres.FANTASY, AnimeGenres.COMEDY,
            AnimeGenres.MARTIAL_ARTS, AnimeGenres.ROMANCE, AnimeGenres.PSYCHOLOGICAL, AnimeGenres.THRILLER,
            AnimeGenres.EVERYDAY_LIFE, AnimeGenres.SUPERNATURAL, AnimeGenres.SPORT, AnimeGenres.SCHOOL,
            AnimeGenres.MUSIC, AnimeGenres.FANTASTIKA, AnimeGenres.SAMURAI
        ];
    }
}

export class Response {
    public total: number;
    public time: string;
    private _results: AnimeResult[] = [];

    constructor(raw_data: Record<string, unknown>) {
        this.total = raw_data['total'] as number;
        this.time = raw_data['time'] as string;
        this.results = raw_data['results'] as Record<string, unknown>[];
    }

    get results(): AnimeResult[] {
        return this._results;
    }

    set results(value: Record<string, unknown>[]) {
        if (value == null || value === undefined) {
            this._results = [];
        } else {
            this._results = (value as unknown) as AnimeResult[];
        }
    }
}

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

    constructor(token: string | null = null, allow_warnings: boolean = true, _args: Record<string, unknown> = {}, _endpoint: string | null = null) {
        this.token = token;
        this.allow_warnings = allow_warnings;
        this.args = _args;
        this.endpoint = _endpoint;
    }

    title(title: string): this {
        this.args['title'] = title;
        return this;
    }

    limit(limit: number = 50): this {
        this.args['limit'] = limit;
        return this;
    }

    year(year: number): this {
        this.args['year'] = year;
        return this;
    }

    anime_kind(kind: string): this {
        this.args['anime_kind'] = kind;
        return this;
    }

    genres(genres: string[]): this {
        this.args['genres'] = genres;
        return this;
    }

    anime_genres(genres: string[]): this {
        this.args['anime_genres'] = genres;
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
            return (data as unknown) as SearchResponse;
        }
        
        return (new Response(data) as unknown) as SearchResponse;
    }

    execute(return_json: boolean = false): SearchResponse {
        throw new Error('Синхронный execute не поддерживается в TypeScript версии. Используйте execute_async');
    }
}

export class KodikSearch extends Api {
    constructor(token: string | null = null, allow_warnings: boolean = true, _args: Record<string, unknown> = {}) {
        super(token, allow_warnings, _args, 'search');
    }
}

export class KodikList extends Api {
    constructor(token: string | null = null, allow_warnings: boolean = true, _args: Record<string, unknown> = {}) {
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