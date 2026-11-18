# Concepto «Un día»

<a href="https://concepto-un-dia.pages.dev/">
  <img src="docs/preview.webp" alt="Un cielo en WebGL que cambia del amanecer a la noche" width="100%">
</a>

**[Ver la página](https://concepto-un-dia.pages.dev/)**

Segundo diseño del portafolio de Frank Abanto: un cielo en WebGL que cambia del amanecer a la noche.

- **El cursor es viento.** Las nubes se abren a su paso. Arrastra el sol, o usa el control accesible, para cambiar la hora del día.
- **Ligera y privada.** Un solo `index.html` de 33 KB, sin build ni dependencias. Fuentes e imágenes propias y nada guardado en el navegador.
- **Se adapta.** Si el equipo va lento, baja la resolución del cielo. Con `?nogl` usa un degradado CSS y respeta el movimiento reducido.

## Estructura

```
sitio/     lo que se publica: index.html, _headers (seguridad), img/, fonts/
scripts/   pruebas de escritorio y móvil (capturas.mjs)
docs/      vista previa de este README
.github/   las mismas pruebas, automáticas en GitHub
```

## Probar y publicar

```bash
python -m http.server 4173 -d sitio
npx wrangler pages deploy sitio --project-name concepto-un-dia --branch main
```

Cada cambio en `sitio/` lanza las pruebas en GitHub Actions (escritorio, móvil, `?nogl` y movimiento reducido) con las cabeceras reales. Si editas el script de `index.html`, recalcula su huella `sha256` en `sitio/_headers`.
