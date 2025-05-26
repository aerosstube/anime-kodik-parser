/**
 * Классы ошибок для anime-parser-kodik
 */

export class TokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenError';
    }
}

export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceError';
    }
}

export class PostArgumentsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PostArgumentsError';
    }
}

export class NoResults extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoResults';
    }
}

export class UnexpectedBehavior extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnexpectedBehavior';
    }
}

export class QualityNotFound extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QualityNotFound';
    }
}

export class AgeRestricted extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AgeRestricted';
    }
}

export class TooManyRequests extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TooManyRequests';
    }
}

export class ContentBlocked extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ContentBlocked';
    }
}

export class ServiceIsOverloaded extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServiceIsOverloaded';
    }
}

export class DecryptionFailure extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DecryptionFailure';
    }
}

// Экспорт всех ошибок в одном объекте для совместимости
export const errors = {
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