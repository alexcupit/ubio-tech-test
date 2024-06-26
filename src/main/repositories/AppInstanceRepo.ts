import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { ReturnDocument } from 'mongodb';

import { AppInstance } from '../schema/instance.js';

export class AppInstanceRepo {
    @dep() private mongoDb!: MongoDb;

    protected get collection() {
        return this.mongoDb.db.collection<AppInstance>('instances');
    }

    async upsertOne({
        id,
        group,
        meta,
    }: {
        id: string;
        group: string;
        meta?: { [key: string]: any };
    }): Promise<AppInstance> {
        const query = { id, group };

        const update = {
            $set: { updatedAt: Date.now(), meta },
            $setOnInsert: { createdAt: Date.now() },
        };

        const options = {
            upsert: true,
            returnDocument: ReturnDocument.AFTER,
            projection: { _id: 0 },
        };

        return (await this.collection.findOneAndUpdate(
            query,
            update,
            options
        )) as AppInstance;
    }
