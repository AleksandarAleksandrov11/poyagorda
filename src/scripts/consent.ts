/**
 * Consentimiento de cookies y analítica.
 * La analítica (Vercel Web Analytics + Speed Insights) solo se carga si el usuario la acepta.
 * La elección se guarda en localStorage (almacenamiento técnico, exento de consentimiento).
 */
import { inject, track as vercelTrack } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

const KEY = 'pg-consent';
const VERSION = 1;

export interface Consent {
  v: number;
  analytics: boolean;
  date: string;
}

let analyticsLoaded = false;

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    return parsed && parsed.v === VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): Consent {
  const consent: Consent = { v: VERSION, analytics, date: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(consent));
  } catch {
    /* modo privado o almacenamiento bloqueado: se respeta la decisión solo en esta visita */
  }
  applyConsent(consent);
  window.dispatchEvent(new CustomEvent('pg:consent', { detail: consent }));
  return consent;
}

export function applyConsent(consent: Consent | null) {
  if (!consent?.analytics || analyticsLoaded) return;
  analyticsLoaded = true;
  inject({ mode: import.meta.env.PROD ? 'production' : 'development', debug: false });
  injectSpeedInsights();
}

/** Evento de analítica. No hace nada si no hay consentimiento. */
export function track(name: string, props?: Record<string, string | number | boolean>) {
  if (!analyticsLoaded) return;
  try {
    vercelTrack(name, props);
  } catch {
    /* nunca rompas la web por una métrica */
  }
}
