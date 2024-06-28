# App Instance Service

This repo uses the [UBIO Node Framework](https://github.com/ubio/node-framework) for creating an HTTP server that registers, deletes and shows a summary of different app instances and their associated group.

## Running Locally

To run this locally, you will need the following dependencies installed:

-   [Node.js](https://nodejs.org/en) (including npm)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Mongo](https://www.mongodb.com/docs/manual/installation/) for connecting to a database.

To get started, clone this repo and install dependencies by running: `npm i`

### Environment Config

The following environment variables can be set for this service, only `MONGO_URL` is required.

This could either be a local instance of mongo if it is installed or you can connect to a containerised version using Docker Desktop (see below).

```
MONGO_URL=<connection string to mongodb eg 'mongodb://localhost:27017'>
EXPIRY_SECONDS=<optional but defaults to 3600>
```

The additional variables in `.env.example` have been generated using `npx generate-env` and relates to other areas of the [UBIO Node Framework](https://github.com/ubio/node-framework) that can be configured.

### Starting the Server

If you want to use a containerised mongo database via Docker Desktop, first run `npm run start-docker`.

Now you are ready to start the server by running `npm start`.

By default, the server will run on `http://localhost:8080/`.

For development work, where you might want the TypeScript to compile to JavaScript upon code changes and for the server to reload without having to manually kill and restart the server, you can run `npm run dev` for compiling in watch mode and `npm run start:dev` in another shell which uses nodemon for reloading the server.

Finally, if using docker the container can be removed by running: `npm run stop-docker` once the server has been terminated.

## Deployed Service

An instance of this service has been deployed via Render which is accessible [here.](https://ubio-tech-test.onrender.com/)

The deployed mongo instance is hosted using Atlas and the `MONGO_URL` environment variable is set via Render.

This hosted mongodb can be configured to enable sharding on more premium plans or alternative horizontal scaling options could be considered.

### Available Endpoints

An additional endpoint to those specified in [Technical Test.md](<./Technical Test.md>) has been created to display the available endpoints. This new endpoint will redirect to the hosted swagger UI: [https://ubio-tech-test.onrender.com/swagger-ui](https://ubio-tech-test.onrender.com/swagger-ui)

Here are some example cURL commands to interact with the deployed service:

#### `POST /:group/:id`

```
curl --request POST \
  --url https://ubio-tech-test.onrender.com/test-group/aacfcab4-6510-4559-a712-e524901f7bb6
  --data '{"meta": {}}'
```

#### `DELETE /:group/:id`

```
curl --request DELETE \
  --url https://ubio-tech-test.onrender.com/test-group/aacfcab4-6510-4559-a712-e524901f7bb6
```

#### `GET /:group/`

```
curl --request GET \
  --url https://ubio-tech-test.onrender.com/test-group
```

#### `GET /`

```
curl --request GET \
  --url https://ubio-tech-test.onrender.com/
```

## Testing

Testing runs against a containerised mongo database and will require Docker Desktop running.

Environment variables for testing are configured in the script: `npm test`

## CI/CD

A CI pipeline has been configured using GitHub Actions and runs can be seen [here.](https://github.com/alexcupit/ubio-tech-test/actions)

CD is managed through Render's integration with GitHub and new deployments are triggered by pushes to `main`.

## Decision Log

Some implementation decisions that were made:

-   Default TTL value set to 1hr. It's hard to know without knowing how regular heartbeats might be sent from instances of each group but an hour's absence of interaction felt like a reasonable benchmark that can easily be changed if needed.
-   I've chosen to host the Swagger UI using their service and created an endpoint that redirects here. Ideally this would be a static page rendered by the server.
-   I've created three routers to abstract some of the logic for the endpoints:
    -   GroupRouter: /:group/...
    -   GroupSummaryRouter: /
    -   SwaggerRouter: /swagger-ui
-   Where data does not exist, I've implemented a 404 response rather than providing an empty array.
-   I've made the body schema for POST /:group/:id optional but this means that providing an incorrect schema (not on a key of `meta`) will be ignored. Therefore users must rely on the code and documentation to
