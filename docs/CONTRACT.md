# Phase 1 檔案清單與介面契約

## 檔案清單 (總 35 檔案)
```
package.json
next.config.mjs
tsconfig.json
tailwind.config.ts
postcss.config.mjs
next-env.d.ts
app/layout.tsx
app/globals.css
app/page.tsx
app/learn/page.tsx
app/practice/page.tsx
app/review/page.tsx
app/pet/page.tsx
app/map/page.tsx
app/dashboard/page.tsx
app/exam/page.tsx
app/settings/page.tsx
components/BottomNav.tsx
components/Pet.tsx
components/QuestionCard.tsx
components/ProgressRing.tsx
components/QuestDaily.tsx
components/TopBar.tsx
lib/types.ts
lib/storage.ts
lib/srs.ts
lib/srs.test.ts
lib/questions.ts
lib/game.ts
lib/themes.ts
lib/useUserData.tsx
data/math-grade1-sem1-chapter1.json
prisma/schema.prisma
docs/PLAN.md
docs/CONTRACT.md
README.md
```

## 介面契約 (lib/* 與 components/*)

### lib/types.ts
```typescript
export type Question = { /* 如 PLAN.md */ };
export type KnowledgePoint = { id: string; title: string; lesson: string[] };
export type Unit = { id: string; title: string; knowledgePoints: KnowledgePoint[] };
export type Chapter = { id: string; title: string; units: Unit[] };
export type AnswerRecord = { questionId: string; userAnswer: string | string[]; isCorrect: boolean; timestamp: string };
export type QuestionMark = { unsure: boolean; wrong: boolean };
export type SrsState = { stage: number; intervalDays: number; dueDate: string };
export type PetState = { name: string; kind: 'dog' | 'cat'; level: number; exp: number; hunger: number; mood: number; accessory: string[]; scene: string };
export type Inventory = { food: number; coins: number; ownedItems: string[] };
export type DailyQuest = { id: string; title: string; target: number; progress: number; reward: { food: number; coins: number }; completed: boolean; resetDate: string };
export type ThemeId = 'campus' | 'adventure' | 'focus' | 'sakura' | 'math';
export type ThemeDef = { name: string; cssVars: Record<string, string>; petVariants: Record<string, string> };
export type UserData = {
  version: number;
  lastActiveDate: string;
  currentTheme: ThemeId;
  unlockedThemes: ThemeId[];
  unlockedUnits: string[];
  pet: PetState;
  inventory: Inventory;
  answerRecords: AnswerRecord[];
  questionMarks: Record<string, QuestionMark>;
  srs: Record<string, SrsState>;
  dailyQuests: DailyQuest[];
};
```

### lib/storage.ts
```typescript
export interface StorageAdapter {
  getUserData(): UserData | null;
  setUserData(data: UserData): void;
}
export class LocalStorageAdapter implements StorageAdapter { /* 實作 */ }
export const storage: StorageAdapter;
export function createDefaultUserData(): UserData;
```

### lib/srs.ts
```typescript
export function nextReviewDate(state: SrsState | null, isCorrect: boolean, today: string): SrsState;
export function isDue(state: SrsState | null, today: string): boolean;
```

### lib/srs.test.ts
Node:test 單元測試，驗證 nextReviewDate (正確→間隔*2，錯誤→stage-1)。

### lib/questions.ts
```typescript
export const questions: Question[];
export function getQuestionsByTier(tier: 'basic'|'advanced'|'exam', unitId?: string): Question[];
export function getUnitProgress(unitId: string, userData: UserData): { correctRate: number; weakPoints: string[] };
```

### lib/game.ts
```typescript
export function calculateRewards(questionTier: string, isCorrect: boolean): { food: number; exp: number; coins: number };
export function levelUpPet(pet: PetState, expGain: number): PetState;
export function feedPet(pet: PetState, food: number): PetState;
export function buyItem(inventory: Inventory, itemId: string, cost: number): Inventory | null;
export function resetDailyQuests(userData: UserData, today: string): UserData['dailyQuests'];
export function checkDailyReminders(userData: UserData, today: string): string[]; // 溫和提醒文字
```

### lib/themes.ts
```typescript
export const themes: Record<ThemeId, ThemeDef>;
export function applyTheme(themeId: ThemeId): void; // set html data-theme + document.documentElement.style
```

### lib/useUserData.tsx
```typescript
export function UserDataProvider({ children }: { children: React.ReactNode }): JSX.Element;
export function useUserData(): {
  userData: UserData | null;
  recordAnswer: (q: Question, userAnswer: string | string[], isCorrect: boolean) => void;
  toggleMark: (qId: string, mark: 'unsure' | 'wrong') => void;
  feedPet: (food: number) => void;
  buyItem: (itemId: string) => boolean;
  setTheme: (themeId: ThemeId) => void;
  unlockUnit: (unitId: string) => void;
  refreshSrs: (today: string) => void;
};
```

### components/BottomNav.tsx
```typescript
export function BottomNav({ active: 'home'|'learn'|'practice'|'pet'|'map'|'dashboard'|'exam'|'settings' }: { active: string }): JSX.Element;
// 固定底部，單手點擊，圖示 + 文字 (home/學/練/寵/圖/板/考/設)
```

### components/Pet.tsx
```typescript
export function Pet({ kind, mood, level, accessory, scene }: { kind: string; mood: number; level: number; accessory: string[]; scene: string }): JSX.Element;
// inline SVG，依 props/theme 變形 (e.g. data-theme 切色)
```

### components/QuestionCard.tsx
```typescript
export function QuestionCard({ question, onAnswer, userAnswer, showExplanation }: {
  question: Question;
  onAnswer: (ans: string | string[]) => void;
  userAnswer?: string | string[];
  showExplanation?: boolean;
}): JSX.Element;
// 單/填空 UI，按鈕下半，標記鈕 (錯/不熟)
```

### components/ProgressRing.tsx
```typescript
export function ProgressRing({ progress, size?: number }: { progress: number; size?: number }): JSX.Element;
// SVG 圓環，Tailwind動畫
```

### components/QuestDaily.tsx
```typescript
export function QuestDaily({ quests, onClaim }: { quests: DailyQuest[]; onClaim: (id: string) => void }): JSX.Element;
```

### components/TopBar.tsx
```typescript
export function TopBar({ title, rightSlot }: { title: string; rightSlot?: JSX.Element }): JSX.Element;
// 標題 + 右側 (e.g. 計時器)
