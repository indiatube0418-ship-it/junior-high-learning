/**
 * 使用者資料 Context Provider：SSR安全，client only
 * 自動載入/儲存，處理 recordAnswer 全流程、每日重置、主題套用
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storage, createDefaultUserData } from '@/lib/storage';
import { nextReviewDate, isDue } from '@/lib/srs';
import { calculateRewards, levelUpPet, feedPet, buyItem, resetDailyQuests } from '@/lib/game';
import { applyTheme, normalizeThemeId } from '@/lib/themes';
import type { UserData, Question, ThemeId, DailyQuest } from '@/lib/types';

interface UserDataContextType {
  userData: UserData | null;
  recordAnswer: (q: Question, userAnswer: string | string[], isCorrect: boolean) => void;
  toggleMark: (qId: string, mark: 'unsure' | 'wrong') => void;
  feedPet: (food: number) => void;
  buyItem: (itemId: string, cost: number) => boolean;
  setTheme: (themeId: ThemeId) => void;
  unlockUnit: (unitId: string) => void;
  refreshSrs: (today: string) => void;
  claimQuest: (id: string) => void;
  setPetScene: (scene: string) => void;
  equipAccessory: (id: string) => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

function useUserDataInternal(): UserDataContextType {
  const [userData, setUserData] = useState<UserData | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const updateData = useCallback((updater: (data: UserData) => UserData) => {
    setUserData((prev) => {
      if (!prev) return prev;
      const newData = updater(prev);
      storage.setUserData(newData);
      return newData;
    });
  }, []);

  const recordAnswer = useCallback((q: Question, userAnswer: string | string[], isCorrect: boolean) => {
    updateData((data) => {
      const newRecord = {
        questionId: q.id,
        userAnswer,
        isCorrect,
        timestamp: new Date().toISOString(),
      };
      const newQuestionMarks = {
        ...data.questionMarks,
        [q.id]: isCorrect
          ? data.questionMarks[q.id]
          : { ...data.questionMarks[q.id], wrong: true },
      };
      const newSrs = {
        ...data.srs,
        [q.id]: nextReviewDate(data.srs[q.id], isCorrect, today),
      };
      const rewards = calculateRewards(q.tier, isCorrect);
      const newInventory = {
        ...data.inventory,
        food: data.inventory.food + rewards.food,
        coins: data.inventory.coins + rewards.coins,
      };
      const newPet = levelUpPet(data.pet, rewards.exp);
      const newDailyQuests = data.dailyQuests.map((quest) => {
        if (quest.id === 'daily-practice') {
          return { ...quest, progress: quest.progress + 1 };
        }
        if (quest.id === 'daily-review' && !isCorrect) {
          return { ...quest, progress: quest.progress + 1 };
        }
        return quest;
      });
      return {
        ...data,
        answerRecords: [...data.answerRecords, newRecord],
        questionMarks: newQuestionMarks,
        srs: newSrs,
        inventory: newInventory,
        pet: newPet,
        dailyQuests: newDailyQuests,
        lastActiveDate: today,
      };
    });
  }, [updateData, today]);

  const toggleMark = useCallback((qId: string, mark: 'unsure' | 'wrong') => {
    updateData((data) => {
      const currentMark = data.questionMarks[qId] ?? { unsure: false, wrong: false };
      return {
        ...data,
        questionMarks: {
          ...data.questionMarks,
          [qId]: {
            ...currentMark,
            [mark]: !currentMark[mark],
          },
        },
      };
    });
  }, [updateData]);

  const feedPetImpl = useCallback((food: number) => {
    updateData((data) => {
      if (data.inventory.food < food) return data;
      const newPetState = feedPet(data.pet, food);
      return {
        ...data,
        inventory: {
          ...data.inventory,
          food: data.inventory.food - food,
        },
        pet: newPetState,
      };
    });
  }, [updateData]);

  const buyItemImpl = useCallback((itemId: string, cost: number): boolean => {
    let success = false;
    updateData((data) => {
      const newInv = buyItem(data.inventory, itemId, cost);
      if (!newInv) return data;
      success = true;
      return {
        ...data,
        inventory: newInv,
      };
    });
    return success;
  }, [updateData]);

  const setThemeImpl = useCallback((themeId: ThemeId) => {
    const normalized = normalizeThemeId(themeId);
    updateData((data) => ({
      ...data,
      currentTheme: normalized,
    }));
    applyTheme(normalized);
  }, [updateData]);

  const unlockUnitImpl = useCallback((unitId: string) => {
    updateData((data) => {
      if (data.unlockedUnits.includes(unitId)) return data;
      return {
        ...data,
        unlockedUnits: [...data.unlockedUnits, unitId],
      };
    });
  }, [updateData]);

  const refreshSrsImpl = useCallback((todayStr: string) => {
    updateData((data) => {
      // 目前空實作：未來可標記已複習或更新
      return data;
    });
  }, [updateData]);

  const claimQuestImpl = useCallback((id: string) => {
    updateData((data) => {
      const quest = data.dailyQuests.find((q) => q.id === id);
      if (!quest || quest.progress < quest.target || quest.completed) return data;
      return {
        ...data,
        dailyQuests: data.dailyQuests.map((q) =>
          q.id === id ? { ...q, completed: true } : q
        ),
        inventory: {
          ...data.inventory,
          food: data.inventory.food + quest.reward.food,
          coins: data.inventory.coins + quest.reward.coins,
        },
      };
    });
  }, [updateData]);

  const setPetSceneImpl = useCallback((scene: string) => {
    updateData((data) => ({
      ...data,
      pet: {
        ...data.pet,
        scene,
      },
    }));
  }, [updateData]);

  const equipAccessoryImpl = useCallback((id: string) => {
    updateData((data) => {
      if (!data.inventory.ownedItems.includes(id)) return data;
      return {
        ...data,
        pet: {
          ...data.pet,
          accessory: [id],
        },
      };
    });
  }, [updateData]);

  useEffect(() => {
    let data = storage.getUserData();
    if (!data) {
      data = createDefaultUserData();
      storage.setUserData(data);
    } else {
      // 複製以避免 mutate 原始資料
      data = { ...data };
      // 檢查每日任務重置
      const needsReset = data.dailyQuests.some((q) => q.resetDate !== today);
      if (needsReset) {
        data.dailyQuests = resetDailyQuests(data, today);
        storage.setUserData(data);
      }
      data.lastActiveDate = today;
      storage.setUserData(data);
    }
    if (data) {
      data.currentTheme = normalizeThemeId(data.currentTheme);
      storage.setUserData(data);
      applyTheme(data.currentTheme);
      setUserData(data);
    }
  }, []);

  return {
    userData,
    recordAnswer,
    toggleMark,
    feedPet: feedPetImpl,
    buyItem: buyItemImpl,
    setTheme: setThemeImpl,
    unlockUnit: unlockUnitImpl,
    refreshSrs: refreshSrsImpl,
    claimQuest: claimQuestImpl,
    setPetScene: setPetSceneImpl,
    equipAccessory: equipAccessoryImpl,
  };
}

export function UserDataProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useUserDataInternal();
  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextType {
  const context = useContext(UserDataContext);
  if (context === null) {
    throw new Error('useUserData 必須在 UserDataProvider 內使用');
  }
  return context;
}
