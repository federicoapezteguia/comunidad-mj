# Comunidad FAN Marcos Juárez

Sitio de noticias de la señal de Comunidad FAN en Marcos Juárez (Córdoba).
Hecho con [Astro](https://astro.build): genera páginas estáticas, sin base de datos ni CMS.
Cada cambio que se sube a GitHub se publica solo en el hosting.

## Cargar una nota

1. Copiar `src/content/notas/_plantilla.md` y renombrarla. El nombre del archivo es la
   dirección de la nota: `intendente-anuncio-obras.md` → `/marcos-juarez/intendente-anuncio-obras/`.
2. Subir la foto a `src/content/notas/img/` (puede ser la foto tal cual sale del celular:
   el sitio la achica y la convierte sola).
3. Completar los datos de arriba (título, bajada, sección, etiquetas, fecha, foto) y escribir el texto.
4. Guardar. En uno o dos minutos está online.

- Etiquetas y localidades permitidas: `src/data/etiquetas.ts`.
- Autores: `src/content/autores.json`.
- Una nota con fecha futura se publica sola a esa hora (el sitio se reconstruye cada hora).
- `borrador: true` = no se publica.
- Publinota: `seccion: contenido-de-marca`, `patrocinado: true`, `anunciante: "..."`.

## Otros datos que se editan

| Qué | Dónde |
| --- | --- |
| Frecuencia, dirección, teléfono, WhatsApp, redes | `src/config.ts` |
| Secciones y textos SEO de cada sección | `src/config.ts` |
| Banners publicitarios | `src/data/publicidad.ts` + imagen en `public/banners/` |
| Ranking FAN | `src/data/ranking.ts` |
| Logo | `public/logo.svg` y activar en `src/components/Logo.astro` |

## SEO incluido

- Datos estructurados: NewsArticle, NewsMediaOrganization + RadioStation, BreadcrumbList,
  CollectionPage, VideoObject, WebSite con buscador.
- Sitemap general (`/sitemap-index.xml`) y de Google News (`/news-sitemap.xml`, últimas 48 h).
- Canonical, Open Graph de artículo, Twitter Card, RSS (`/rss.xml`).
- Páginas por sección, etiqueta, localidad y autor. Etiquetas con pocas notas quedan en noindex.
- Buscador con filtros (Pagefind), sin servidor.

## Publicación

GitHub Actions (`.github/workflows/publicar.yml`) genera el sitio y lo sube por FTP.
Configurar en GitHub → Settings → Secrets and variables → Actions:

- **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- **Variables:** `SITE_URL`, `STAGING`, `FTP_DIR`, `FTP_PROTOCOL`

## Etapa de prueba y migración al dominio final

Mientras `STAGING` no sea `false`, el sitio queda bloqueado para Google (noindex + robots.txt).

Para migrar:
1. Cambiar la variable `SITE_URL` al dominio final y `STAGING` a `false`.
2. Cambiar `FTP_DIR` (y los secrets si es otra cuenta FTP) a la carpeta del dominio final.
3. Apuntar el dominio al hosting (DNS) y activar SSL.
4. Redirigir el subdominio de prueba al dominio final (301).
5. Borrar las notas de ejemplo (`src/content/notas/ejemplo-*.md` y sus fotos).
6. Alta en Google Search Console y envío de sitemaps.

## Desarrollo local

```bash
npm install
npm run dev      # sitio en http://localhost:4321
npm run build    # genera la carpeta dist/
```
