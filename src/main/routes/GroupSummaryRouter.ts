import { Get, Router } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { AppInstanceRepo } from '../repositories/AppInstanceRepo.js';
import { GroupSummaryResponse } from '../schema/GroupSummary.js';

export class GroupSummaryRouter extends Router {
    @dep()
    mongoDb!: MongoDb;

    @dep()
    appInstanceRepo!: AppInstanceRepo;

    @Get({
        path: '/',
        responses: {
            200: { schema: GroupSummaryResponse.schema },
        },
        summary:
            'Shows an array of summary information for each group including the number of instances and the last time an instance in this group was updated',
    })
    async getAllGroups() {
        const allGroups = await this.appInstanceRepo.groupAppInstances();

        if (!allGroups.length) {
            this.ctx.status = 404;
            this.ctx.body = { message: 'no app instances found' };
            return;
        }

        return GroupSummaryResponse.decode(allGroups);
    }
}
