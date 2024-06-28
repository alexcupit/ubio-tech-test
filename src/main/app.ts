import { Application } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

import { AppInstanceRepo } from './repositories/AppInstanceRepo.js';
import { GroupRouter } from './routes/groups/GroupRouter.js';
import { GroupSummaryRouter } from './routes/GroupSummaryRouter.js';
import { SwaggerRouter } from './routes/SwaggerRouter.js';

export class App extends Application {
    @dep() mongoDb!: MongoDb;
    @dep() appInstanceRepo!: AppInstanceRepo;

    override createGlobalScope() {
        const mesh = super.createGlobalScope();
        mesh.service(MongoDb);
        mesh.service(AppInstanceRepo);
        return mesh;
    }

    override createHttpRequestScope() {
        const mesh = super.createHttpRequestScope();
        mesh.service(SwaggerRouter);
        mesh.service(GroupRouter);
        mesh.service(GroupSummaryRouter);
        return mesh;
    }

    override async beforeStart() {
        await this.mongoDb.start();
        await this.appInstanceRepo.createTTLIndex();
        await this.httpServer.startServer();
    }

    override async afterStop() {
        await this.httpServer.stopServer();
        await this.mongoDb.stop();
    }
}
