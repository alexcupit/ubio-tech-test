import { config } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { DeleteResult, ReturnDocument } from 'mongodb';

import { AppInstance, AppInstanceDocument } from '../schema/AppInstance.js';
import { GroupSummary } from '../schema/GroupSummary.js';

export class AppInstanceRepo {
    @dep() private mongoDb!: MongoDb;
    @config({ default: 10 }) EXPIRY_SECONDS!: number;

    protected get collection() {
        return this.mongoDb.db.collection<AppInstanceDocument>('instances');
    }

    async createTTLIndex() {
        await this.collection.createIndex(
            { updatedAt: 1 },
            { expireAfterSeconds: this.EXPIRY_SECONDS }
        );
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
            $set: { updatedAt: new Date(), meta },
            $setOnInsert: { createdAt: new Date() },
        };

        const options = {
            upsert: true,
            returnDocument: ReturnDocument.AFTER,
            projection: { _id: false },
        };

        const res = (await this.collection.findOneAndUpdate(
            query,
            update,
            options
        )) as AppInstanceDocument;
        // cast as AppInstanceDocument as upsert: true means that the result will never be null

        return {
            ...res,
            createdAt: res.createdAt.getTime(),
            updatedAt: res.updatedAt.getTime(),
        };
    }

    async deleteOne({
        id,
        group,
    }: {
        id: string;
        group: string;
    }): Promise<DeleteResult> {
        return await this.collection.deleteOne({ id, group });
    }

    async aggregate(): Promise<GroupSummary[]> {
        return await this.collection
            .aggregate<GroupSummary>([
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
                        createdAt: { $toLong: '$createdAt' },
                        lastUpdatedAt: { $toLong: '$lastUpdatedAt' },
                    },
                },
            ])
            .toArray();
    }

    async findMany({ group }: { group: string }): Promise<AppInstance[]> {
        return await this.collection
            .aggregate<AppInstance>([
                { $match: { group } },
                {
                    $project: {
                        _id: false,
                        id: true,
                        group: true,
                        createdAt: { $toLong: '$createdAt' },
                        updatedAt: { $toLong: '$updatedAt' },
                        meta: true,
                    },
                },
            ])
            .toArray();
    }
}
