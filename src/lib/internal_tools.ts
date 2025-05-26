import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestOptions } from '../types';

const CAN_WORK = true;

export class Response {
    /**
     * Класс для удобства использования AsyncSession
     */
    public status: number;
    public status_code: number;
    public text: string;
    public url: string;

    constructor(status: number, text: string, url: string) {
        this.status = status;
        this.status_code = status;
        this.text = text;
        this.url = url;
    }

    json<T = any>(): T {
        return JSON.parse(this.text);
    }
}

export class AsyncSession {
    /**
     * Класс-обертка для удобства использования асинхронных запросов
     */
    constructor() {
        if (!CAN_WORK) {
            throw new Error('Невозможно получить доступ к библиотекам "axios". Проверьте правильность установки библиотеки.');
        }
    }

    async get(url: string, options: RequestOptions = {}): Promise<Response> {
        const config: AxiosRequestConfig = {
            ...options,
            headers: options.headers || {}
        };

        const response: AxiosResponse = await axios.get(url, config);
        return new Response(
            response.status,
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            response.request?.res?.responseUrl || url
        );
    }

    async post(url: string, options: RequestOptions & { data?: any } = {}): Promise<Response> {
        const { data, ...config } = options;
        const axiosConfig: AxiosRequestConfig = {
            ...config,
            headers: options.headers || {}
        };

        const response: AxiosResponse = await axios.post(url, data, axiosConfig);
        return new Response(
            response.status,
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            response.request?.res?.responseUrl || url
        );
    }
}

export { CAN_WORK }; 