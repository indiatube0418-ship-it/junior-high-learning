import type { ReactNode } from 'react';

type Scene = (step: number) => ReactNode;

function Board({ h = 244, title, children }: { h?: number; title: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 360 ${h}`} className="h-auto w-full" role="img">
      <title>{title}</title>
      <defs>
        <marker id="atlas-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="var(--accent)" />
        </marker>
      </defs>
      <rect x="1" y="1" width="358" height={h - 2} rx="16" fill="var(--card)" stroke="var(--border)" />
      {children}
    </svg>
  );
}

function Tx({
  x,
  y,
  children,
  size = 12,
  fill = 'var(--fg)',
  anchor = 'middle',
  weight = 700,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  fill?: string;
  anchor?: 'middle' | 'start' | 'end';
  weight?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill} fontFamily="ui-sans-serif, system-ui, sans-serif">
      {children}
    </text>
  );
}

function Show({ step, at, children }: { step: number; at: number; children: ReactNode }) {
  if (step < at) return null;
  return <g className={step === at ? 'fig-pop' : undefined}>{children}</g>;
}

function Chip({ x, y, w, text, hot = false }: { x: number; y: number; w: number; text: string; hot?: boolean }) {
  return (
    <g className={hot ? 'fig-pulse' : undefined}>
      <rect x={x} y={y} width={w} height={26} rx={8} fill={hot ? 'var(--primary)' : 'var(--bg2)'} stroke={hot ? 'var(--primary)' : 'var(--border)'} />
      <Tx x={x + w / 2} y={y + 17} size={12} fill={hot ? 'var(--primary-fg)' : 'var(--fg)'}>
        {text}
      </Tx>
    </g>
  );
}

function Foot({ y = 234 }: { y?: number }) {
  return (
    <Tx x={180} y={y} size={10} fill="var(--muted)" weight={500}>
      簡圖用來看出位置，不是精確比例
    </Tx>
  );
}

const TW = 'M58,8 L74,20 L82,42 L78,66 L84,98 L80,130 L70,158 L58,178 L46,168 L36,146 L30,114 L32,84 L42,52 L50,28 Z';
const MTN = 'M58,44 L74,60 L72,104 L66,142 L54,132 L50,96 L54,60 Z';
const PLAIN = 'M34,88 L52,80 L54,136 L40,152 L30,118 Z';

function IslandShape({ land = 'var(--bg2)' }: { land?: string }) {
  return <path d={TW} fill={land} stroke="var(--fg)" strokeWidth={1.7} />;
}

function TwScene({ title, map, side }: { title: string; map: ReactNode; side: ReactNode }) {
  return (
    <Board h={244} title={title}>
      <rect x="16" y="16" width="156" height="204" rx="18" fill="var(--primary)" fillOpacity={0.08} />
      <g transform="translate(40 26)">{map}</g>
      {side}
      <Foot />
    </Board>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={2.4} markerEnd="url(#atlas-arrow)" />;
}

function elements(step: number) {
  return (
    <Board h={230} title="地圖的三要素">
      <rect x="28" y="36" width="150" height="150" rx="16" fill="var(--primary)" fillOpacity={0.08} />
      <g transform="translate(58 48) scale(0.72)">
        <IslandShape />
        <path d="M70,70 l10,-16 l10,16 Z" fill="var(--primary)" />
        <rect x="40" y="120" width="12" height="12" fill="var(--accent)" />
      </g>
      <Show step={step} at={0}>
        <Chip x={200} y={28} w={132} text="方向、圖例、比例尺" />
      </Show>
      <Show step={step} at={1}>
        <polygon points="118,48 108,74 118,66 128,74" fill="var(--accent)" />
        <Tx x={118} y={90} size={12} fill="var(--accent)">北</Tx>
        <Chip x={200} y={66} w={140} text="先定方向" hot />
        <Tx x={270} y={108} size={11} fill="var(--muted)" weight={500}>上北下南只是常見畫法</Tx>
      </Show>
      <Show step={step} at={2}>
        <Chip x={200} y={124} w={140} text="符號要回圖例" hot />
        <Tx x={214} y={164} size={11} anchor="start">▲ 山地</Tx>
        <Tx x={214} y={184} size={11} anchor="start">■ 城市</Tx>
      </Show>
      <Show step={step} at={3}>
        <line x1="48" y1="200" x2="108" y2="200" stroke="var(--fg)" strokeWidth={2} />
        <Tx x={78} y={216} size={11}>圖上 1 公分</Tx>
        <Chip x={200} y={196} w={146} text="換回真實距離" hot />
      </Show>
    </Board>
  );
}

function latlong(step: number) {
  const lats = [42, 78, 114, 150, 186];
  const lons = [36, 78, 120, 162, 204];
  return (
    <Board h={244} title="經線和緯線">
      <rect x="24" y="28" width="192" height="176" rx="12" fill="var(--primary)" fillOpacity={0.06} stroke="var(--border)" />
      {lats.map((y) => (
        <line key={`lat${y}`} x1="24" y1={y} x2="216" y2={y} stroke={y === 114 ? 'var(--accent)' : 'var(--primary)'} strokeWidth={y === 114 ? 2 : 1} />
      ))}
      <Show step={step} at={0}>
        {lons.map((x) => (
          <line key={`lon${x}`} x1={x} y1="28" x2={x} y2="204" stroke="var(--fg)" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        ))}
        <Chip x={228} y={24} w={116} text="橫的是緯線" />
        <Chip x={228} y={56} w={116} text="直的是經線" />
      </Show>
      <Show step={step} at={1}>
        <Tx x={40} y={38} size={11} fill="var(--accent)">北</Tx>
        <Tx x={40} y={198} size={11} fill="var(--accent)">南</Tx>
        <Chip x={228} y={96} w={120} text="緯度分南北" hot />
      </Show>
      <Show step={step} at={2}>
        <Tx x={30} y={24} size={11} fill="var(--primary)">西</Tx>
        <Tx x={200} y={24} size={11} fill="var(--primary)">東</Tx>
        <Chip x={228} y={136} w={120} text="經度分東西" hot />
        <Tx x={288} y={174} size={11} fill="var(--muted)" weight={500}>也關係到時區</Tx>
      </Show>
      <Show step={step} at={3}>
        <g transform="translate(132 96) scale(0.28)">
          <IslandShape land="var(--accent)" />
        </g>
        <line x1="24" y1="132" x2="216" y2="132" stroke="var(--accent)" strokeWidth={2} />
        <Chip x={228} y={186} w={120} text="北回歸線附近" hot />
        <Tx x={180} y={232} size={11}>絕對位置用經緯度，相對位置用海陸</Tx>
      </Show>
    </Board>
  );
}

function twLand(step: number) {
  return (
    <TwScene
      title="台灣的地形"
      map={
        <>
          <IslandShape />
          <Show step={step} at={0}>
            <path d={PLAIN} fill="var(--accent)" fillOpacity={0.35} />
            <path d={MTN} fill="var(--primary)" fillOpacity={0.45} />
            <ellipse cx="62" cy="36" rx="10" ry="7" fill="var(--card)" stroke="var(--fg)" />
          </Show>
          <Show step={step} at={1}>
            <path d={MTN} fill="var(--primary)" fillOpacity={0.75} className="fig-pulse" />
          </Show>
          <Show step={step} at={2}>
            <path d={PLAIN} fill="var(--accent)" fillOpacity={0.8} className="fig-pulse" />
          </Show>
          <Show step={step} at={3}>
            <path d="M70,70 C60,100 52,130 46,156" fill="none" stroke="var(--primary)" strokeWidth={2} />
            <circle cx="42" cy="128" r="4" fill="var(--fg)" />
            <circle cx="48" cy="112" r="4" fill="var(--fg)" />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Tx x={268} y={36} size={13}>五種地形</Tx>
            <Tx x={200} y={58} size={12} anchor="start">山地、丘陵</Tx>
            <Tx x={200} y={76} size={12} anchor="start">台地、盆地、平原</Tx>
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={96} w={148} text="山地最多、偏中央東" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={134} w={148} text="西部平原較廣" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={172} w={148} text="城市農田多在平原" hot />
            <Tx x={270} y={214} size={11} fill="var(--muted)" weight={500}>平原多由河流沖積</Tx>
          </Show>
        </>
      }
    />
  );
}

function twClimate(step: number) {
  return (
    <TwScene
      title="台灣的氣候"
      map={
        <>
          <IslandShape />
          <path d={MTN} fill="var(--primary)" fillOpacity={0.35} />
          <Show step={step} at={0}>
            <Arrow x1={8} y1={150} x2={48} y2={110} />
            <Arrow x1={96} y1={20} x2={70} y2={48} />
          </Show>
          <Show step={step} at={1}>
            <circle cx="78" cy="40" r="8" fill="var(--primary)" fillOpacity={0.35} />
            <circle cx="36" cy="130" r="8" fill="var(--accent)" fillOpacity={0.45} />
          </Show>
          <Show step={step} at={2}>
            <Tx x={86} y={36} size={10} anchor="start">雨</Tx>
            <Tx x={24} y={124} size={10}>雨</Tx>
          </Show>
          <Show step={step} at={3}>
            <circle cx="96" cy="150" r="14" fill="none" stroke="var(--accent)" strokeWidth={2} className="fig-pulse" />
            <Tx x={96} y={154} size={10} fill="var(--accent)">颱</Tx>
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={28} w={148} text="夏西南、冬東北" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={68} w={148} text="冬夏迎風面不同" hot />
            <Tx x={200} y={110} size={11} anchor="start">冬：北海岸、宜蘭</Tx>
            <Tx x={200} y={128} size={11} anchor="start">夏：西南部</Tx>
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={146} w={148} text="迎風多雨、背風少雨" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={186} w={148} text="夏秋要注意颱風" hot />
          </Show>
        </>
      }
    />
  );
}

function twPop(step: number) {
  const west = [
    [40, 100], [46, 112], [42, 124], [50, 118], [44, 136], [48, 96], [38, 128],
  ];
  const east = [
    [74, 80], [78, 120],
  ];
  return (
    <TwScene
      title="人口集中在哪裡"
      map={
        <>
          <IslandShape />
          <path d={PLAIN} fill="var(--accent)" fillOpacity={0.25} />
          {west.map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={3.2} fill="var(--accent)" />
          ))}
          {east.map(([x, y]) => (
            <circle key={`e${x}${y}`} cx={x} cy={y} r={2.4} fill="var(--muted)" />
          ))}
          <Show step={step} at={2}>
            <circle cx="46" cy="112" r="9" fill="none" stroke="var(--primary)" strokeWidth={2} className="fig-pulse" />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={36} w={148} text="西密、東疏" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={78} w={148} text="平原加上工作機會" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={120} w={148} text="都市有拉力" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={162} w={148} text="交通、水、垃圾要跟著人" hot />
          </Show>
        </>
      }
    />
  );
}

function migrate(step: number) {
  return (
    <TwScene
      title="遷移"
      map={
        <>
          <IslandShape />
          <circle cx="76" cy="120" r="5" fill="var(--muted)" />
          <circle cx="44" cy="112" r="6" fill="var(--accent)" />
          <Show step={step} at={1}>
            <Arrow x1={70} y1={116} x2={52} y2={112} />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={32} w={70} text="推力" />
            <Chip x={274} y={32} w={70} text="拉力" />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={74} w={148} text="人被推，也被拉" hot />
          </Show>
          <Show step={step} at={2}>
            <Tx x={200} y={122} size={12} anchor="start">鄉村 → 都市</Tx>
            <Chip x={196} y={136} w={148} text="城鄉之間最明顯" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={180} w={148} text="兩邊年齡組成會變" hot />
          </Show>
        </>
      }
    />
  );
}

const CHINA = 'M36,78 C48,36 110,28 168,34 C230,40 286,58 300,92 C312,124 286,162 220,172 C150,184 70,176 40,148 C22,124 24,100 36,78 Z';

function chinaLand(step: number) {
  return (
    <Board h={244} title="中國的地形和氣候">
      <g transform="translate(4 36) scale(0.62)">
        <path d={CHINA} fill="var(--primary)" fillOpacity={0.1} stroke="var(--fg)" strokeWidth={2} />
        <path d="M36,78 C70,60 90,90 78,150 C60,170 40,148 40,148 C22,124 24,100 36,78 Z" fill="var(--primary)" fillOpacity={0.45} />
        <Tx x={62} y={112} size={18}>西高</Tx>
        <Tx x={200} y={120} size={18}>東低</Tx>
        <Show step={step} at={1}>
          <path d="M150,80 C190,100 230,130 250,150" fill="none" stroke="var(--primary)" strokeWidth={3} />
        </Show>
        <Show step={step} at={2}>
          <Arrow x1={330} y1={120} x2={270} y2={120} />
          <Tx x={78} y={78} size={16}>較乾</Tx>
        </Show>
        <Show step={step} at={3}>
          <line x1="110" y1="108" x2="270" y2="132" stroke="var(--accent)" strokeWidth={3} />
        </Show>
      </g>
      <Show step={step} at={0}>
        <Chip x={196} y={28} w={148} text="先看西高東低" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={196} y={70} w={148} text="水和人往東邊平原" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={196} y={112} w={148} text="沿海濕、內陸乾" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={196} y={154} w={148} text="秦嶺淮河分南北" hot />
        <Tx x={270} y={198} size={11} fill="var(--muted)" weight={500}>約 0°C、800 毫米</Tx>
      </Show>
      <Foot />
    </Board>
  );
}

function twoLines(step: number) {
  return (
    <Board h={244} title="兩條重要界線">
      <g transform="translate(4 28) scale(0.62)">
        <path d={CHINA} fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2} />
        <Show step={step} at={0}>
          <line x1="120" y1="100" x2="280" y2="128" stroke="var(--accent)" strokeWidth={4} />
        </Show>
        <Show step={step} at={1}>
          <line x1="250" y1="52" x2="130" y2="176" stroke="var(--primary)" strokeWidth={4} />
        </Show>
        <Show step={step} at={3}>
          <Tx x={86} y={78} size={16}>西北人少</Tx>
          <Tx x={210} y={150} size={16} fill="var(--primary)">東南人多</Tx>
        </Show>
      </g>
      <Show step={step} at={0}>
        <Chip x={196} y={28} w={148} text="秦嶺淮河分南北" hot />
        <Tx x={200} y={68} size={11} anchor="start">北旱作、南稻作</Tx>
      </Show>
      <Show step={step} at={1}>
        <Chip x={196} y={96} w={148} text="黑河到騰衝分人口" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={196} y={138} w={148} text="兩條線不要記成一條" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={196} y={180} w={148} text="線是概括，不是牆" hot />
      </Show>
      <Foot />
    </Board>
  );
}

function eastSea(step: number) {
  return (
    <Board h={244} title="東亞和東南亞">
      <rect x="78" y="48" width="110" height="78" rx="10" fill="var(--primary)" fillOpacity={0.15} stroke="var(--fg)" />
      <Tx x={133} y={92} size={13}>中國</Tx>
      <ellipse cx="214" cy="78" rx="16" ry="22" fill="var(--bg2)" stroke="var(--fg)" />
      <Tx x={214} y={82} size={10}>日本</Tx>
      <rect x="168" y="36" width="14" height="28" rx="4" fill="var(--bg2)" stroke="var(--fg)" />
      <Tx x={154} y={30} size={10}>朝鮮半島</Tx>
      <rect x="96" y="24" width="46" height="18" rx="4" fill="var(--bg2)" stroke="var(--fg)" />
      <Tx x={119} y={37} size={10}>蒙古</Tx>
      <Show step={step} at={0}>
        <Chip x={16} y={16} w={70} text="東亞" hot />
      </Show>
      <path d="M150,140 L190,150 L176,196 L132,188 Z" fill="var(--accent)" fillOpacity={0.2} stroke="var(--fg)" />
      <Tx x={162} y={172} size={11}>中南半島</Tx>
      <circle cx="214" cy="176" r="10" fill="var(--accent)" fillOpacity={0.25} stroke="var(--fg)" />
      <circle cx="236" cy="196" r="8" fill="var(--accent)" fillOpacity={0.25} stroke="var(--fg)" />
      <Tx x={250} y={168} size={10} anchor="start">馬來群島</Tx>
      <Show step={step} at={0}>
        <Chip x={250} y={140} w={92} text="東南亞" hot />
      </Show>
      <Show step={step} at={1}>
        <line x1="150" y1="206" x2="336" y2="206" stroke="var(--accent)" strokeWidth={1.6} />
        <Tx x={240} y={224} size={12} fill="var(--accent)">赤道在這一側</Tx>
      </Show>
      <Show step={step} at={2}>
        <Chip x={16} y={150} w={120} text="海峽是交通關鍵" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={186} y={168} w={160} text="鄰近仍可能有爭端" hot />
      </Show>
    </Board>
  );
}

function chinaPop(step: number) {
  const dots = [
    [200, 120], [220, 130], [190, 140], [230, 110], [210, 150], [240, 136],
  ];
  return (
    <Board h={244} title="中國人口與產業">
      <g transform="translate(4 36) scale(0.62)">
        <path d={CHINA} fill="var(--bg2)" stroke="var(--fg)" strokeWidth={2} />
        {dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill="var(--accent)" />
        ))}
        <Show step={step} at={1}>
          <circle cx="268" cy="128" r="9" fill="var(--primary)" />
        </Show>
        <Show step={step} at={2}>
          <Tx x={78} y={120} size={16}>內陸有資源</Tx>
        </Show>
      </g>
      <Show step={step} at={0}>
        <Chip x={196} y={28} w={148} text="人多集中在東南" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={196} y={70} w={148} text="沿海靠港口" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={196} y={112} w={148} text="內陸不是沒有資源" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={196} y={154} w={148} text="平均會遮住差距" hot />
      </Show>
      <Foot />
    </Board>
  );
}

function eurAm(step: number) {
  return (
    <Board h={236} title="歐洲和美洲">
      <ellipse cx="78" cy="110" rx="40" ry="78" fill="var(--primary)" fillOpacity={0.12} stroke="var(--fg)" />
      <line x1="40" y1="110" x2="116" y2="110" stroke="var(--border)" />
      <Tx x={78} y={78} size={12}>北美</Tx>
      <Tx x={78} y={148} size={12}>南美</Tx>
      <path d="M176,46 L230,40 L248,78 L220,96 L176,86 Z" fill="var(--accent)" fillOpacity={0.15} stroke="var(--fg)" />
      <Tx x={208} y={74} size={12}>歐洲</Tx>
      <Show step={step} at={0}>
        <circle cx="198" cy="62" r="3" fill="var(--fg)" />
        <circle cx="220" cy="70" r="3" fill="var(--fg)" />
        <circle cx="206" cy="84" r="3" fill="var(--fg)" />
        <Chip x={168} y={12} w={176} text="整塊大陸不是一個國家" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={168} y={112} w={160} text="航海，後來有工業" hot />
      </Show>
      <Show step={step} at={2}>
        <circle cx="70" cy="70" r="4" fill="var(--accent)" />
        <circle cx="84" cy="150" r="4" fill="var(--accent)" />
        <Chip x={150} y={154} w={176} text="殖民之前美洲就有人" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={150} y={196} w={176} text="南北要分開記" hot />
      </Show>
      <Foot y={228} />
    </Board>
  );
}

function dryMonsoon(step: number) {
  return (
    <Board h={230} title="乾燥地區與季風">
      <rect x="24" y="40" width="312" height="120" rx="14" fill="var(--primary)" fillOpacity={0.06} stroke="var(--border)" />
      <line x1="24" y1="78" x2="336" y2="78" stroke="var(--accent)" strokeDasharray="5 4" />
      <Tx x={180} y={32} size={11} fill="var(--accent)">回歸線附近</Tx>
      <Show step={step} at={0}>
        <rect x="40" y="58" width="90" height="36" rx="8" fill="var(--accent)" fillOpacity={0.35} />
        <Tx x={85} y={80} size={12}>乾</Tx>
        <rect x="210" y="96" width="90" height="36" rx="8" fill="var(--primary)" fillOpacity={0.3} />
        <Tx x={255} y={118} size={12}>濕季、乾季</Tx>
      </Show>
      <Show step={step} at={1}>
        <Chip x={20} y={168} w={150} text="西亞、北非多沙漠" hot />
      </Show>
      <Show step={step} at={2}>
        <Arrow x1={300} y1={150} x2={250} y2={120} />
        <Chip x={186} y={168} w={156} text="南亞、東亞有季風" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={90} y={198} w={180} text="有水，人才住得下來" hot />
      </Show>
    </Board>
  );
}

function bands(step: number) {
  return (
    <Board h={236} title="緯度與氣候帶">
      <defs>
        <clipPath id="atlas-globe">
          <circle cx="118" cy="112" r="78" />
        </clipPath>
      </defs>
      <g clipPath="url(#atlas-globe)">
        <rect x="40" y="34" width="156" height="156" fill="var(--bg2)" />
        <Show step={step} at={0}>
          <rect x="40" y="86" width="156" height="52" fill="var(--accent)" fillOpacity={0.45} />
        </Show>
        <Show step={step} at={1}>
          <rect x="40" y="34" width="156" height="36" fill="var(--primary)" fillOpacity={0.35} />
          <rect x="40" y="154" width="156" height="36" fill="var(--primary)" fillOpacity={0.35} />
        </Show>
        <Show step={step} at={2}>
          <rect x="40" y="104" width="156" height="16" fill="var(--primary)" fillOpacity={0.55} />
        </Show>
        <Show step={step} at={3}>
          <rect x="40" y="70" width="156" height="18" fill="var(--accent)" fillOpacity={0.7} />
          <rect x="40" y="136" width="156" height="18" fill="var(--accent)" fillOpacity={0.7} />
        </Show>
      </g>
      <circle cx="118" cy="112" r="78" fill="none" stroke="var(--fg)" strokeWidth={1.6} />
      <Show step={step} at={0}>
        <Chip x={210} y={28} w={136} text="低緯度通常較熱" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={210} y={68} w={136} text="高緯度通常較冷" hot />
        <Tx x={214} y={108} size={11} anchor="start">高度、洋流、風</Tx>
        <Tx x={214} y={126} size={11} anchor="start">也會改結果</Tx>
      </Show>
      <Show step={step} at={2}>
        <Chip x={210} y={146} w={136} text="赤道附近多雨" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={210} y={186} w={136} text="回歸線附近常乾" hot />
      </Show>
    </Board>
  );
}

function afAus(step: number) {
  return (
    <Board h={244} title="非洲和大洋洲">
      <path d="M70,36 L108,30 L124,70 L116,120 L96,156 L70,150 L52,110 L56,70 Z" fill="var(--bg2)" stroke="var(--fg)" />
      <Show step={step} at={0}>
        <path d="M62,48 L112,46 L116,78 L58,80 Z" fill="var(--accent)" fillOpacity={0.45} />
        <path d="M58,84 L116,82 L112,112 L56,110 Z" fill="var(--primary)" fillOpacity={0.25} />
        <path d="M56,114 L112,116 L100,146 L68,148 Z" fill="var(--primary)" fillOpacity={0.45} />
        <Tx x={86} y={66} size={11}>沙漠</Tx>
        <Tx x={86} y={100} size={11}>草原</Tx>
        <Tx x={84} y={132} size={11}>雨林</Tx>
      </Show>
      <ellipse cx="230" cy="120" rx="62" ry="40" fill="var(--bg2)" stroke="var(--fg)" />
      <Show step={step} at={1}>
        <Chip x={16} y={176} w={150} text="撒哈拉是大沙漠" hot />
      </Show>
      <Show step={step} at={2}>
        <ellipse cx="230" cy="120" rx="28" ry="16" fill="var(--accent)" fillOpacity={0.45} />
        <circle cx="196" cy="104" r="3" fill="var(--primary)" />
        <circle cx="268" cy="112" r="3" fill="var(--primary)" />
        <circle cx="220" cy="146" r="3" fill="var(--primary)" />
        <Chip x={176} y={176} w={168} text="澳洲內部乾、人在沿海" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={28} y={208} w={304} text="早有人群，殖民才改政治版圖" hot />
      </Show>
    </Board>
  );
}

function plates(step: number) {
  return (
    <Board h={248} title="板塊、地震和火山">
      <path d="M20,36 L190,48 L176,150 L16,140 Z" fill="var(--primary)" fillOpacity={0.15} stroke="var(--fg)" />
      <path d="M190,48 L344,36 L340,146 L176,150 Z" fill="var(--accent)" fillOpacity={0.15} stroke="var(--fg)" />
      <Tx x={90} y={100} size={13}>歐亞板塊</Tx>
      <Tx x={270} y={96} size={13}>菲律賓海板塊</Tx>
      <g transform="translate(168 58) scale(0.36)">
        <IslandShape land="var(--card)" />
      </g>
      <Show step={step} at={0}>
        <Chip x={78} y={8} w={204} text="邊界常有地震和火山" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={18} y={162} w={156} text="台灣在交界附近" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={184} y={162} w={160} text="能量被放出來" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={40} y={204} w={280} text="先趴下、掩護、穩住，再離開" hot />
      </Show>
    </Board>
  );
}

function typhoon(step: number) {
  return (
    <TwScene
      title="颱風和豪雨"
      map={
        <>
          <IslandShape />
          <Show step={step} at={0}>
            <circle cx="100" cy="150" r="16" fill="none" stroke="var(--accent)" strokeWidth={2} />
            <Arrow x1={100} y1={134} x2={78} y2={100} />
          </Show>
          <Show step={step} at={1}>
            <rect x="40" y="108" width="10" height="10" fill="var(--fg)" />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={28} w={148} text="颱風、豪雨會靠近" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={70} w={148} text="現象＋人＝災害" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={112} w={148} text="預報、堅固、避開危險地" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={164} w={148} text="事先準備" hot />
          </Show>
        </>
      }
    />
  );
}

function contour(step: number) {
  return (
    <Board h={248} title="等高線">
      <ellipse cx="100" cy="78" rx="72" ry="46" fill="none" stroke="var(--fg)" strokeWidth={1.6} />
      <ellipse cx="100" cy="78" rx="46" ry="28" fill="none" stroke="var(--fg)" strokeWidth={1.6} />
      <ellipse cx="100" cy="78" rx="20" ry="12" fill="var(--primary)" fillOpacity={0.25} stroke="var(--primary)" strokeWidth={1.8} />
      <Show step={step} at={0}>
        <circle cx="28" cy="78" r="3" fill="var(--accent)" />
        <circle cx="172" cy="78" r="3" fill="var(--accent)" />
        <Chip x={188} y={16} w={156} text="同一條線高度相同" hot />
      </Show>
      <Show step={step} at={1}>
        <path d="M40,70 L58,74" stroke="var(--accent)" strokeWidth={2} />
        <path d="M44,80 L60,82" stroke="var(--accent)" strokeWidth={2} />
        <Tx x={36} y={60} size={11} fill="var(--accent)">密＝陡</Tx>
        <Tx x={150} y={40} size={11}>疏＝緩</Tx>
      </Show>
      <Show step={step} at={2}>
        <Tx x={100} y={82} size={11}>300</Tx>
        <Tx x={100} y={108} size={10}>200</Tx>
        <Tx x={100} y={128} size={10}>100</Tx>
        <circle cx="250" cy="92" r="22" fill="none" stroke="var(--fg)" />
        <circle cx="250" cy="92" r="10" fill="none" stroke="var(--fg)" />
        <Tx x={250} y={96} size={10}>低</Tx>
        <Chip x={188} y={124} w={156} text="看數字才知山或窪地" hot />
      </Show>
      <Show step={step} at={3}>
        <path d="M36,176 L92,148 L150,176" fill="none" stroke="var(--primary)" strokeWidth={2} />
        <path d="M24,198 L100,160 L176,198" fill="none" stroke="var(--fg)" strokeWidth={1.6} />
        <Tx x={92} y={142} size={11} fill="var(--primary)">高</Tx>
        <Chip x={188} y={176} w={156} text="尖端朝高處、指向上游" hot />
      </Show>
      <Tx x={180} y={236} size={10} fill="var(--muted)" weight={500}>等高線示意</Tx>
    </Board>
  );
}

function mapRead(step: number) {
  return (
    <TwScene
      title="地圖題怎麼讀"
      map={
        <>
          <IslandShape />
          <path d={PLAIN} fill="var(--accent)" fillOpacity={0.45} />
          <path d={MTN} fill="var(--primary)" fillOpacity={0.4} />
          <Show step={step} at={3}>
            <Arrow x1={20} y1={120} x2={40} y2={120} />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={20} w={148} text="題目問平原在哪？" hot />
          </Show>
          <Show step={step} at={1}>
            <Tx x={200} y={64} size={12} anchor="start">圖名、方向</Tx>
            <Tx x={200} y={84} size={12} anchor="start">圖例、比例尺</Tx>
            <polygon points="250,100 242,118 250,112 258,118" fill="var(--accent)" />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={132} w={148} text="不要只因為顏色漂亮" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={176} w={148} text="答案要指得回圖上" hot />
          </Show>
        </>
      }
    />
  );
}

function earlyIsland(step: number) {
  return (
    <TwScene
      title="史前和原住民族"
      map={
        <>
          <IslandShape />
          <Show step={step} at={1}>
            <circle cx="48" cy="90" r="4" fill="var(--accent)" />
            <circle cx="62" cy="130" r="4" fill="var(--accent)" />
            <circle cx="70" cy="70" r="4" fill="var(--accent)" />
          </Show>
          <Show step={step} at={2}>
            <rect x="36" y="116" width="8" height="8" fill="var(--primary)" />
            <rect x="72" y="96" width="8" height="8" fill="var(--accent)" />
            <rect x="54" y="146" width="8" height="8" fill="var(--fg)" />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={24} w={148} text="史前：還沒有本地文字" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={66} w={148} text="這些點是考古證據" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={112} w={148} text="各族不同，不是單一團體" hot />
            <Tx x={200} y={154} size={11} anchor="start" fill="var(--muted)" weight={500}>這裡不畫各族界線</Tx>
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={176} w={148} text="早就在，不只是移民史" hot />
          </Show>
        </>
      }
    />
  );
}

function posts(step: number) {
  return (
    <TwScene
      title="荷西、鄭氏和清領"
      map={
        <>
          <IslandShape />
          <Show step={step} at={0}>
            <circle cx="70" cy="24" r="5" fill="var(--primary)" />
            <circle cx="42" cy="150" r="5" fill="var(--accent)" />
          </Show>
          <Show step={step} at={2}>
            <path d={PLAIN} fill="var(--accent)" fillOpacity={0.35} />
          </Show>
          <Show step={step} at={3}>
            <circle cx="54" cy="28" r="3" fill="var(--fg)" />
            <circle cx="74" cy="26" r="3" fill="var(--fg)" />
            <circle cx="40" cy="152" r="3" fill="var(--fg)" />
            <circle cx="50" cy="166" r="3" fill="var(--fg)" />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Tx x={200} y={36} size={12} anchor="start">北：西班牙據點</Tx>
            <Tx x={200} y={56} size={12} anchor="start">南：荷蘭據點</Tx>
            <Chip x={196} y={68} w={148} text="為了貿易而來" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={108} w={148} text="1662 荷人離開" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={146} w={148} text="1683 後進入清領" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={186} w={148} text="後來開港通商" hot />
          </Show>
        </>
      }
    />
  );
}

function qingWest(step: number) {
  return (
    <TwScene
      title="清領時期的社會"
      map={
        <>
          <IslandShape />
          <path d={MTN} fill="var(--primary)" fillOpacity={0.25} />
          <Show step={step} at={2}>
            <path d={PLAIN} fill="var(--accent)" fillOpacity={0.75} />
          </Show>
          <Show step={step} at={1}>
            <Arrow x1={-8} y1={70} x2={30} y2={100} />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={24} w={148} text="1683 後納入清帝國" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={66} w={148} text="限制渡台，仍有人來" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={112} w={148} text="漢人主要墾西部平原" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={164} w={148} text="不是空地，人已經在" hot />
          </Show>
        </>
      }
    />
  );
}

function ports(step: number) {
  const dots = [
    [54, 26, '淡水'],
    [76, 22, '雞籠'],
    [40, 150, '安平'],
    [50, 166, '打狗'],
  ] as const;
  return (
    <TwScene
      title="開港與茶糖樟腦"
      map={
        <>
          <IslandShape />
          {dots.map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={4} fill="var(--accent)" />
          ))}
          <Show step={step} at={1}>
            <Arrow x1={36} y1={110} x2={4} y2={110} />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            {dots.map(([x, , name], i) => (
              <Tx key={name} x={200} y={32 + i * 18} size={12} anchor="start">
                {name}
              </Tx>
            ))}
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={112} w={148} text="茶、糖、樟腦出口" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={150} w={148} text="商人、傳教士進入" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={188} w={148} text="更連上外面的世界" hot />
          </Show>
        </>
      }
    />
  );
}

function origins(step: number) {
  return (
    <TwScene
      title="人群從哪裡來"
      map={
        <>
          <IslandShape land="var(--primary)" />
          <Show step={step} at={1}>
            <Arrow x1={-6} y1={78} x2={34} y2={104} />
          </Show>
          <Show step={step} at={2}>
            <Arrow x1={-6} y1={40} x2={40} y2={70} />
          </Show>
          <Show step={step} at={3}>
            <Arrow x1={70} y1={190} x2={60} y2={168} />
          </Show>
        </>
      }
      side={
        <>
          <Show step={step} at={0}>
            <Chip x={196} y={24} w={148} text="原住民族的祖先很早" hot />
          </Show>
          <Show step={step} at={1}>
            <Chip x={196} y={68} w={148} text="明清：閩、粵移民" hot />
          </Show>
          <Show step={step} at={2}>
            <Chip x={196} y={112} w={148} text="1949 前後軍民遷台" hot />
          </Show>
          <Show step={step} at={3}>
            <Chip x={196} y={164} w={148} text="近幾十年還有新住民" hot />
          </Show>
        </>
      }
    />
  );
}

function qin(step: number) {
  return (
    <Board h={244} title="先秦到秦的統一">
      <rect x="70" y="36" width="220" height="160" rx="18" fill="var(--bg2)" stroke="var(--border)" />
      <Show step={step} at={0}>
        <Chip x={108} y={96} w={144} text="商周已有文字制度" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={24} y={100} w={52} text="秦" />
        <Chip x={286} y={100} w={52} text="齊" />
        <Chip x={154} y={44} w={52} text="燕" />
        <Chip x={154} y={176} w={52} text="楚" />
        <Tx x={180} y={132} size={12}>三晉</Tx>
        <Tx x={180} y={154} size={11} fill="var(--muted)" weight={500}>戰爭頻繁</Tx>
      </Show>
      <Show step={step} at={2}>
        <rect x="70" y="36" width="220" height="160" rx="18" fill="var(--primary)" fillOpacity={0.18} />
        <Chip x={86} y={78} w={188} text="皇帝、郡縣、統一制度" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={78} y={206} w={204} text="秦很短，漢代才穩定下來" hot />
      </Show>
    </Board>
  );
}

function y1949(step: number) {
  return (
    <Board h={236} title="戰爭與 1949">
      <path d="M28,36 L168,40 L176,168 L36,176 Z" fill="var(--bg2)" stroke="var(--fg)" />
      <g transform="translate(214 78) scale(0.55)">
        <IslandShape />
      </g>
      <Show step={step} at={0}>
        <Chip x={36} y={86} w={120} text="抗戰傷害很大" hot />
      </Show>
      <Show step={step} at={1}>
        <Arrow x1={168} y1={100} x2={214} y2={120} />
        <Chip x={150} y={16} w={190} text="中華民國政府遷到台灣" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={28} y={140} w={150} text="中華人民共和國成立" hot />
      </Show>
      <Show step={step} at={3}>
        <Tx x={180} y={214} size={12}>後來的事，不是都發生在這一天</Tx>
      </Show>
      <Foot y={230} />
    </Board>
  );
}

function voyage(step: number) {
  return (
    <Board h={236} title="大航海">
      <ellipse cx="62" cy="112" rx="34" ry="70" fill="var(--primary)" fillOpacity={0.12} stroke="var(--fg)" />
      <Tx x={62} y={108} size={12}>美洲</Tx>
      <ellipse cx="168" cy="58" rx="36" ry="22" fill="var(--bg2)" stroke="var(--fg)" />
      <Tx x={168} y={62} size={12}>歐洲</Tx>
      <path d="M150,90 L196,96 L186,168 L142,160 Z" fill="var(--accent)" fillOpacity={0.12} stroke="var(--fg)" />
      <Tx x={168} y={132} size={12}>非洲</Tx>
      <ellipse cx="286" cy="110" rx="40" ry="48" fill="var(--bg2)" stroke="var(--fg)" />
      <Tx x={286} y={114} size={12}>亞洲</Tx>
      <Show step={step} at={0}>
        <path d="M140,70 C100,40 90,80 90,100" fill="none" stroke="var(--accent)" strokeWidth={2} />
        <path d="M186,150 C230,180 260,160 270,140" fill="none" stroke="var(--accent)" strokeWidth={2} />
        <Chip x={196} y={16} w={148} text="歐洲人經海路出去" hot />
      </Show>
      <Show step={step} at={1}>
        <Chip x={196} y={176} w={148} text="貿易、財富、宗教" hot />
      </Show>
      <Show step={step} at={2}>
        <Chip x={16} y={16} w={150} text="作物和疾病兩邊走" hot />
      </Show>
      <Show step={step} at={3}>
        <circle cx="52" cy="80" r="4" fill="var(--accent)" />
        <circle cx="70" cy="140" r="4" fill="var(--accent)" />
        <Chip x={16} y={196} w={168} text="美洲早就有人" hot />
      </Show>
      <Foot y={228} />
    </Board>
  );
}

function lateQing(step: number) {
  return (
    <Board h={230} title="晚清變局">
      <path d="M24,30 L150,36 L156,190 L30,184 Z" fill="var(--bg2)" stroke="var(--fg)" />
      <rect x="168" y="40" width="168" height="150" rx="16" fill="var(--primary)" fillOpacity={0.08} />
      <Tx x={250} y={118} size={13}>海</Tx>
      <Show step={step} at={0}>
        <Arrow x1={230} y1={90} x2={156} y2={100} />
        <Chip x={176} y={16} w={150} text="外力從海上來" hot />
      </Show>
      <Show step={step} at={1}>
        <circle cx="148" cy="70" r="4" fill="var(--accent)" />
        <circle cx="150" cy="110" r="4" fill="var(--accent)" />
        <circle cx="146" cy="150" r="4" fill="var(--accent)" />
        <Chip x={176} y={150} w={160} text="口岸開放、權利受損" hot />
      </Show>
      <Show step={step} at={2}>
        <rect x="70" y="96" width="28" height="16" fill="var(--primary)" />
        <Chip x={36} y={16} w={120} text="洋務：用新技術" hot />
      </Show>
      <Show step={step} at={3}>
        <Chip x={36} y={196} w={250} text="只換機器，制度沒有一起改完" hot />
      </Show>
    </Board>
  );
}

const SCENES: Record<string, Scene> = {
  elements,
  latlong,
  'tw-land': twLand,
  'tw-climate': twClimate,
  'tw-pop': twPop,
  migrate,
  'china-land': chinaLand,
  'two-lines': twoLines,
  'east-sea': eastSea,
  'china-pop': chinaPop,
  'eur-am': eurAm,
  'dry-monsoon': dryMonsoon,
  bands,
  'af-aus': afAus,
  plates,
  typhoon,
  contour,
  'map-read': mapRead,
  'early-island': earlyIsland,
  posts,
  'qing-west': qingWest,
  ports,
  origins,
  qin,
  y1949,
  voyage,
  'late-qing': lateQing,
};

export function Atlas({ name, step }: { name: string; step: number; beat?: number }) {
  const scene = SCENES[name];
  const safe = Math.max(0, Math.min(3, step));
  if (!scene) {
    return (
      <Board h={80} title="簡圖">
        <Tx x={180} y={46} size={14}>簡圖</Tx>
      </Board>
    );
  }
  return scene(safe);
}
