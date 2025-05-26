/**
 * Классы ошибок для anime-parser-kodik
 */
export declare class TokenError extends Error {
    constructor(message: string);
}
export declare class ServiceError extends Error {
    constructor(message: string);
}
export declare class PostArgumentsError extends Error {
    constructor(message: string);
}
export declare class NoResults extends Error {
    constructor(message: string);
}
export declare class UnexpectedBehavior extends Error {
    constructor(message: string);
}
export declare class QualityNotFound extends Error {
    constructor(message: string);
}
export declare class AgeRestricted extends Error {
    constructor(message: string);
}
export declare class TooManyRequests extends Error {
    constructor(message: string);
}
export declare class ContentBlocked extends Error {
    constructor(message: string);
}
export declare class ServiceIsOverloaded extends Error {
    constructor(message: string);
}
export declare class DecryptionFailure extends Error {
    constructor(message: string);
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
//# sourceMappingURL=errors.d.ts.map