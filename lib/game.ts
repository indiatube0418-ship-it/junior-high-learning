/**
 * 遊戲邏輯純函式：獎勵、寵物升級、餵食、購買、每日任務
 */

import type { PetState, Inventory, UserData, DailyQuest } from './types';

export function calculateRewards(tier: string, isCorrect: boolean): { food: number; exp: number; coins: number } {
  const base = tier === 'basic' ? 1 : tier === 'advanced' ? 2 : 3;
  const mul = isCorrect ? 1 : 0.5;
  return {
    food: Math.floor(base * mul),
    exp: Math.floor(base * 10 * mul),
    coins: Math.floor(base * 5 * mul),
  };
}

export function levelUpPet(pet: PetState, expGain: number): PetState {
  let newPet: PetState = { ...pet, exp: pet.exp + expGain };
  const maxExpForLevel = (level: number) => level * 100;
  while (newPet.exp >= maxExpForLevel(newPet.level) && newPet.level < 20) {
    newPet.exp -= maxExpForLevel(newPet.level);
    newPet.level += 1;
    newPet.hunger = Math.min(100, newPet.hunger + 10);
    newPet.mood = Math.min(100, newPet.mood + 10);
  }
  return newPet;
}

export function feedPet(pet: PetState, food: number): PetState {
  const hungerGain = food * 20;
  return {
    ...pet,
    hunger: Math.min(100, pet.hunger + hungerGain),
    mood: Math.min(100, pet.mood + Math.floor(hungerGain / 2)),
  };
}

export function buyItem(inventory: Inventory, itemId: string, cost: number): Inventory | null {
  if (inventory.coins < cost) return null;
  return {
    ...inventory,
    coins: inventory.coins - cost,
    ownedItems: [...inventory.ownedItems, itemId],
  };
}

export function resetDailyQuests(userData: UserData, today: string): DailyQuest[] {
  return userData.dailyQuests.map(quest => ({
    ...quest,
    progress: 0,
    completed: false,
    resetDate: today,
  }));
}

export function checkDailyReminders(userData: UserData, today: string): string[] {
  const reminders: string[] = [];
  const daysSinceLast = /* impl diffDays from srs */ (() => {
    // 簡化，假設有 diffDays
    return 2; // placeholder
  })();
  if (daysSinceLast > 1) {
    reminders.push('好久沒來練習了，一起來刷題吧！');
  }
  if (userData.pet.hunger < 30) {
    reminders.push('小學伴好像餓了，快餵食！');
  }
  if (userData.inventory.food === 0) {
    reminders.push('飼料不夠了，多練習賺飼料吧！');
  }
  return reminders;
}
