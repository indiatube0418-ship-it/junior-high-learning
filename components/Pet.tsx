import { PetKind } from '@/lib/types';

export type PetPose = 'idle' | 'happy' | 'sleepy' | 'cheer';

interface PetProps {
  kind: PetKind;
  mood: number;
  level: number;
  accessory: string[];
  scene: string;
  hunger?: number;
  pose?: PetPose;
  size?: number;
  className?: string;
}

const scenes: Record<string, string> = {
  room: 'bg-gradient-to-br from-[var(--bg)]/95 via-blue-50/90 to-indigo-50/85 rounded-3xl shadow-2xl border border-[var(--border)]/50 p-6 md:p-8',
  classroom: 'bg-gradient-to-br from-[var(--bg)]/90 to-[var(--bg2)]/90 rounded-3xl shadow-2xl border border-[var(--border)]/30 p-6 md:p-8',
  park: 'bg-gradient-to-br from-emerald-300/90 via-green-400/90 to-teal-400/80 rounded-3xl shadow-2xl border-4 border-emerald-500/60 p-6 md:p-8',
  space: 'bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-violet-600/80 rounded-3xl shadow-2xl border-4 border-indigo-500/60 p-6 md:p-8',
} as const;

const poseNames: Record<PetPose, string> = {
  idle: '悠閒',
  happy: '開心',
  sleepy: '睡眼朦朧',
  cheer: '歡呼',
};

/**
 * 寵物圖片元件：使用 WebP 圖片 + CSS 動畫
 */
export function Pet({
  kind,
  mood,
  level,
  accessory,
  scene,
  hunger,
  pose,
  size = 200,
  className,
}: PetProps) {
  const displayKind = kind === 'dog' ? 'dog' : 'cat';
  const effectivePose: PetPose =
    pose ??
    ((hunger ?? 50) < 30 || mood < 30 ? 'sleepy' : 'idle');
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const src = `${base}/pets/${displayKind}_${effectivePose}.svg`;
  const alt = `可愛的${displayKind === 'dog' ? '狗狗' : '貓咪'} ${poseNames[effectivePose]} 姿勢`;
  const sceneClass = scenes[scene as keyof typeof scenes] || scenes.classroom;

  return (
    <div className={`pet-root relative w-full aspect-square ${sceneClass} ${className ?? ''}`}>
      <style>{`
        .pet-root {
          --pet-size: ${size}px;
        }
        .pet-float {
          transform-origin: center bottom;
        }
        .pet-img {
          opacity: 0;
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pet-float,
          .pet-float .shadow {
            animation-duration: 0s !important;
            animation: none !important;
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .pet-root .pet-float.pose-idle {
            animation: bob 3s ease-in-out infinite;
          }
          .pet-root .pet-float.pose-happy {
            animation: bounce 1.5s ease-in-out infinite;
          }
          .pet-root .pet-float.pose-cheer {
            animation: cheerJump 2s ease-in-out infinite;
          }
          .pet-root .pet-float.pose-sleepy {
            animation: breathe 4s ease-in-out infinite;
          }
          .pet-root .shadow.pose-idle {
            animation: shadowBob 3s ease-in-out infinite;
          }
          .pet-root .shadow.pose-happy {
            animation: shadowBounce 1.5s ease-in-out infinite;
          }
          .pet-root .shadow.pose-cheer {
            animation: shadowCheer 2s ease-in-out infinite;
          }
          .pet-root .shadow.pose-sleepy {
            animation: shadowBreathe 4s ease-in-out infinite;
          }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-8px) scale(1.05); }
          60% { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes cheerJump {
          0%, 100% { transform: translateY(0) scale(1); }
          15% { transform: translateY(-25px) scale(1.12); }
          30% { transform: translateY(-10px) scale(1.05); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes shadowBob {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.96); }
        }
        @keyframes shadowBounce {
          0%, 20%, 50%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(0.92); }
          60% { transform: scale(0.96); }
        }
        @keyframes shadowCheer {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(0.85); }
          30% { transform: scale(0.94); }
          50% { transform: scale(0.97); }
        }
        @keyframes shadowBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        [data-theme="japanese"] .pet-root .theme-emoji::before { content: "🌸"; }
        [data-theme="korean"] .pet-root .theme-emoji::before { content: "☕"; }
        [data-theme="american"] .pet-root .theme-emoji::before { content: "⭐"; }
        [data-theme="lolita"] .pet-root .theme-emoji::before { content: "🎀"; }
        [data-theme="cyber"] .pet-root .theme-emoji::before { content: "💠"; }
        [data-theme="anime"] .pet-root .theme-emoji::before { content: "💢"; }
        .pet-root .theme-emoji::before {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1.2rem, 4vw, 1.5rem);
          line-height: 1;
          pointer-events: none;
        }
        .pet-root .crown {
          font-size: clamp(1.2rem, 4vw, 1.5rem);
          line-height: 1;
        }
        .pet-root .shadow {
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,0,0,0.4) 0%, transparent 70%);
          filter: blur(2px);
          border-radius: 50%;
        }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
        <div
          className={`pet-float pose-${effectivePose} relative flex-shrink-0`}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <img
            key={effectivePose}
            className="pet-img w-full h-full object-contain"
            src={src}
            alt={alt}
            width={size}
            height={size}
            draggable={false}
            loading="eager"
          />
          <div className="theme-badge absolute top-[5%] right-[5%] flex items-center gap-0.5 z-10 pointer-events-none">
            <span className="theme-emoji block w-6 h-6 relative" />
            {level >= 5 && <span className="crown">👑</span>}
          </div>
          <div className={`shadow pose-${effectivePose} absolute bottom-[-8%] left-1/2 -translate-x-1/2 w-[55%] h-[12%] pointer-events-none`} />
        </div>
      </div>
    </div>
  );
}
