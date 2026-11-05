import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { whapiAuth } from '../auth';
import { whapiCommon } from '../common/client';

export const getMessage = createAction({
    auth: whapiAuth,
    name: 'get_message',
    displayName: 'Get Message',
    description: 'Retrieve a message by ID.',
    audience: 'both',
    aiMetadata: {
        description:
            'Fetch a single Whapi message by its ID. Use when you already have the message ID from chat history or a webhook payload.',
        idempotent: true,
    },
    classification: 'READ',
    props: {
        message_id: Property.ShortText({
            displayName: 'Message ID',
            description: 'ID of the message to retrieve.',
            required: true,
        }),
    },
    async run(context) {
        const { message_id } = context.propsValue;
        return whapiCommon.sendWhapiRequest({
            auth: context.auth,
            method: HttpMethod.GET,
            path: `messages/${message_id}`,
        });
    },
});
