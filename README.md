# Concepto «Un día»

<a href="https://concepto-un-dia.pages.dev/">
  <img src="docs/preview.webp" alt="Un cielo en WebGL que cambia del amanecer a la noche" width="100%">
</a>

**[Ver la página](https://concepto-un-dia.pages.dev/)**

Segundo diseño del portafolio de Frank Abanto: un cielo en WebGL que cambia del amanecer a la noche.

- **El cursor es viento:** las nubes se abren a su paso. Arrastra el sol, o usa el control accesible, para cambiar la hora del día. Un clic suelta una onda de luz.
- **Ligero:** un solo `index.html` de 33 KB, sin build ni dependencias. Fuentes e imágenes van dentro del repositorio y no se guarda nada en el navegador.
- **Se adapta:** si el equipo va lento, baja la resolución del cielo y, en último caso, lo congela. Con `?nogl` usa un degradado CSS.

## Probar y publicar

```bash
python -m http.server 4173   # abrir http://localhost:4173
```

Se publica en Cloudflare Pages, con `index.html`, `_headers`, `img/` y `fonts/` en una carpeta limpia:
`npx wrangler pages deploy <carpeta> --project-name concepto-un-dia --branch main`

Cada cambio en `index.html` dispara en GitHub Actions las pruebas de escritorio y móvil, con las mismas cabeceras de seguridad que producción, y repite con `?nogl` y con movimiento reducido. Dejan capturas e informe como artefacto.

Si cambias el script de `index.html`, recalcula su huella en la política de seguridad de `_headers` (`script-src 'sha256-…'`).
