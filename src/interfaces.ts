export interface Links {
    self?: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
}

export type Dictionary<T = unknown> = Record<string, T>;
