'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUserData } from '@/lib/useUserData';
import { Pet, type PetPose } from '@/components/Pet';
import { TopBar } from '@/components/TopBar';
import { ProgressRing } from '@/components/ProgressRing';
import { BottomNav } from '@/components/BottomNav';
import type { PetState, Inventory } from '@/lib/types';

/**
 * 寵物養成頁：大尺寸寵物顯示、狀態條、餵食、商店、裝備切換
 */
export default function PetPage() {
  const { userData, feedPet, buyItem, equipAccessory, setPetScene } = useUserData();
  const [tempPose, setTempPose] = useState<PetPose | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userData?.pet) return;
    const level = userData.pet.level;
    const key = 'jhl-pet-celebrated-level';
    let stored: number | null = null;
    try {
      const raw = window.localStorage.getItem(key);
      stored = raw === null ? null : Number(raw);
    } catch {
      stored = null;
    }
    const shouldCheer = stored === null ? level > 1 : Number.isFinite(stored) && level > stored;
    if (shouldCheer) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTempPose('cheer');
      setShowUpgrade(true);
      timeoutRef.current = setTimeout(() => {
        setTempPose(null);
        setShowUpgrade(false);
      }, 3000);
    }
    try {
      window.localStorage.setItem(key, String(level));
    } catch {
      /* 私人模式寫不進去時，這次造訪仍會播放 */
    }
  }, [userData?.pet?.level]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleFeed = useCallback(() => {
    if (!userData || userData.inventory.food < 1) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTempPose('happy');
    timeoutRef.current = setTimeout(() => {
      setTempPose(null);
    }, 2500);
    feedPet(1);
  }, [userData, feedPet]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)]">
        載入中...
      </div>
    );
  }

  const pet = userData.pet;
  const inventory = userData.inventory;

  const shopItems = [
    { id: 'hat', name: '帽子', price: 20, type: 'accessory' as const },
    { id: 'scarf', name: '圍巾', price: 15, type: 'accessory' as const },
    { id: 'glasses', name: '眼鏡', price: 25, type: 'accessory' as const },
    { id: 'park', name: '公園', price: 30, type: 'scene' as const },
    { id: 'space', name: '太空', price: 50, type: 'scene' as const },
  ] as const;

  const isOwned = (itemId: string): boolean => {
    return itemId === 'classroom' || inventory.ownedItems.includes(itemId as any);
  };

  const canBuy = (itemId: string, price: number): boolean => {
    return inventory.coins >= price && !isOwned(itemId);
  };

  const maxExp = pet.level * 100;
  const foodDisplayMax = 50;

  return (
    <>
      <TopBar title="我的寵物" />
      <div className="p-4 pb-20 min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
        {/* 寵物大顯示 */}
        <div className="flex flex-col items-center py-8">
          <div className="w-[min(70vw,28rem)] aspect-square mx-auto">
            <Pet
              kind={pet.kind}
              mood={pet.mood}
              hunger={pet.hunger}
              level={pet.level}
              accessory={pet.accessory}
              scene={pet.scene || 'classroom'}
              pose={tempPose ?? undefined}
              size={240}
            />
          </div>
          {showUpgrade && (
            <div className="mb-4 animate-bounce rounded-full border border-[var(--primary)] bg-[var(--card)] px-5 py-2 text-3xl font-bold text-[var(--fg)]">升級了！✨</div>
          )}
          <div className="mt-6 text-2xl font-bold">{pet.name}</div>
        </div>

        {/* 狀態條 */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-8">
          {/* 等級 */}
          <div className="text-center space-y-2">
            <div className="text-lg font-bold">等級 {pet.level}</div>
            <div className="w-20 h-20 mx-auto">
              <ProgressRing progress={(pet.exp / maxExp) * 100} size={64} />
            </div>
            <div className="text-sm text-[var(--muted)]">{pet.exp}/{maxExp} 經驗</div>
          </div>
          {/* 飢餓 */}
          <div className="text-center space-y-2">
            <div className="text-lg font-bold">飢餓</div>
            <div className="w-20 h-20 mx-auto">
              <ProgressRing progress={pet.hunger} size={64} />
            </div>
            <div className="text-sm">{Math.round(pet.hunger)}/100</div>
          </div>
          {/* 心情 */}
          <div className="text-center space-y-2">
            <div className="text-lg font-bold">心情</div>
            <div className="w-20 h-20 mx-auto">
              <ProgressRing progress={pet.mood} size={64} />
            </div>
            <div className="text-sm">{Math.round(pet.mood)}/100</div>
          </div>
          {/* 飼料 */}
          <div className="text-center space-y-2">
            <div className="text-lg font-bold">飼料</div>
            <div className="w-20 h-20 mx-auto">
              <ProgressRing progress={Math.min(inventory.food / foodDisplayMax, 1) * 100} size={64} />
            </div>
            <div className="text-sm">{inventory.food}</div>
          </div>
        </div>

        {/* 餵食 */}
        <div className="mb-8">
          <button
            className="w-full bg-[var(--primary)] text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:scale-100"
            onClick={handleFeed}
            disabled={inventory.food < 1}
          >
            🥩 餵食 (+20 飢餓){inventory.food < 1 ? ' (無飼料)' : ''}
          </button>
        </div>

        {/* 商店 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">商店 (金幣: {inventory.coins})</h2>
          <div className="grid grid-cols-2 gap-4">
            {shopItems.map((item) => (
              <div key={item.id} className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-lg border border-[var(--border)]">
                <div className="text-lg font-bold mb-2">{item.name}</div>
                <div className="text-base opacity-75 mb-4">{item.price} 金幣</div>
                {!isOwned(item.id) ? (
                  <button
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-xl text-sm font-bold shadow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => buyItem(item.id, item.price)}
                    disabled={!canBuy(item.id, item.price)}
                  >
                    購買
                  </button>
                ) : (
                  <div className="text-green-500 font-bold text-lg text-center">已擁有 ✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 裝備 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">裝備</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* 配件 */}
            <div>
              <div className="font-bold text-lg mb-4">配件</div>
              {shopItems.filter((i) => i.type === 'accessory').map((item) => (
                <button
                  key={item.id}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold mb-3 flex items-center justify-between shadow transition-all ${
                    pet.accessory[0] === item.id
                      ? 'bg-[var(--primary)] text-white shadow-lg scale-[1.02]'
                      : isOwned(item.id)
                      ? 'bg-[var(--bg2)] border-2 border-[var(--border)] hover:bg-[var(--primary)]/20 hover:border-[var(--primary)] hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => equipAccessory(item.id)}
                  disabled={!isOwned(item.id)}
                >
                  <span>{item.name}</span>
                  {pet.accessory[0] === item.id ? '✅' : isOwned(item.id) ? '⚪' : '🔒'}
                </button>
              ))}
            </div>
            {/* 場景 */}
            <div>
              <div className="font-bold text-lg mb-4">場景</div>
              <button
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold mb-3 flex items-center justify-between shadow transition-all ${
                  pet.scene === 'classroom'
                    ? 'bg-[var(--primary)] text-white shadow-lg scale-[1.02]'
                    : 'bg-[var(--bg2)] border-2 border-[var(--border)] hover:bg-[var(--primary)]/20 hover:border-[var(--primary)] hover:shadow-lg'
                }`}
                onClick={() => setPetScene('classroom')}
              >
                <span>教室</span>
                {pet.scene === 'classroom' ? '✅' : '⚪'}
              </button>
              {shopItems.filter((i) => i.type === 'scene').map((item) => (
                <button
                  key={item.id}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold mb-3 flex items-center justify-between shadow transition-all ${
                    pet.scene === item.id
                      ? 'bg-[var(--primary)] text-white shadow-lg scale-[1.02]'
                      : isOwned(item.id)
                      ? 'bg-[var(--bg2)] border-2 border-[var(--border)] hover:bg-[var(--primary)]/20 hover:border-[var(--primary)] hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => setPetScene(item.id)}
                  disabled={!isOwned(item.id)}
                >
                  <span>{item.name}</span>
                  {pet.scene === item.id ? '✅' : isOwned(item.id) ? '⚪' : '🔒'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="pet" />
    </>
  );
}
