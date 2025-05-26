import { RequestOptions } from '../types';
declare const CAN_WORK = true;
export declare class Response {
    /**
     * Класс для удобства использования AsyncSession
     */
    status: number;
    status_code: number;
    text: string;
    url: string;
    constructor(status: number, text: string, url: string);
    json<T = any>(): T;
}
export declare class AsyncSession {
    /**
     * Класс-обертка для удобства использования асинхронных запросов
     */
    constructor();
    get(url: string, options?: RequestOptions): Promise<Response>;
    post(url: string, options?: RequestOptions & {
        data?: any;
    }): Promise<Response>;
}
export { CAN_WORK };
//# sourceMappingURL=internal_tools.d.ts.map