/**
 * 儲存抽象層：Phase 1 localStorage，Phase 2 可換 ApiStorageAdapter
 * SSR 安全：僅 client-side 執行，typeof window 檢查
 */

import type { UserData } from './types';
import { THEME_LIST, normalizeThemeId } from './themes';

interface StorageAdapter {
  /** 取得使用者資料 */
  getUserData(): UserData | null;
  /** 儲存使用者資料 */
  setUserData(data: UserData): void;
}

class LocalStorageAdapter implements StorageAdapter {
  private readonly key = 'learning-platform-userdata-v1';

  getUserData(): UserData | null {
    if (typeof window === 'undefined') {
      return null; // SSR 時回傳 null
    }
    const json = window.localStorage.getItem(this.key);
    if (!json) {
      return null;
    }
    try {
      let data: UserData = JSON.parse(json);
      data = this.migrate(data);
      return data;
    } catch {
      window.localStorage.removeItem(this.key);
      return null;
    }
  }

  setUserData(data: UserData): void {
    if (typeof window === 'undefined') {
      return; // SSR 忽略
    }
    window.localStorage.setItem(this.key, JSON.stringify(data, null, 2));
  }

  public migrate(data: any): UserData {
    // 版本遷移掛鉤：未來版本在此擴充
    const today = new Date().toISOString().split('T')[0];
    const allThemes = THEME_LIST.map(t => t.id);

    if (!data.version) {
      // 新資料：版本 3，全部主題開放，預設 japanese
      data.version = 3;
      data.currentTheme = 'japanese' as const;
      data.unlockedThemes = allThemes;
      data.unlockedUnits = ['unit-1-1'];
      data.pet = {
        name: '小學伴',
        kind: 'dog' as const,
        level: 1,
        exp: 0,
        hunger: 50,
        mood: 50,
        accessory: [],
        scene: 'classroom',
      };
      data.inventory = { food: 10, coins: 0, ownedItems: [] };
      data.answerRecords = [];
      data.questionMarks = {};
      data.srs = {};
      data.dailyQuests = this.createDefaultQuests(today);
      data.lastActiveDate = today;
    }
    if (data.version === 1) {
      // v1 → v2：新增 dailyQuests resetDate
      data.dailyQuests.forEach((q: any) => {
        q.resetDate = today;
      });
      data.version = 2;
    }
    if (data.version < 3) {
      // v2 → v3：正規化主題，全開 unlockedThemes
      data.currentTheme = normalizeThemeId(data.currentTheme);
      data.unlockedThemes = allThemes;
      data.version = 3;
    }
    // 確保第一單元解鎖
    if (!data.unlockedUnits || data.unlockedUnits.length === 0) {
      data.unlockedUnits = ['unit-1-1'];
    }
    // data.version >= 3：當前最新
    return data as UserData;
  }

  private createDefaultQuests(today: string): UserData['dailyQuests'] {
    return [
      {
        id: 'daily-practice',
        title: '練習 10 題',
        target: 10,
        progress: 0,
        reward: { food: 5, coins: 10 },
        completed: false,
        resetDate: today,
      },
      {
        id: 'daily-review',
        title: '複習 3 錯題',
        target: 3,
        progress: 0,
        reward: { food: 3, coins: 5 },
        completed: false,
        resetDate: today,
      },
    ];
  }
}

/** 全域 storage 實例 */
export const storage = new LocalStorageAdapter();

/** 建立預設使用者資料 (僅用於文件或重置) */
export function createDefaultUserData(): UserData {
  const adapter = new LocalStorageAdapter();
  const dummy: any = { version: 0 };
  return adapter.migrate(dummy);
}
