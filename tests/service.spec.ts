import * as faker from 'faker';
import { Expose } from 'class-transformer';
import { Dictionary, JSONAPIDocument, JsonapiService, ResourceLinks, SchemaBuilder, SchemaDataBuilder } from '../src';
import { SerializeRelationshipsDataParams } from 'transformalizer';

// represents the internal model
class Person {
    public readonly id: string;

    constructor(public readonly firstName: string, public readonly lastName?: string) {
        this.id = faker.random.uuid();
    }

    // additional getters must be exposed
    @Expose()
    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}

class Photo {
    public readonly id: string;

    constructor(public readonly url: string, public readonly creator?: Person) {
        this.id = faker.random.uuid();
    }
}

class Album {
    public readonly id: string;

    constructor(public readonly name: string, public readonly photos?: Photo[]) {
        this.id = faker.random.uuid();
    }
}

interface Model {
    id: string;
}

interface PeopleResult {
    results: Person[];
    meta?: Dictionary;
    links?: ResourceLinks;
}

const RESOURCE_PEOPLE = 'people';
const RESOURCE_PHOTOS = 'photos';
const RESOURCE_ALBUMS = 'albums';

describe('jsonapi service', () => {
    let service: JsonapiService;

    beforeEach(() => {
        service = new JsonapiService();
    });

    const expectModel = (data: Dictionary, model: Model, type: string): void => {
        expect(data).toBeDefined();
        expect(data.id).toEqual(model.id);
        expect(data.type).toEqual(type);
        expect(data.attributes).toBeDefined();
    };

    const expectModelArray = (data: Dictionary[], models: Model[], type: string): void => {
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toBe(models.length);
        for (let i = 0; i < models.length; i++) {
            expect(data[i].id).toEqual(models[i].id);
            expect(data[i].type).toEqual(type);
            expect(data[i].attributes).toBeDefined();
        }
    };

    const expectRelationship = (relationship: Dictionary, model: Model, type: string): void => {
        expect(relationship).toBeDefined();
        const relData = relationship.data as Dictionary;
        expect(relData).toBeDefined();
        expect(relData.id).toEqual(model.id);
        expect(relData.type).toEqual(type);
    };

    describe('attributes', () => {
        beforeEach(() => {
            // create a new schema and register it with the service
            service.register({ name: RESOURCE_PEOPLE, schema: new SchemaBuilder<Person>(RESOURCE_PEOPLE).build() });
        });

        const expectPersonWithAllAtts = (data: Dictionary, person: Person): void => {
            expectModel(data, person, RESOURCE_PEOPLE);
            const attributes = data.attributes as Dictionary;
            expect(attributes['first-name']).toEqual(person.firstName);
            expect(attributes['last-name']).toEqual(person.lastName);
            expect(attributes['full-name']).toEqual(person.fullName);
        };

        it('has attributes for singular person', () => {
            const bob = new Person('Bob', 'Martin');
            const result = service.transform({ source: bob, resourceName: RESOURCE_PEOPLE });
            expect(result).toBeDefined();

            const { data } = result;
            expectPersonWithAllAtts(data, bob);
        });

        it('has attributes for a collection of people', () => {
            const bob = new Person('Bob', 'Martin');
            const alice = new Person('Alice', 'Smith');
            const result = service.transform({ source: [bob, alice], resourceName: RESOURCE_PEOPLE });
            expect(result).toBeDefined();

            const { data } = result;
            expect(data).toBeDefined();
            expect(data.length).toEqual(2);
            expectPersonWithAllAtts(data[0], bob);
            expectPersonWithAllAtts(data[1], alice);
        });
    });

    describe('deny atts', () => {
        beforeEach(() => {
            const schemaBuilder = new SchemaBuilder<Person>(RESOURCE_PEOPLE);
            schemaBuilder.dataBuilder.attributes({ deny: ['firstName'] });
            service.register(schemaBuilder);
        });

        const expectPersonWithSomeAtts = (data: Dictionary, person: Person): void => {
            expectModel(data, person, RESOURCE_PEOPLE);
            const attributes = data.attributes as Dictionary;
            expect(Object.keys(attributes).sort()).toEqual(['full-name', 'last-name']);
            expect(attributes['full-name']).toEqual(person.fullName);
            expect(attributes['last-name']).toEqual(person.lastName);
        };

        it('has correct attributes for single person', () => {
            const bob = new Person('Bob', 'Martin');
            const result = service.transform({ source: bob, resourceName: RESOURCE_PEOPLE });

            const { data } = result;
            expectPersonWithSomeAtts(data, bob);
        });

        it('has correct attributes for collection of people', () => {
            const bob = new Person('Bob', 'Martin');
            const alice = new Person('Alice', 'Smith');
            const result = service.transform({ source: [bob, alice], resourceName: RESOURCE_PEOPLE });

            const { data } = result;
            expectModelArray(data, [bob, alice], RESOURCE_PEOPLE);
            expectPersonWithSomeAtts(data[0], bob);
            expectPersonWithSomeAtts(data[1], alice);
        });
    });

    describe('allow atts', () => {
        beforeEach(() => {
            service.register({
                name: RESOURCE_PEOPLE,
                schema: new SchemaBuilder<Person>(RESOURCE_PEOPLE)
                    .data(new SchemaDataBuilder<Person>(RESOURCE_PEOPLE).attributes({ allow: ['fullName'] }).build())
                    .build()
            });
        });

        const expectPersonWithFullNameOnly = (data: Dictionary, person: Person): void => {
            expectModel(data, person, RESOURCE_PEOPLE);
            const attributes = data.attributes as Dictionary;
            expect(Object.keys(attributes).sort()).toEqual(['full-name']);
            expect(attributes['full-name']).toEqual(person.fullName);
        };

        it('has correct attributes for single person', () => {
            const bob = new Person('Bob', 'Martin');
            const result = service.transform({ source: bob, resourceName: RESOURCE_PEOPLE });
            expectPersonWithFullNameOnly(result.data, bob);
        });

        it('has correct attributes for collection of people', () => {
            const bob = new Person('Bob', 'Martin');
            const alice = new Person('Alice', 'Smith');
            const result = service.transform({ source: [bob, alice], resourceName: RESOURCE_PEOPLE });

            const { data } = result;
            expectModelArray(data, [bob, alice], RESOURCE_PEOPLE);
            expectPersonWithFullNameOnly(data[0], bob);
            expectPersonWithFullNameOnly(data[1], alice);
        });
    });

    const transformResult = (result: PeopleResult): JSONAPIDocument =>
        service.transform({
            resourceName: RESOURCE_PEOPLE,
            source: result.results,
            options: { meta: result.meta, links: result.links }
        });

    describe('custom transforms', () => {
        beforeEach(() => {
            service.register({ name: RESOURCE_PEOPLE, schema: new SchemaBuilder<Person>(RESOURCE_PEOPLE).build() });
        });

        const expectPersonWithFirstLastName = (data: Dictionary, person: Person): void => {
            expectModel(data, person, RESOURCE_PEOPLE);
            const attributes = data.attributes as Dictionary;
            expect(attributes['first-name']).toEqual(person.firstName);
            expect(attributes['last-name']).toEqual(person.lastName);
        };

        it('can pass meta through', () => {
            const peopleResult: PeopleResult = {
                results: [new Person('Bob', 'Martin'), new Person('Alice', 'Smith')],
                meta: {
                    count: 2,
                    total: 100
                }
            };

            const result = transformResult(peopleResult);

            const { data, meta, links } = result;
            expectModelArray(data, peopleResult.results, RESOURCE_PEOPLE);
            expectPersonWithFirstLastName(data[0], peopleResult.results[0]);
            expectPersonWithFirstLastName(data[1], peopleResult.results[1]);
            expect(meta).toBeDefined();
            expect(meta).toEqual(peopleResult.meta);
            expect(links).toBeUndefined();
        });

        it('can pass links through', () => {
            const peopleResult: PeopleResult = {
                results: [new Person('Bob', 'Martin'), new Person('Alice', 'Smith')],
                links: {
                    self: '/people',
                    related: {
                        href: '/people/friends',
                        meta: {
                            count: 1
                        }
                    }
                }
            };

            const result = transformResult(peopleResult);

            const { data, links, meta } = result;
            expectModelArray(data, peopleResult.results, RESOURCE_PEOPLE);
            expectPersonWithFirstLastName(data[0], peopleResult.results[0]);
            expectPersonWithFirstLastName(data[1], peopleResult.results[1]);
            expect(links).toBeDefined();
            expect(links).toEqual(peopleResult.links);
            expect(meta).toEqual({});
        });
    });

    describe('failure conditions', () => {
        it('throws when resource is not registered', () => {
            const person = new Person('Bob', 'Martin');
            expect(() => service.transform({ source: person, resourceName: RESOURCE_PEOPLE })).toThrow(
                'Missing Schema: people'
            );
        });

        it('throws when wrong resource is provided', () => {
            const person = new Person('Bob', 'Martin');
            service.register(new SchemaBuilder<Person>(RESOURCE_PEOPLE));
            expect(() => service.transform({ source: person, resourceName: 'bob' })).toThrow('Missing Schema: bob');
        });
    });

    describe('relationships', () => {
        beforeEach(() => {
            // register people
            service.register({ name: RESOURCE_PEOPLE, schema: new SchemaBuilder<Person>(RESOURCE_PEOPLE).build() });
            // register photos and include the creator relationship
            service.register({
                name: RESOURCE_PHOTOS,
                schema: new SchemaBuilder<Photo>(RESOURCE_PHOTOS)
                    .data(
                        new SchemaDataBuilder<Photo>(RESOURCE_PHOTOS)
                            .attributes({ deny: ['creator'] })
                            .relationships({
                                creator: (params: SerializeRelationshipsDataParams) =>
                                    SchemaDataBuilder.includeBelongsToRelationship(params, 'creator', RESOURCE_PEOPLE)
                            })
                            .build()
                    )
                    .build()
            });
            // register albums and include hasMany relationship to photos
            service.register({
                name: RESOURCE_ALBUMS,
                schema: new SchemaBuilder<Album>(RESOURCE_ALBUMS)
                    .data(
                        new SchemaDataBuilder<Album>(RESOURCE_ALBUMS)
                            .attributes({ deny: ['photos'] })
                            .relationships({
                                photos: (params: SerializeRelationshipsDataParams) =>
                                    SchemaDataBuilder.includeHasManyRelationship(params, 'photos', RESOURCE_PHOTOS)
                            })
                            .build()
                    )
                    .build()
            });
        });

        it('belongsTo relationship included', () => {
            const bob = new Person('Bob', 'Martin');
            const photo = new Photo(faker.image.imageUrl(), bob);
            const result = service.transform({ source: photo, resourceName: RESOURCE_PHOTOS });

            const { data, included } = result;
            expectModel(data, photo, RESOURCE_PHOTOS);
            expect(data.attributes.url).toEqual(photo.url);
            // make sure the relationship linkage was included
            expectRelationship(data.relationships.creator, bob, RESOURCE_PEOPLE);
            // ensure the model was included
            expectModelArray(included, [bob], RESOURCE_PEOPLE);
            expect(included[0].attributes['first-name']).toEqual(bob.firstName);
            expect(included[0].attributes['last-name']).toEqual(bob.lastName);
        });

        it('hasMany relationship included', () => {
            const bob = new Person('Bob', 'Martin');
            const photo = new Photo(faker.image.imageUrl(), bob);
            const album = new Album('faves', [photo]);
            const result = service.transform({ source: album, resourceName: RESOURCE_ALBUMS });

            const { data, included } = result;
            expectModel(data, album, RESOURCE_ALBUMS);
            expect(included).toBeDefined();
            expect(included.length).toBe(2);
        });
    });
});
