import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 圖片欄位：CMS 存的是 Cloudinary 原圖網址（或 public ID），轉換參數在建置時才加上
const image = z.string().min(1);

// 文章內容 = 區塊清單。type 對應 public/admin/config.yml 的 types[].name
const block = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    body: z.string().default(''),
  }),
  z.object({
    type: z.literal('photo'),
    src: image,
    caption: z.string().optional(),
    wide: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('gallery'),
    images: z.array(image).min(1),
    caption: z.string().optional(),
  }),
]);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    cover: image.optional(),
    summary: z.string().optional(),
    featured: z.boolean().optional(),
    blocks: z.array(block).default([]),
  }),
});

export const collections = { posts };
