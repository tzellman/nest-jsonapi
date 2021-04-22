import * as url from 'url';
import { Links } from './interfaces';
import { AssertionError } from 'assert';

interface LinkOptions {
    originalUrl?: string;
    count?: number;
    page?: {
        number?: number;
        size?: number;
    };
}

export const buildLinks = (options: LinkOptions): Links => {
    const originalUrl = options.originalUrl;

    const links = {} as Links;
    if (!originalUrl) {
        return links;
    } else {
        links.self = originalUrl;
    }
    const pageNumber = options.page?.number ?? 0;
    const pageSize = options.page?.size ?? 0;
    const count = options.count;

    if (count === undefined || count < 0 || pageNumber < 1 || pageSize < 1) {
        return links;
    }

    // consider at least 1 page. We want first and last links always, even when no records are found
    const totalPages = count === 0 ? 1 : Math.ceil(count / pageSize);

    links.first = buildLink(originalUrl, 1, pageSize);

    // maybe add next
    if (pageNumber + 1 <= totalPages) {
        links.next = buildLink(originalUrl, pageNumber + 1, pageSize);
    }

    // maybe add prev
    if (pageNumber !== 1) {
        links.prev = buildLink(originalUrl, pageNumber - 1, pageSize);
    }

    // maybe add last
    if (pageNumber <= totalPages) {
        links.last = buildLink(originalUrl, totalPages, pageSize);
    }

    return links;
};

const buildLink = (originalUrl: string, pageNumber: number, pageSize: number): string => {
    const parts = url.parse(originalUrl, true);
    const query = parts.query;
    query['page[number]'] = String(pageNumber);
    query['page[size]'] = String(pageSize);
    return url.format({
        protocol: parts.protocol,
        hostname: parts.hostname,
        pathname: parts.pathname,
        query
    });
};

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function assertIsDefined<T>(val: T, name?: string): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
        throw new AssertionError({ message: `Expected '${name || 'val'}' to be defined, but received ${val}` });
    }
}
