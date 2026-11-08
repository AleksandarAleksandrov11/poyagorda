# POYAGORDA

Landing de captación de emails para POYAGORDA. Marketing con huevos.

Astro + Vercel. Una sola página interactiva: logo animado, una linterna que revela verdades incómodas y una terminal que interroga al visitante y acaba pidiéndole el email. Más páginas legales, aviso de cookies y analítica de Vercel.

## Arrancar en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + build para Vercel
```

En local, sin proveedor configurado, el formulario funciona en modo prueba: no guarda nada y escribe el email en la consola del servidor.

## Publicar en Vercel

1. Importa el repo en Vercel. Detecta Astro solo (`vercel.json` ya está).
2. En **Settings > Environment Variables** añade las variables de `.env.example` (mínimo `NEWSLETTER_PROVIDER` y las de tu proveedor).
3. En **Analytics** y **Speed Insights** pulsa *Enable*. Solo se cargan si el visitante acepta la analítica en el aviso de cookies.
4. Si tienes dominio propio, añádelo en **Domains** y pon `SITE_URL`.

> En producción, si `NEWSLETTER_PROVIDER` no está definido, el formulario devuelve error para no perder emails en silencio.

## Conectar la newsletter

### Brevo (recomendado: empresa europea, gratis hasta 300 envíos al día, contactos ilimitados)

1. Crea una cuenta en brevo.com y una lista en **Contactos > Listas**. Apunta su ID.
2. Verifica el dominio y el remitente (`marketing@poyagorda.com`) en Brevo.
3. Crea una API key en **SMTP y API > Claves API** y desactiva la restricción de IPs en **Seguridad**.
4. En Vercel: `NEWSLETTER_PROVIDER=brevo`, `BREVO_API_KEY`, `BREVO_LIST_ID`, `CONFIRM_SECRET` (texto largo aleatorio) y `SITE_URL`.

El doble opt-in lo hace la propia web: manda por Brevo el correo de `emails/confirmacion.html` con un enlace firmado que caduca en 48 horas. El contacto entra en la lista solo cuando lo pulsa. (Si prefieres la plantilla DOI nativa de Brevo, pon su ID en `BREVO_DOI_TEMPLATE_ID`.)

Tras confirmar, el usuario llega a `/confirmado`.

### MailerLite

`NEWSLETTER_PROVIDER=mailerlite`, `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`. Activa el doble opt-in para API en *Account settings > Subscribe settings* y deja `MAILERLITE_DOUBLE_OPTIN=true`. Si usas MailerLite, cambia `newsletterProcessor` en `src/config/site.ts` para que la política de privacidad lo nombre.

### Webhook / Google Sheets

`NEWSLETTER_WEBHOOK_URL` recibe un POST JSON con `email`, `name`, `answers` (respuestas del cuestionario), `consentVersion`, `consentAt`, `ip`, `userAgent`. Puede ser el destino único (`NEWSLETTER_PROVIDER=webhook`) o una copia además de Brevo/MailerLite. Si defines `NEWSLETTER_WEBHOOK_SECRET`, llega en la cabecera `x-webhook-secret`.

## Datos legales

Están en `src/config/site.ts` y salen en el aviso legal, la privacidad y el formulario. Cualquier cambio (domicilio, email, pasar a sociedad...) se hace ahí.

- `legal.registry`: solo si en algún momento hay sociedad (datos del Registro Mercantil).
- `brand.tiktok`: URL de TikTok cuando exista.
- El email `cuentanos@poyagorda.com` tiene que existir y recibir correo: es donde la gente ejerce sus derechos RGPD.

Si cambias el texto de la casilla de consentimiento, sube `CONSENT_VERSION`.

## Dónde se toca cada cosa

| Qué | Dónde |
| --- | --- |
| Textos de la terminal (preguntas, insultos, respuestas) | `src/scripts/gate.ts` |
| Portada | `src/components/Hero.astro` |
| Frases de la linterna y manifiesto | `src/components/Spotlight.astro` |
| Logo y su animación | `src/components/Logo.astro` |
| Aviso de cookies | `src/components/CookieBanner.astro`, `src/scripts/consent.ts` |
| Envío a la newsletter | `src/pages/api/subscribe.ts`, `src/lib/newsletter.ts` |
| Páginas legales | `src/pages/aviso-legal.astro`, `privacidad.astro`, `cookies.astro`, `condiciones.astro` |
| Colores y tipografías | `src/styles/global.css` |
| Cabeceras de seguridad | `vercel.json` (y CSP con hashes en `astro.config.mjs`) |

## Qué cumple

- Casilla de consentimiento sin marcar, con enlace a privacidad y primera capa informativa (RGPD/LOPDGDD).
- Edad mínima 14 años. Doble opt-in. Baja en cada correo.
- Aviso de cookies con Aceptar y Rechazar al mismo nivel y panel de configuración; la analítica no se carga sin permiso.
- Tipografías servidas desde el propio dominio (sin Google Fonts).
- Antispam: campo trampa, tiempo mínimo y límite de intentos por IP.
- CSP, HSTS y demás cabeceras de seguridad.
