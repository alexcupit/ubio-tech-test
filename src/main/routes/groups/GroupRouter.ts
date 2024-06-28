import {
    BodyParam,
    Delete,
    Get,
    PathParam,
    Post,
    Router,
} from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { AppInstanceRepo } from '../../repositories/AppInstanceRepo.js';
import { AllAppInstances, AppInstance } from '../../schema/AppInstance.js';

export class GroupRouter extends Router {
    @dep()
    mongoDb!: MongoDb;

    @dep()
    appInstanceRepo!: AppInstanceRepo;

    @Post({
        path: '/{group}/{id}',
        responses: { 201: { schema: AppInstance.schema } },
        summary: 'Creates a new app instance in a group',
    })
    async postGroupInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string,
        @BodyParam('meta', {
            schema: {
                type: 'object',
                properties: {},
                additionalProperties: true,
            },
            required: false,
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

    @Delete({
        path: '/{group}/{id}',
        summary: 'Deletes a given app instance from a group',
    })
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

    @Get({
        path: '/{group}',
        responses: { 200: { schema: AllAppInstances.schema } },
        summary: 'Shows an array of all instances of a given group',
    })
    async getAllGroupInstances(
        @PathParam('group', { schema: { type: 'string' } })
        group: string
    ) {
        const allInstances = await this.appInstanceRepo.findMany({ group });

        if (!allInstances.length) {
            this.ctx.status = 404;
            this.ctx.body = {
                message: `no app instances found for group: ${group}`,
            };
            return;
        }

        return AllAppInstances.decode(allInstances);
    }
}
