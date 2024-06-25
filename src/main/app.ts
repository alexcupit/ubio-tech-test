import { Application } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';

export class App extends Application {
    // Note: application can inject global-scoped components
    @dep() mongoDb!: MongoDb;

    override createGlobalScope() {
        const mesh = super.createGlobalScope();
        mesh.service(MongoDb);
        // mesh.service(MyService);
        // mesh.service(MyRepository);
        return mesh;
    }

    override createHttpRequestScope() {
        const mesh = super.createHttpRequestScope();
        // mesh.service(MyRouter);
        return mesh;
    }

    override async beforeStart() {
        await this.mongoDb.client.connect();
        // Add other code to execute on application startup
        await this.httpServer.startServer();
    }

    override async afterStop() {
        await this.httpServer.stopServer();
        // Add other finalization code
        this.mongoDb.client.close();
    }
}
