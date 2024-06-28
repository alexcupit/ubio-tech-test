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



### Body Params
- id: string
  - format: uuid
- group: string


## GET /



### Responses
#### Status: 200
- contentType: application/json
- body: array
  - items: object
    - group: string
    - instances: number
    - createdAt: number
    - lastUpdatedAt: number


## GET /swagger/ui



### Responses
#### Status: 200
- contentType: text/html
- body: {}


## GET /{group}



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