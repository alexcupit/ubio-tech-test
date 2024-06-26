import { expect, should } from 'chai';
import { randomUUID } from 'crypto';
import supertest from 'supertest';

import { App } from '../main/app.js';

const app = new App();
should();

beforeEach(async () => await app.start());
afterEach(async () => await app.stop());

describe('POST /:group/:id', () => {
    it('201: should return a 201 if a new instance is created', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: {} })
            .expect(201);
    });

    it('200: should return a 200 if an existing instance is updated', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: {} })
            .expect(201);

        await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: {} })
            .expect(200);
    });

    it('201: should return the app instance if db response matches AppInstance schema', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        const { body } = await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: {} })
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
            .send({ meta: {} })
            .expect(201);

        const { body: body2 } = await request
            .post(`/particle-detector/${testUUID}`)
            .send({ meta: {} })
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

    it('400: should return a 400 if the request body contains a key other than meta', async () => {
        const request = supertest(app.httpServer.callback());

        // const testUUID = fakeUuid('e');
        const testUUID = randomUUID();

        const { body } = await request
            .post(`/particle-detector/${testUUID}`)
            .send({ incorrect: { schema: 'for meta data' } })
            .expect(400);

        body.message.should.include("must have required property 'meta'");
    });

    it('400: should return a 400 if the provided id is not a valid uuid', async () => {
        const request = supertest(app.httpServer.callback());

        const { body } = await request
            .post(`/particle-detector/123`)
            .send({ meta: {} })
            .expect(400);

        body.message.should.include('id must match format "uuid"');
    });

    // TODO: throw an error if the db response does not match app instance schema
    // TODO: meta spreads existing meta from db
});
