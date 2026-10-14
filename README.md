# 攝影部落格：第一階段原型

Astro 7 + GitHub Pages + Sveltia CMS + Cloudinary。
這個原型的目的只有兩個：驗證**整條發布鏈路能通**，以及讓管理者實際試用**區塊式編輯器**與 **Cloudinary 上傳**。視覺設計、燈箱、搜尋、分類頁都留到後續階段。

## 檔案結構

```
.github/workflows/deploy.yml   push 到 main 就自動建置並部署到 GitHub Pages
astro.config.mjs               site / base（網址）
public/admin/index.html        後台頁面（載入 Sveltia CMS）
public/admin/config.yml        後台欄位、登入、Cloudinary 設定
src/site.config.ts             網站名稱、Cloudinary cloud name
src/content.config.ts          文章資料格式（與 config.yml 的欄位一一對應）
src/content/posts/*.yml        文章檔案（後台會寫入這裡）
src/lib/cloudinary.ts          在圖片網址插入 f_auto,q_auto,w_xxx 轉換參數
src/pages/                     首頁、文章頁、404
```

## 一、要替換的值

| 檔案 | 佔位字串 | 填入 |
|---|---|---|
| `astro.config.mjs` | `kevin001610`、`photo-blog` | GitHub 帳號、repo 名稱 |
| `public/admin/config.yml` | `kevin001610`、`photo-blog`（3 處） | 同上 |
| `public/admin/config.yml` | `YOUR_WORKER_URL` | 步驟 C 得到的 Workers 網址 |
| `public/admin/config.yml` | `YOUR_CLOUD_NAME`、`YOUR_API_KEY` | Cloudinary 主控台的 Cloud name、API Key |
| `src/site.config.ts` | `YOUR_CLOUD_NAME` | 同上 |

Cloud name 與 API Key 本來就是公開資訊。**API Secret 和 GitHub client secret 絕對不能出現在 repo 裡。**

## 二、本機先試（不需要任何帳號）

```bash
npm install
npm run dev
```

- 網站：`http://localhost:4321/photo-blog/`
- 後台：`http://localhost:4321/photo-blog/admin/index.html`（開發伺服器不會自動補 `index.html`）

用 Chrome 或 Edge 開後台，選「Work with Local Repository」並指向這個專案資料夾，就能不登入、直接編輯本機檔案。這是測試**欄位設計與編輯體驗**最快的方法；此模式不會連到 Cloudinary。

## 三、正式串接

### A. GitHub repo 與 Pages

1. 建立 **public** repo（GitHub 免費帳號的 Pages 只支援公開 repo）。
2. 推上去：
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/kevin001610/photo-blog.git
   git push -u origin main
   ```
3. repo → Settings → Pages → Source 選 **GitHub Actions**。
4. 到 Actions 分頁確認第一次部署成功，打開 `https://kevin001610.github.io/photo-blog/`。

### B. GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App：
- Homepage URL：網站網址
- Authorization callback URL：`<步驟 C 的 Workers 網址>/callback`（可以先隨便填，C 完成後回來改）

建立後記下 Client ID，按 Generate a new client secret 記下 Client Secret（只會顯示一次）。

### C. Cloudflare Workers 登入代理

1. 到 https://github.com/sveltia/sveltia-cms-auth 按 **Deploy to Cloudflare Workers**。
2. 部署完成後在 Workers 儀表板取得網址（`https://sveltia-cms-auth.<子網域>.workers.dev`），填進 `config.yml` 的 `base_url`，並回到 B 修正 callback URL。
3. Worker → Settings → Variables 新增：
   - `GITHUB_CLIENT_ID`：B 的 Client ID
   - `GITHUB_CLIENT_SECRET`：B 的 Client Secret，**按 Encrypt**
   - `ALLOWED_DOMAINS`：`kevin001610.github.io`（只有從這個網域來的頁面才拿得到 token）

### D. Cloudinary

1. 主控台左上角取得 Cloud name、API Key，填入兩個設定檔。
2. 要讓管理者上傳，需在 Cloudinary 把他加為使用者（免費方案上限 3 人），他上傳時要用自己的 Cloudinary 帳密登入。

改完設定後 push，等 Actions 跑完即可到 `/admin/` 登入。

## 四、測試清單

**核心驗證（決定架構要不要調整）**
- [ ] 手機（iOS Safari、Android Chrome）開 `/admin/`：登入、新增文章、上傳照片整個流程能否順利完成
- [ ] Cloudinary 上傳視窗在手機上是否好操作；是否需要每次重新登入 Cloudinary
- [ ] 「相簿」區塊一次選多張後，**能否調整照片順序**（官方文件沒寫，需實測；不行的話改成逐張的清單）
- [ ] 區塊排序：桌機拖曳、手機用上移／下移按鈕
- [ ] 後台介面語言是否跟隨瀏覽器設定顯示中文

**發布鏈路**
- [ ] 存草稿後，GitHub 上出現新分支與 draft PR，網站**沒有**變化
- [ ] 按發布後 PR 被合併、Actions 自動執行；記錄從按發布到網站更新花幾分鐘
- [ ] 編輯既有文章、刪除文章，網站都會同步
- [ ] repo 裡沒有出現任何圖片檔（`public/uploads` 應保持不存在）

**權限**
- [ ] 用無痕視窗、用**沒有 repo 寫入權限**的 GitHub 帳號登入後台，應該被拒絕
- [ ] 檢查 `/admin/config.yml` 原始碼中沒有任何 secret

**網站輸出**
- [ ] 照片網址帶有 `f_auto,q_auto,c_limit,w_…`，用開發者工具確認實際下載的是 AVIF/WebP
- [ ] 手機上照片寬度自動適配、文字換行正確

## 五、已知限制（原型階段刻意留下的）

- 分類選項寫死在 `config.yml`（生活／攝影／旅行／研究），之後可改成可在後台編輯的清單。
- 圖片未帶寬高，載入時會有版面跳動（CLS），第五階段處理。
- 沒有燈箱、搜尋、分類頁、分頁、sitemap。
- 草稿存在公開 repo 的分支上，**任何人都能在 GitHub 看到草稿內容**。
- 後台的「素材庫」畫面可能仍顯示 repo 內建儲存；各圖片欄位已關閉內建儲存，但需實測確認管理者不會誤傳到 repo。
- 範例文章使用 Cloudinary 官方的公開 demo 圖片，測試完請從後台刪除。
