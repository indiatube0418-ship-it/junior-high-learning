# 交接文件（HANDOFF）— 國中學習平台 junior-high-learning

> 給接手開發的 Agent / 開發者：**請先完整閱讀本文件**，再看 `docs/PLAN.md`（整體規劃）與 `docs/CONTRACT.md`（檔案與介面契約）。

## ⚠️ 工作規則（必讀）
1. **未經使用者明確同意，不得 push、不得部署（gh-pages）、不得建立 PR 或修改遠端。** 本機修改、建置、測試可自由進行。
2. 未經詢問不得安裝全域工具（`npm i -g`、系統套件等）；專案內 `npm install` 可以。
3. 回報一律使用繁體中文；不要宣稱成功，以實際指令輸出為準。

## 專案目標
台灣國中生線上學習平台，核心為「學習 → 練習 → 複習」循環，搭配遊戲化（點數、經驗、金幣、寵物養成、每日任務、章節地圖）。行動裝置優先、單手操作。
- Repo：https://github.com/indiatube0418-ship-it/junior-high-learning （`main`）
- Demo：https://indiatube0418-ship-it.github.io/junior-high-learning/ （`gh-pages`）

## 使用者偏好（重要）
- **首頁以「課程進度」為主**：繼續學習主視覺卡（一顆大按鈕）、課程路徑（單元清單＋狀態）、精簡今日任務、寵物小卡。
- **儀表板（正確率、弱點、進度環）不放首頁**，獨立在 `/dashboard`，由設定頁與首頁「📊 學習報告」連結進入。
- **6 套主題全部開放**：日系 japanese、韓系 korean、美式 american、蘿莉風 lolita（健康可愛、適合國中生）、賽博風 cyber、動漫風 anime。主題影響顏色、系統字型、按鈕、背景圖樣、卡片形狀。設定頁與首頁右上角都能切換。
- **寵物**：Gemini 繪製的精緻 Q 版插圖（貓：三花＋紅圍巾；狗：柴犬＋藍圍巾），每種 4 個狀態 idle / happy / sleepy / cheer。檔案在 `public/pets/<kind>_<pose>.svg`，**內容是 SVG 包住 base64 WebP**（因為 GitHub 連接器只能推文字檔）。原始 2048px JPEG 不在 repo 內。
- 負數一律使用「−」（U+2212）。

## 目前狀態（Phase 1 MVP，無後端）
- Next.js 14.2.35（App Router）+ TypeScript strict + Tailwind 3，靜態輸出（`output: 'export'`）。
- 資料存在 `localStorage`（`lib/storage.ts` 抽象層，key `learning-platform-userdata-v1`，version 3，舊主題 id 會自動遷移成 japanese）。
- 題庫：`data/math-grade1-sem1-chapter1.json`（七年級第一章「整數的運算」，4 單元、28 題）。
- 間隔複習：`lib/srs.ts`（1/3/7 天），單元測試 `lib/srs.test.ts`。
- 已修正：練習作答後解析不會消失、主題切換、basePath 連結（設定頁學習報告改用 next/link）。

## 檔案地圖（詳見 docs/CONTRACT.md）
- `app/`：頁面 — `page.tsx`(首頁) `learn/` `practice/` `review/` `exam/` `map/` `pet/` `dashboard/` `settings/`，`layout.tsx`，`globals.css`（6 套主題 CSS 變數與 .btn/.card/.chip 樣式）
- `components/`：`Pet.tsx`（圖片寵物、依狀態選圖、CSS 動畫、主題角標）、`ThemeSwitcher.tsx`、`QuestionCard.tsx`、`BottomNav.tsx`、`TopBar.tsx`、`ProgressRing.tsx`、`QuestDaily.tsx` 等
- `lib/`：`types.ts` `storage.ts` `useUserData.tsx`（Context 與所有動作）`themes.ts` `game.ts` `srs.ts` `questions.ts`
- `data/`：題庫 JSON；`prisma/schema.prisma`：Phase 2 用；`scripts/serve.mjs`：本機靜態伺服器
- `docs/PLAN.md`、`docs/CONTRACT.md`、本文件

## 執行 / 建置 / 部署
```powershell
npm install
npm run dev                      # 開發（http://localhost:3000，無 basePath）
npx tsc --noEmit                 # 型別檢查
# 給 GitHub Pages 的建置 —— 一定要設定 basePath，否則上線後全部 404！
$env:NEXT_PUBLIC_BASE_PATH='/junior-high-learning'; npm run build    # 輸出到 out/
$env:NEXT_PUBLIC_BASE_PATH='/junior-high-learning'; node scripts/serve.mjs   # 本機預覽 http://localhost:3000/junior-high-learning/
```
- 部署：把 `out/` 全部內容放到 `gh-pages` 分支根目錄，並確保有 `.nojekyll`。**需使用者同意後才可部署。**
- 程式內連結一律用 `next/link` 或 `useRouter`；不要用原生 `<a href="/...">` 或寫死 `/xxx` 的 `window.location`（會繞過 basePath 造成 404）。靜態資源網址請加 `process.env.NEXT_PUBLIC_BASE_PATH` 前綴。

## 已知問題（待修）
1. 學習地圖（`app/map/page.tsx`）：手機上單元標籤重疊；鎖定節點顯示為全黑圓。
2. 底部導覽列在長頁面遮住練習頁的「下一題／不熟／錯題」按鈕（需加足夠 padding 或改成內容區內固定操作列）。
3. 賽博風主題主要按鈕（如「繼續學習」）文字與底色對比不足，難以閱讀。
4. 升級時的 cheer 動畫、以及「貓」這組圖片尚未在 App 內實測（目前測試帳號是狗）。
5. `app/globals.css` 有舊主題遺留、未使用的 CSS，可清理。
6. 測驗結束後的按鈕（結果頁）尚未做完整點擊巡檢（填空題自動作答腳本卡在「送出答案」）。

## 建議下一步
1. 修正上方已知問題（先 1、2、3）。
2. 擴充題庫：第一章更多題目、第二章以後；歷屆會考題匯入（格式見 PLAN.md）。
3. 寵物：餵食／升級回饋更完整、商店配件。
4. Phase 2：Prisma + PostgreSQL 後端、帳號登入、雲端同步（schema 已在 `prisma/schema.prisma`）。
5. 每次修改後：`npx tsc --noEmit`、帶 basePath 的 `npm run build`、本機預覽確認；再請使用者決定是否 push / 部署。
