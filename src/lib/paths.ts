// 所有站內連結都要加上 base（GitHub Pages 專案頁面在 /<repo>/ 底下）
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${base}/${p}`;
}
