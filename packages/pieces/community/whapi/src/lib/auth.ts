import { PieceAuth, Property } from '@activepieces/pieces-framework';
import {
    AuthenticationType,
    HttpMethod,
    httpClient,
} from '@activepieces/pieces-common';
import { WHAPI_BASE_URL } from './common/constants';

export const whapiAuth = PieceAuth.CustomAuth({
    displayName: 'Whapi API',
    description:
        'Channel token from the Whapi Panel (panel.whapi.cloud → your channel → Token).',
    required: true,
    props: {
        access_token: PieceAuth.SecretText({
            displayName: 'Access Token',
            description:
                'Channel token from Whapi Panel. See https://whapi.cloud/docs for authorization.',
            required: true,
        }),
        channel_id: Property.ShortText({
            displayName: 'Channel ID',
            description:
                'Optional. From the channel URL: panel.whapi.cloud/channels/{channel-id}',
            required: false,
        }),
    },
    validate: async ({ auth }) => {
        try {
            await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${WHAPI_BASE_URL}/limits`,
                authentication: {
                    type: AuthenticationType.BEARER_TOKEN,
                    token: auth.access_token,
                },
            });
            return { valid: true };
        } catch {
            return { valid: false, error: 'Invalid access token' };
        }
    },
    getConnectionIdentifier: async ({ auth }) => {
        if (auth.channel_id) {
            return auth.channel_id;
        }
        return undefined;
    },
});
