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
import { GroupSummaryResponse } from '../../schema/GroupSummary.js';

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

    @Get({
        path: '/',
        responses: {
            200: { schema: GroupSummaryResponse.schema },
        },
    })
    async getAllGroups() {
        const allGroups = await this.appInstanceRepo.aggregate();

        if (!allGroups.length) {
            this.ctx.status = 404;
            this.ctx.body = { message: 'no app instances found' };
            return;
        }
        return GroupSummaryResponse.decode(allGroups);
    }

    @Get({
        path: '/{group}',
        responses: { 200: { schema: AllAppInstances.schema } },
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
