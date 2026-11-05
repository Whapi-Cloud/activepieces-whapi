import { HttpMethod } from '@activepieces/pieces-common';
import { createAction } from '@activepieces/pieces-framework';
import { whapiAuth } from '../auth';
import { whapiCommon } from '../common/client';

export const checkHealth = createAction({
    auth: whapiAuth,
    name: 'check_health',
    displayName: 'Check Health',
    description:
        'Check channel health and operational status (optionally launch the channel).',
    audience: 'both',
    aiMetadata: {
        description:
            'Returns Whapi channel uptime and connection status. Use to verify the instance is running or to wake the channel.',
        idempotent: true,
    },
    classification: 'READ',
    props: {},
    async run(context) {
        return whapiCommon.sendWhapiRequest({
            auth: context.auth,
            method: HttpMethod.GET,
            path: 'health',
        });
    },
});
