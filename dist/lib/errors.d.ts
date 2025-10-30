/**
 * Классы ошибок для anime-parser-kodik
 */
interface ErrorOptions {
    cause?: unknown;
}
export declare class TokenError extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class ServiceError extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class PostArgumentsError extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class NoResults extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class UnexpectedBehavior extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class QualityNotFound extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class AgeRestricted extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class TooManyRequests extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class ContentBlocked extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class ServiceIsOverloaded extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare class DecryptionFailure extends Error {
    cause?: unknown;
    constructor(message: string, options?: ErrorOptions);
}
export declare const errors: {
    TokenError: typeof TokenError;
    ServiceError: typeof ServiceError;
    PostArgumentsError: typeof PostArgumentsError;
    NoResults: typeof NoResults;
    UnexpectedBehavior: typeof UnexpectedBehavior;
    QualityNotFound: typeof QualityNotFound;
    AgeRestricted: typeof AgeRestricted;
    TooManyRequests: typeof TooManyRequests;
    ContentBlocked: typeof ContentBlocked;
    ServiceIsOverloaded: typeof ServiceIsOverloaded;
    DecryptionFailure: typeof DecryptionFailure;
};
export {};
//# sourceMappingURL=errors.d.ts.map