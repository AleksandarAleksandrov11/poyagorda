/**
 * Todo lo que hay que tocar sin meterse en el código está aquí.
 * Estos datos salen en el aviso legal, la privacidad y el formulario.
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
  owner: 'Alejandro Sánchez García',
  /** NIF o CIF. */
  taxId: '05333488H',
  /** Domicilio completo. */
  address: 'Calle Carrión de los Condes, 77',
  /** Email para contacto y ejercicio de derechos RGPD. */
  email: 'info@poyagorda.com',
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
