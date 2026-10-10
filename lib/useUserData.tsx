/**
 * 使用者資料 Context Provider：SSR安全，client only
 * 自動載入/儲存，處理 recordAnswer 全流程、每日重置、主題套用
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storage, createDefaultUserData } from '@/lib/storage';
import { nextReviewDate, isDue } from '@/lib/srs';
import { calculateRewards, levelUpPet, feedPet, buyItem, resetDailyQuests } from '@/lib/game';
import { applyTheme, isThemeUnlocked } from '@/lib/themes';
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
    if (!userData) return;
    const newData = updater(userData);
    storage.setUserData(newData);
    setUserData(newData);
  }, [userData]);

  const recordAnswer = useCallback((q: Question, userAnswer: string | string[], isCorrect: boolean) => {
    if (!userData) return;
    updateData(data => {
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
      const newDailyQuests = data.dailyQuests.map(quest => {
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
    if (!userData) return;
    updateData(data => {
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
    if (!userData || userData.inventory.food < food) return;
    updateData(data => {
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
  }, [updateData, userData]);

  const buyItemImpl = useCallback((itemId: string, cost: number): boolean => {
    if (!userData) return false;
    const newInv = buyItem(userData.inventory, itemId, cost);
    if (!newInv) return false;
    updateData(data => ({
      ...data,
      inventory: newInv,
    }));
    return true;
  }, [updateData, userData]);

  const setThemeImpl = useCallback((themeId: ThemeId) => {
    if (!userData || !isThemeUnlocked(themeId, userData)) return;
    updateData(data => ({
      ...data,
      currentTheme: themeId,
    }));
    applyTheme(themeId);
  }, [updateData, userData]);

  const unlockUnitImpl = useCallback((unitId: string) => {
    if (!userData || userData.unlockedUnits.includes(unitId)) return;
    updateData(data => ({
      ...data,
      unlockedUnits: [...data.unlockedUnits, unitId],
    }));
  }, [updateData, userData]);

  const refreshSrsImpl = useCallback((todayStr: string) => {
    if (!userData) return;
    updateData(data => {
      // 目前空實作：未來可標記已複習或更新
      return data;
    });
  }, [updateData, userData]);

  const claimQuestImpl = useCallback((id: string) => {
    if (!userData) return;
    updateData(data => {
      return {
        ...data,
        dailyQuests: data.dailyQuests.map(quest => {
          if (quest.id === id && quest.progress >= quest.target && !quest.completed) {
            return {
              ...quest,
              completed: true,
            };
          }
          return quest;
        }),
        inventory: {
          ...data.inventory,
          food: data.inventory.food + (data.dailyQuests.find(q => q.id === id)?.reward.food ?? 0),
          coins: data.inventory.coins + (data.dailyQuests.find(q => q.id === id)?.reward.coins ?? 0),
        },
      };
    });
  }, [updateData, userData]);

  const setPetSceneImpl = useCallback((scene: string) => {
    if (!userData) return;
    updateData(data => ({
      ...data,
      pet: {
        ...data.pet,
        scene,
      },
    }));
  }, [updateData]);

  const equipAccessoryImpl = useCallback((id: string) => {
    if (!userData || !userData.inventory.ownedItems.includes(id)) return;
    updateData(data => ({
      ...data,
      pet: {
        ...data.pet,
        accessory: [id],
      },
    }));
  }, [updateData, userData]);

  useEffect(() => {
    let data = storage.getUserData();
    if (!data) {
      data = createDefaultUserData();
      storage.setUserData(data);
    } else {
      // 複製以避免 mutate 原始資料
      data = { ...data };
      // 檢查每日任務重置
      const needsReset = data.dailyQuests.some(q => q.resetDate !== today);
      if (needsReset) {
        data.dailyQuests = resetDailyQuests(data, today);
        storage.setUserData(data);
      }
      data.lastActiveDate = today;
      storage.setUserData(data);
    }
    if (data) {
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
