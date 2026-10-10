import { PetKind } from '@/lib/types';

interface PetProps {
  kind: PetKind;
  mood: number; // 0-100
  level: number;
  accessory: string[];
  scene: string;
}

const scenes: Record<string, string> = {
  room: 'bg-gradient-to-br from-[var(--bg)]/95 via-blue-50/90 to-indigo-50/85 rounded-3xl shadow-2xl border border-[var(--border)]/50 p-6 md:p-8',
  classroom: 'bg-gradient-to-br from-[var(--bg)]/90 to-[var(--bg2)]/90 rounded-3xl shadow-2xl border border-[var(--border)]/30 p-6 md:p-8',
  park: 'bg-gradient-to-br from-emerald-300/90 via-green-400/90 to-teal-400/80 rounded-3xl shadow-2xl border-4 border-emerald-500/60 p-6 md:p-8',
  space: 'bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-violet-600/80 rounded-3xl shadow-2xl border-4 border-indigo-500/60 p-6 md:p-8',
} as const;

/**
 * 寵物 SVG 元件：支援心情、等級、配件、場景、主題專屬裝飾
 * 所有顏色使用 CSS var 帶 fallback
 */
export function Pet({ kind, mood, level, accessory, scene }: PetProps) {
  const isDog = kind === 'dog';
  const isHappy = mood >= 70;
  const isSleepy = mood < 40;
  const hasHat = accessory.includes('hat');
  const hasScarf = accessory.includes('scarf');
  const hasGlasses = accessory.includes('glasses');
  const sceneClass = scenes[scene as keyof typeof scenes] || scenes.classroom;

  const leftOuter = isDog
    ? 'M58 38 Q43 75 60 108 Q70 116 80 108'
    : 'M60 25 L45 65 L70 82 L82 48 Z';
  const leftInner = isDog
    ? 'M62 48 Q47 82 63 103 Q71 110 77 107'
    : 'M64 33 L48 58 L68 72 L78 45 Z';

  const dogTailPath = 'M152 152 L158 152 Q170 130 162 110 Q172 97 168 90 L158 90 Q152 100 156 112 Q152 132 152 152 Z';
  const catTailPath = 'M150 158 L155 158 Q168 135 178 155 Q188 178 176 202 Q164 222 152 217 L148 217 Q142 202 150 178 Q152 165 150 158 Z';

  const mouthPath = isHappy ? 'M78 152 Q100 170 122 152' : 'M82 148 Q100 152 118 148';
  const mouthWidth = isHappy ? 6 : 3.5;
  const mouthTransform = isHappy ? '' : 'translate(0 3)';

  return (
    <div className={`relative w-full aspect-[3/4] mx-auto ${sceneClass}`}>
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .pet-breathe {
          animation: breathe 4s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center bottom;
        }
        .pet-deco {
          display: none !important;
        }
        [data-theme="japanese"] .pet-deco-japanese,
        [data-theme="korean"] .pet-deco-korean,
        [data-theme="american"] .pet-deco-american,
        [data-theme="lolita"] .pet-deco-lolita,
        [data-theme="cyber"] .pet-deco-cyber,
        [data-theme="anime"] .pet-deco-anime {
          display: block !important;
        }
      `}</style>
      <svg viewBox="0 0 200 200" width="100%" height="100%" className="pet-breathe drop-shadow-2xl pointer-events-none">
        {/* 皇冠 */}
        {level >= 5 && (
          <g transform="translate(100,12) scale(1.5)">
            <path d="M-18 -8 L-9 12 L0 5 L9 12 L18 -8 L14 -18 L0 -22 L-14 -18 Z" fill="#ffd700" stroke="#ffaa00" strokeWidth="1" strokeLinejoin="round" />
          </g>
        )}
        {/* 主題專屬裝飾 */}
        <g className="pet-deco pet-deco-japanese" transform="translate(100,28) scale(0.7)">
          {/* 櫻花髮飾 */}
          <circle cx="-15" cy="-5" r="8" fill="var(--pet-accent, #ff69b4)" opacity="0.9" stroke="var(--pet-accent, #ff69b4)" strokeWidth="1.5" />
          <circle cx="15" cy="-5" r="8" fill="var(--pet-accent, #ff69b4)" opacity="0.9" stroke="var(--pet-accent, #ff69b4)" strokeWidth="1.5" />
          <path d="M0 12 Q-12 20 0 28 Q12 20 0 12" fill="var(--pet-accent, #ff69b4)" opacity="0.7" stroke="var(--pet-accent, #ff69b4)" strokeWidth="1" />
        </g>
        <g className="pet-deco pet-deco-korean" transform="translate(100,18) scale(0.8)">
          {/* 小貝雷帽 */}
          <ellipse cx="0" cy="-8" rx="28" ry="14" fill="var(--pet-accent, #f4a261)" stroke="var(--border, #333)" strokeWidth="2" />
          <ellipse cx="0" cy="-18" rx="20" ry="10" fill="var(--pet-accent, #f4a261)" stroke="var(--border, #333)" strokeWidth="1.5" />
          <circle cx="5" cy="-10" r="3" fill="var(--border, #333)" />
        </g>
        <g className="pet-deco pet-deco-american" transform="translate(100,20) scale(0.75)">
          {/* 棒球帽 */}
          <path d="M-28 -12 Q0 -28 28 -12 L28 12 Q18 18 0 14 Q-18 18 -28 12 Z" fill="var(--pet-accent, #ef4444)" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-22 10 Q0 16 22 10" stroke="#000" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="-5" cy="2" r="2" fill="#fff" stroke="#000" strokeWidth="0.5" />
        </g>
        <g className="pet-deco pet-deco-lolita" transform="translate(100,35) scale(0.8)">
          {/* 蝴蝶結緞帶 */}
          <ellipse cx="-18" cy="0" rx="14" ry="10" fill="var(--pet-accent, #ec4899)" stroke="var(--border, #333)" strokeWidth="1.5" />
          <ellipse cx="18" cy="0" rx="14" ry="10" fill="var(--pet-accent, #ec4899)" stroke="var(--border, #333)" strokeWidth="1.5" />
          <rect x="-8" y="-2" width="16" height="8" rx="4" fill="var(--fg, #333)" />
          <circle cx="0" cy="-12" r="3" fill="var(--pet-accent, #ec4899)" />
        </g>
        <g className="pet-deco pet-deco-cyber" transform="translate(100,25) scale(0.9)">
          {/* 霓虹護目鏡 */}
          <ellipse cx="-15" cy="0" rx="12" ry="7" fill="none" stroke="var(--pet-accent, #00ff88)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="15" cy="0" rx="12" ry="7" fill="none" stroke="var(--pet-accent, #00ff88)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="4" fill="var(--pet-accent, #00ff88)" opacity="0.8" />
        </g>
        <g className="pet-deco pet-deco-anime" transform="translate(130,50) scale(1.2)">
          {/* 汗滴符號 */}
          <path d="M0 0 Q3 12 0 22 Q-3 12 0 0" fill="var(--pet-accent, #3b82f6)" stroke="var(--border, #333)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="-8" cy="8" r="2" fill="var(--pet-accent, #3b82f6)" opacity="0.6" />
        </g>
        {/* 帽子 */}
        {hasHat && (
          <g transform="translate(0,-8)">
            <path d="M45 18 Q100 -2 155 18 L155 48 Q145 58 100 52 Q55 58 45 48 Z" fill="var(--pet-accent, #3b82f6)" stroke="#5a4636" strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        )}
        {/* 身體 */}
        <ellipse cx="100" cy="170" rx="48" ry="52" fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* 肚子 */}
        <ellipse cx="100" cy="175" rx="32" ry="28" fill="#fff" stroke="#5a4636" strokeWidth="1.5" />
        {/* 頭部 */}
        <circle cx="100" cy="75" r="58" fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* 耳朵左 */}
        <path d={leftOuter} fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={leftInner} fill="var(--pet-blush, #ffb3c1)" stroke="#5a4636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* 耳朵右 */}
        <g transform="translate(200,0) scale(-1,1)">
          <path d={leftOuter} fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={leftInner} fill="var(--pet-blush, #ffb3c1)" stroke="#5a4636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* 腮紅 */}
        <circle cx="65" cy="105" r="20" fill="var(--pet-blush, #ffb3c1)" opacity="0.6" />
        <circle cx="135" cy="105" r="20" fill="var(--pet-blush, #ffb3c1)" opacity="0.6" />
        {/* 狗嘴部白 */}
        {isDog && <ellipse cx="100" cy="140" rx="25" ry="20" fill="#fff" stroke="#5a4636" strokeWidth="1.8" opacity="0.9" />}
        {/* 鼻子 */}
        <ellipse cx="100" cy="125" rx="12" ry="8" fill="var(--pet-nose, #5a4636)" stroke="#4a3a2a" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="96" cy="127" r="2" fill="#2b2b2b" />
        <circle cx="104" cy="127" r="2" fill="#2b2b2b" />
        {/* 眼睛 */}
        {isHappy ? (
          <>
            <path d="M74 80 Q88 92 102 80" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" fill="none" strokeLinejoin="round" />
            <path d="M102 80 Q116 92 130 80" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" fill="none" strokeLinejoin="round" />
          </>
        ) : isSleepy ? (
          <>
            <line x1="74" y1="78" x2="94" y2="78" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
            <line x1="106" y1="78" x2="128" y2="78" stroke="#2b2b2b" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="83" cy="78" rx="14" ry="12" fill="white" stroke="#5a4636" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="117" cy="78" rx="14" ry="12" fill="white" stroke="#5a4636" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="85" cy="76" r="7" fill="#2b2b2b" />
            <circle cx="119" cy="76" r="7" fill="#2b2b2b" />
            <circle cx="87" cy="74" r="2.5" fill="white" opacity="0.9" />
            <circle cx="121" cy="74" r="2.5" fill="white" opacity="0.9" />
          </>
        )}
        {/* 眼鏡 */}
        {hasGlasses && (
          <g stroke="var(--pet-accent, #3b82f6)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0,-2)">
            <ellipse cx="83" cy="78" rx="14" ry="10" />
            <ellipse cx="117" cy="78" rx="14" ry="10" />
            <path d="M97 78 Q100 78 103 78" strokeWidth="2.5" />
          </g>
        )}
        {/* 嘴巴 */}
        <path d={mouthPath} stroke="#5a4636" strokeWidth={mouthWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={mouthTransform} />
        {/* 貓鬍鬚 */}
        {kind === 'cat' && (
          <g stroke="#5a4636" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <line x1="82" y1="150" x2="55" y2="145" />
            <line x1="82" y1="155" x2="48" y2="153" />
            <line x1="118" y1="150" x2="145" y2="145" />
            <line x1="118" y1="155" x2="152" y2="153" />
          </g>
        )}
        {/* 尾巴 */}
        {isDog ? (
          <path d={dogTailPath} fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d={catTailPath} fill="var(--pet-body, #f6c28b)" stroke="#5a4636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* 圍巾 */}
        {hasScarf && (
          <rect x="58" y="128" width="84" height="48" rx="22" fill="var(--pet-accent, #3b82f6)" stroke="#5a4636" strokeWidth="2.5" strokeLinejoin="round" />
        )}
        {/* Zzz */}
        {isSleepy && (
          <g opacity="0.8" transform="translate(100,18)">
            <path d="M-20 0 L-10 10 L-20 10 L-17 20 L-7 20 L-17 30" stroke="#5a4636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="-18" cy="2" r="2.5" fill="#5a4636" />
          </g>
        )}
      </svg>
    </div>
  );
}
