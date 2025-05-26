"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAN_WORK = exports.AsyncSession = exports.Response = void 0;
const axios_1 = __importDefault(require("axios"));
const CAN_WORK = true;
exports.CAN_WORK = CAN_WORK;
class Response {
    constructor(status, text, url) {
        this.status = status;
        this.status_code = status;
        this.text = text;
        this.url = url;
    }
    json() {
        return JSON.parse(this.text);
    }
}
exports.Response = Response;
class AsyncSession {
    /**
     * Класс-обертка для удобства использования асинхронных запросов
     */
    constructor() {
        if (!CAN_WORK) {
            throw new Error('Невозможно получить доступ к библиотекам "axios". Проверьте правильность установки библиотеки.');
        }
    }
    async get(url, options = {}) {
        const config = {
            ...options,
            headers: options.headers || {}
        };
        const response = await axios_1.default.get(url, config);
        return new Response(response.status, typeof response.data === 'string' ? response.data : JSON.stringify(response.data), response.request?.res?.responseUrl || url);
    }
    async post(url, options = {}) {
        const { data, ...config } = options;
        const axiosConfig = {
            ...config,
            headers: options.headers || {}
        };
        const response = await axios_1.default.post(url, data, axiosConfig);
        return new Response(response.status, typeof response.data === 'string' ? response.data : JSON.stringify(response.data), response.request?.res?.responseUrl || url);
    }
}
exports.AsyncSession = AsyncSession;
//# sourceMappingURL=internal_tools.js.map