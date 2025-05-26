"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimeGenres = exports.Types = exports.AnimeKind = exports.SortList = exports.OrderList = exports.KodikList = exports.KodikSearch = exports.Api = exports.AsyncSession = exports.Response = exports.KodikParser = void 0;
exports.createParser = createParser;
exports.createSearch = createSearch;
exports.createList = createList;
exports.getToken = getToken;
// Экспорт ошибок
__exportStar(require("./lib/errors"), exports);
// Экспорт типов
__exportStar(require("./types"), exports);
// Экспорт основных классов
var parser_kodik_1 = require("./lib/parser_kodik");
Object.defineProperty(exports, "KodikParser", { enumerable: true, get: function () { return parser_kodik_1.KodikParser; } });
var internal_tools_1 = require("./lib/internal_tools");
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return internal_tools_1.Response; } });
Object.defineProperty(exports, "AsyncSession", { enumerable: true, get: function () { return internal_tools_1.AsyncSession; } });
var api_kodik_1 = require("./lib/api_kodik");
Object.defineProperty(exports, "Api", { enumerable: true, get: function () { return api_kodik_1.Api; } });
Object.defineProperty(exports, "KodikSearch", { enumerable: true, get: function () { return api_kodik_1.KodikSearch; } });
Object.defineProperty(exports, "KodikList", { enumerable: true, get: function () { return api_kodik_1.KodikList; } });
Object.defineProperty(exports, "OrderList", { enumerable: true, get: function () { return api_kodik_1.OrderList; } });
Object.defineProperty(exports, "SortList", { enumerable: true, get: function () { return api_kodik_1.SortList; } });
Object.defineProperty(exports, "AnimeKind", { enumerable: true, get: function () { return api_kodik_1.AnimeKind; } });
Object.defineProperty(exports, "Types", { enumerable: true, get: function () { return api_kodik_1.Types; } });
Object.defineProperty(exports, "AnimeGenres", { enumerable: true, get: function () { return api_kodik_1.AnimeGenres; } });
// Импорты для функций
const parser_kodik_2 = require("./lib/parser_kodik");
const api_kodik_2 = require("./lib/api_kodik");
// Удобные функции для создания экземпляров
async function createParser(token) {
    const finalToken = token || await parser_kodik_2.KodikParser.getToken();
    return new parser_kodik_2.KodikParser(finalToken);
}
async function createSearch(token) {
    const finalToken = token || await parser_kodik_2.KodikParser.getToken();
    return new api_kodik_2.KodikSearch(finalToken);
}
async function createList(token) {
    const finalToken = token || await parser_kodik_2.KodikParser.getToken();
    return new api_kodik_2.KodikList(finalToken);
}
async function getToken() {
    return await parser_kodik_2.KodikParser.getToken();
}
//# sourceMappingURL=index.js.map