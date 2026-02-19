import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestOptions } from '../types';

export class Response {
    public readonly status: number;
    public readonly status_code: number;
    public readonly text: string;
    public readonly url: string;

    constructor(status: number, text: string, url: string) {
        this.status = status;
        this.status_code = status;
        this.text = text;
        this.url = url;
    }

    json<T = unknown>(): T {
        return JSON.parse(this.text) as T;
    }
}

export class AsyncSession {
    async get(url: string, options: RequestOptions = {}): Promise<Response> {
        const config: AxiosRequestConfig = {
            ...options,
            headers: options.headers || {},
        };

        const response: AxiosResponse = await axios.get(url, config);
        const responseUrl = response.request?.res?.responseUrl || url;
        const text = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);

        return new Response(response.status, text, responseUrl);
    }

    async post(url: string, options: RequestOptions & { data?: unknown } = {}): Promise<Response> {
        const { data, ...config } = options;
        const axiosConfig: AxiosRequestConfig = {
            ...config,
            headers: options.headers || {},
        };

        const response: AxiosResponse = await axios.post(url, data, axiosConfig);
        const responseUrl = response.request?.res?.responseUrl || url;
        const text = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);

        return new Response(response.status, text, responseUrl);
    }
}
