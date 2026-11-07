/**
 * Conectores de newsletter. Se elige con NEWSLETTER_PROVIDER:
 *   brevo       -> Brevo (recomendado, UE, doble opt-in nativo)
 *   mailerlite  -> MailerLite
 *   webhook     -> solo envía los datos a NEWSLETTER_WEBHOOK_URL (Make, Zapier, Google Sheets...)
 * Si además defines NEWSLETTER_WEBHOOK_URL con otro proveedor, se manda una copia al webhook.
 */

export interface Subscriber {
  email: string;
  name: string;
  answers: Record<string, string>;
  consentVersion: string;
  consentAt: string;
  ip: string;
  userAgent: string;
  source: string;
}

export type SubscribeStatus = 'pending' | 'subscribed' | 'exists';

export class ProviderError extends Error {
  constructor(message: string, public detail?: unknown) {
    super(message);
  }
}

type Env = Record<string, string | undefined>;

function required(env: Env, key: string): string {
  const v = env[key];
  if (!v) throw new ProviderError(`Falta la variable de entorno ${key}`);
  return v;
}

async function brevo(sub: Subscriber, env: Env, siteUrl: string): Promise<SubscribeStatus> {
  const apiKey = required(env, 'BREVO_API_KEY');
  const listId = Number(required(env, 'BREVO_LIST_ID'));
  const templateId = env.BREVO_DOI_TEMPLATE_ID ? Number(env.BREVO_DOI_TEMPLATE_ID) : 0;
  const attributes: Record<string, string> = {};
  if (sub.name) attributes.FIRSTNAME = sub.name;

  const headers = { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' };

  if (templateId) {
    // Doble opt-in: Brevo manda el correo de confirmación y solo añade el contacto a la lista al confirmar.
    const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: sub.email,
        attributes,
        includeListIds: [listId],
        templateId,
        redirectionUrl: env.BREVO_DOI_REDIRECT_URL || new URL('/confirmado', siteUrl).toString(),
      }),
    });
    if (res.status === 201 || res.status === 204) return 'pending';
    throw new ProviderError(`Brevo DOI ${res.status}`, await res.text().catch(() => ''));
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: sub.email, attributes, listIds: [listId], updateEnabled: true }),
  });
  if (res.status === 201) return 'subscribed';
  if (res.status === 204) return 'exists';
  throw new ProviderError(`Brevo ${res.status}`, await res.text().catch(() => ''));
}

async function mailerlite(sub: Subscriber, env: Env): Promise<SubscribeStatus> {
  const apiKey = required(env, 'MAILERLITE_API_KEY');
  const groupId = required(env, 'MAILERLITE_GROUP_ID');
  const doubleOptin = env.MAILERLITE_DOUBLE_OPTIN === 'true';
  const now = sub.consentAt.replace('T', ' ').slice(0, 19);

  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email: sub.email,
      fields: sub.name ? { name: sub.name } : {},
      groups: [groupId],
      ...(doubleOptin ? { status: 'unconfirmed' } : {}),
      ip_address: sub.ip || undefined,
      optin_ip: sub.ip || undefined,
      subscribed_at: now,
      opted_in_at: now,
    }),
  });
  if (res.status === 201) return doubleOptin ? 'pending' : 'subscribed';
  if (res.status === 200) return 'exists';
  throw new ProviderError(`MailerLite ${res.status}`, await res.text().catch(() => ''));
}

async function webhook(sub: Subscriber, env: Env): Promise<void> {
  const url = required(env, 'NEWSLETTER_WEBHOOK_URL');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (env.NEWSLETTER_WEBHOOK_SECRET) headers['x-webhook-secret'] = env.NEWSLETTER_WEBHOOK_SECRET;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...sub, answers: sub.answers }),
  });
  if (!res.ok) throw new ProviderError(`Webhook ${res.status}`, await res.text().catch(() => ''));
}

export async function subscribe(
  sub: Subscriber,
  env: Env,
  siteUrl: string,
): Promise<SubscribeStatus | 'mock'> {
  const provider = (env.NEWSLETTER_PROVIDER || '').toLowerCase();
  let status: SubscribeStatus;

  switch (provider) {
    case 'brevo':
      status = await brevo(sub, env, siteUrl);
      break;
    case 'mailerlite':
      status = await mailerlite(sub, env);
      break;
    case 'webhook':
      await webhook(sub, env);
      return 'subscribed';
    case '':
      return 'mock';
    default:
      throw new ProviderError(`Proveedor desconocido: ${provider}`);
  }

  // Copia opcional (por ejemplo a una hoja de cálculo con las respuestas del cuestionario).
  if (env.NEWSLETTER_WEBHOOK_URL) {
    try {
      await webhook(sub, env);
    } catch (err) {
      console.error('[subscribe] webhook de copia falló', err);
    }
  }
  return status;
}
