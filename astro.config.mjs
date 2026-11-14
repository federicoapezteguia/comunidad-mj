// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Fecha de cada nota, para que el sitemap lleve <lastmod>.
// Google usa ese dato para saber qué volver a rastrear primero.
const fechasNotas = new Map();
try {
  for (const archivo of readdirSync('src/content/notas')) {
    if (!archivo.endsWith('.md')) continue;
    const texto = readFileSync(`src/content/notas/${archivo}`, 'utf-8').slice(0, 2000);
    const seccion = texto.match(/^seccion:\s*["']?([\w-]+)/m)?.[1];
    const fecha = texto.match(/^fecha:\s*["']?([\dT:+-]{10,})/m)?.[1];
    const modificada = texto.match(/^modificada:\s*["']?([\dT:+-]{10,})/m)?.[1];
    if (seccion && fecha) {
      fechasNotas.set(`/${seccion}/${archivo.replace(/\.md$/, '')}/`, new Date(modificada ?? fecha));
    }
  }
} catch {
  // Si no se puede leer, el sitemap sale sin lastmod: no es un error fatal.
}

// Dirección pública del sitio. Se define en GitHub (variable SITE_URL).
// Durante la etapa de prueba es el subdominio; al migrar, el dominio final.
const SITE_URL = process.env.SITE_URL || 'https://prueba.example.com.ar';

// STAGING=true bloquea a Google (noindex + robots.txt). Se apaga al migrar.
const STAGING = process.env.STAGING !== 'false';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  image: {
    // Las fotos se achican y convierten a webp/avif automáticamente.
    responsiveStyles: true,
  },
  integrations: [
    sitemap({
      // En staging no publicamos sitemap útil: Google no debe indexar.
      filter: (page) => !STAGING && !/\/(buscar|pagina|etiqueta|localidad|autor)\//.test(page),
      changefreq: 'hourly',
      serialize(item) {
        const ruta = new URL(item.url).pathname;
        const fecha = fechasNotas.get(ruta);
        // Las notas llevan su propia fecha; las portadas de sección, la de hoy.
        item.lastmod = (fecha ?? new Date()).toISOString();
        item.priority = fecha ? 0.8 : ruta === '/' ? 1 : 0.6;
        return item;
      },
    }),
  ],
  vite: {
    define: {
      __STAGING__: JSON.stringify(STAGING),
    },
  },
});
