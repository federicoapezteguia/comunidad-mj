// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      filter: (page) => !STAGING && !page.includes('/buscar/') && !page.includes('/pagina/'),
      changefreq: 'hourly',
    }),
  ],
  vite: {
    define: {
      'import.meta.env.STAGING': JSON.stringify(STAGING),
    },
  },
});
