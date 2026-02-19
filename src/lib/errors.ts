/**
 * Классы ошибок для anime-parser-kodik
 */

interface ErrorOptions {
    cause?: unknown;
}

class KodikError extends Error {
    cause?: unknown;

    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = this.constructor.name;
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

export class TokenError extends KodikError {}
export class ServiceError extends KodikError {}
export class PostArgumentsError extends KodikError {}
export class NoResults extends KodikError {}
export class UnexpectedBehavior extends KodikError {}
export class QualityNotFound extends KodikError {}
export class AgeRestricted extends KodikError {}
export class TooManyRequests extends KodikError {}
export class ContentBlocked extends KodikError {}
export class ServiceIsOverloaded extends KodikError {}
export class DecryptionFailure extends KodikError {}

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
    DecryptionFailure,
};
