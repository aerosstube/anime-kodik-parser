"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KodikList = exports.KodikSearch = exports.Api = exports.Response = exports.AnimeGenres = exports.Types = exports.AnimeKind = exports.SortList = exports.OrderList = void 0;
const parser_kodik_1 = require("./parser_kodik");
class OrderList {
    static getList() {
        return [OrderList.ASC, OrderList.DESC];
    }
}
exports.OrderList = OrderList;
OrderList.ASC = 'asc';
OrderList.DESC = 'desc';
class SortList {
    static getList() {
        return [
            SortList.YEAR, SortList.CREATED_AT, SortList.UPDATED_AT,
            SortList.KINOPOISK_RATING, SortList.IMDB_RATING, SortList.SHIKIMORI_RATING
        ];
    }
}
exports.SortList = SortList;
SortList.YEAR = 'year';
SortList.CREATED_AT = 'created_at';
SortList.UPDATED_AT = 'updated_at';
SortList.KINOPOISK_RATING = 'kinopoisk_rating';
SortList.IMDB_RATING = 'imdb_rating';
SortList.SHIKIMORI_RATING = 'shikimori_rating';
class AnimeKind {
    static getList() {
        return [
            AnimeKind.TV, AnimeKind.TV13, AnimeKind.TV24, AnimeKind.TV48,
            AnimeKind.MOVIE, AnimeKind.SPECIAL, AnimeKind.OVA, AnimeKind.ONA, AnimeKind.MUSIC
        ];
    }
}
exports.AnimeKind = AnimeKind;
AnimeKind.TV = 'tv';
AnimeKind.TV13 = 'tv13';
AnimeKind.TV24 = 'tv24';
AnimeKind.TV48 = 'tv48';
AnimeKind.MOVIE = 'movie';
AnimeKind.SPECIAL = 'special';
AnimeKind.OVA = 'ova';
AnimeKind.ONA = 'ona';
AnimeKind.MUSIC = 'music';
class Types {
    static getList() {
        return [
            Types.FOREIGN_MOVIE, Types.SOVIET_CARTOON, Types.FOREIGN_CARTOON, Types.RUSSIAN_CARTOON, Types.ANIME,
            Types.RUSSIAN_MOVIE, Types.CARTOON_SERIAL, Types.DOCUMENTARY_SERIAL, Types.RUSSIAN_SERIAL,
            Types.FOREIGN_SERIAL, Types.ANIME_SERIAL, Types.MULTI_PART_FILM
        ];
    }
}
exports.Types = Types;
Types.FOREIGN_MOVIE = "foreign-movie";
Types.SOVIET_CARTOON = "soviet-cartoon";
Types.FOREIGN_CARTOON = "foreign-cartoon";
Types.RUSSIAN_CARTOON = "russian-cartoon";
Types.ANIME = "anime";
Types.RUSSIAN_MOVIE = "russian-movie";
Types.CARTOON_SERIAL = "cartoon-serial";
Types.DOCUMENTARY_SERIAL = "documentary-serial";
Types.RUSSIAN_SERIAL = "russian-serial";
Types.FOREIGN_SERIAL = "foreign-serial";
Types.ANIME_SERIAL = "anime-serial";
Types.MULTI_PART_FILM = "multi-part-film";
class AnimeGenres {
    static getList() {
        return [
            AnimeGenres.MILITARY, AnimeGenres.DRAMA, AnimeGenres.HISTORY, AnimeGenres.ACTION,
            AnimeGenres.ADVENTURES, AnimeGenres.SENEN, AnimeGenres.FANTASY, AnimeGenres.COMEDY,
            AnimeGenres.MARTIAL_ARTS, AnimeGenres.ROMANCE, AnimeGenres.PSYCHOLOGICAL, AnimeGenres.THRILLER,
            AnimeGenres.EVERYDAY_LIFE, AnimeGenres.SUPERNATURAL, AnimeGenres.SPORT, AnimeGenres.SCHOOL,
            AnimeGenres.MUSIC, AnimeGenres.FANTASTIKA, AnimeGenres.SAMURAI
        ];
    }
}
exports.AnimeGenres = AnimeGenres;
AnimeGenres.MILITARY = "Военное";
AnimeGenres.DRAMA = "Драма";
AnimeGenres.HISTORY = "Исторический";
AnimeGenres.ACTION = "Экшен";
AnimeGenres.ADVENTURES = "Приключения";
AnimeGenres.SENEN = "Сёнен";
AnimeGenres.FANTASY = "Фэнтези";
AnimeGenres.COMEDY = "Комедия";
AnimeGenres.MARTIAL_ARTS = "Боевые искусства";
AnimeGenres.ROMANCE = "Романтика";
AnimeGenres.PSYCHOLOGICAL = "Психологическое";
AnimeGenres.THRILLER = "Триллер";
AnimeGenres.EVERYDAY_LIFE = "Повседневность";
AnimeGenres.SUPERNATURAL = "Сверхъестественное";
AnimeGenres.SPORT = "Спорт";
AnimeGenres.SCHOOL = "Школа";
AnimeGenres.MUSIC = "Музыка";
AnimeGenres.FANTASTIKA = "Фантастика";
AnimeGenres.SAMURAI = "Самураи";
class Response {
    constructor(raw_data) {
        this._results = [];
        this.total = raw_data['total'];
        this.time = raw_data['time'];
        this.results = raw_data['results'];
    }
    get results() {
        return this._results;
    }
    set results(value) {
        if (value == null || value === undefined) {
            this._results = [];
        }
        else {
            this._results = value;
        }
    }
}
exports.Response = Response;
class Api {
    constructor(token = null, allow_warnings = true, _args = {}, _endpoint = null) {
        this.token = token;
        this.allow_warnings = allow_warnings;
        this.args = _args;
        this.endpoint = _endpoint;
    }
    title(title) {
        this.args['title'] = title;
        return this;
    }
    limit(limit = 50) {
        this.args['limit'] = limit;
        return this;
    }
    year(year) {
        this.args['year'] = year;
        return this;
    }
    anime_kind(kind) {
        this.args['anime_kind'] = kind;
        return this;
    }
    genres(genres) {
        this.args['genres'] = genres;
        return this;
    }
    anime_genres(genres) {
        this.args['anime_genres'] = genres;
        return this;
    }
    shikimori_id(id) {
        this.args['shikimori_id'] = id;
        return this;
    }
    kinopoisk_id(id) {
        this.args['kinopoisk_id'] = id;
        return this;
    }
    imdb_id(id) {
        this.args['imdb_id'] = id;
        return this;
    }
    async execute_async(return_json = false) {
        const parser = new parser_kodik_1.KodikParser(this.token);
        const data = await parser.apiRequest(this.endpoint || 'search', this.args);
        if (return_json) {
            return data;
        }
        return new Response(data);
    }
    execute(return_json = false) {
        throw new Error('Синхронный execute не поддерживается в TypeScript версии. Используйте execute_async');
    }
}
exports.Api = Api;
Api.Order = OrderList;
Api.Sort = SortList;
Api.AnimeKind = AnimeKind;
Api.Types = Types;
Api.AnimeGenres = AnimeGenres;
class KodikSearch extends Api {
    constructor(token = null, allow_warnings = true, _args = {}) {
        super(token, allow_warnings, _args, 'search');
    }
}
exports.KodikSearch = KodikSearch;
class KodikList extends Api {
    constructor(token = null, allow_warnings = true, _args = {}) {
        super(token, allow_warnings, _args, 'list');
    }
    sort(value) {
        this.args['sort'] = value;
        return this;
    }
    order(value) {
        this.args['order'] = value;
        return this;
    }
}
exports.KodikList = KodikList;
//# sourceMappingURL=api_kodik.js.map