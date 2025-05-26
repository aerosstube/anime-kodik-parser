export * from './lib/errors';
export * from './types';
export { KodikParser } from './lib/parser_kodik';
export { Response, AsyncSession } from './lib/internal_tools';
export { Api, KodikSearch, KodikList, OrderList, SortList, AnimeKind, Types, AnimeGenres } from './lib/api_kodik';
import { KodikParser } from './lib/parser_kodik';
import { KodikSearch, KodikList } from './lib/api_kodik';
export declare function createParser(token?: string | null): Promise<KodikParser>;
export declare function createSearch(token?: string | null): Promise<KodikSearch>;
export declare function createList(token?: string | null): Promise<KodikList>;
export declare function getToken(): Promise<string>;
//# sourceMappingURL=index.d.ts.map