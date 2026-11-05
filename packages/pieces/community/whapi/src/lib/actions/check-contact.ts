import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { whapiAuth } from '../auth';
import { whapiCommon } from '../common/client';

export const checkContact = createAction({
    auth: whapiAuth,
    name: 'check_contact',
    displayName: 'Check Contact',
    description: 'Check whether a phone number is registered on WhatsApp.',
    audience: 'both',
    aiMetadata: {
        description:
            'Check if a phone number has WhatsApp via Whapi. Safe to retry with the same number.',
        idempotent: true,
    },
    classification: 'READ',
    props: {
        contact: Property.ShortText({
            displayName: 'Contact',
            description: 'Phone number to check (e.g. 447911123456).',
            required: true,
        }),
    },
    async run(context) {
        const { contact } = context.propsValue;
        return whapiCommon.sendWhapiRequest({
            auth: context.auth,
            method: HttpMethod.POST,
            path: 'contacts',
            body: {
                blocking: 'wait',
                contacts: [contact],
            },
        });
    },
});
