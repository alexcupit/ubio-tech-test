import { expect, should } from 'chai';
import { randomUUID } from 'crypto';
import supertest from 'supertest';

import { App } from '../main/app.js';
import { AppInstance } from '../main/schema/AppInstance.js';
import { TestSeed } from './seed.js';

const app = new App();
app.mesh.service(TestSeed);
const seed = app.mesh.resolve(TestSeed);

should();

beforeEach(async () => {
    await app.start();
});

afterEach(async () => {
    await seed.deleteAll();
    await app.stop();
});

describe('POST /:group/:id', () => {
    it('201: should return a 201 if a new instance is created', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);
    });

    it('200: should return a 200 if an existing instance is updated', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);

        await request.post(`/particle-detector/${testUUID}`).expect(200);
    });

    it('201: should return the app instance if db response matches AppInstance schema', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        const { body } = await request
            .post(`/particle-detector/${testUUID}`)
            .expect(201);

        body.should.include({
            id: testUUID,
            group: 'particle-detector',
        });

        expect(body.createdAt).to.be.a('number');
        expect(body.updatedAt).to.be.a('number');
    });

    it('201: should set the updatedAt date on the second request while the createdAt date remains unchanged', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        const { body: body1 } = await request
            .post(`/particle-detector/${testUUID}`)

            .expect(201);

        const { body: body2 } = await request
            .post(`/particle-detector/${testUUID}`)
            .expect(200);

        expect(body1.createdAt).to.equal(body2.createdAt);
        expect(body2.updatedAt).to.be.greaterThan(body2.createdAt);
    });

    it('201: should accept a meta object in the request body and return this in the response', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        const { body } = await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: { important: 'data' } })
            .expect(201);

        body.should.deep.include({
            id: testUUID,
            group: 'particle-detector',
            meta: { important: 'data' },
        });

        expect(body.createdAt).to.be.a('number');
        expect(body.updatedAt).to.be.a('number');
    });

    it("201: should ignore any other keys in the body that aren't on the meta key", async () => {
        const request = supertest(app.httpServer.callback());

        // const testUUID = fakeUuid('e');
        const testUUID = randomUUID();

        const { body } = await request
            .post(`/particle-detector/${testUUID}`)
            .send({
                banana: { incorrect: 'schema' },
                meta: { correct: 'schema' },
            })
            .expect(201);

        body.should.not.deep.include({ banana: { incorrect: 'schema' } });
    });

    it('400: should return a 400 if the provided id is not a valid uuid', async () => {
        const request = supertest(app.httpServer.callback());

        const { body } = await request
            .post(`/particle-detector/123`)
            .expect(400);

        body.message.should.include('id must match format "uuid"');
    });

    // TODO: throw an error if the db response does not match app instance schema
    // TODO: meta spreads existing meta from db
});

describe('DELETE /:group/:id', () => {
    it('204: should return a 204 if an existing instance is successfully deleted', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);

        await request.delete(`/particle-detector/${testUUID}`).expect(204);
    });

    it('404: should return a 404 if an non-existing instance id is requested to be deleted', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);

        const { body } = await request
            .delete(`/a-new-group/${testUUID}`)
            .expect(404);

        body.message.should.include('item not found in database');
    });

    it('404: should return a 404 if an non-existing instance group is requested to be deleted', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        const { body } = await request
            .delete(`/particle-detector/${testUUID}`)
            .expect(404);

        body.message.should.include('item not found in database');
    });

    it('400: should return a 400 if the provided id is not a valid uuid', async () => {
        const request = supertest(app.httpServer.callback());

        const { body } = await request
            .delete(`/particle-detector/123`)
            .expect(400);

        body.message.should.include('id must match format "uuid"');
    });

    // TODO: check all instances before and after a deletion once new endpoint created
});

describe('GET /:group', () => {
    it('200: should return a 200 status if there are instances of the given group in the database', async () => {
        const request = supertest(app.httpServer.callback());

        await request.post(`/particle-detector/${randomUUID()}`);

        await request.get('/particle-detector').expect(200);
    });

    it('404: should return a 404 if there are no instances of the given group in the database', async () => {
        const request = supertest(app.httpServer.callback());

        const { body } = await request.get('/particle-detector').expect(404);

        body.message.should.include(
            'no app instances found for group: particle-detector'
        );
    });

    it('200: should return an array with all of the app instances of the given group', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();
        const testUUID2 = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);
        await request
            .post(`/particle-detector/${testUUID2}`)
            .send({ banana: { something: 'here' } })
            .expect(201);

        const { body } = await request.get('/particle-detector').expect(200);

        body.length.should.equal(2);
        body.forEach((appInstance: AppInstance) => {
            appInstance.group.should.equal('particle-detector');
        });
    });
});

describe('Creating TTL index ', () => {
    it('should have an index on the collection with an expiry time set from an environment variable', async () => {
        const indexes = await seed.getIndexes();

        const ttlIndex = indexes.find(
            ({ key: { updatedAt } }) => updatedAt === 1
        );

        ttlIndex!.expireAfterSeconds!.should.equal(1);
    });
});
