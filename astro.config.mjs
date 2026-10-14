// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 專案頁面網址為 https://<帳號>.github.io/<repo>/
// 若 repo 名稱是 <帳號>.github.io，請把 base 改成 '/'
export default defineConfig({
  site: 'https://kevin001610.github.io',
  base: '/photo-blog',
  trailingSlash: 'always',
});
