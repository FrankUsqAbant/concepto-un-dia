// Corre en GitHub Actions (no en el portátil): abre la página, mueve el sol por los 4 momentos,
// recorre las secciones, mide cuadros y errores, y guarda capturas en ./salida
import {chromium} from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd(), SAL = path.join(RAIZ, process.env.SALIDA || 'salida');
fs.mkdirSync(SAL, {recursive: true});
// Servidor de pruebas: sirve la carpeta con las MISMAS cabeceras que producción (_headers, bloque /*),
// así una política de seguridad que bloquee algo aparece aquí como error de consola.
const TIPOS = {'.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.js': 'text/javascript', '.css': 'text/css'};
const CABECERAS = {};
try {
  let activo = false;
  for (const l of fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8').split('\n')) {
    if (!l.startsWith(' ') && l.trim()) activo = l.trim() === '/*';
    else if (activo && l.includes(':')) { const i = l.indexOf(':'); CABECERAS[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  }
} catch { /* sin _headers */ }
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(RAIZ, u === '/' ? 'index.html' : u);
  if (!f.startsWith(RAIZ)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, {...CABECERAS, 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream'}); r.end(d);
  });
}).listen(4173);

const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const informe = {};
const espera = ms => new Promise(r => setTimeout(r, ms));

for (const [nombre, w, h, tactil] of [['escritorio', 1280, 800, false], ['movil', 375, 812, true]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: tactil, isMobile: tactil, reducedMotion: process.env.MOVIMIENTO === 'reduce' ? 'reduce' : 'no-preference'});
  const page = await ctx.newPage(), errores = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errores.push(String(e).slice(0, 200)));
  const fallos = [];
  page.on('response', r => { if (r.status() >= 400) fallos.push(r.status() + ' ' + r.url().slice(0, 120)); });
  page.on('requestfailed', r => fallos.push('fallo ' + r.url().slice(0, 120)));
  await page.goto('http://localhost:4173/' + (process.env.CONSULTA || ''), {waitUntil: 'load'});
  await page.addStyleTag({content: 'html{scroll-behavior:auto!important}'});
  await espera(6000);
  const info = {};
  info.webgl = await page.evaluate(() => { const c = document.createElement('canvas'), g = c.getContext('webgl'); if (!g) return 'no'; const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'si'; });
  info.cieloGL = await page.evaluate(() => document.documentElement.classList.contains('gl'));
  await page.screenshot({path: `${SAL}/${nombre}-1-amanecer.png`});
  // arrastrar el sol por el control accesible: 100 = mediodía, 200 = atardecer, 300 = noche
  for (const [v, n] of [[100, '2-mediodia'], [200, '3-atardecer'], [300, '4-noche']]) {
    await page.evaluate(v => { const r = document.getElementById('faseRango'); r.value = v; r.dispatchEvent(new Event('input', {bubbles: true})); }, v);
    await espera(1800);
    await page.screenshot({path: `${SAL}/${nombre}-${n}.png`});
  }
  // cuadros por segundo del cielo en el hero
  await page.evaluate(() => window.scrollTo(0, 0)); await espera(1200);
  info.cuadros = await page.evaluate(() => new Promise(res => { const fr = []; let ult = performance.now(); const t0 = ult; (function f(n) { fr.push(n - ult); ult = n; if (n - t0 < 3000) requestAnimationFrame(f); else { fr.shift(); res({ms: Math.round(fr.reduce((a, b) => a + b, 0) / fr.length), max: Math.round(Math.max(...fr)), n: fr.length}); } })(ult); }));
  info.estadoCielo = await page.evaluate(() => document.getElementById('cieloGL')?.dataset.estado || 'activo');
  // secciones
  for (const id of ['servicios', 'proyectos', 'ocaso', 'hablemos']) {
    await page.evaluate(id => { const el = document.getElementById(id); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 40); }, id);
    await espera(2200);
    await page.screenshot({path: `${SAL}/${nombre}-5-${id}.png`});
  }
  info.desbordeHorizontal = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  info.alto = await page.evaluate(() => document.documentElement.scrollHeight);
  info.fuentes = await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))]; });
  // Imágenes: tras recorrer la página (las perezosas ya cargaron) ninguna debe estar rota
  info.imagenesRotas = await page.evaluate(() => [...document.images].filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.getAttribute('src')));
  // Objetivos táctiles: enlaces y botones visibles de menos de 44 px en alguna dimensión (los enlaces dentro de un párrafo se ignoran)
  info.objetivosPequenos = await page.evaluate(() => [...document.querySelectorAll('a,button,input')].filter(e => { const r = e.getBoundingClientRect(); const v = r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; return v && (r.height < 44 || r.width < 44) && !e.closest('p'); }).map(e => (e.textContent || e.getAttribute('aria-label') || e.id || e.tagName).trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
  info.estructura = await page.evaluate(() => ({h1: document.querySelectorAll('h1').length, lang: document.documentElement.lang, sinAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length}));
  info.recursosFallidos = fallos;
  info.errores = errores;
  informe[nombre] = info;
  await ctx.close();
}
await browser.close(); server.close();
fs.writeFileSync(`${SAL}/informe.json`, JSON.stringify(informe, null, 2));
console.log(JSON.stringify(informe, null, 2));
