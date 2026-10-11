export function stepRole(step: number, total: number) {
  if (step <= 0) {
    return {
      look: '先看整張圖，先不要算',
      hint: '這一步只認識畫面裡有什麼。',
    };
  }
  if (step >= Math.max(total, 1) - 1) {
    return {
      look: '看最後亮起來的結論',
      hint: '把圖收成一句話，做題時用這句。',
    };
  }
  if (step === 1) {
    return {
      look: '只看會動、會亮的那一塊',
      hint: '這一步是變化本身，其他先當背景。',
    };
  }
  return {
    look: '把圖對回旁邊的數字或式子',
    hint: '圖和算式講的是同一件事。',
  };
}

export const BEAT_LABELS = ['① 先看圖', '② 看它怎麼動', '③ 對上這句話'] as const;
