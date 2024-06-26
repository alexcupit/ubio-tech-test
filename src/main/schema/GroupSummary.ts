import { Schema } from '@ubio/framework';

export interface GroupSummary {
    group: string;
    instances: number;
    createdAt: number;
    lastUpdatedAt: number;
}

export const GroupSummary = new Schema<GroupSummary>({
    schema: {
        type: 'object',
        properties: {
            group: { type: 'string' },
            instances: { type: 'number' },
            createdAt: { type: 'number' },
            lastUpdatedAt: { type: 'number' },
        },
        required: ['group', 'instances', 'createdAt', 'lastUpdatedAt'],
    },
});

export const GroupSummaryResponse = new Schema<GroupSummary[]>({
    schema: {
        type: 'array',
        items: GroupSummary.schema,
    },
});
