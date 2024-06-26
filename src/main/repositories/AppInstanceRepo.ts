import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { ReturnDocument } from 'mongodb';

import { AppInstance } from '../schema/AppInstance.js';

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
            projection: { _id: false },
        };

        return (await this.collection.findOneAndUpdate(
            query,
            update,
            options
        )) as AppInstance;
    }

    async deleteOne({ id, group }: { id: string; group: string }) {
        return await this.collection.deleteOne({ id, group });
    }

    async aggregate() {
        return await this.collection
            .aggregate([
                {
                    $group: {
                        _id: '$group',
                        instances: { $sum: 1 },
                        createdAt: { $min: '$createdAt' },
                        lastUpdatedAt: { $max: '$updatedAt' },
                    },
                },
                {
                    $project: {
                        _id: false,
                        group: '$_id',
                        instances: true,
                        createdAt: true,
                        lastUpdatedAt: true,
                    },
                },
            ])
            .toArray();
    }

    async findMany({ group }: { group: string }) {
        return await this.collection
            .find({ group }, { projection: { _id: false } })
            .toArray();
    }
}
