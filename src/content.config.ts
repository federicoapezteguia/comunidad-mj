import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECCION_IDS } from './config';
import { ETIQUETA_IDS, LOCALIDAD_IDS } from './data/etiquetas';

const notas = defineCollection({
  // Los archivos que empiezan con _ (como _plantilla.md) se ignoran
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/notas' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(120),
      bajada: z.string().max(300),
      seccion: z.enum(SECCION_IDS),
      volanta: z.string().optional(),
      etiquetas: z.array(z.enum(ETIQUETA_IDS)).default([]),
      localidad: z.enum(LOCALIDAD_IDS).optional(),
      autor: z.string().default('redaccion'), // id en src/content/autores.json
      fecha: z.coerce.date(),
      actualizado: z.coerce.date().optional(),
      foto: image(),
      fotoAlt: z.string(),
      fotoCredito: z.string().optional(),
      destacada: z.boolean().default(false),
      // Publinotas
      patrocinado: z.boolean().default(false),
      anunciante: z.string().optional(),
      anuncianteUrl: z.string().url().optional(),
      // Multimedia
      youtube: z.string().optional(), // ID del video, ej. dQw4w9WgXcQ
      audio: z.string().url().optional(),
      // SEO opcional (si no, se usan titulo y bajada)
      seoTitulo: z.string().max(70).optional(),
      seoDescripcion: z.string().max(170).optional(),
      borrador: z.boolean().default(false),
    }),
});

const autores = defineCollection({
  loader: file('./src/content/autores.json'),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      rol: z.string(),
      bio: z.string(),
      foto: image().optional(),
      redes: z.array(z.string().url()).default([]),
    }),
});

export const collections = { notas, autores };
