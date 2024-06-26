import { Schema } from '@ubio/framework';

export interface AppInstance {
    id: string;
    group: string;
    createdAt: number;
    updatedAt: number;
    meta?: { [key: string]: any };
}

export const AppInstance = new Schema<AppInstance>({
    schema: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            group: { type: 'string' },
            createdAt: { type: 'number' },
            updatedAt: { type: 'number' },
            meta: {
                type: 'object',
                optional: true,
                properties: {},
                additionalProperties: true,
            },
        },
        required: ['id', 'group', 'createdAt', 'updatedAt'],
    },
});

export const AllAppInstances = new Schema<AppInstance[]>({
    schema: {
        type: 'array',
        items: AppInstance.schema,
    },
});
