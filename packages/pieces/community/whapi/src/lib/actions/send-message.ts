import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { whapiAuth } from '../auth';
import { whapiCommon, type WhapiMessageType } from '../common/client';

export const sendMessage = createAction({
    auth: whapiAuth,
    name: 'send_message',
    displayName: 'Send Message',
    description:
        'Send text, image, video, audio, document, or contact to a phone number or chat ID.',
    audience: 'both',
    aiMetadata: {
        description:
            'Send a WhatsApp message through Whapi to a phone number or chat ID. Use for outbound text or media; each call creates a new message.',
        idempotent: false,
    },
    classification: 'WRITE',
    props: {
        to: Property.ShortText({
            displayName: 'Recipient',
            description:
                'Phone number (e.g. 447911123456) or group/channel chat ID.',
            required: true,
        }),
        message_type: Property.StaticDropdown({
            displayName: 'Message Type',
            description: 'Type of message to send.',
            required: true,
            options: {
                options: [
                    { label: 'Text', value: 'text' },
                    { label: 'Image', value: 'image' },
                    { label: 'Video', value: 'video' },
                    { label: 'Audio', value: 'audio' },
                    { label: 'Document', value: 'document' },
                    { label: 'Contact', value: 'contact' },
                ],
            },
            defaultValue: 'text',
        }),
        body: Property.LongText({
            displayName: 'Body',
            description: 'Message text (for text and contact types).',
            required: false,
        }),
        media: Property.ShortText({
            displayName: 'Media',
            description:
                'URL, media ID, or base64 for image, video, audio, or document.',
            required: false,
        }),
        caption: Property.LongText({
            displayName: 'Caption',
            description: 'Caption for image, video, or document.',
            required: false,
        }),
        typing_time: Property.Number({
            displayName: 'Typing Time',
            description: 'Seconds to simulate typing (0–60).',
            required: false,
        }),
    },
    async run(context) {
        const { to, message_type, body, media, caption, typing_time } =
            context.propsValue;
        const messageType = resolveMessageType(message_type);

        const payload: Record<string, unknown> = { to };

        if (body) {
            payload['body'] = body;
        }
        if (media) {
            payload['media'] = media;
        }
        if (caption) {
            payload['caption'] = caption;
        }
        if (typing_time !== undefined && typing_time !== null) {
            payload['typing_time'] = typing_time;
        }

        return whapiCommon.sendWhapiRequest({
            auth: context.auth,
            method: HttpMethod.POST,
            path: whapiCommon.messageSendPath(messageType),
            body: payload,
        });
    },
});

const WHAPI_MESSAGE_TYPES = [
    'text',
    'image',
    'video',
    'audio',
    'document',
    'contact',
] as const;

function resolveMessageType(value: string): WhapiMessageType {
    for (const messageType of WHAPI_MESSAGE_TYPES) {
        if (messageType === value) {
            return messageType;
        }
    }
    throw new Error('Invalid message type');
}
