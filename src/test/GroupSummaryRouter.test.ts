import { should } from 'chai';
import { randomUUID } from 'crypto';
import supertest from 'supertest';

import { App } from '../main/app.js';
import { GroupSummary } from '../main/schema/GroupSummary.js';
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

describe('GET /', () => {
    it('200: should return a 200 if there are groups registered', async () => {
        const request = supertest(app.httpServer.callback());

        const testUUID = randomUUID();

        await request.post(`/particle-detector/${testUUID}`).expect(201);

        await request.get('/').expect(200);
    });

    it('404: should return a 404 if there are no groups registered', async () => {
        const request = supertest(app.httpServer.callback());

        const { body } = await request.get('/').expect(404);

        body.message.should.include('no app instances found');
    });

    it('200: should return an array with the number of instances of each group, the createdAt date of the first instance and the lastUpdatedAt date of the last instance', async () => {
        const request = supertest(app.httpServer.callback());

        // create first instance
        const testUUID = randomUUID();
        const {
            body: { createdAt },
        } = await request.post(`/particle-detector/${testUUID}`).expect(201);

        // create second instance
        const testUUID2 = randomUUID();
        const {
            body: { updatedAt },
        } = await request.post(`/particle-detector/${testUUID2}`).expect(201);

        const { body } = await request.get('/').expect(200);

        const particleDetectorSummary: GroupSummary = body.find(
            (groupSummary: GroupSummary) =>
                groupSummary.group === 'particle-detector'
        );

        particleDetectorSummary.instances.should.equal(2);
        particleDetectorSummary.createdAt.should.equal(createdAt);
        particleDetectorSummary.lastUpdatedAt.should.equal(updatedAt);
    });
});
