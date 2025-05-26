/**
 * Типы и интерфейсы для anime-parser-kodik
 */
export interface AnimeResult {
    title: string;
    title_orig: string;
    other_title: string | null;
    type: string;
    year: number;
    screenshots: string[];
    shikimori_id: string | null;
    kinopoisk_id: string | null;
    imdb_id: string | null;
    worldart_link: string | null;
    additional_data: any;
    material_data: any;
    link: string;
    id?: string;
    episodes_count?: number;
}
export interface Translation {
    id: string;
    title: string;
    name?: string;
    type: string;
    is_voice: boolean;
}
export interface AnimeInfo {
    translations: Translation[];
    series_count: number;
    [key: string]: any;
}
export interface SearchResponse {
    total: number;
    time: string;
    results: AnimeResult[];
}
export type IdType = 'shikimori' | 'kinopoisk' | 'imdb';
export interface ApiOptions {
    token?: string | null;
    allow_warnings?: boolean;
    _args?: any;
    _endpoint?: string | null;
}
export interface SearchOptions {
    title?: string;
    limit?: number;
    include_material_data?: boolean;
    anime_status?: string | null;
    strict?: boolean;
    only_anime?: boolean;
}
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    [key: string]: any;
}
//# sourceMappingURL=index.d.ts.map