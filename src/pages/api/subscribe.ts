import type { APIRoute } from 'astro';
import { subscribe, ProviderError, type Subscriber } from '../../lib/newsletter';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const ALLOWED_ANSWER_KEYS = ['negocio', 'gasto', 'claridad'];

// Límite de intentos por IP. Vive en la memoria de cada instancia: frena a los pesados, no a un ejército.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_HITS;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max) : '';

export const POST: APIRoute = async ({ request, clientAddress, site, url }) => {
  // Solo peticiones desde nuestra propia web.
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== url.host) return json({ ok: false, error: 'origin' }, 403);
    } catch {
      return json({ ok: false, error: 'origin' }, 403);
    }
  }

  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json({ ok: false, error: 'content-type' }, 415);
  }

  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    (() => {
      try {
        return clientAddress;
      } catch {
        return '';
      }
    })() ||
    '';

  if (ip && rateLimited(ip)) return json({ ok: false, error: 'rate' }, 429);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return json({ ok: false, error: 'size' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'json' }, 400);
  }

  // Trampa para bots: campo oculto relleno o envío imposiblemente rápido. Les decimos que sí y a la mierda.
  const honeypot = clean(body.website, 200);
  const elapsed = Number(body.elapsed) || 0;
  if (honeypot || (elapsed > 0 && elapsed < 2500)) return json({ ok: true, status: 'pending' });

  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'email' }, 400);
  if (body.consent !== true) return json({ ok: false, error: 'consent' }, 400);

  const answers: Record<string, string> = {};
  if (body.answers && typeof body.answers === 'object') {
    for (const key of ALLOWED_ANSWER_KEYS) {
      const v = clean((body.answers as Record<string, unknown>)[key], 60);
      if (v) answers[key] = v;
    }
  }

  const sub: Subscriber = {
    email,
    name: clean(body.name, 40),
    answers,
    consentVersion: clean(body.consentVersion, 20),
    consentAt: new Date().toISOString(),
    ip,
    userAgent: clean(request.headers.get('user-agent'), 300),
    source: 'landing',
  };

  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const siteUrl = (site ?? url).toString();

  try {
    const status = await subscribe(sub, env, siteUrl);
    if (status === 'mock') {
      if (import.meta.env.PROD) {
        console.error('[subscribe] NEWSLETTER_PROVIDER no configurado. El email NO se ha guardado.');
        return json({ ok: false, error: 'not-configured' }, 503);
      }
      console.info('[subscribe] (modo desarrollo, sin proveedor)', { email: sub.email, name: sub.name, answers });
      return json({ ok: true, status: 'pending', mock: true });
    }
    return json({ ok: true, status });
  } catch (err) {
    console.error('[subscribe] error', err instanceof ProviderError ? `${err.message} ${String(err.detail).slice(0, 500)}` : err);
    return json({ ok: false, error: 'provider' }, 502);
  }
};

export const ALL: APIRoute = () => json({ ok: false, error: 'method' }, 405);
