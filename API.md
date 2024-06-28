# ubio-tech-test (1.0.0)
Alex Cupit's backend developer technical test for UBIO


## GET /metrics
(internal) Get current process metrics


### Responses
#### Status: 200
Prometheus metrics in text-based format
- contentType: text/plain
- body: {}


## POST /{group}/{id}
Creates a new app instance in a group


### Body Params
- meta: object (optional)
- id: string
  - format: uuid
- group: string


### Responses
#### Status: 201
- contentType: application/json
- body: object
  - id: string
    - format: uuid
  - group: string
  - createdAt: number
  - updatedAt: number
  - meta: object(optional)


## DELETE /{group}/{id}
Deletes a given app instance from a group


### Body Params
- id: string
  - format: uuid
- group: string


## GET /{group}
Shows an array of all instances of a given group


### Body Params
- group: string


### Responses
#### Status: 200
- contentType: application/json
- body: array
  - items: object
    - id: string
      - format: uuid
    - group: string
    - createdAt: number
    - updatedAt: number
    - meta: object(optional)


## GET /
Shows an array of summary information for each group including the number of instances and the last time an instance in this group was updated


### Responses
#### Status: 200
- contentType: application/json
- body: array
  - items: object
    - group: string
    - instances: number
    - createdAt: number
    - lastUpdatedAt: number


## GET /swagger-ui
This will redirect to the swagger UI hosted on swaggerhub


### Responses
#### Status: 302
- contentType: application/json
- body: {}