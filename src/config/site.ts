/**
 * Todo lo que hay que tocar sin meterse en el código está aquí.
 * Los campos marcados con [PENDIENTE] salen tal cual en las páginas legales
 * hasta que los rellenes. No publiques sin rellenarlos.
 */

export const brand = {
  name: 'POYAGORDA',
  motto: 'Marketing con huevos.',
  slogan: 'Te auditamos el negocio. Sin anestesia y sin gilipolleces.',
  description:
    'POYAGORDA. Marketing con huevos. Auditorías para negocios que están tirando el dinero y no saben en qué. Algo gordo se acerca.',
  instagram: 'https://www.instagram.com/somospoyagorda/',
  instagramHandle: '@somospoyagorda',
  /** Pon la URL de TikTok cuando exista. Si está vacía, no se muestra. */
  tiktok: '',
};

export const legal = {
  /** Nombre y apellidos (autónomo) o razón social (sociedad). */
  owner: '[PENDIENTE: nombre completo o razón social]',
  /** NIF o CIF. */
  taxId: '[PENDIENTE: NIF/CIF]',
  /** Domicilio completo. */
  address: '[PENDIENTE: domicilio completo]',
  /** Email para contacto y ejercicio de derechos RGPD. */
  email: '[PENDIENTE: email de contacto]',
  /** Solo sociedades: datos del Registro Mercantil. Déjalo vacío si eres autónomo. */
  registry: '',
  /** Fecha de la última revisión de los textos legales. */
  updatedAt: '7 de noviembre de 2026',
};

/**
 * Proveedor que guarda los emails y envía la newsletter.
 * Debe coincidir con NEWSLETTER_PROVIDER en Vercel. Sale en la política de privacidad.
 */
export const newsletterProcessor = {
  name: 'Brevo (Sendinblue SAS)',
  location: 'Francia, Unión Europea',
  privacyUrl: 'https://www.brevo.com/es/legal/privacypolicy/',
};

/** Versión del texto de consentimiento. Cámbiala si cambias el texto del checkbox. */
export const CONSENT_VERSION = '2026-11-07';
