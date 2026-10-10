# 國中生線上學習平台

## 專案介紹
為台灣國一～國三生打造「從零教學到刷題複習」的行動優先平台。核心流程：從零教學 → 基礎練習 → 進階題 → 歷年真題 → 錯題／不確定題複習。  
特色：3套主題（清新校園、冒險、暗色專注，可解鎖季節／科目）、輕量養成遊戲（寵物餵食升級、闖關地圖、每日任務）。  
單手操作、間隔複習、進度儀表板、模擬考。

## Phase 規劃
- **Phase 1 (MVP)**：Next.js 靜態輸出 + localStorage（StorageAdapter抽象）。首頁、題目練習、養成、主題切換。以國一數學第1章為例題庫。
- **Phase 2**：Prisma + PostgreSQL 後端（替換 StorageAdapter 為 ApiStorage）。API routes / server actions（但靜態輸出限制，Phase 2 切換 output:'standalone'）。
- **Phase 3**：多科目、完整教學內容、更多遊戲元素、PWA、雲端部署。

## 安裝與開發
```bash
npm install
npm run dev  # http://localhost:3000
npm run typecheck  # tsc 檢查
npm test  # node --test lib/srs.test.ts
```

## 靜態輸出與預覽
```bash
npm run build  # 產生 out/
npm run start  # 伺服 out/ 於 PORT=3000 (支援 NEXT_PUBLIC_BASE_PATH)
```

## 部署 GitHub Pages
```bash
NEXT_PUBLIC_BASE_PATH=/junior-high-learning npm run build
# 將 out/ 目錄推至 gh-pages 分支，並新增 .nojekyll 檔案
```
- 存取：https://username.github.io/junior-high-learning/

## 歷年真題匯入
1. 新增 JSON 檔案於 `data/`（格式如 `math-grade1-sem1-chapter1.json`，含 `{chapter: Chapter, questions: Question[]}`）。
2. 在 `lib/questions.ts` 匯入並合併至 `questions` 陣列：
   ```ts
   import newData from '@/data/new-exam.json';
   questions.push(...newData.questions);
   ```
3. `npm run build` 靜態編譯。

## 資料夾結構
```
.
├── app/              # Next.js 14 App Router 頁面
├── components/       # React 元件 (PetSVG, QuestionCard 等)
├── lib/              # 工具 (types.ts, questions.ts, srs.ts, srs.test.ts, storage.ts)
├── data/             # 題庫 JSON (math-grade1-sem1-chapter1.json, ch1-part2.json 等)
├── prisma/           # Phase 2 (schema.prisma)
├── scripts/          # serve.mjs
├── public/           # 靜態資產 (無外部依賴)
├── tailwind.config.js # 主題 CSS 變數
├── tsconfig.json     # resolveJsonModule: true
├── next.config.mjs   # output: 'export'
├── package.json
└── README.md
```

數學題庫範例：國一上第1章「整數的運算」，28題（基礎12、進階8、考題8）。歡迎 PR 新題庫！
