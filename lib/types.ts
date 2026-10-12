/**
 * 核心 TypeScript 型別定義
 * 所有資料結構在此，供全專案使用
 */

export type Subject = 'math' | 'chinese' | 'english' | 'science' | 'social' | 'biology';
export type Grade = 1 | 2 | 3;
export type Semester = 1 | 2;
export type Tier = 'basic' | 'advanced' | 'exam';
export type QuestionType = 'single' | 'multiple' | 'fill';

export interface Question {
  /** 唯一 ID，格式: subject-grade-sem-chapter-unit-kp-seq */
  id: string;
  /** 科目 */
  subject: Subject;
  /** 年級 */
  grade: Grade;
  /** 學期 */
  semester: Semester;
  /** 章節 ID */
  chapterId: string;
  /** 單元 ID */
  unitId: string;
  /** 知識點 ID */
  knowledgePointId: string;
  /** 難度層級 */
  tier: Tier;
  /** 題型：單選、多選、填空 */
  type: QuestionType;
  /** 題幹 */
  stem: string;
  /** 選項 (單/多選用) */
  options?: string[];
  /** 答案：填空 string，單選 'A'，多選 ['A','B'] */
  answer: string | string[];
  /** 解析 */
  explanation: string;
  /** 來源：歷年真題 */
  source?: {
    year: number;
    exam: string;
    number: number;
  };
  /** 標籤 */
  tags: string[];
  /** 難度 1-5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface KnowledgePoint {
  id: string;
  title: string;
  /** 教學段落：短篇文字陣列，便於分段顯示 */
  lesson: string[];
}

export interface Unit {
  id: string;
  title: string;
  knowledgePoints: KnowledgePoint[];
}

export interface Chapter {
  id: string;
  title: string;
  units: Unit[];
}

export interface AnswerRecord {
  questionId: string;
  /** 使用者答案 */
  userAnswer: string | string[];
  /** 是否正確 */
  isCorrect: boolean;
  /** 答題時間 ISO 字串 */
  timestamp: string;
}

export interface QuestionMark {
  /** 不熟／沒把握 */
  unsure: boolean;
  /** 錯題 */
  wrong: boolean;
}

export interface SrsState {
  /** 階段：1=新學, 2=熟, 3=掌握 */
  stage: 1 | 2 | 3;
  /** 下次間隔天數 */
  intervalDays: number;
  /** 到期日 YYYY-MM-DD */
  dueDate: string;
}

export type PetKind = 'dog' | 'cat';
export interface PetState {
  /** 寵物名 */
  name: string;
  /** 種類 */
  kind: PetKind;
  /** 等級 */
  level: number;
  /** 經驗 */
  exp: number;
  /** 飢餓 0-100 */
  hunger: number;
  /** 心情 0-100 */
  mood: number;
  /** 配件 ID 陣列 */
  accessory: string[];
  /** 場景 ID */
  scene: string;
}

export interface Inventory {
  /** 飼料數 */
  food: number;
  /** 金幣 */
  coins: number;
  /** 擁有的物品 ID */
  ownedItems: string[];
}

export interface DailyQuest {
  id: string;
  title: string;
  /** 目標題數 */
  target: number;
  /** 目前進度 */
  progress: number;
  reward: {
    food: number;
    coins: number;
  };
  /** 已完成 */
  completed: boolean;
  /** 重置日期 YYYY-MM-DD */
  resetDate: string;
}

export type ThemeId = 'japanese' | 'korean' | 'american' | 'lolita' | 'cyber' | 'anime';

export interface ThemeDef {
  /** CSS 變數 e.g. { '--bg': '#f0f8ff' } (僅預覽用 bg/card/primary/fg) */
  cssVars: Record<string, string>;
}

export interface UserData {
  /** 資料版本，用於遷移 */
  version: number;
  /** 最後活躍日期 YYYY-MM-DD */
  lastActiveDate: string;
  /** 目前主題 */
  currentTheme: ThemeId;
  /** 解鎖主題 (保留欄位，現全開放) */
  unlockedThemes: ThemeId[];
  /** 解鎖單元 */
  unlockedUnits: string[];
  /** 寵物狀態 */
  pet: PetState;
  /** 物品欄 */
  inventory: Inventory;
  /** 答題紀錄 */
  answerRecords: AnswerRecord[];
  /** 題目標記 { qId: QuestionMark } */
  questionMarks: Record<string, QuestionMark>;
  /** 間隔複習 { qId: SrsState } */
  srs: Record<string, SrsState>;
  /** 每日任務 */
  dailyQuests: DailyQuest[];
}
