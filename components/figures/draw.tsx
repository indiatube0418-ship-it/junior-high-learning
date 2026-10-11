import type { ReactNode } from 'react';

export type Tone = 'pri' | 'acc' | 'ink' | 'mute';

const fill: Record<Tone, string> = {
  pri: 'var(--primary)',
  acc: 'var(--accent)',
  ink: 'var(--fg)',
  mute: 'var(--muted)',
};

export interface NlPhase {
  points?: { at: number; label?: string; tone?: Tone; open?: boolean }[];
  arrow?: { from: number; to: number; label?: string };
  arcs?: { a: number; b: number; label: string }[];
  shade?: { a: number; b: number };
  tags?: [string, string];
}

export interface PlanePhase {
  points?: { x: number; y: number; label: string }[];
  lines?: { x1: number; y1: number; x2: number; y2: number }[];
  curve?: 'prop' | 'inverse' | 'up' | 'down' | 'vertex' | 'cross' | 'touch' | 'miss' | 'slope';
  quads?: boolean;
  note?: string;
}

export interface TokenPhase {
  groups: { label: string; cells: { t: string; tone?: Tone }[] }[];
  foot?: string;
}

export interface FlowPhase {
  boxes: string[];
  hot?: number;
  result?: string;
}

export interface BarPhase {
  items: { label: string; value: number; tone?: Tone }[];
  note?: string;
}

export interface FracPhase {
  rows: { label: string; den: number; num: number; tone?: Tone }[];
  note?: string;
}

export type Visual =
  | { type: 'nl'; min: number; max: number; phases: NlPhase[] }
  | { type: 'tokens'; phases: TokenPhase[] }
  | { type: 'flow'; phases: FlowPhase[] }
  | { type: 'bars'; phases: BarPhase[] }
  | { type: 'frac'; phases: FracPhase[] }
  | { type: 'plane'; phases: PlanePhase[] }
  | { type: 'geo'; name: string };

interface Pt {
  x: number;
  y: number;
}

function Label({
  x,
  y,
  children,
  size = 14,
  fillColor = 'var(--fg)',
  anchor = 'middle',
  weight = 700,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  fillColor?: string;
  anchor?: 'middle' | 'start' | 'end';
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={fillColor}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {children}
    </text>
  );
}

function Board({ h = 210, children }: { h?: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 360 ${h}`} className="h-auto w-full" role="img">
      <rect x="1" y="1" width="358" height={h - 2} rx="16" fill="var(--card)" stroke="var(--border)" />
      {children}
    </svg>
  );
}

function phaseAt<T>(phases: T[] | undefined, step: number): T | undefined {
  if (!phases || phases.length === 0) return undefined;
  return phases[Math.min(step, phases.length - 1)];
}


function Cue({ cx, cy, show }: { cx: number; cy: number; show: boolean }) {
  if (!show) return null;
  return (
    <circle cx={cx} cy={cy} r={10} fill="none" stroke="var(--accent)" strokeWidth={2.4}>
      <animate attributeName="r" values="10;22;10" dur="1.2s" repeatCount="2" />
      <animate attributeName="opacity" values="0.85;0;0.85" dur="1.2s" repeatCount="2" />
    </circle>
  );
}


function NumberLine({
  min,
  max,
  phase,
  prev,
  motion,
  beat,
  h = 168,
}: {
  min: number;
  max: number;
  phase: NlPhase;
  prev?: NlPhase;
  motion: boolean;
  beat: number;
  h?: number;
}) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const y = 92;
  const x0 = 32;
  const x1 = 328;
  const X = (n: number) => x0 + ((n - min) / (max - min)) * (x1 - x0);
  const ticks: number[] = [];
  for (let n = Math.ceil(min); n <= Math.floor(max); n += 1) ticks.push(n);
  const arrow = phase.arrow;
  const goRight = arrow ? arrow.to >= arrow.from : true;

  return (
    <Board h={h}>
      {phase.tags && (
        <>
          <Label x={28} y={36} anchor="start" size={13} fillColor="var(--accent)">
            {phase.tags[0]}
          </Label>
          <Label x={332} y={36} anchor="end" size={13} fillColor="var(--primary)">
            {phase.tags[1]}
          </Label>
        </>
      )}
      {showAct && phase.shade && (
        <rect
          className="fig-grow"
          x={X(phase.shade.a)}
          y={y - 18}
          width={Math.max(8, X(phase.shade.b) - X(phase.shade.a))}
          height={36}
          rx={10}
          fill="var(--primary)"
          opacity={0.22}
        />
      )}
      <line x1={x0 - 6} y1={y} x2={x1 + 6} y2={y} stroke="var(--fg)" strokeWidth={2.4} />
      <polygon points={`${x1 + 10},${y} ${x1},${y - 5} ${x1},${y + 5}`} fill="var(--fg)" />
      {ticks.map((n) => (
        <g key={n}>
          <line
            x1={X(n)}
            y1={y - (n === 0 ? 12 : 8)}
            x2={X(n)}
            y2={y + (n === 0 ? 12 : 8)}
            stroke="var(--fg)"
            strokeWidth={n === 0 ? 2.6 : 1.4}
          />
          <Label x={X(n)} y={y + 30} size={13} weight={n === 0 ? 800 : 600}>
            {n}
          </Label>
        </g>
      ))}
      {showAct && phase.arcs?.map((arc, i) => {
        const xA = X(arc.a);
        const xB = X(arc.b);
        const mid = (xA + xB) / 2;
        const lift = Math.min(52, Math.abs(xB - xA) * 0.55 + 16);
        return (
          <g key={`${arc.label}-${i}`}>
            <path
              d={`M ${xA} ${y - 12} Q ${mid} ${y - 12 - lift} ${xB} ${y - 12}`}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.4}
              pathLength={100} className="fig-dash"
            />
            {showSay && (
              <Label x={mid} y={y - 16 - lift} size={13} fillColor="var(--primary)">
                {arc.label}
              </Label>
            )}
          </g>
        );
      })}
      {prev?.points?.map((p, i) => (
        <g key={`prev-${p.at}-${i}`} className="fig-dim">
          <circle
            cx={X(p.at)}
            cy={y}
            r={7}
            fill={p.open ? 'var(--card)' : fill[p.tone || 'mute']}
            stroke={fill[p.tone || 'mute']}
            strokeWidth={2}
          />
        </g>
      ))}
      {showAct && arrow && (
        <g>
          <line
            x1={X(arrow.from)}
            y1={46}
            x2={X(arrow.to)}
            y2={46}
            stroke="var(--accent)"
            strokeWidth={3}
            pathLength={100} className="fig-dash"
          />
          <polygon
            points={
              goRight
                ? `${X(arrow.to) + 2},46 ${X(arrow.to) - 9},41 ${X(arrow.to) - 9},51`
                : `${X(arrow.to) - 2},46 ${X(arrow.to) + 9},41 ${X(arrow.to) + 9},51`
            }
            fill="var(--accent)"
          />
          {showSay && arrow.label && (
            <Label x={(X(arrow.from) + X(arrow.to)) / 2} y={34} size={13} fillColor="var(--accent)">
              {arrow.label}
            </Label>
          )}
          <circle r={8} cy={y} fill="var(--accent)" cx={motion ? undefined : X(arrow.to)}>
            {motion && (
              <animate attributeName="cx" from={X(arrow.from)} to={X(arrow.to)} dur="1.25s" fill="freeze" />
            )}
          </circle>
          <Cue cx={X(arrow.to)} cy={y} show={showAct} />
        </g>
      )}
      {showSay && phase.points?.map((p, i) => (
        <g key={`${p.at}-${i}`} className={showAct ? 'fig-pop fig-pulse' : undefined} style={{ animationDelay: `${i * 0.12}s` }}>
          <circle
            cx={X(p.at)}
            cy={y}
            r={8}
            fill={p.open ? 'var(--card)' : fill[p.tone || 'acc']}
            stroke={fill[p.tone || 'acc']}
            strokeWidth={3}
          />
          <Cue cx={X(p.at)} cy={y} show={showAct && i === 0} />
          {showSay && p.label && (
            <Label x={X(p.at)} y={y - 18} size={13} fillColor={fill[p.tone || 'acc']}>
              {p.label}
            </Label>
          )}
        </g>
      ))}
    </Board>
  );
}

function Tokens({ phase, beat }: { phase: TokenPhase; beat: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const n = Math.max(phase.groups.length, 1);
  const gap = 12;
  const w = (336 - gap * (n - 1)) / n;
  return (
    <Board h={phase.foot ? 210 : 188}>
      {phase.groups.map((g, i) => {
        const x = 12 + i * (w + gap);
        return (
          <g key={g.label}>
            <rect x={x} y={16} width={w} height={128} rx={14} fill="var(--bg2)" />
            <Label x={x + w / 2} y={40} size={14}>
              {g.label}
            </Label>
            {showAct && g.cells.map((c, k) => {
              const cols = Math.min(3, g.cells.length);
              const cw = 36;
              const row = Math.floor(k / cols);
              const col = k % cols;
              const totalW = cols * cw;
              const sx = x + (w - totalW) / 2 + col * cw + 18;
              const sy = 78 + row * 36;
              return (
                <g key={`${c.t}-${k}`} className="fig-pop fig-pulse" style={{ animationDelay: `${k * 0.08}s` }}>
                  <circle cx={sx} cy={sy} r={15} fill={fill[c.tone || 'pri']} />
                  <Label x={sx} y={sy + 4} size={12} fillColor="var(--primary-fg)">
                    {c.t}
                  </Label>
                </g>
              );
            })}
          </g>
        );
      })}
      {showSay && phase.foot && (
        <Label x={180} y={186} size={15}>
          {phase.foot}
        </Label>
      )}
    </Board>
  );
}

function Flow({ phase, beat = 2 }: { phase: FlowPhase; beat?: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const rows = phase.boxes.length;
  const h = 36 + rows * 42 + (phase.result ? 28 : 12);
  return (
    <Board h={h}>
      {phase.boxes.map((box, i) => {
        const y = 16 + i * 42;
        const hot = phase.hot === i;
        const later = phase.hot != null && i > phase.hot;
        if (later && !showSay) return null;
        const lit = hot && showAct;
        return (
          <g key={box} className={lit ? 'fig-pop fig-pulse' : later ? 'fig-dim' : undefined}>
            <rect
              x={28}
              y={y}
              width={304}
              height={34}
              rx={10}
              fill={lit ? 'var(--primary)' : 'var(--bg2)'}
              stroke="var(--border)"
            />
            <Label x={180} y={y + 22} size={15} fillColor={lit ? 'var(--primary-fg)' : 'var(--fg)'}>
              {box}
            </Label>
          </g>
        );
      })}
      {showSay && phase.result && (
        <Label x={180} y={h - 12} size={15} fillColor="var(--primary)">
          {phase.result}
        </Label>
      )}
    </Board>
  );
}

function Bars({ phase, beat = 2 }: { phase: BarPhase; beat?: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const max = Math.max(...phase.items.map((it) => it.value), 1);
  const n = Math.max(phase.items.length, 1);
  const w = Math.min(48, 280 / n);
  const base = 150;
  return (
    <Board h={200}>
      {phase.items.map((it, i) => {
        const bh = (it.value / max) * 100;
        const x = 36 + i * (300 / n);
        return (
          <g key={it.label}>
            {showAct && (
              <rect
                className="fig-rise fig-pulse"
                x={x}
                y={base - bh}
                width={w}
                height={bh}
                rx={6}
                fill={fill[it.tone || (i % 2 === 0 ? 'pri' : 'acc')]}
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            )}
            {showSay && (
              <Label x={x + w / 2} y={base - bh - 8} size={12}>
                {it.value}
              </Label>
            )}
            <Label x={x + w / 2} y={172} size={12} weight={600}>
              {it.label}
            </Label>
          </g>
        );
      })}
      {showSay && phase.note && (
        <Label x={180} y={192} size={13} fillColor="var(--primary)">
          {phase.note}
        </Label>
      )}
    </Board>
  );
}

function Fractions({ phase, beat }: { phase: FracPhase; beat: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const h = 28 + phase.rows.length * 48 + 28;
  return (
    <Board h={h}>
      {phase.rows.map((row, i) => {
        const y = 20 + i * 48;
        const x = 86;
        const width = 240;
        const cell = width / row.den;
        return (
          <g key={`${row.label}-${i}`}>
            <Label x={78} y={y + 20} anchor="end" size={14}>
              {row.label}
            </Label>
            <rect x={x} y={y} width={width} height={28} rx={6} fill="var(--bg2)" stroke="var(--border)" />
            {Array.from({ length: row.den }, (_, k) => (
              <g key={k}>
                {showAct && k < row.num && (
                  <rect
                    className="fig-grow"
                    x={x + k * cell}
                    y={y}
                    width={Math.max(0, cell - 1)}
                    height={28}
                    fill={fill[row.tone || 'pri']}
                    opacity={0.85}
                    style={{ animationDelay: `${k * 0.04}s` }}
                  />
                )}
              </g>
            ))}
          </g>
        );
      })}
      {showSay && phase.note && (
        <Label x={180} y={h - 12} size={15} fillColor="var(--primary)">
          {phase.note}
        </Label>
      )}
    </Board>
  );
}

function Plane({ phase, beat }: { phase: PlanePhase; beat: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  const ox = 180;
  const oy = 108;
  const s = 22;
  const X = (x: number) => ox + x * s;
  const Y = (y: number) => oy - y * s;
  const samples = (fn: (x: number) => number | null) => {
    let d = '';
    let pen = false;
    for (let i = 0; i <= 84; i += 1) {
      const x = -4.4 + (8.8 * i) / 84;
      const y = fn(x);
      if (y === null || y < -4.3 || y > 4.3) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(y).toFixed(1)} `;
      pen = true;
    }
    return d;
  };

  const curvePath = () => {
    if (phase.curve === 'prop') return samples((x) => x);
    if (phase.curve === 'inverse') return samples((x) => (Math.abs(x) < 0.35 ? null : 4 / x));
    if (phase.curve === 'up') return samples((x) => 0.32 * x * x);
    if (phase.curve === 'down') return samples((x) => -0.32 * x * x);
    if (phase.curve === 'vertex') return samples((x) => (x - 1) * (x - 1) - 1.5);
    if (phase.curve === 'cross') return samples((x) => 0.4 * (x - 1.2) * (x + 2));
    if (phase.curve === 'touch') return samples((x) => 0.55 * (x - 0.6) * (x - 0.6));
    if (phase.curve === 'miss') return samples((x) => 0.25 * x * x + 0.9);
    if (phase.curve === 'slope') return samples((x) => 0.8 * x + 1);
    return '';
  };

  return (
    <Board h={228}>
      {[-3, -2, -1, 1, 2, 3].map((n) => (
        <g key={n}>
          <line x1={X(n)} y1={Y(-4)} x2={X(n)} y2={Y(4)} stroke="var(--border)" />
          <line x1={X(-4)} y1={Y(n)} x2={X(4)} y2={Y(n)} stroke="var(--border)" />
        </g>
      ))}
      <line x1={X(-4.4)} y1={oy} x2={X(4.4)} y2={oy} stroke="var(--fg)" strokeWidth={1.7} />
      <line x1={ox} y1={Y(-4.2)} x2={ox} y2={Y(4.4)} stroke="var(--fg)" strokeWidth={1.7} />
      <Label x={X(4.2)} y={oy + 16} size={12}>x</Label>
      <Label x={ox + 10} y={Y(4.15)} size={12} anchor="start">y</Label>
      {phase.quads && (
        <>
          <Label x={X(2.1)} y={Y(2)} size={13} fillColor="var(--primary)">I</Label>
          <Label x={X(-2.1)} y={Y(2)} size={13} fillColor="var(--accent)">II</Label>
          <Label x={X(-2.1)} y={Y(-2)} size={13} fillColor="var(--muted)">III</Label>
          <Label x={X(2.1)} y={Y(-2)} size={13}>IV</Label>
        </>
      )}
      {showAct && phase.lines?.map((ln, i) => (
        <line
          key={i}
          x1={X(ln.x1)}
          y1={Y(ln.y1)}
          x2={X(ln.x2)}
          y2={Y(ln.y2)}
          stroke={i % 2 === 0 ? 'var(--primary)' : 'var(--accent)'}
          strokeWidth={2.5}
          pathLength={100} className="fig-dash"
        />
      ))}
      {showAct && phase.curve && (
        <path d={curvePath()} fill="none" stroke="var(--primary)" strokeWidth={2.6} pathLength={100} className="fig-dash" />
      )}
      {phase.points?.map((p, i) => (
        <g key={p.label} className="fig-pop" style={{ animationDelay: `${i * 0.1}s` }}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5} fill="var(--accent)" />
          <Label x={X(p.x) + 8} y={Y(p.y) - 8} anchor="start" size={12} fillColor="var(--accent)">
            {p.label}
          </Label>
        </g>
      ))}
      {showSay && phase.note && (
        <Label x={180} y={216} size={13} fillColor="var(--primary)">
          {phase.note}
        </Label>
      )}
    </Board>
  );
}

function squareOn(x1: number, y1: number, x2: number, y2: number, sign: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * len * sign;
  const py = (dx / len) * len * sign;
  return `${x1},${y1} ${x2},${y2} ${x2 + px},${y2 + py} ${x1 + px},${y1 + py}`;
}

function circumcenter(A: Pt, B: Pt, C: Pt) {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const x =
    ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
      (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
      (C.x ** 2 + C.y ** 2) * (A.y - B.y)) /
    d;
  const y =
    ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
      (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
      (C.x ** 2 + C.y ** 2) * (B.x - A.x)) /
    d;
  return { x, y, r: Math.hypot(x - A.x, y - A.y) };
}

function incenter(A: Pt, B: Pt, C: Pt) {
  const a = Math.hypot(B.x - C.x, B.y - C.y);
  const b = Math.hypot(A.x - C.x, A.y - C.y);
  const c = Math.hypot(A.x - B.x, A.y - B.y);
  const p = a + b + c;
  return { x: (a * A.x + b * B.x + c * C.x) / p, y: (a * A.y + b * B.y + c * C.y) / p };
}

function Geo({ name, step, motion = true, beat = 2 }: { name: string; step: number; motion?: boolean; beat?: number }) {
  const showAct = beat >= 1;
  const showSay = beat >= 2;
  if (name === 'mulsign') {
    const cells = [
      ['正×正', '正'],
      ['正×負', '負'],
      ['負×正', '負'],
      ['負×負', '正'],
    ];
    return (
      <Board h={188}>
        {cells.map((c, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const hot = step === i;
          return (
            <g key={c[0]} className={hot && showAct ? "fig-pulse" : undefined}>
              <rect x={24 + col * 160} y={20 + row * 72} width={148} height={60} rx={12} fill={hot ? 'var(--primary)' : 'var(--bg2)'} />
              <Label x={98 + col * 160} y={44 + row * 72} size={15} fillColor={hot ? 'var(--primary-fg)' : 'var(--fg)'}>{c[0]}</Label>
              <Label x={98 + col * 160} y={66 + row * 72} size={16} fillColor={hot ? 'var(--primary-fg)' : 'var(--accent)'}>{c[1]}</Label>
            </g>
          );
        })}
      </Board>
    );
  }

  if (name === 'sci') {
    return (
      <Board h={170}>
        <Label x={180} y={46} size={18}>{step === 0 ? '10³ = 1000' : '3.45 × 10⁶ = 3450000'}</Label>
        <Label x={180} y={90} size={15} weight={600}>{step < 2 ? '1 後面有幾個 0，就是 10 的幾次方' : '1 ≤ a ＜ 10，小數點要放在這個範圍'}</Label>
        <circle className="fig-pop" cx={70 + step * 60} cy={124} r={7} fill="var(--accent)" />
        <line x1={60} y1={124} x2={300} y2={124} stroke="var(--border)" />
        <Label x={180} y={154} size={13} fillColor="var(--primary)">小數點往右移 n 位，就是乘 10ⁿ</Label>
      </Board>
    );
  }

  if (name === 'factors') {
    const title = ['12 的因數', '7 的正因數只有 1 和 7', '1 不是質數也不是合數', '2 是最小的質數，也是唯一偶質數'][step];
    const center = ['12', '7', '1', '2'][step];
    const cells = [['1', '2', '3', '4', '6', '12'], ['1', '7'], ['—'], ['1', '2']][step];
    return (
      <Board h={200}>
        <Label x={180} y={28} size={14}>{title}</Label>
        <circle cx={180} cy={110} r={24} fill="var(--primary)" />
        <Label x={180} y={115} size={14} fillColor="var(--primary-fg)">{center}</Label>
        {cells.map((c, i) => {
          const ang = -Math.PI / 2 + (i * 2 * Math.PI) / cells.length;
          const x = 180 + Math.cos(ang) * 78;
          const y = 116 + Math.sin(ang) * 52;
          return (
            <g key={c} className="fig-pop" style={{ animationDelay: `${i * 0.08}s` }}>
              <line x1={180} y1={110} x2={x} y2={y} stroke="var(--accent)" strokeWidth={2} />
              <circle cx={x} cy={y} r={16} fill="var(--bg2)" stroke="var(--accent)" strokeWidth={2} />
              <Label x={x} y={y + 4} size={11}>{c}</Label>
            </g>
          );
        })}
      </Board>
    );
  }

  if (name === 'gcd') {
    const left = ['1', '2', '3', '4', '6', '12'];
    const right = ['1', '2', '3', '6', '9', '18'];
    const common = new Set(['1', '2', '3', '6']);
    return (
      <Board h={210}>
        <Label x={100} y={32} size={14}>12</Label>
        <Label x={260} y={32} size={14}>18</Label>
        {left.map((t, i) => (
          <g key={`l${t}`}>
            <rect x={36 + (i % 3) * 44} y={48 + Math.floor(i / 3) * 38} width={38} height={28} rx={8} fill={common.has(t) ? 'var(--primary)' : 'var(--bg2)'} />
            <Label x={55 + (i % 3) * 44} y={67 + Math.floor(i / 3) * 38} size={13} fillColor={common.has(t) ? 'var(--primary-fg)' : 'var(--fg)'}>{t}</Label>
          </g>
        ))}
        {right.map((t, i) => (
          <g key={`r${t}`}>
            <rect x={196 + (i % 3) * 48} y={48 + Math.floor(i / 3) * 38} width={40} height={28} rx={8} fill={common.has(t) ? 'var(--primary)' : 'var(--bg2)'} />
            <Label x={216 + (i % 3) * 48} y={67 + Math.floor(i / 3) * 38} size={13} fillColor={common.has(t) ? 'var(--primary-fg)' : 'var(--fg)'}>{t}</Label>
          </g>
        ))}
        <Label x={180} y={176} size={15} fillColor="var(--primary)">{['共有因數裡最大的是 6', '12 和 18 的最小公倍數是 36', '12 和 18 還有別的公因數，所以不互質', '短除可以同時找出這兩個數'][step]}</Label>
      </Board>
    );
  }

  if (name === 'exp') {
    const total = [5, 3, 6, 5][step];
    const cut = [2, 3, 2, 2][step];
    return (
      <Board h={170}>
        <Label x={180} y={32} size={14}>{['同底相乘，指數相加', '同底相除，指數相減', '乘方再乘方，指數相乘', '先用正整數指數'][step]}</Label>
        {Array.from({ length: total }, (_, i) => (
          <rect key={i} className="fig-pop" x={36 + i * 42} y={62} width={34} height={34} rx={6} fill={i < cut ? 'var(--primary)' : 'var(--accent)'} style={{ animationDelay: `${i * 0.06}s` }} />
        ))}
        <Label x={180} y={140} size={16}>{['a² × a³ = a⁵', 'a⁵ ÷ a² = a³', '(a²)³ = a⁶', 'aᵐ × aⁿ = aᵐ⁺ⁿ'][step]}</Label>
      </Board>
    );
  }

  if (name === 'like') {
    return (
      <Board h={180}>
        {step === 1 ? (
          <g>
            <rect x={40} y={50} width={150} height={70} fill="var(--primary)" opacity={0.85} />
            <rect x={190} y={50} width={80} height={70} fill="var(--accent)" />
            <Label x={115} y={90} size={16} fillColor="var(--primary-fg)">ab</Label>
            <Label x={230} y={90} size={16} fillColor="var(--primary-fg)">ac</Label>
            <Label x={180} y={156} size={15}>a(b + c) = ab + ac</Label>
          </g>
        ) : (
          <g>
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} className="fig-rise" x={28 + i * 44} y={58} width={36} height={48} rx={6} fill={i < 5 ? 'var(--primary)' : 'var(--accent)'} />
            ))}
            <Label x={180} y={150} size={16}>{step === 0 ? '3 枝 × x 元 = 3x' : '2x + 5x = 7x'}</Label>
          </g>
        )}
      </Board>
    );
  }

  if (name === 'balance') {
    const removed = step >= 1;
    const tilt = step === 0 ? '-8 180 78; 5 180 78; -2 180 78; 0 180 78' : '0 180 78; -7 180 78; 4 180 78; 0 180 78';
    return (
      <Board h={200}>
        <line x1={180} y1={36} x2={180} y2={70} stroke="var(--fg)" strokeWidth={3} />
        <g>
          {motion && (
            <animateTransform attributeName="transform" type="rotate" values={tilt} dur="1.35s" fill="freeze" />
          )}
          <line x1={50} y1={78} x2={310} y2={78} stroke="var(--fg)" strokeWidth={4} />
          <rect x={36} y={100} width={110} height={46} rx={10} fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2} />
          <rect x={214} y={100} width={110} height={46} rx={10} fill="var(--bg2)" stroke="var(--accent)" strokeWidth={2} />
          <Label x={91} y={129} size={16}>{removed ? 'x' : 'x + 3'}</Label>
          <Label x={269} y={129} size={16}>{removed ? '4' : '7'}</Label>
        </g>
        <Label x={180} y={178} size={14} fillColor="var(--primary)">{['兩邊一樣重，等式才成立', '兩邊同時減 3', '移項時，這一項的正負要變', 'x = 7 − 3'][step]}</Label>
      </Board>
    );
  }

  if (name === 'word') {
    const boxes = ['設未知數為 x', '把「共、多、倍」寫成等式', '解出 x', '代回題目檢查'];
    return (
      <Board h={210}>
        {boxes.map((b, i) => (
          <g key={b}>
            <rect x={36} y={16 + i * 46} width={288} height={36} rx={10} fill={i === step ? 'var(--primary)' : 'var(--bg2)'} />
            <Label x={180} y={40 + i * 46} size={15} fillColor={i === step ? 'var(--primary-fg)' : 'var(--fg)'}>{b}</Label>
          </g>
        ))}
      </Board>
    );
  }

  if (name === 'elim') {
    return (
      <Board h={190}>
        <Label x={100} y={48} size={16}>x + y = 5</Label>
        <Label x={100} y={78} size={16}>x − y = 1</Label>
        <line x1={30} y1={90} x2={180} y2={90} stroke="var(--fg)" />
        <Label x={100} y={118} size={16} fillColor="var(--primary)">2x = 6</Label>
        <Label x={100} y={148} size={14}>x = 3，y = 2</Label>
        <line x1={210} y1={150} x2={330} y2={40} stroke="var(--primary)" strokeWidth={2} pathLength={100} className="fig-dash" />
        <line x1={210} y1={50} x2={330} y2={150} stroke="var(--accent)" strokeWidth={2} pathLength={100} className="fig-dash" />
        <circle cx={274} cy={92} r={5} fill="var(--fg)" className="fig-pop" />
        <Label x={300} y={78} size={12}>(3, 2)</Label>
      </Board>
    );
  }

  if (name === 'ratio') {
    return (
      <Board h={180}>
        <rect className="fig-grow" x={36} y={40} width={90} height={26} rx={6} fill="var(--primary)" />
        <rect className="fig-grow" x={36} y={78} width={150} height={26} rx={6} fill="var(--accent)" />
        <Label x={200} y={58} anchor="start" size={14}>a</Label>
        <Label x={200} y={96} anchor="start" size={14}>b</Label>
        <Label x={180} y={145} size={16}>{step < 2 ? '比值 = 前項 ÷ 後項' : '外項積 = 內項積'}</Label>
      </Board>
    );
  }

  if (name === 'stats') {
    const dots = [2, 3, 3, 3, 7];
    const seen: Record<number, number> = {};
    return (
      <Board h={180}>
        <line x1={28} y1={128} x2={332} y2={128} stroke="var(--fg)" />
        {dots.map((n, i) => {
          seen[n] = (seen[n] || 0) + 1;
          return <circle key={i} className="fig-pop" cx={36 + n * 40} cy={128 - seen[n] * 24} r={10} fill={n === 3 ? 'var(--primary)' : 'var(--accent)'} />;
        })}
        <Label x={180} y={162} size={14}>{['平均：全部加總再除以個數 → 3.6', '排序後中間那個是中位數 → 3', '偶數筆時，中位數是中間兩數的平均', '眾數是出現最多次的數 → 3'][step]}</Label>
      </Board>
    );
  }

  if (name === 'sym') {
    if (step === 3) {
      return (
        <Board>
          <polygon points="70,60 200,78 230,150 100,140" fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2} />
          <Label x={180} y={186} size={14}>一般平行四邊形沒有對稱軸</Label>
        </Board>
      );
    }
    if (step === 2) {
      return (
        <Board>
          <circle cx={180} cy={96} r={58} fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2} />
          {[0, 45, 90, 135].map((d) => {
            const r = (d * Math.PI) / 180;
            return <line key={d} x1={180 - Math.cos(r) * 58} y1={96 - Math.sin(r) * 58} x2={180 + Math.cos(r) * 58} y2={96 + Math.sin(r) * 58} stroke="var(--accent)" strokeDasharray="4 3" />;
          })}
          <Label x={180} y={186} size={14}>圓有無限多條對稱軸</Label>
        </Board>
      );
    }
    if (step === 1) {
      return (
        <Board>
          <rect x={110} y={36} width={120} height={120} fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2} />
          <line x1={170} y1={36} x2={170} y2={156} stroke="var(--accent)" strokeDasharray="4 3" />
          <line x1={110} y1={96} x2={230} y2={96} stroke="var(--accent)" strokeDasharray="4 3" />
          <line x1={110} y1={36} x2={230} y2={156} stroke="var(--accent)" strokeDasharray="4 3" />
          <line x1={230} y1={36} x2={110} y2={156} stroke="var(--accent)" strokeDasharray="4 3" />
          <Label x={180} y={186} size={14}>正 n 邊形有 n 條對稱軸</Label>
        </Board>
      );
    }
    return (
      <Board>
        <polygon points="180,36 108,150 180,118" fill="var(--primary)" />
        <polygon className="fig-pop" points="180,36 252,150 180,118" fill="var(--accent)" />
        <line x1={180} y1={24} x2={180} y2={170} stroke="var(--fg)" strokeDasharray="5 4" />
        <Label x={180} y={190} size={14}>沿虛線對折，兩邊會重合</Label>
      </Board>
    );
  }

  if (name === 'views') {
    return (
      <Board h={200}>
        <Label x={70} y={28} size={13}>前</Label>
        <Label x={180} y={28} size={13}>上</Label>
        <Label x={290} y={28} size={13}>側</Label>
        {step === 2 ? <polygon points="70,150 40,70 100,70" fill="var(--primary)" /> : <rect x={36} y={46} width={68} height={step === 3 ? 68 : 100} fill="var(--primary)" opacity={0.85} />}
        {step === 3 ? <rect x={146} y={58} width={68} height={68} fill="var(--accent)" /> : <circle cx={180} cy={96} r={34} fill="var(--accent)" />}
        {step === 2 ? <polygon points="290,150 260,70 320,70" fill="var(--accent)" /> : <rect x={256} y={46} width={68} height={step === 3 ? 68 : 100} fill="var(--primary)" opacity={0.45} />}
        <Label x={180} y={184} size={14}>{['三個方向各看一次輪廓', '圓柱：上面是圓，前面是長方形', '圓錐的前面是等腰三角形', '正立方體三面都是正方形'][step]}</Label>
      </Board>
    );
  }

  if (name === 'pyth') {
    const A = { x: 118, y: 150 };
    const B = { x: 198, y: 150 };
    const C = { x: 198, y: 90 };
    return (
      <Board h={248}>
        {step >= 1 && (
          <>
            <polygon points={squareOn(A.x, A.y, B.x, B.y, 1)} fill="var(--primary)" opacity={0.8} className="fig-pop" />
            <polygon points={squareOn(B.x, B.y, C.x, C.y, 1)} fill="var(--accent)" className="fig-pop" />
          </>
        )}
        {step >= 2 && (
          <polygon points={squareOn(C.x, C.y, A.x, A.y, 1)} fill="var(--primary)" opacity={0.28} className="fig-pop" />
        )}
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="var(--card)" stroke="var(--fg)" strokeWidth={2.4} />
        <polyline points={`${B.x - 12},${B.y} ${B.x - 12},${B.y - 12} ${B.x},${B.y - 12}`} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <Label x={158} y={142} size={13}>4</Label>
        <Label x={212} y={122} size={13}>3</Label>
        {step >= 2 && <Label x={140} y={112} size={13}>5</Label>}
        {step >= 1 && <Label x={158} y={198} size={16} fillColor="var(--primary-fg)">16</Label>}
        {step >= 1 && <Label x={230} y={122} size={16} fillColor="var(--primary-fg)">9</Label>}
        <Label x={180} y={232} size={15} fillColor="var(--primary)">{step >= 2 ? '9 + 16 = 25' : '先看直角三角形'}</Label>
      </Board>
    );
  }

  if (name === 'angles') {
    return (
      <Board h={200}>
        <polygon points="46,160 230,160 120,58" fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2.2} />
        <line x1={230} y1={160} x2={320} y2={160} stroke="var(--fg)" strokeWidth={2} />
        <path d="M 86 160 A 36 36 0 0 0 74 132" fill="none" stroke="var(--primary)" strokeWidth={3} />
        <path d="M 250 160 A 26 26 0 0 0 272 146" fill="none" stroke="var(--accent)" strokeWidth={3} pathLength={100} className="fig-dash" />
        <Label x={180} y={36} size={15}>內角和 180°</Label>
        <Label x={180} y={188} size={13}>{step < 2 ? '外角等於另外兩個內角的和' : '挨在一起的內角和外角補成 180°'}</Label>
      </Board>
    );
  }

  if (name === 'cong') {
    const bad = step === 2;
    return (
      <Board h={180}>
        <polygon points="36,140 130,140 78,62" fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2.5} />
        <polygon points="190,140 320,140 260,52" fill="var(--bg2)" stroke={bad ? 'var(--muted)' : 'var(--accent)'} strokeWidth={2.5} />
        <Label x={180} y={32} size={16}>{['SSS 三邊', 'SAS 兩邊夾角', 'SSA 不能判定', '直角三角形：斜邊和一股'][step]}</Label>
        <Label x={180} y={168} size={13}>{bad ? '這個條件一般不夠' : '對應的邊角都一樣，圖形就能重合'}</Label>
      </Board>
    );
  }

  if (name === 'sides') {
    if (step === 1) {
      return (
        <Board h={170}>
          <line x1={30} y1={110} x2={250} y2={110} stroke="var(--fg)" strokeWidth={4} />
          <line x1={30} y1={110} x2={90} y2={60} stroke="var(--primary)" strokeWidth={4} />
          <line x1={250} y1={110} x2={200} y2={70} stroke="var(--accent)" strokeWidth={4} />
          <Label x={180} y={150} size={15}>2 + 3 ＜ 6，三邊圍不起來</Label>
        </Board>
      );
    }
    return (
      <Board h={180}>
        <polygon points="50,150 280,150 210,50" fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2.4} />
        <Label x={165} y={168} size={13}>最長邊</Label>
        <Label x={230} y={46} size={13} fillColor="var(--accent)">對最大角</Label>
        <Label x={180} y={28} size={14}>{step >= 2 ? '等腰三角形的兩個底角相等' : '大邊對大角，大角對大邊'}</Label>
      </Board>
    );
  }

  if (name === 'parallel') {
    return (
      <Board h={190}>
        <line x1={24} y1={64} x2={280} y2={64} stroke="var(--fg)" strokeWidth={2.5} />
        <line x1={48} y1={140} x2={330} y2={140} stroke="var(--fg)" strokeWidth={2.5} />
        <line x1={100} y1={24} x2={230} y2={176} stroke="var(--accent)" strokeWidth={2.5} />
        <circle cx={148} cy={64} r={7} fill="var(--primary)" />
        <circle cx={186} cy={140} r={7} fill="var(--primary)" className="fig-pop" />
        <Label x={180} y={184} size={13}>{['同位角一樣大', '內錯角一樣大', '同側內角加起來 180°', '看到同位角相等，就可以說兩線平行'][step]}</Label>
      </Board>
    );
  }

  if (name === 'para') {
    return (
      <Board h={190}>
        <polygon points="70,52 210,52 250,132 110,132" fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2.5} />
        {step >= 2 && (
          <>
            <line x1={70} y1={52} x2={250} y2={132} stroke="var(--accent)" pathLength={100} className="fig-dash" />
            <line x1={210} y1={52} x2={110} y2={132} stroke="var(--accent)" pathLength={100} className="fig-dash" />
            <circle cx={160} cy={92} r={4} fill="var(--accent)" />
          </>
        )}
        <Label x={180} y={170} size={14}>{['對邊平行而且一樣長', '相鄰的角加起來 180°', '兩條對角線互相平分', '有一組對邊又平行又相等，就可以判定'][step]}</Label>
      </Board>
    );
  }

  if (name === 'quads') {
    return (
      <Board h={200}>
        <rect x={28} y={40} width={78} height={46} fill="var(--bg2)" stroke="var(--primary)" strokeWidth={2} />
        <polygon points="140,86 176,40 230,40 194,86" fill="var(--bg2)" stroke="var(--accent)" strokeWidth={2} />
        <rect x={260} y={36} width={52} height={52} fill="var(--primary)" />
        <polygon points="36,160 130,160 160,124 66,124" fill="none" stroke="var(--fg)" strokeWidth={2} />
        <Label x={67} y={104} size={12}>矩形</Label>
        <Label x={186} y={104} size={12}>菱形</Label>
        <Label x={286} y={108} size={12} fillColor="var(--primary-fg)">正方</Label>
        <Label x={180} y={186} size={13}>{['四個角都是直角，對角線一樣長', '四邊一樣長，對角線垂直平分', '正方形同時是矩形和菱形', '梯形恰有一組對邊平行'][step]}</Label>
      </Board>
    );
  }

  if (name === 'similar') {
    return (
      <Board h={190}>
        <polygon points="30,145 100,145 58,108" fill="var(--primary)" />
        <polygon className="fig-pop" points="140,160 300,160 206,64" fill="var(--accent)" />
        <Label x={180} y={32} size={15}>{step === 3 ? '面積比是相似比的平方：1 : 4' : '對應邊的比是 1 : 2'}</Label>
        <Label x={180} y={182} size={13}>對應角相等，對應邊成比例</Label>
      </Board>
    );
  }

  if (name === 'mid') {
    return (
      <Board h={200}>
        <polygon points="180,28 40,168 320,168" fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2} />
        <line x1={110} y1={98} x2={250} y2={98} stroke="var(--primary)" strokeWidth={3} pathLength={100} className="fig-dash" />
        <Label x={180} y={90} size={13} fillColor="var(--primary)">平行底邊，而且是一半</Label>
      </Board>
    );
  }

  if (name === 'arc') {
    const cx = 168;
    const cy = 112;
    const r = 58;
    const polar = (deg: number) => {
      const t = (deg * Math.PI) / 180;
      return { x: cx + r * Math.cos(t), y: cy - r * Math.sin(t) };
    };
    const A = polar(210);
    const B = polar(330);
    const P = polar(90);
    return (
      <Board h={210}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill="var(--fg)" />
        <line x1={cx} y1={cy} x2={A.x} y2={A.y} stroke="var(--accent)" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={B.x} y2={B.y} stroke="var(--accent)" strokeWidth={2} />
        <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="var(--primary)" strokeWidth={2.2} />
        <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="var(--primary)" strokeWidth={2.2} />
        <Label x={180} y={22} size={14}>{step === 3 ? '直徑所對的圓周角是直角' : '同一條弧上，圓周角是圓心角的一半'}</Label>
      </Board>
    );
  }

  if (name === 'tangent') {
    return (
      <Board h={200}>
        <circle cx={140} cy={104} r={46} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <line x1={140} y1={104} x2={186} y2={104} stroke="var(--primary)" strokeWidth={2.4} />
        <line x1={186} y1={40} x2={186} y2={170} stroke="var(--accent)" strokeWidth={2.4} />
        <polyline points="172,104 172,118 186,118" fill="none" stroke="var(--fg)" />
        <Label x={180} y={188} size={13}>{['切線垂直於經過切點的半徑', '從圓外一點拉兩條切線，兩段一樣長', '圓心對弦作垂線，會把弦平分', '半弦、弦心距、半徑圍成直角三角形'][step]}</Label>
      </Board>
    );
  }

  if (name === 'centers') {
    const A = { x: 180, y: 34 };
    const B = { x: 78, y: 186 };
    const C = { x: 282, y: 186 };
    const cc = circumcenter(A, B, C);
    const ic = incenter(A, B, C);
    const g = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    return (
      <Board h={230}>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2} />
        {(step === 0 || step === 3) && (
          <>
            <circle cx={cc.x} cy={cc.y} r={Math.min(cc.r, 120)} fill="none" stroke="var(--primary)" pathLength={100} className="fig-dash" />
            <circle cx={cc.x} cy={cc.y} r={4} fill="var(--primary)" />
          </>
        )}
        {(step === 1 || step === 3) && <circle cx={ic.x} cy={ic.y} r={5} fill="var(--accent)" />}
        {(step === 2 || step === 3) && (
          <>
            <line x1={A.x} y1={A.y} x2={(B.x + C.x) / 2} y2={(B.y + C.y) / 2} stroke="var(--muted)" />
            <circle cx={g.x} cy={g.y} r={5} fill="var(--fg)" />
          </>
        )}
        <Label x={180} y={18} size={13}>{['外心是外接圓的圓心', '內心是內切圓的圓心', '重心把中線分成 2 : 1', '三個心通常不在同一點'][step]}</Label>
      </Board>
    );
  }

  if (name === 'prob') {
    const cx = 108;
    const cy = 96;
    const r = 54;
    const slices = step === 2 ? 2 : 6;
    return (
      <Board h={190}>
        {Array.from({ length: slices }, (_, i) => {
          const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / slices;
          const a1 = a0 + (2 * Math.PI) / slices;
          const x0 = cx + r * Math.cos(a0);
          const y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          return <path key={i} d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={i === 0 ? 'var(--primary)' : 'var(--bg2)'} stroke="var(--card)" />;
        })}
        <Label x={250} y={90} size={16}>{step === 2 ? '1/2' : '1/6'}</Label>
        <Label x={180} y={172} size={14}>{step === 1 ? '機率最小是 0，最大是 1' : '有利的結果數 ÷ 全部同樣可能的結果數'}</Label>
      </Board>
    );
  }

  if (name === 'solids') {
    return (
      <Board h={200}>
        <ellipse cx={78} cy={58} rx={34} ry={12} fill="var(--primary)" />
        <path d="M 44 58 L 44 120 A 34 12 0 0 0 112 120 L 112 58" fill="var(--primary)" opacity={0.8} />
        <polygon points="210,40 268,120 152,120" fill="var(--accent)" />
        <ellipse cx={210} cy={120} rx={58} ry={14} fill="var(--accent)" />
        <Label x={78} y={160} size={13}>柱 V = 底 × 高</Label>
        <Label x={210} y={160} size={13}>錐 V = ⅓ 底 × 高</Label>
        <Label x={180} y={186} size={13} fillColor="var(--primary)">{step === 3 ? '正立方體表面積是 6 個正方形' : '同底等高時，要 3 個錐才裝滿 1 個柱'}</Label>
      </Board>
    );
  }

  if (name === 'mapfn') {
    const bad = step === 3;
    return (
      <Board h={190}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={78} cy={42 + i * 46} r={16} fill="var(--bg2)" stroke="var(--fg)" />
            <Label x={78} y={47 + i * 46} size={14}>{i + 1}</Label>
            <circle cx={250} cy={42 + i * 46} r={16} fill="var(--primary)" />
            <Label x={250} y={47 + i * 46} size={14} fillColor="var(--primary-fg)">{(i + 1) * 2}</Label>
            <line x1={94} y1={42 + i * 46} x2={234} y2={42 + i * 46} stroke="var(--accent)" pathLength={100} className="fig-dash" />
          </g>
        ))}
        {bad && <line x1={94} y1={88} x2={234} y2={134} stroke="var(--muted)" strokeWidth={2.4} />}
        <Label x={180} y={176} size={13}>{bad ? '一個 x 對到兩個 y，就不是函數' : '每個 x 只對到一個 y'}</Label>
      </Board>
    );
  }

  if (name === 'seq') {
    const neg = step === 3;
    const d = neg ? -3 : 3;
    const start = neg ? 10 : 2;
    return (
      <Board h={156}>
        {Array.from({ length: 4 }, (_, i) => (
          <g key={i} className="fig-pop" style={{ animationDelay: `${i * 0.12}s` }}>
            <circle cx={48 + i * 82} cy={68} r={22} fill={i % 2 ? 'var(--accent)' : 'var(--primary)'} />
            <Label x={48 + i * 82} y={73} size={14} fillColor="var(--primary-fg)">{start + i * d}</Label>
            {i < 3 && <Label x={88 + i * 82} y={36} size={12}>{neg ? '−3' : '+3'}</Label>}
          </g>
        ))}
        <Label x={180} y={128} size={14}>第 n 項 = 首項 + (n − 1) × 公差</Label>
      </Board>
    );
  }

  if (name === 'series') {
    return (
      <Board h={176}>
        {[['1', '6'], ['2', '5'], ['3', '4']].map((p, i) => (
          <g key={p[0]} className="fig-pop" style={{ animationDelay: `${i * 0.1}s` }}>
            <rect x={36} y={24 + i * 40} width={64} height={30} rx={8} fill="var(--primary)" />
            <rect x={130} y={24 + i * 40} width={64} height={30} rx={8} fill="var(--accent)" />
            <Label x={68} y={44 + i * 40} size={14} fillColor="var(--primary-fg)">{p[0]}</Label>
            <Label x={162} y={44 + i * 40} size={14} fillColor="var(--primary-fg)">{p[1]}</Label>
            <Label x={230} y={44 + i * 40} anchor="start" size={14}>= 7</Label>
          </g>
        ))}
        <Label x={180} y={162} size={13}>三組都是 7，和 = 項數 ÷ 2 × (首 + 末)</Label>
      </Board>
    );
  }

  if (name === 'geoseq') {
    const alt = step >= 2;
    const vals = alt ? [2, -4, 8, -16] : [2, 6, 18, 54];
    return (
      <Board h={170}>
        {vals.map((v, i) => {
          const bh = 24 + i * 16;
          return (
            <g key={i}>
              <rect className="fig-rise" x={30 + i * 84} y={118 - bh} width={46} height={bh} rx={6} fill={v < 0 ? 'var(--accent)' : 'var(--primary)'} />
              <Label x={53 + i * 84} y={140} size={13}>{v}</Label>
            </g>
          );
        })}
        <Label x={180} y={160} size={13}>{alt ? '公比是負數時，正負會輪流出現' : '每一項都乘上同一個公比'}</Label>
      </Board>
    );
  }

  if (name === 'disc') {
    return (
      <Board h={170}>
        <path d="M 24 118 Q 70 36 116 118" fill="none" stroke="var(--primary)" strokeWidth={2.5} />
        <path d="M 136 112 Q 182 78 228 112" fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        <path d="M 246 78 Q 292 28 338 78" fill="none" stroke="var(--muted)" strokeWidth={2.5} />
        <line x1={16} y1={118} x2={124} y2={118} stroke="var(--fg)" />
        <line x1={130} y1={118} x2={236} y2={118} stroke="var(--fg)" />
        <line x1={242} y1={118} x2={348} y2={118} stroke="var(--fg)" />
        <Label x={180} y={152} size={14}>{['判別式 > 0：兩個交點', '判別式 = 0：接到同一點', '判別式 < 0：跟 x 軸沒有交點', '看 b² − 4ac 的正負'][step]}</Label>
      </Board>
    );
  }

  if (name === 'sqrt') {
    return (
      <Board h={170}>
        <rect x={36} y={36} width={86} height={86} fill="var(--primary)" />
        <Label x={79} y={86} size={18} fillColor="var(--primary-fg)">9</Label>
        <Label x={210} y={70} size={16}>邊長 √9 = 3</Label>
        <Label x={210} y={104} size={14} weight={600}>1² = 1，2² = 4</Label>
        <Label x={210} y={132} size={14} weight={600}>√2 落在 1 和 2 之間</Label>
      </Board>
    );
  }

  if (name === 'rad') {
    return (
      <Board h={150}>
        <Label x={180} y={42} size={16}>{step === 0 ? '√(ab) = √a × √b' : '√12 = 2√3'}</Label>
        <rect x={40} y={68} width={80} height={40} rx={8} fill="var(--primary)" />
        <rect x={130} y={68} width={60} height={40} rx={8} fill="var(--accent)" />
        <Label x={80} y={93} size={14} fillColor="var(--primary-fg)">√4</Label>
        <Label x={160} y={93} size={14} fillColor="var(--primary-fg)">√3</Label>
        <Label x={250} y={93} size={16}>= 2√3</Label>
      </Board>
    );
  }

  if (name === 'cross') {
    const neg = step === 3;
    return (
      <Board h={170}>
        <Label x={78} y={48} size={18}>x</Label>
        <Label x={78} y={96} size={18}>{neg ? '+3' : '+2'}</Label>
        <Label x={150} y={48} size={18}>x</Label>
        <Label x={150} y={96} size={18}>{neg ? '−2' : '+3'}</Label>
        <line x1={92} y1={42} x2={136} y2={90} stroke="var(--primary)" strokeWidth={2} />
        <line x1={92} y1={90} x2={136} y2={42} stroke="var(--accent)" strokeWidth={2} />
        <Label x={250} y={64} size={15}>{neg ? '和是 1，積是 −6' : '和是 5，積是 6'}</Label>
        <Label x={180} y={140} size={16}>{neg ? '(x + 3)(x − 2)' : '(x + 2)(x + 3)'}</Label>
      </Board>
    );
  }

  if (name === 'pull') {
    return (
      <Board h={160}>
        <rect x={28} y={36} width={70} height={34} rx={8} fill="var(--primary)" />
        <rect x={106} y={36} width={70} height={34} rx={8} fill="var(--primary)" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={28 + i * 28} y={84} width={24} height={24} rx={5} fill="var(--accent)" />
        ))}
        <Label x={250} y={58} size={15}>2x + 6</Label>
        <Label x={250} y={100} size={16} fillColor="var(--primary)">2(x + 3)</Label>
        <Label x={180} y={140} size={13}>提出來之後要乘得回去</Label>
      </Board>
    );
  }

  if (name === 'area') {
    if (step === 2) {
      return (
        <Board h={180}>
          <rect x={40} y={30} width={130} height={130} fill="var(--primary)" opacity={0.35} />
          <rect x={100} y={90} width={70} height={70} fill="var(--card)" stroke="var(--accent)" strokeWidth={2} />
          <Label x={250} y={80} anchor="start" size={16}>a² − b²</Label>
          <Label x={250} y={110} anchor="start" size={14}>= (a + b)(a − b)</Label>
        </Board>
      );
    }
    return (
      <Board h={200}>
        <rect x={36} y={28} width={96} height={96} fill="var(--primary)" />
        <rect x={132} y={28} width={48} height={96} fill="var(--accent)" />
        <rect x={36} y={124} width={96} height={40} fill="var(--accent)" opacity={0.75} />
        <rect x={132} y={124} width={48} height={40} fill="var(--bg2)" stroke="var(--fg)" />
        <Label x={84} y={82} size={14} fillColor="var(--primary-fg)">a²</Label>
        <Label x={250} y={70} anchor="start" size={15}>{step === 1 ? '(a − b)²' : '(a + b)²'}</Label>
        <Label x={250} y={98} anchor="start" size={13}>{step === 1 ? 'a² − 2ab + b²' : 'a² + 2ab + b²'}</Label>
      </Board>
    );
  }

  if (name === 'ineq') {
    return (
      <Board h={176}>
        <Label x={28} y={36} anchor="start" size={13}>x ＞ 2</Label>
        <line x1={36} y1={56} x2={324} y2={56} stroke="var(--fg)" />
        <line x1={190} y1={56} x2={324} y2={56} stroke="var(--primary)" strokeWidth={7} opacity={0.35} />
        <circle cx={190} cy={56} r={6} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
        <Label x={28} y={104} anchor="start" size={13}>兩邊乘 (−1)</Label>
        <line x1={36} y1={126} x2={324} y2={126} stroke="var(--fg)" />
        <line className="fig-grow" x1={36} y1={126} x2={130} y2={126} stroke="var(--accent)" strokeWidth={7} opacity={0.4} />
        <circle cx={130} cy={126} r={6} fill="var(--card)" stroke="var(--accent)" strokeWidth={3} />
        <Label x={180} y={160} size={14} fillColor="var(--accent)">乘或除以負數，不等號反向</Label>
      </Board>
    );
  }

  if (name === 'order') {
    return <Flow beat={beat} phase={{ boxes: ['2 + (−3) × 4', '先算 (−3) × 4 = −12', '再算 2 + (−12)', '得到 −10'], hot: step }} />;
  }

  if (name === 'zero') {
    return (
      <Board h={156}>
        <Label x={180} y={40} size={18}>(x − 1)(x + 2) = 0</Label>
        <rect x={28} y={64} width={140} height={40} rx={10} fill={step % 2 === 0 ? 'var(--primary)' : 'var(--bg2)'} />
        <rect x={192} y={64} width={140} height={40} rx={10} fill={step % 2 === 1 ? 'var(--accent)' : 'var(--bg2)'} />
        <Label x={98} y={89} size={14} fillColor={step % 2 === 0 ? 'var(--primary-fg)' : 'var(--fg)'}>x = 1</Label>
        <Label x={262} y={89} size={14} fillColor={step % 2 === 1 ? 'var(--primary-fg)' : 'var(--fg)'}>x = −2</Label>
        <Label x={180} y={136} size={14}>兩個因式相乘是 0，至少一個是 0</Label>
      </Board>
    );
  }

  if (name === 'rel') {
    return (
      <Bars
        beat={beat}
        phase={{
          items: [
            { label: '甲', value: 2 },
            { label: '乙', value: 6 },
            { label: '丙', value: 4 },
            { label: '丁', value: 8 },
          ],
          note: ['次數是這一組有幾筆', '相對次數 = 次數 ÷ 總次數', '四組相對次數加起來是 1', '知道相對次數和總筆數，就能還原次數'][step],
        }}
      />
    );
  }

  if (name === 'poly') {
    return (
      <Board h={140}>
        <Label x={180} y={48} size={15}>{['多項式就是好幾個單項式相加', '一樣的文字才能合併', '係數相乘，相同文字的指數相加', '係數相除，指數相減'][step]}</Label>
        <Label x={180} y={96} size={20} fillColor="var(--primary)">{step >= 2 ? '2x² · 3x = 6x³' : '3x² + 5x² = 8x²'}</Label>
      </Board>
    );
  }


  if (name === 'scismall') {
    const notes = ['0.0045', '把小數點移到 4 和 5 之間', '向右移了 3 位', '4.5×10 的 −3 次方'];
    return (
      <Board h={170}>
        <Label x={180} y={58} size={22}>{notes[Math.min(step, 3)]}</Label>
        <line x1={70} y1={108} x2={290} y2={108} stroke="var(--border)" />
        <circle className="fig-pop" cx={90 + Math.min(step, 3) * 48} cy={108} r={7} fill="var(--accent)" />
        <Label x={180} y={146} size={14} fillColor="var(--primary)">小數點往左走，指數是負的</Label>
      </Board>
    );
  }

  if (name === 'nexp') {
    const rows = [
      ['2³', '8'],
      ['2 的 −3 次方', '1/8'],
      ['不是', '−8'],
      ['(2 的 −1 次方)³', '1/8'],
    ];
    return (
      <Board h={180}>
        {rows.map((row, i) => (
          <g key={row[0]} className="fig-pop" style={{ animationDelay: `${i * 0.08}s` }}>
            <rect x={28} y={16 + i * 40} width={304} height={34} rx={10} fill={step === i ? 'var(--primary)' : 'var(--bg2)'} />
            <Label x={110} y={38 + i * 40} size={14} fillColor={step === i ? 'var(--primary-fg)' : 'var(--fg)'}>{row[0]}</Label>
            <Label x={270} y={38 + i * 40} size={14} fillColor={step === i ? 'var(--primary-fg)' : 'var(--accent)'}>{row[1]}</Label>
          </g>
        ))}
      </Board>
    );
  }

  if (name === 'triple') {
    const phases = [
      { items: [{ label: 'a', value: 2 }, { label: 'b', value: 3 }, { label: 'c', value: 5 }], note: '先看三個份數' },
      { items: [{ label: 'a', value: 2 }, { label: 'b', value: 3 }, { label: 'b′', value: 4 }, { label: 'c', value: 5 }], note: '兩個 b 還不一樣' },
      { items: [{ label: 'a', value: 8 }, { label: 'b', value: 12 }, { label: 'c', value: 15 }], note: 'b 都對齊成 12' },
      { items: [{ label: '2份', value: 2 }, { label: '3份', value: 3 }, { label: '5份', value: 5 }], note: '總量照份數分' },
    ];
    return <Bars beat={beat} phase={phases[Math.min(step, 3)]} />;
  }

  if (name === 'sector') {
    const notes = ['圓心角占整圓的一份', '60° 是 360° 的 1/6', '弧長＝2π', '扇形面積＝6π'];
    return (
      <Board h={210}>
        <circle cx={150} cy={112} r={62} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <path className="fig-dash" pathLength={100} d="M 150 112 L 212 112 A 62 62 0 0 0 181 58 Z" fill="var(--primary)" opacity={0.28} stroke="var(--accent)" strokeWidth={2.4} />
        <Label x={180} y={28} size={14}>{notes[Math.min(step, 3)]}</Label>
      </Board>
    );
  }

  if (name === 'cyclic') {
    return (
      <Board h={210}>
        <circle cx={168} cy={108} r={64} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <polygon className="fig-dash" pathLength={100} points="168,48 226,108 168,168 110,108" fill="none" stroke="var(--primary)" strokeWidth={2.4} />
        <Label x={168} y={40} size={13} fillColor={step === 1 || step === 2 ? 'var(--accent)' : 'var(--fg)'}>70°</Label>
        <Label x={168} y={186} size={13} fillColor="var(--accent)">{step >= 1 ? '110°' : '對角'}</Label>
        <Label x={180} y={22} size={13}>{step >= 3 ? '外角等於內對角' : '對角和是 180°'}</Label>
      </Board>
    );
  }

  if (name === 'trig') {
    const notes = ['對邊、鄰邊、斜邊', 'sin＝對邊／斜邊', 'cos＝鄰邊／斜邊', 'tan＝對邊／鄰邊'];
    const hot = Math.min(step, 3);
    return (
      <Board h={210}>
        <polygon points="64,164 250,164 250,64" fill="none" stroke="var(--fg)" strokeWidth={2.4} />
        <polyline points="234,164 234,148 250,148" fill="none" stroke="var(--fg)" />
        <Label x={150} y={184} size={14} fillColor={hot === 2 || hot === 3 ? 'var(--accent)' : 'var(--fg)'}>鄰邊 4</Label>
        <Label x={286} y={118} size={14} fillColor={hot === 1 || hot === 3 ? 'var(--accent)' : 'var(--fg)'}>對邊 3</Label>
        <Label x={130} y={100} size={14} fillColor={hot === 1 || hot === 2 ? 'var(--primary)' : 'var(--fg)'}>斜邊 5</Label>
        <Label x={180} y={30} size={15} fillColor="var(--primary)">{notes[hot]}</Label>
      </Board>
    );
  }

  if (name === 'triguse') {
    const notes = ['30° 的正弦是 1/2', '斜邊 10，對邊 5', '45° 的正切是 1', '仰角 45°，樹高等於距離'];
    return (
      <Board h={200}>
        <polygon points="70,160 230,160 230,60" fill="none" stroke="var(--fg)" strokeWidth={2.4} />
        <Label x={150} y={180} size={13}>距離</Label>
        <Label x={268} y={112} size={13}>高度</Label>
        <Label x={120} y={96} size={13} fillColor="var(--accent)">{step >= 2 ? '45°' : '30°'}</Label>
        <Label x={180} y={32} size={15} fillColor="var(--primary)">{notes[Math.min(step, 3)]}</Label>
      </Board>
    );
  }

  if (name === 'space') {
    const notes = ['上面和底面平行', '這兩條邊歪斜', '這條線垂直底面', '它垂直於過垂足的每一條線'];
    return (
      <Board h={210}>
        <polygon points="78,78 196,78 236,50 118,50" fill="none" stroke="var(--fg)" strokeWidth={2} />
        <polygon points="78,78 196,78 196,158 78,158" fill="none" stroke="var(--fg)" strokeWidth={2} />
        <polygon points="196,78 236,50 236,130 196,158" fill="none" stroke="var(--muted)" strokeWidth={2} />
        {step === 1 && (
          <>
            <line className="fig-dash" pathLength={100} x1={78} y1={78} x2={196} y2={78} stroke="var(--accent)" strokeWidth={4} />
            <line className="fig-dash" pathLength={100} x1={236} y1={130} x2={236} y2={50} stroke="var(--primary)" strokeWidth={4} />
          </>
        )}
        {step >= 2 && (
          <line className="fig-dash" pathLength={100} x1={156} y1={50} x2={156} y2={158} stroke="var(--accent)" strokeWidth={4} />
        )}
        <Label x={180} y={192} size={13} fillColor="var(--primary)">{notes[Math.min(step, 3)]}</Label>
      </Board>
    );
  }

  if (name === 'cumul') {
    return (
      <Bars
        beat={beat}
        phase={{
          items: [
            { label: '第1組', value: 4 },
            { label: '累到2', value: 10 },
            { label: '累到3', value: 15 },
            { label: '全部', value: 20 },
          ],
          note: ['次數逐組加上去', '前兩組累積是 10', '再加 5，累積是 15', '最後一定等於總次數'][Math.min(step, 3)],
        }}
      />
    );
  }

  return (
    <Board h={80}>
      <Label x={180} y={46} size={14}>圖解</Label>
    </Board>
  );
}

export function renderVisual(visual: Visual, step: number, motion: boolean, beat = 2): ReactNode {
  if (visual.type === 'nl') {
    return (
      <NumberLine
        min={visual.min}
        max={visual.max}
        phase={phaseAt(visual.phases, step) || {}}
        prev={step > 0 ? phaseAt(visual.phases, step - 1) : undefined}
        motion={motion}
        beat={beat}
      />
    );
  }
  if (visual.type === 'tokens') return <Tokens phase={phaseAt(visual.phases, step) || { groups: [] }} beat={beat} />;
  if (visual.type === 'flow') return <Flow phase={phaseAt(visual.phases, step) || { boxes: [] }} beat={beat} />;
  if (visual.type === 'bars') return <Bars phase={phaseAt(visual.phases, step) || { items: [] }} beat={beat} />;
  if (visual.type === 'frac') return <Fractions phase={phaseAt(visual.phases, step) || { rows: [] }} beat={beat} />;
  if (visual.type === 'plane') return <Plane phase={phaseAt(visual.phases, step) || {}} beat={beat} />;
  return <Geo name={visual.name} step={step} motion={motion} beat={beat} />;
}
