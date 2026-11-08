import type { APIRoute } from 'astro';
import { verifyToken, confirmBrevoContact } from '../../lib/newsletter';

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect }) => {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const secret = env.CONFIRM_SECRET;
  const token = url.searchParams.get('t') || '';
  const payload = secret ? verifyToken(token, secret) : null;
  if (!payload) return redirect('/enlace-caducado', 302);

  try {
    await confirmBrevoContact(payload.e, payload.n, env);
  } catch (err) {
    console.error('[confirm] error', err);
    return redirect('/enlace-caducado?error=1', 302);
  }
  return redirect('/confirmado', 302);
};
