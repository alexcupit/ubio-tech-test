import { Get, Router } from '@ubio/framework';

export class SwaggerRouter extends Router {
    @Get({
        path: '/swagger-ui',
        summary: 'This will redirect to the swagger UI hosted on swaggerhub',
    })
    getSwaggerUi() {
        this.ctx.redirect(
            'https://app.swaggerhub.com/apis-docs/AlexCupit/ubio-tech_test/1.0.0'
        );
    }
}
