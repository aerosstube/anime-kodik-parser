import { AnimeResult, SearchResponse } from '../types';
export declare class OrderList {
    static readonly ASC = "asc";
    static readonly DESC = "desc";
    static getList(): string[];
}
export declare class SortList {
    static readonly YEAR = "year";
    static readonly CREATED_AT = "created_at";
    static readonly UPDATED_AT = "updated_at";
    static readonly KINOPOISK_RATING = "kinopoisk_rating";
    static readonly IMDB_RATING = "imdb_rating";
    static readonly SHIKIMORI_RATING = "shikimori_rating";
    static getList(): string[];
}
export declare class AnimeKind {
    static readonly TV = "tv";
    static readonly TV13 = "tv13";
    static readonly TV24 = "tv24";
    static readonly TV48 = "tv48";
    static readonly MOVIE = "movie";
    static readonly SPECIAL = "special";
    static readonly OVA = "ova";
    static readonly ONA = "ona";
    static readonly MUSIC = "music";
    static getList(): string[];
}
export declare class Types {
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
    static getList(): string[];
}
export declare class AnimeGenres {
    static readonly MILITARY = "\u0412\u043E\u0435\u043D\u043D\u043E\u0435";
    static readonly DRAMA = "\u0414\u0440\u0430\u043C\u0430";
    static readonly HISTORY = "\u0418\u0441\u0442\u043E\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439";
    static readonly ACTION = "\u042D\u043A\u0448\u0435\u043D";
    static readonly ADVENTURES = "\u041F\u0440\u0438\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F";
    static readonly SENEN = "\u0421\u0451\u043D\u0435\u043D";
    static readonly FANTASY = "\u0424\u044D\u043D\u0442\u0435\u0437\u0438";
    static readonly COMEDY = "\u041A\u043E\u043C\u0435\u0434\u0438\u044F";
    static readonly MARTIAL_ARTS = "\u0411\u043E\u0435\u0432\u044B\u0435 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0430";
    static readonly ROMANCE = "\u0420\u043E\u043C\u0430\u043D\u0442\u0438\u043A\u0430";
    static readonly PSYCHOLOGICAL = "\u041F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0435";
    static readonly THRILLER = "\u0422\u0440\u0438\u043B\u043B\u0435\u0440";
    static readonly EVERYDAY_LIFE = "\u041F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u043E\u0441\u0442\u044C";
    static readonly SUPERNATURAL = "\u0421\u0432\u0435\u0440\u0445\u044A\u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435";
    static readonly SPORT = "\u0421\u043F\u043E\u0440\u0442";
    static readonly SCHOOL = "\u0428\u043A\u043E\u043B\u0430";
    static readonly MUSIC = "\u041C\u0443\u0437\u044B\u043A\u0430";
    static readonly FANTASTIKA = "\u0424\u0430\u043D\u0442\u0430\u0441\u0442\u0438\u043A\u0430";
    static readonly SAMURAI = "\u0421\u0430\u043C\u0443\u0440\u0430\u0438";
    static getList(): string[];
}
export declare class Response {
    total: number;
    time: string;
    private _results;
    constructor(raw_data: Record<string, unknown>);
    get results(): AnimeResult[];
    set results(value: Record<string, unknown>[]);
}
export declare class Api {
    static Order: typeof OrderList;
    static Sort: typeof SortList;
    static AnimeKind: typeof AnimeKind;
    static Types: typeof Types;
    static AnimeGenres: typeof AnimeGenres;
    protected token: string | null;
    protected allow_warnings: boolean;
    protected args: Record<string, unknown>;
    protected endpoint: string | null;
    constructor(token?: string | null, allow_warnings?: boolean, _args?: Record<string, unknown>, _endpoint?: string | null);
    title(title: string): this;
    limit(limit?: number): this;
    year(year: number): this;
    anime_kind(kind: string): this;
    genres(genres: string[]): this;
    anime_genres(genres: string[]): this;
    shikimori_id(id: string): this;
    kinopoisk_id(id: string): this;
    imdb_id(id: string): this;
    execute_async(return_json?: boolean): Promise<SearchResponse>;
    execute(return_json?: boolean): SearchResponse;
}
export declare class KodikSearch extends Api {
    constructor(token?: string | null, allow_warnings?: boolean, _args?: Record<string, unknown>);
}
export declare class KodikList extends Api {
    constructor(token?: string | null, allow_warnings?: boolean, _args?: Record<string, unknown>);
    sort(value: string): this;
    order(value: string): this;
}
//# sourceMappingURL=api_kodik.d.ts.map