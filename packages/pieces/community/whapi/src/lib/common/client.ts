import {
    AuthenticationType,
    HttpMethod,
    HttpRequest,
    httpClient,
    QueryParams,
} from '@activepieces/pieces-common';
import { WHAPI_BASE_URL } from './constants';

type WhapiAuthValues = {
    access_token: string;
    channel_id?: string;
};

export type WhapiConnectionAuth = {
    props: WhapiAuthValues;
};

function bearerAuth(auth: WhapiConnectionAuth): HttpRequest['authentication'] {
    return {
        type: AuthenticationType.BEARER_TOKEN,
        token: auth.props.access_token,
    };
}

async function sendWhapiRequest({
    auth,
    method,
    path,
    body,
    query,
}: {
    auth: WhapiConnectionAuth;
    method: HttpMethod;
    path: string;
    body?: Record<string, unknown>;
    query?: QueryParams;
}) {
    const request: HttpRequest = {
        method,
        url: `${WHAPI_BASE_URL}/${path}`,
        authentication: bearerAuth(auth),
        queryParams: query,
    };
    if (body !== undefined && Object.keys(body).length > 0) {
        request.body = body;
    }
    const response = await httpClient.sendRequest<unknown>(request);
    return response.body;
}

async function getSettings(auth: WhapiConnectionAuth) {
    const response = await httpClient.sendRequest<WhapiSettings>({
        method: HttpMethod.GET,
        url: `${WHAPI_BASE_URL}/settings`,
        authentication: bearerAuth(auth),
    });
    return response.body;
}

async function patchSettings(
    auth: WhapiConnectionAuth,
    settings: WhapiSettings,
) {
    const response = await httpClient.sendRequest<WhapiSettings>({
        method: HttpMethod.PATCH,
        url: `${WHAPI_BASE_URL}/settings`,
        authentication: bearerAuth(auth),
        body: settings,
    });
    return response.body;
}

function messageSendPath(messageType: WhapiMessageType) {
    return `messages/${messageType}`;
}

export const whapiCommon = {
    sendWhapiRequest,
    getSettings,
    patchSettings,
    messageSendPath,
};

export type WhapiMessageType =
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'contact';

export type WhapiWebhookEventType = 'messages' | 'groups';

export type WhapiWebhookEventMethod = 'post' | 'put' | 'delete' | 'patch';

export type WhapiWebhookEvent = {
    type: WhapiWebhookEventType;
    method: WhapiWebhookEventMethod;
};

export type WhapiWebhookConfig = {
    url: string;
    events?: WhapiWebhookEvent[];
    mode?: 'body' | 'path' | 'method';
    headers?: Record<string, string>;
};

export type WhapiSettings = {
    webhooks?: WhapiWebhookConfig[];
    callback_backoff_delay_ms?: number;
    max_callback_backoff_delay_ms?: number;
    callback_persist?: boolean;
    proxy?: string;
    mobile_proxy?: string;
    offline_mode?: boolean;
    full_history?: boolean;
};

const EVENT_METHODS: WhapiWebhookEventMethod[] = [
    'put',
    'post',
    'delete',
    'patch',
];

export function buildWebhookEvents(
    eventTypes: WhapiWebhookEventType[],
): WhapiWebhookEvent[] {
    return eventTypes.flatMap((type) =>
        EVENT_METHODS.map((method) => ({ type, method })),
    );
}

export function upsertWebhookOnSettings({
    settings,
    webhookUrl,
    eventTypes,
}: {
    settings: WhapiSettings;
    webhookUrl: string;
    eventTypes: WhapiWebhookEventType[];
}): WhapiSettings {
    const events = buildWebhookEvents(eventTypes);
    const newHook: WhapiWebhookConfig = {
        url: webhookUrl,
        events,
        mode: 'body',
    };
    const otherWebhooks =
        settings.webhooks?.filter((hook) => hook.url !== webhookUrl) ?? [];
    return {
        ...settings,
        webhooks: [...otherWebhooks, newHook],
    };
}

export function removeWebhookFromSettings({
    settings,
    webhookUrl,
}: {
    settings: WhapiSettings;
    webhookUrl: string;
}): WhapiSettings {
    return {
        ...settings,
        webhooks:
            settings.webhooks?.filter((hook) => hook.url !== webhookUrl) ?? [],
    };
}
