import { SITE } from '../site.config';

// 固定斷點：轉換次數 = 照片數 × 斷點數，斷點越少越省 Cloudinary credits
export const WIDTHS = [480, 800, 1200, 1800];

const UPLOAD = '/image/upload/';

export function isCloudinary(src: string): boolean {
  return !/^https?:\/\//.test(src) || (src.includes('res.cloudinary.com') && src.includes(UPLOAD));
}

// 在原圖網址的 /image/upload/ 後面插入轉換參數
// f_auto：依瀏覽器輸出 AVIF/WebP；q_auto：感知品質壓縮；c_limit：只縮不放大
export function cldUrl(src: string, width: number): string {
  const t = `f_auto,q_auto,c_limit,w_${width}`;
  if (/^https?:\/\//.test(src)) {
    const i = src.indexOf(UPLOAD);
    if (!src.includes('res.cloudinary.com') || i < 0) return src;
    const head = src.slice(0, i + UPLOAD.length);
    return `${head}${t}/${src.slice(head.length)}`;
  }
  // 只存 public ID 的情況
  return `https://res.cloudinary.com/${SITE.cloudName}${UPLOAD}${t}/${src.replace(/^\/+/, '')}`;
}

export function cldSrcset(src: string, widths: number[] = WIDTHS): string {
  return widths.map((w) => `${cldUrl(src, w)} ${w}w`).join(', ');
}
