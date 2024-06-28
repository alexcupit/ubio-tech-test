import { expect, should } from 'chai';
import supertest from 'supertest';

import { App } from '../main/app.js';
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

describe('GET /swagger-ui', () => {
    it('302: should return a 302 redirect to the hosted ui on swagger hub ', async () => {
        const request = supertest(app.httpServer.callback());

        const { redirect, text } = await request.get(`/swagger-ui`).expect(302);

        expect(redirect).to.equal(true);

        text.should.include(
            'https://app.swaggerhub.com/apis-docs/AlexCupit/ubio-tech_test/1.0.0'
        );
    });
});
