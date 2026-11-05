import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { checkContact } from './lib/actions/check-contact';
import { checkHealth } from './lib/actions/check-health';
import { getMessage } from './lib/actions/get-message';
import { sendMessage } from './lib/actions/send-message';
import { whapiAuth } from './lib/auth';
import { WHAPI_BASE_URL } from './lib/common/constants';
import { whapiEvents } from './lib/triggers/whapi-events';

export const whapi = createPiece({
    displayName: 'Whapi',
    description:
        'Send and receive WhatsApp messages through Whapi.Cloud (gate.whapi.cloud).',
    minimumSupportedRelease: '0.88.2',
    logoUrl: 'https://cdn.activepieces.com/pieces/whapi.png',
    categories: [PieceCategory.COMMUNICATION],
    authors: ['Whapi-Cloud'],
    auth: whapiAuth,
    actions: [
        sendMessage,
        getMessage,
        checkContact,
        checkHealth,
        createCustomApiCallAction({
            baseUrl: () => WHAPI_BASE_URL,
            auth: whapiAuth,
            authMapping: async (auth) => ({
                Authorization: `Bearer ${auth.props.access_token}`,
            }),
        }),
    ],
    triggers: [whapiEvents],
});
