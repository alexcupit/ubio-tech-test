import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { AppInstance } from '../main/schema/AppInstance.js';

export class TestSeed {
    @dep() mongoDb!: MongoDb;

    private get collection() {
        return this.mongoDb.db.collection<AppInstance>('instances');
    }

    async deleteAll() {
        if (process.env.NODE_ENV !== 'test') return;
        await this.collection.deleteMany();
    }
}
