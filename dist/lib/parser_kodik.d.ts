import { AnimeResult, Translation, AnimeInfo, IdType } from '../types';
export declare class KodikParser {
    private readonly LXML_WORKS;
    private readonly TOKEN;
    private readonly USE_LXML;
    private _crypt_step;
    /**
     * Парсер для плеера Kodik
     */
    constructor(token?: string | null, use_lxml?: boolean);
    apiRequest(endpoint: string, filters?: Record<string, unknown>, parameters?: Record<string, unknown>): Promise<Record<string, unknown>>;
    baseSearch(title: string, limit?: number, include_material_data?: boolean, anime_status?: string | null, strict?: boolean): Promise<Record<string, unknown>>;
    baseSearchById(id: string, id_type: IdType, limit?: number, include_material_data?: boolean): Promise<Record<string, unknown>>;
    getList(limit_per_page?: number, pages_to_parse?: number, include_material_data?: boolean, anime_status?: string | null, only_anime?: boolean, start_from?: string | null): Promise<[AnimeResult[], string | null]>;
    search(title: string, limit?: number | null, include_material_data?: boolean, anime_status?: string | null, strict?: boolean, only_anime?: boolean): Promise<AnimeResult[]>;
    searchById(id: string | number, id_type: IdType, limit?: number | null): Promise<AnimeResult[]>;
    private _prettifyData;
    translations(id: string | number, id_type: IdType): Promise<Translation[]>;
    seriesCount(id: string | number, id_type: IdType): Promise<number>;
    private _linkToInfo;
    getInfo(id: string | number, id_type: IdType): Promise<AnimeInfo>;
    private _isSerial;
    private _isVideo;
    private _generateTranslationsDict;
    getLink(id: string | number, id_type: IdType, seria_num: number, translation_id: string | number): Promise<[string, number]>;
    private _getLinkWithData;
    private _convertChar;
    private _convert;
    private _getPostLink;
    static getToken(): Promise<string>;
}
//# sourceMappingURL=parser_kodik.d.ts.map