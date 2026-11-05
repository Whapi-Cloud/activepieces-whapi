import {
    Property,
    TriggerStrategy,
    createTrigger,
} from '@activepieces/pieces-framework';
import { whapiAuth } from '../auth';
import {
    type WhapiWebhookEventType,
    removeWebhookFromSettings,
    upsertWebhookOnSettings,
    whapiCommon,
} from '../common/client';

export const whapiEvents = createTrigger({
    auth: whapiAuth,
    name: 'whapi_events',
    displayName: 'Whapi Events',
    description:
        'Start a flow when Whapi sends message or group webhook events to Activepieces.',
    type: TriggerStrategy.WEBHOOK,
    classification: 'READ',
    aiMetadata: {
        description:
            'Runs when Whapi posts webhook events for messages or groups to this flow URL. Registers the webhook on the channel when the flow is published.',
    },
    props: {
        event_families: Property.StaticMultiSelectDropdown({
            displayName: 'Trigger On',
            description:
                'Webhook event families to receive when this flow is active.',
            required: true,
            options: {
                options: [
                    {
                        label: 'Messages Events',
                        value: 'messages',
                    },
                    {
                        label: 'Groups Events',
                        value: 'groups',
                    },
                ],
            },
        }),
    },
    sampleData: {
        event: {
            type: 'messages',
            event: 'post',
        },
        messages: [],
    },
    async onEnable(context) {
        const webhookUrl = context.webhookUrl;
        const eventFamilies = resolveEventFamilies(
            context.propsValue.event_families ?? [],
        );

        if (eventFamilies.length === 0) {
            throw new Error('Select at least one event family.');
        }

        const settings = await whapiCommon.getSettings(context.auth);
        const updated = upsertWebhookOnSettings({
            settings,
            webhookUrl,
            eventTypes: eventFamilies,
        });
        await whapiCommon.patchSettings(context.auth, updated);
    },
    async onDisable(context) {
        const webhookUrl = context.webhookUrl;
        const settings = await whapiCommon.getSettings(context.auth);
        const updated = removeWebhookFromSettings({
            settings,
            webhookUrl,
        });
        await whapiCommon.patchSettings(context.auth, updated);
    },
    async run(context) {
        const body = context.payload.body;
        if (body === undefined || body === null) {
            return [];
        }
        return [body];
    },
});

const WHAPI_WEBHOOK_EVENT_TYPES = ['messages', 'groups'] as const;

function resolveEventFamilies(values: string[]): WhapiWebhookEventType[] {
    const resolved: WhapiWebhookEventType[] = [];
    for (const value of values) {
        for (const allowed of WHAPI_WEBHOOK_EVENT_TYPES) {
            if (allowed === value) {
                resolved.push(allowed);
            }
        }
    }
    return resolved;
}
