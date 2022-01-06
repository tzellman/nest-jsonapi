import { URL } from 'url';
import { buildLinks } from '../src';
import { assertIsDefined } from '../src/utils';

describe('utils', () => {
    describe('buildLinks', () => {
        it('does not include anything when no originalUrl', () => {
            const result = buildLinks({});
            expect(result).toEqual({});
        });

        it('does not include pages when no page or count info', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1';
            let result = buildLinks({ originalUrl });
            expect(result).toEqual({ self: originalUrl });

            // must have page size and page number
            result = buildLinks({ originalUrl, page: {}, count: 42 });
            expect(result).toEqual({ self: originalUrl });

            // must have page number
            result = buildLinks({ originalUrl, page: { size: 12 }, count: 42 });
            expect(result).toEqual({ self: originalUrl });

            // must have page size
            result = buildLinks({ originalUrl, page: { number: 1 }, count: 42 });
            expect(result).toEqual({ self: originalUrl });

            // must have count
            result = buildLinks({ originalUrl, page: { size: 12, number: 1 } });
            expect(result).toEqual({ self: originalUrl });
        });

        const expectLink = (resultLink: string | undefined, expectedLink: string): void => {
            assertIsDefined(resultLink);
            const resultUrl = new URL(`http://example.com${resultLink}`);
            const expectedUrl = new URL(`http://example.com${expectedLink}`);
            expect(resultUrl.pathname).toEqual(expectedUrl.pathname);
            for (const [key, value] of resultUrl.searchParams.entries()) {
                expect(value).toEqual(expectedUrl.searchParams.get(key));
            }
            for (const [key, value] of expectedUrl.searchParams.entries()) {
                expect(resultUrl.searchParams.get(key)).toEqual(value);
            }
        };

        it('can handle first page', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1';
            let result = buildLinks({ originalUrl, page: { size: 5, number: 1 }, count: 12 });
            expectLink(result.self, originalUrl);
            expectLink(result.first, originalUrl);
            expect(result.prev).toBeFalsy();
            expectLink(result.next, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2');
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3');

            result = buildLinks({ originalUrl: '/api/photos', page: { size: 5, number: 1 }, count: 12 });
            expectLink(result.self, '/api/photos');
            expectLink(result.first, originalUrl);
            expect(result.prev).toBeFalsy();
            expectLink(result.next, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2');
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3');
        });

        it('can handle last page', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3';
            const result = buildLinks({ originalUrl, page: { size: 5, number: 3 }, count: 12 });
            expectLink(result.self, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3');
            expectLink(result.first, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expectLink(result.prev, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2');
            expect(result.next).toBeFalsy();
            expectLink(result.last, originalUrl);
        });

        it('can handle some arbitrary page', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2';
            const result = buildLinks({ originalUrl, page: { size: 5, number: 2 }, count: 12 });
            expectLink(result.self, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2');
            expectLink(result.first, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expectLink(result.prev, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expectLink(result.next, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3');
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3');
        });

        it('can handle only 1 page worth', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1';
            const result = buildLinks({ originalUrl, page: { size: 5, number: 1 }, count: 4 });
            expectLink(result.self, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expectLink(result.first, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expect(result.prev).toBeFalsy();
            expect(result.next).toBeFalsy();
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
        });

        it('keeps other query params', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2&foo=bar';
            const result = buildLinks({ originalUrl, page: { size: 5, number: 2 }, count: 12 });
            expectLink(result.self, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=2&foo=bar');
            expectLink(result.first, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1&foo=bar');
            expectLink(result.prev, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1&foo=bar');
            expectLink(result.next, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3&foo=bar');
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=3&foo=bar');
        });

        it('handles no results', () => {
            const originalUrl = '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1';
            const result = buildLinks({ originalUrl, page: { size: 5, number: 1 }, count: 0 });
            expectLink(result.self, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expectLink(result.first, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
            expect(result.prev).toBeFalsy();
            expect(result.next).toBeFalsy();
            expectLink(result.last, '/api/photos?page%5Bsize%5D=5&page%5Bnumber%5D=1');
        });
    });
});
