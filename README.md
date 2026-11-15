# Concepto "Un día"

Segundo diseño del portafolio de Frank Abanto: un **cielo en WebGL** que cambia del amanecer a la noche.
Sitio estático de un solo archivo (`index.html`), sin build ni dependencias.

- **Cursor = viento:** las nubes se abren a su paso. **Arrastra el sol** (o usa el control accesible) para cambiar el momento del día; un clic suelta una onda de luz.
- El scroll también avanza el día. Si el equipo va lento, el cielo baja solo la resolución y, en último caso, se congela (sin dejar de obedecer al sol).
- `?nogl` desactiva el WebGL (degradado CSS de respaldo).

## Publicar
Cloudflare Pages: `npx wrangler pages deploy <carpeta-limpia> --project-name concepto-un-dia --branch main`
(con `CLOUDFLARE_ACCOUNT_ID` fijado). Producción: https://concepto-un-dia.pages.dev

## Pruebas
El workflow `Capturas y mediciones` abre la página en GitHub Actions (WebGL por software), recorre los 4 momentos del día en escritorio y móvil y guarda capturas e informe como artefacto.
