"use strict";
/**
 * Классы ошибок для anime-parser-kodik
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.DecryptionFailure = exports.ServiceIsOverloaded = exports.ContentBlocked = exports.TooManyRequests = exports.AgeRestricted = exports.QualityNotFound = exports.UnexpectedBehavior = exports.NoResults = exports.PostArgumentsError = exports.ServiceError = exports.TokenError = void 0;
class TokenError extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'TokenError';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.TokenError = TokenError;
class ServiceError extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'ServiceError';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.ServiceError = ServiceError;
class PostArgumentsError extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'PostArgumentsError';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.PostArgumentsError = PostArgumentsError;
class NoResults extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'NoResults';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.NoResults = NoResults;
class UnexpectedBehavior extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'UnexpectedBehavior';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.UnexpectedBehavior = UnexpectedBehavior;
class QualityNotFound extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'QualityNotFound';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.QualityNotFound = QualityNotFound;
class AgeRestricted extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'AgeRestricted';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.AgeRestricted = AgeRestricted;
class TooManyRequests extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'TooManyRequests';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.TooManyRequests = TooManyRequests;
class ContentBlocked extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'ContentBlocked';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.ContentBlocked = ContentBlocked;
class ServiceIsOverloaded extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'ServiceIsOverloaded';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}
exports.ServiceIsOverloaded = ServiceIsOverloaded;
class DecryptionFailure extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'DecryptionFailure';
        if (options?.cause !== undefined) {
            this.cause = options.cause;
        }
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