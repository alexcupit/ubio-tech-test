import { BodyParam, Delete, PathParam, Post, Router } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { AppInstanceRepo } from '../../repositories/AppInstanceRepo.js';
import { AppInstance } from '../../schema/instance.js';

export class GroupRouter extends Router {
    @dep()
    mongoDb!: MongoDb;

    @dep()
    appInstanceRepo!: AppInstanceRepo;

    @Post({
        path: '/{group}/{id}',
        responses: { 201: { schema: AppInstance.schema } },
    })
    async postGroupInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string,
        // TODO: make body optional but meta required if body present
        @BodyParam('meta', {
            schema: {
                type: 'object',
                properties: {
                    meta: {
                        type: 'object',
                        properties: {},
                    },
                },
            },
        })
        meta?: { [key: string]: any }
    ) {
        const updatedAppInstance = await this.appInstanceRepo.upsertOne({
            id,
            group,
            meta,
        });

        if (updatedAppInstance.createdAt === updatedAppInstance.updatedAt) {
            this.ctx.status = 201;
        }

        return AppInstance.decode(updatedAppInstance);
    }

    @Delete({ path: '/{group}/{id}' })
    async deleteGroupInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string
    ) {
        const { deletedCount } = await this.appInstanceRepo.deleteOne({
            id,
            group,
        });

        if (deletedCount === 0) {
            this.ctx.status = 404;
            this.ctx.body = { message: 'item not found in database' };
        } else {
            this.ctx.status = 204;
        }
    }
}
