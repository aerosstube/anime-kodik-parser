/**
 * Классы ошибок для anime-parser-kodik
 */

interface ErrorOptions {
    cause?: unknown;
}

export class TokenError extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'TokenError';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class ServiceError extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'ServiceError';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class PostArgumentsError extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'PostArgumentsError';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class NoResults extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'NoResults';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class UnexpectedBehavior extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'UnexpectedBehavior';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class QualityNotFound extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'QualityNotFound';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class AgeRestricted extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'AgeRestricted';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class TooManyRequests extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'TooManyRequests';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class ContentBlocked extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'ContentBlocked';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class ServiceIsOverloaded extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'ServiceIsOverloaded';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class DecryptionFailure extends Error {
    cause?: unknown;
    
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = 'DecryptionFailure';
        if (options?.cause) {
            this.cause = options.cause;
        }
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