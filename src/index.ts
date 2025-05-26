// Экспорт ошибок
export * from './lib/errors';

// Экспорт типов
export * from './types';

// Экспорт основных классов
export { KodikParser } from './lib/parser_kodik';
export { Response, AsyncSession } from './lib/internal_tools';
export { 
    Api, 
    KodikSearch, 
    KodikList, 
    OrderList, 
    SortList, 
    AnimeKind, 
    Types, 
    AnimeGenres 
} from './lib/api_kodik';

// Импорты для функций
import { KodikParser } from './lib/parser_kodik';
import { KodikSearch, KodikList } from './lib/api_kodik';

// Удобные функции для создания экземпляров
export async function createParser(token?: string | null): Promise<KodikParser> {
    const finalToken = token || await KodikParser.getToken();
    return new KodikParser(finalToken);
}

export async function createSearch(token?: string | null): Promise<KodikSearch> {
    const finalToken = token || await KodikParser.getToken();
    return new KodikSearch(finalToken);
}

export async function createList(token?: string | null): Promise<KodikList> {
    const finalToken = token || await KodikParser.getToken();
    return new KodikList(finalToken);
}

export async function getToken(): Promise<string> {
    return await KodikParser.getToken();
} 