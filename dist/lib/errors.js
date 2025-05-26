"use strict";
/**
 * Классы ошибок для anime-parser-kodik
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.DecryptionFailure = exports.ServiceIsOverloaded = exports.ContentBlocked = exports.TooManyRequests = exports.AgeRestricted = exports.QualityNotFound = exports.UnexpectedBehavior = exports.NoResults = exports.PostArgumentsError = exports.ServiceError = exports.TokenError = void 0;
class TokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TokenError';
    }
}
exports.TokenError = TokenError;
class ServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
class PostArgumentsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostArgumentsError';
    }
}
exports.PostArgumentsError = PostArgumentsError;
class NoResults extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoResults';
    }
}
exports.NoResults = NoResults;
class UnexpectedBehavior extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnexpectedBehavior';
    }
}
exports.UnexpectedBehavior = UnexpectedBehavior;
class QualityNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'QualityNotFound';
    }
}
exports.QualityNotFound = QualityNotFound;
class AgeRestricted extends Error {
    constructor(message) {
        super(message);
        this.name = 'AgeRestricted';
    }
}
exports.AgeRestricted = AgeRestricted;
class TooManyRequests extends Error {
    constructor(message) {
        super(message);
        this.name = 'TooManyRequests';
    }
}
exports.TooManyRequests = TooManyRequests;
class ContentBlocked extends Error {
    constructor(message) {
        super(message);
        this.name = 'ContentBlocked';
    }
}
exports.ContentBlocked = ContentBlocked;
class ServiceIsOverloaded extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServiceIsOverloaded';
    }
}
exports.ServiceIsOverloaded = ServiceIsOverloaded;
class DecryptionFailure extends Error {
    constructor(message) {
        super(message);
        this.name = 'DecryptionFailure';
    }
}
exports.DecryptionFailure = DecryptionFailure;
// Экспорт всех ошибок в одном объекте для совместимости
exports.errors = {
    TokenError,
    ServiceError,
    PostArgumentsError,
    NoResults,
    UnexpectedBehavior,
    QualityNotFound,
    AgeRestricted,
    TooManyRequests,
    ContentBlocked,
    ServiceIsOverloaded,
    DecryptionFailure
};
//# sourceMappingURL=errors.js.map