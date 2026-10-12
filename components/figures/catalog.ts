import type { Visual } from './draw';
import { englishFigures } from './englishCatalog';
import { chineseFigures } from './chineseCatalog';
import { socialFigures } from './socialCatalog';
import { biologyFigures } from './biologyCatalog';

export interface FigureEntry {
  title: string;
  captions: [string, string, string, string];
  visual: Visual;
  voice?: 'math' | 'language' | 'concept';
}

const cell = (t: string, tone: 'pri' | 'acc' | 'ink' = 'pri') => ({ t, tone });

export const figures: Record<string, FigureEntry> = {
  ...englishFigures,
  ...chineseFigures,
  ...socialFigures,
  ...biologyFigures,
  'unit-1-1-kp1': {
    title: '正數、負數和零',
    captions: [
      '整數分成正整數、負整數，再加上零。',
      '正整數 1、2、3…用來表示「得到」。',
      '負整數 (−1)、(−2)、(−3)…用來表示「失去」。',
      '零表示沒有得也沒有失，站在正數和負數中間。',
    ],
    visual: {
      type: 'tokens',
      phases: [
        { groups: [{ label: '正', cells: [cell('1'), cell('2'), cell('3')] }, { label: '零', cells: [cell('0', 'ink')] }, { label: '負', cells: [cell('−1', 'acc'), cell('−2', 'acc'), cell('−3', 'acc')] }] },
        { groups: [{ label: '得到', cells: [cell('+1'), cell('+2'), cell('+3')] }, { label: '零', cells: [cell('0', 'ink')] }, { label: '失去', cells: [cell('−1', 'acc'), cell('−2', 'acc')] }], foot: '正數表示得到' },
        { groups: [{ label: '得到', cells: [cell('+1'), cell('+2')] }, { label: '零', cells: [cell('0', 'ink')] }, { label: '失去', cells: [cell('−1', 'acc'), cell('−2', 'acc'), cell('−3', 'acc')] }], foot: '負數表示失去' },
        { groups: [{ label: '正', cells: [cell('1'), cell('2')] }, { label: '沒有得失', cells: [cell('0', 'ink')] }, { label: '負', cells: [cell('−1', 'acc'), cell('−2', 'acc')] }] },
      ],
    },
  },
  'unit-1-1-kp2': {
    title: '數線',
    captions: [
      '數線以 0 為原點，右邊是正，左邊是負。',
      '數字越大越靠右，越小越靠左。',
      '負數、零、正數由左到右排在同一條線上。',
      '比大小時，看誰站得比較右邊。',
    ],
    visual: {
      type: 'nl',
      min: -4,
      max: 4,
      phases: [
        { tags: ['負', '正'], points: [{ at: 0, label: '原點', tone: 'ink' }] },
        { points: [{ at: -2, label: '較小', tone: 'acc' }, { at: 3, label: '較大', tone: 'pri' }] },
        { points: [{ at: -3, tone: 'acc' }, { at: -1, tone: 'acc' }, { at: 2, tone: 'pri' }] },
        { points: [{ at: -1, label: '左', tone: 'acc' }, { at: 2, label: '右、比較大', tone: 'pri' }] },
      ],
    },
  },
  'unit-1-2-kp1': {
    title: '絕對值',
    captions: [
      '絕對值是這個數離 0 有多遠，不會是負的。',
      '正數的絕對值就是自己，負數要先拿掉負號。',
      '|(−5)| = 5，|3| = 3，|0| = 0。',
      '它只看距離，不看方向。',
    ],
    visual: {
      type: 'nl',
      min: -5,
      max: 5,
      phases: [
        { arcs: [{ a: -4, b: 0, label: '距離 4' }, { a: 0, b: 4, label: '距離 4' }], points: [{ at: -4, tone: 'acc' }, { at: 4, tone: 'pri' }] },
        { arcs: [{ a: -5, b: 0, label: '5' }, { a: 0, b: 3, label: '3' }] },
        { points: [{ at: -5, label: '|(−5)|=5', tone: 'acc' }, { at: 3, label: '|3|=3', tone: 'pri' }, { at: 0, label: '0', tone: 'ink' }] },
        { arcs: [{ a: -4, b: 0, label: '只看距離' }, { a: 0, b: 4, label: '不看方向' }] },
      ],
    },
  },
  'unit-1-2-kp2': {
    title: '比較整數',
    captions: [
      '先看符號：負數小於 0，0 小於正數。',
      '兩個負數，絕對值越大的那個越小。',
      '(−5) < (−3) < 0 < 2 < 4。',
      '在數線上，越右邊越大。',
    ],
    visual: {
      type: 'nl',
      min: -6,
      max: 5,
      phases: [
        { tags: ['負數', '正數'], points: [{ at: 0, tone: 'ink' }, { at: -4, tone: 'acc' }, { at: 3, tone: 'pri' }] },
        { points: [{ at: -5, label: '比較小', tone: 'acc' }, { at: -3, label: '比較大', tone: 'pri' }] },
        { points: [{ at: -5, label: '−5', tone: 'acc' }, { at: -3, label: '−3', tone: 'acc' }, { at: 0, tone: 'ink' }, { at: 2, label: '2', tone: 'pri' }, { at: 4, label: '4', tone: 'pri' }] },
        { arrow: { from: -5, to: 4, label: '越右越大' } },
      ],
    },
  },
  'unit-1-3-kp1': {
    title: '整數加法',
    captions: [
      '同號相加：符號不變，絕對值相加。(−2)+(−3)=(−5)。',
      '異號相加：看誰離 0 比較遠，符號跟它走。',
      '(−3)+5 = 2，從 −3 向右走 5 格。',
      '3+(−5)=(−2)，向左走就是加負數。',
    ],
    visual: {
      type: 'nl',
      min: -6,
      max: 6,
      phases: [
        { arrow: { from: -2, to: -5, label: '再加 (−3)' }, points: [{ at: -2, tone: 'ink', open: true }] },
        { arrow: { from: -3, to: 2, label: '+5' }, points: [{ at: -3, tone: 'acc', open: true }] },
        { arrow: { from: -3, to: 2, label: '(−3)+5=2' } },
        { arrow: { from: 3, to: -2, label: '3+(−5)' } },
      ],
    },
  },
  'unit-1-3-kp2': {
    title: '整數減法',
    captions: [
      '減一個數，就是加上它的相反數。',
      '5−(−3) = 5+3 = 8。',
      '(−3)−5 = (−3)+(−5) = (−8)。',
      '先改成加法，再沿數線走。',
    ],
    visual: {
      type: 'nl',
      min: -8,
      max: 8,
      phases: [
        { arrow: { from: 5, to: 8, label: '減負＝加正' }, points: [{ at: 5, open: true, tone: 'ink' }] },
        { arrow: { from: 5, to: 8, label: '5−(−3)=8' } },
        { arrow: { from: -3, to: -8, label: '(−3)−5' } },
        { arrow: { from: 2, to: -1, label: '2−3 = 2+(−3)' } },
      ],
    },
  },
  'unit-1-4-kp1': {
    title: '乘除的符號',
    captions: [
      '乘法：同號得正，異號得負，再把絕對值相乘。',
      '除法和乘法用同一套符號規則。',
      '(−2)×3=(−6)，(−10)÷(−5)=2。',
      '任何數都不能除以 0。',
    ],
    visual: { type: 'geo', name: 'mulsign' },
  },
  'unit-1-4-kp2': {
    title: '先乘除，後加減',
    captions: [
      '沒有括號時，先做乘除，再做加減。',
      '有括號就從最裡面先算。',
      '2+(−3)×4 要先把 (−3)×4 算出來。',
      '符號要跟著每一段一起看，不要先丢掉。',
    ],
    visual: { type: 'geo', name: 'order' },
  },
  'unit-1-5-kp1': {
    title: '科學記號',
    captions: [
      '10 的正整數次方，就是 1 後面有幾個 0。',
      '科學記號寫成 a×10ⁿ，而且 1 ≤ a ＜ 10。',
      '小數點往右移 n 位，等於乘上 10ⁿ。',
      '很大的數用科學記號，比較不會數錯 0。',
    ],
    visual: { type: 'geo', name: 'sci' },
  },
  'u7a2-u1-kp1': {
    title: '因數和質數',
    captions: [
      '因數可以整除這個數。12 的因數有 1、2、3、4、6、12。',
      '質數的正因數只有 1 和自己。',
      '1 不是質數，也不是合數。',
      '2 是最小的質數，也是唯一的偶質數。',
    ],
    visual: { type: 'geo', name: 'factors' },
  },
  'u7a2-u2-kp1': {
    title: '最大公因數、最小公倍數',
    captions: [
      '塗色的是 12 和 18 共有的因數，最大的是 6。',
      '兩個數共有的倍數裡，最小的正數是最小公倍數。',
      '如果只共有因數 1，這兩個數就互質。',
      '短除法可以同時找出最大公因數和最小公倍數。',
    ],
    visual: { type: 'geo', name: 'gcd' },
  },
  'u7a2-u3-kp1': {
    title: '分數',
    captions: [
      '分母不同，要先切成一樣大的格子才能相加。',
      '1/2 是 3/6，1/3 是 2/6，加起來是 5/6。',
      '分數相乘：分子乘分子、分母乘分母，再約分。',
      '除以一個分數，改成乘上它的倒數。',
    ],
    visual: {
      type: 'frac',
      phases: [
        { rows: [{ label: '1/2', den: 2, num: 1 }, { label: '1/3', den: 3, num: 1, tone: 'acc' }] },
        { rows: [{ label: '3/6', den: 6, num: 3 }, { label: '2/6', den: 6, num: 2, tone: 'acc' }, { label: '5/6', den: 6, num: 5, tone: 'ink' }], note: '通分後再加' },
        { rows: [{ label: '2/3', den: 3, num: 2 }, { label: '3/4', den: 4, num: 3, tone: 'acc' }], note: '相乘後再約分' },
        { rows: [{ label: '2/3', den: 3, num: 2 }, { label: '3/4', den: 4, num: 3, tone: 'acc' }], note: '除以 3/4，改成乘 4/3' },
      ],
    },
  },
  'u7a2-u4-kp1': {
    title: '指數律',
    captions: [
      '同底數相乘，指數相加：a²×a³=a⁵。',
      '同底數相除，指數相減：a⁵÷a²=a³。',
      '乘方再乘方，指數相乘：(a²)³=a⁶。',
      '這裡先用正整數指數。',
    ],
    visual: { type: 'geo', name: 'exp' },
  },
  'u7a3-u1-kp1': {
    title: '代數式',
    captions: [
      '用文字代表還不知道的數，句子就能寫成式子。',
      '分配律：一個數乘進括號，每一項都要乘到。',
      '文字部分相同的才是同類項，係數可以相加。',
      '2x 和 5x 合在一起是 7x，常數另外放。',
    ],
    visual: { type: 'geo', name: 'like' },
  },
  'u7a3-u2-kp1': {
    title: '天平上看等式',
    captions: [
      '等式像天平，兩邊一樣重，平衡才不會倒。',
      '兩邊同時加、減、乘、除同一個數（不能除以 0），平衡不變。',
      '移項就是把一項搬到另一邊，正負號要改。',
      'x+3=7 兩邊拿走 3，得到 x=4。',
    ],
    visual: { type: 'geo', name: 'balance' },
  },
  'u7a3-u3-kp1': {
    title: '先設未知數',
    captions: [
      '先決定 x 代表題目裡的哪一個量。',
      '「共」「比……多」「是幾倍」都要寫成等式。',
      '解出來之後，還要把 x 代回原本的句子。',
      '價錢、年齡、雞兔同籠，都是先列式再解。',
    ],
    visual: { type: 'geo', name: 'word' },
  },
  'u7b1-u1-kp1': {
    title: '兩條線的交點',
    captions: [
      '一個二元一次方程式有很多組解，圖形是直線。',
      '兩個式子聯立，才同時決定兩個未知數。',
      '加減消去：讓其中一個未知數的係數變成相反數再相加。',
      'x+y=5 和 x−y=1 交在 (3, 2)。',
    ],
    visual: { type: 'geo', name: 'elim' },
  },
  'u7b1-u2-kp1': {
    title: '兩個條件，兩個式子',
    captions: [
      '兩種東西的數量和價錢，通常要列兩個方程式。',
      '知道和與差時，大數 = (和 + 差) ÷ 2。',
      '一個條件寫一個式子，不要把兩件事寫進同一句。',
      '答案要標清楚哪一個字母是哪一個量。',
    ],
    visual: { type: 'geo', name: 'word' },
  },
  'u7b2-u1-kp1': {
    title: '坐標平面',
    captions: [
      '平面上的點寫成 (x, y)，先橫再縱。',
      'x 向右是正，y 向上是正。',
      '兩軸把平面分成四個象限。',
      '剛好在軸上的點，不屬於任何象限。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { points: [{ x: 2, y: 3, label: '(2, 3)' }], note: '先往右 2，再往上 3' },
        { points: [{ x: 2, y: 3, label: '(2, 3)' }, { x: -2, y: 1, label: '(−2, 1)' }] },
        { quads: true, note: '右上 I、左上 II、左下 III、右下 IV' },
        { points: [{ x: 0, y: 2, label: '(0, 2) 在軸上' }, { x: -3, y: 0, label: '(−3, 0)' }], quads: true },
      ],
    },
  },
  'u7b2-u2-kp1': {
    title: '方程式的圖形是直線',
    captions: [
      '二元一次方程式的圖形是一條直線。',
      'x 等於常數是鉛直線，y 等於常數是水平線。',
      '找到兩個點，就能把直線畫出來。',
      '跟軸的交點，是另一個坐標為 0 的地方。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { lines: [{ x1: -1, y1: 3, x2: 3, y2: -1 }], note: 'x + y = 2' },
        { lines: [{ x1: 2, y1: -3, x2: 2, y2: 3 }, { x1: -3, y1: 1, x2: 3, y2: 1 }], note: 'x=2 鉛直，y=1 水平' },
        { points: [{ x: 0, y: 2, label: '(0, 2)' }, { x: 2, y: 0, label: '(2, 0)' }], lines: [{ x1: -1, y1: 3, x2: 3, y2: -1 }] },
        { points: [{ x: 0, y: 2, label: 'y 截距' }, { x: 2, y: 0, label: 'x 截距' }], lines: [{ x1: -1, y1: 3, x2: 3, y2: -1 }] },
      ],
    },
  },
  'u7b3-u1-kp1': {
    title: '比例',
    captions: [
      'a : b 的比值是 a÷b，後項不能是 0。',
      '兩個比的比值相同，就寫成比例式。',
      '外項相乘等於內項相乘。',
      '前後項同乘或同除一個不是 0 的數，比值不變。',
    ],
    visual: { type: 'geo', name: 'ratio' },
  },
  'u7b3-u2-kp1': {
    title: '正比和反比',
    captions: [
      'y 與 x 成正比時，y=kx，圖形過原點。',
      'k 是固定的數，而且不是 0。',
      '成反比時，x 和 y 的乘積是定值。',
      'k＞0 的時候，x 變大，y 就變小。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { curve: 'prop', note: '過原點的直線：正比' },
        { curve: 'prop', points: [{ x: 2, y: 2, label: 'y=x' }] },
        { curve: 'inverse', note: 'xy = 4' },
        { curve: 'inverse', note: '第一象限：x 越大，y 越小' },
      ],
    },
  },
  'u7b4-u1-kp1': {
    title: '不等式的方向',
    captions: [
      '解可以用數線上的一段來表示，空心點表示不含等號。',
      '兩邊同加或同減，不等號的方向不變。',
      '兩邊同乘或同除一個負數，不等號要反過來。',
      'x＞2 乘上 (−1) 之後，變成 x＜−2。',
    ],
    visual: { type: 'geo', name: 'ineq' },
  },
  'u7b5-u1-kp1': {
    title: '平均、中間、最常出現',
    captions: [
      '這五個數 2、3、3、3、7 的平均是 18÷5=3.6。',
      '先排序，正中間那個數是中位數，這裡是 3。',
      '如果有偶數筆，中位數是最中間兩數的平均。',
      '3 出現最多次，所以眾數是 3。',
    ],
    visual: { type: 'geo', name: 'stats' },
  },
  'u7b6-u1-kp1': {
    title: '對稱軸',
    captions: [
      '沿一條直線對折能夠重合，那條線就是對稱軸。',
      '正 n 邊形有 n 條對稱軸。正方形有 4 條。',
      '圓的任何一條直徑都是對稱軸。',
      '一般的平行四邊形對折不會重合。',
    ],
    visual: { type: 'geo', name: 'sym' },
  },
  'u7b6-u2-kp1': {
    title: '三視圖',
    captions: [
      '從前面、上面、側面各看一次輪廓。',
      '圓柱從上面看是圓，從前面看是長方形。',
      '圓錐從前面看是等腰三角形。',
      '正立方體的三個視圖都是正方形。',
    ],
    visual: { type: 'geo', name: 'views' },
  },
  'u8a1-u1-kp1': {
    title: '面積看出乘法公式',
    captions: [
      '大正方形分成 a²、兩個 ab 和 b²，就是 (a+b)²。',
      '(a−b)² 展開後，中間是減掉 2ab。',
      '大方塊去掉小方塊，就是 a²−b²=(a+b)(a−b)。',
      '看到平方項再加兩倍乘積，就想到完全平方。',
    ],
    visual: { type: 'geo', name: 'area' },
  },
  'u8a1-u2-kp1': {
    title: '多項式',
    captions: [
      '多項式是好幾個單項式加在一起。',
      '加減的時候，只合併同類項。',
      '單項式相乘：係數相乘，相同文字的指數相加。',
      '相除時係數相除，指數改成相減。',
    ],
    visual: { type: 'geo', name: 'poly' },
  },
  'u8a2-u1-kp1': {
    title: '平方根',
    captions: [
      '邊長是 3 的正方形，面積是 9，所以 √9=3。',
      '完全平方數的平方根是整數。',
      '1²=1、2²=4，所以 √2 落在 1 和 2 之間。',
      '國中先看 a 不是負數的情形。',
    ],
    visual: { type: 'geo', name: 'sqrt' },
  },
  'u8a2-u2-kp1': {
    title: '把完全平方提出根號',
    captions: [
      '√(ab)=√a×√b，a 和 b 都不是負數。',
      '√12=√(4×3)=2√3。',
      '根號外面一樣的，才可以相加減。',
      '√a×√a=a。',
    ],
    visual: { type: 'geo', name: 'rad' },
  },
  'u8a2-u3-kp1': {
    title: '畢氏定理',
    captions: [
      '直角三角形：兩股的平方和等於斜邊的平方。',
      '3、4、5 這組整數邊滿足 9+16=25。',
      '知道斜邊和一股，另一股用平方差開根號。',
      '平面上兩點的距離，就是水平差和垂直差圍成的斜邊。',
    ],
    visual: { type: 'geo', name: 'pyth' },
  },
  'u8a3-u1-kp1': {
    title: '提出公因式',
    captions: [
      '每一項都有的因式可以先提出來。',
      '係數取最大公因數，文字取較小的次方。',
      '2x+6=2(x+3)，乘回去要能還原。',
      '這是因式分解的第一步。',
    ],
    visual: { type: 'geo', name: 'pull' },
  },
  'u8a3-u2-kp1': {
    title: '用乘法公式拆開',
    captions: [
      '完全平方可以寫成一個括號的平方。',
      '中間項剛好是 2ab，才是完全平方。',
      '平方差 a²−b² 拆成 (a+b)(a−b)。',
      '先看完全平方，再看平方差。',
    ],
    visual: { type: 'geo', name: 'area' },
  },
  'u8a3-u3-kp1': {
    title: '十字交乘',
    captions: [
      '找兩個數，相加是中間的係數，相乘是常數。',
      'x²+5x+6=(x+2)(x+3)。',
      '拆完要乘開，核對每一項。',
      '常數是負的時候，這兩個數一正一負。',
    ],
    visual: { type: 'geo', name: 'cross' },
  },
  'u8a4-u1-kp1': {
    title: '乘積是 0',
    captions: [
      '一元二次方程式先整理成一邊等於 0。',
      '兩個因式相乘是 0，至少有一個因式是 0。',
      '(x−1)(x+2)=0 時，x=1 或 x=−2。',
      '解要代回原式檢查。',
    ],
    visual: { type: 'geo', name: 'zero' },
  },
  'u8a4-u2-kp1': {
    title: '跟 x 軸有幾個交點',
    captions: [
      '判別式 b²−4ac 大於 0，有兩個不同交點。',
      '等於 0 時，拋物線剛好接到 x 軸一次。',
      '小於 0 時，跟 x 軸沒有交點，沒有實數解。',
      '公式解是把 −b 加減這個平方根，再除以 2a。',
    ],
    visual: { type: 'geo', name: 'disc' },
  },
  'u8a4-u3-kp1': {
    title: '二次的應用',
    captions: [
      '面積、連續整數，常常列成二次方程式。',
      '先設未知數，再依題意寫等式。',
      '負的解要看題目允不允許，長度不能是負的。',
      '最後用原來的條件驗算。',
    ],
    visual: { type: 'geo', name: 'word' },
  },
  'u8b1-u1-kp1': {
    title: '等差數列',
    captions: [
      '相鄰兩項的差都一樣，這個差叫公差。',
      '第 n 項 = 首項 + (n−1)×公差。',
      '知道兩項，就可以先把公差算出來。',
      '公差可以是負的，這時數列會愈來愈小。',
    ],
    visual: { type: 'geo', name: 'seq' },
  },
  'u8b1-u2-kp1': {
    title: '頭尾配對',
    captions: [
      '等差級數是等差數列全部加起來。',
      '1 配 6、2 配 5、3 配 4，每一組都是 7。',
      '前 n 項和 = 項數 ÷ 2 × (首項 + 末項)。',
      '1 加到 n 等於 n(n+1)÷2。先數有幾項。',
    ],
    visual: { type: 'geo', name: 'series' },
  },
  'u8b1-u3-kp1': {
    title: '等比數列',
    captions: [
      '相鄰兩項相除都得到同一個公比。',
      '第 n 項 = 首項 × 公比的 (n−1) 次方。',
      '公比可以是分數，也可以是負數。',
      '公比是負的時候，正負會輪流出現。',
    ],
    visual: { type: 'geo', name: 'geoseq' },
  },
  'u8b2-u1-kp1': {
    title: '一個 x 只對一個 y',
    captions: [
      '函數是一種對應：每個 x 恰好走到一個 y。',
      '可以用式子、表格或圖形來表示。',
      'f(3) 的意思是把 3 代進這個對應。',
      '如果同一個 x 走到兩個 y，那就不是函數。',
    ],
    visual: { type: 'geo', name: 'mapfn' },
  },
  'u8b2-u2-kp1': {
    title: '直線的斜率',
    captions: [
      '線型函數寫成 y=mx+k。',
      'm 是斜率，決定往右上還是往右下。',
      'm＞0 時，直線由左下往右上。',
      'k 是跟 y 軸的交點高度；跟 x 軸的交點要令 y=0。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { curve: 'slope', note: 'y = mx + k' },
        { curve: 'slope', points: [{ x: 0, y: 1, label: 'k' }] },
        { curve: 'slope', note: '往右上，斜率是正的' },
        { curve: 'slope', points: [{ x: 0, y: 1, label: 'y 截距' }, { x: -1.25, y: 0, label: 'y=0' }] },
      ],
    },
  },
  'u8b3-u1-kp1': {
    title: '內角和外角',
    captions: [
      '三角形三個內角加起來是 180°。',
      '把一邊延長，外面那個角叫外角。',
      '外角等於另外兩個不相鄰的內角加起來。',
      '挨在一起的內角和外角，加起來是 180°。',
    ],
    visual: { type: 'geo', name: 'angles' },
  },
  'u8b3-u2-kp1': {
    title: '什麼條件能說全等',
    captions: [
      '全等表示形狀和大小都一樣，可以完全重合。',
      'SSS、SAS、ASA、AAS 都可以判定三角形全等。',
      'SSA 一般不能判定，圖上這組條件不夠。',
      '直角三角形可以只用斜邊和一股。',
    ],
    visual: { type: 'geo', name: 'cong' },
  },
  'u8b3-u3-kp1': {
    title: '邊和角誰對誰',
    captions: [
      '最長的邊對著最大的角。',
      '任兩邊的和必須大於第三邊，否則圍不起來。',
      '等腰三角形的兩個底角一樣大。',
      '等邊三角形的三個角都是 60°。',
    ],
    visual: { type: 'geo', name: 'sides' },
  },
  'u8b4-u1-kp1': {
    title: '平行線被截出的角',
    captions: [
      '兩條平行線被一條截線切開，同位角一樣大。',
      '內錯角也一樣大。',
      '同側內角加起來是 180°。',
      '反過來看：同位角相等，就可以說這兩線平行。',
    ],
    visual: { type: 'geo', name: 'parallel' },
  },
  'u8b4-u2-kp1': {
    title: '平行四邊形',
    captions: [
      '兩組對邊都平行，而且對邊一樣長、對角一樣大。',
      '相鄰的兩個角互補。',
      '兩條對角線互相平分，交點在各自的中點。',
      '只要有一組對邊又平行又相等，就可以判定。',
    ],
    visual: { type: 'geo', name: 'para' },
  },
  'u8b4-u3-kp1': {
    title: '矩形、菱形、正方形、梯形',
    captions: [
      '矩形的四個角都是直角，兩條對角線一樣長。',
      '菱形的四邊一樣長，對角線互相垂直平分。',
      '正方形同時是矩形，也是菱形。',
      '恰有一組對邊平行的四邊形是梯形。',
    ],
    visual: { type: 'geo', name: 'quads' },
  },
  'u9a1-u1-kp1': {
    title: '相似：一樣的形，不一樣的大小',
    captions: [
      '對應角相等，對應邊成比例，兩個三角形就相似。',
      '只要有兩組對應角相等，就可以判定相似。',
      '圖上的對應邊是 1 : 2。',
      '面積比是相似比的平方，所以是 1 : 4。',
    ],
    visual: { type: 'geo', name: 'similar' },
  },
  'u9a1-u2-kp1': {
    title: '中點連線',
    captions: [
      '平行線把對應線段切成比例。',
      '三角形兩邊中點的連線，平行於第三邊。',
      '這條中點連線的長度是第三邊的一半。',
      '相似三角形的對應高，比也等於相似比。',
    ],
    visual: { type: 'geo', name: 'mid' },
  },
  'u9a2-u1-kp1': {
    title: '圓心角和圓周角',
    captions: [
      '頂點在圓心的是圓心角，頂點在圓上的是圓周角。',
      '看同一條弧時，圓周角是圓心角的一半。',
      '看同一條弧的圓周角，彼此一樣大。',
      '直徑所對的圓周角是 90°。',
    ],
    visual: { type: 'geo', name: 'arc' },
  },
  'u9a2-u2-kp1': {
    title: '切線和弦',
    captions: [
      '切線垂直於經過切點的半徑。',
      '從圓外同一點作出的兩條切線一樣長。',
      '從圓心向弦作垂線，會把這條弦平分。',
      '半弦、弦心距和半徑，圍成一個直角三角形。',
    ],
    visual: { type: 'geo', name: 'tangent' },
  },
  'u9a3-u1-kp1': {
    title: '拋物線開口',
    captions: [
      '二次函數的圖形是拋物線。',
      '二次項是正的，開口向上；是負的，開口向下。',
      '與 y 軸的交點，看常數項。',
      '與 x 軸的交點，就是對應方程式的實數解。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { curve: 'up', note: '開口向上' },
        { curve: 'down', note: '開口向下' },
        { curve: 'miss', points: [{ x: 0, y: 0.9, label: '常數項' }], note: '與 y 軸的交點' },
        { curve: 'cross', note: '與 x 軸的交點就是實數解' },
      ],
    },
  },
  'u9a3-u2-kp1': {
    title: '頂點和對稱軸',
    captions: [
      '對稱軸是 x=−b÷(2a)，圖上這條在 x=1。',
      '把對稱軸的 x 代回去，就得到頂點的 y。',
      '寫成 a(x−h)²+k 時，頂點是 (h, k)。',
      '開口向上時，頂點是最低點，也就是最小值。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { curve: 'vertex', lines: [{ x1: 1, y1: -3, x2: 1, y2: 3 }], note: '對稱軸 x=1' },
        { curve: 'vertex', points: [{ x: 1, y: -1.5, label: '頂點' }], lines: [{ x1: 1, y1: -3, x2: 1, y2: 3 }] },
        { curve: 'vertex', points: [{ x: 1, y: -1.5, label: '(h, k)' }] },
        { curve: 'vertex', points: [{ x: 1, y: -1.5, label: '最小值' }], note: '開口向上' },
      ],
    },
  },
  'u9a4-u1-kp1': {
    title: '機率',
    captions: [
      '機率 = 有利的結果數 ÷ 全部同樣可能的結果數。',
      '算完一定落在 0 和 1 之間。',
      '公正硬幣的正面是兩種結果裡的一種，機率 1/2。',
      '先把全部結果數清楚，再數有利的有幾種。',
    ],
    visual: { type: 'geo', name: 'prob' },
  },
  'u9b1-u1-kp1': {
    title: '外心、內心、重心',
    captions: [
      '三邊中垂線交於外心，它是外接圓的圓心。',
      '三內角的平分線交於內心，它是內切圓的圓心。',
      '三條中線交於重心。',
      '重心把每一條中線分成 2:1，靠近頂點的那段比較長。',
    ],
    visual: { type: 'geo', name: 'centers' },
  },
  'u9b2-u1-kp1': {
    title: '柱體和錐體',
    captions: [
      '柱體的體積是底面積乘上高。',
      '同底等高的錐體，體積只有柱體的三分之一。',
      '圓柱可以想成底是圓：體積是 πr²h。',
      '正立方體的表面積是 6 個相同正方形。',
    ],
    visual: { type: 'geo', name: 'solids' },
  },
  'u9b3-u1-kp1': {
    title: '次數和相對次數',
    captions: [
      '次數是落在這一組的資料有幾筆。',
      '相對次數 = 這一組的次數 ÷ 總次數。',
      '全部組的相對次數加起來是 1。',
      '知道相對次數和總筆數，次數就乘回去。',
    ],
    visual: { type: 'geo', name: 'rel' },
  },

  'unit-1-6-kp1': {
    title: '很小的數',
    captions: [
      '小於 1 的正數，科學記號的指數是負的。',
      '仍然要寫成 1 到 10 之間的數，再乘 10 的次方。',
      '小數點向左移幾位，指數就是負幾。',
      '0.0045＝4.5×10 的 −3 次方。',
    ],
    visual: { type: 'geo', name: 'scismall' },
  },
  'u7a2-u5-kp1': {
    title: '負指數',
    captions: [
      'a 的 −n 次方，就是 1 除以 a 的 n 次方。',
      '2 的 −3 次方＝1/8，不是 −8。',
      '負號在指數上，底數本身沒有變號。',
      '指數相乘的規則，負指數也適用。',
    ],
    visual: { type: 'geo', name: 'nexp' },
  },
  'u9a1-u3-kp1': {
    title: '三連比',
    captions: [
      '三連比一次看三個量。',
      '兩個比要先把共同的項化成一樣。',
      'a：b＝2：3、b：c＝4：5，接成 8：12：15。',
      '知道總量，就照份數分配。',
    ],
    visual: { type: 'geo', name: 'triple' },
  },
  'u9a2-u3-kp1': {
    title: '弧長和扇形',
    captions: [
      '先看圓心角占了 360° 的幾分之幾。',
      '弧長用這個比例乘上圓周長。',
      '扇形面積用同一個比例乘上圓面積。',
      '半徑 6、圓心角 60°：弧長 2π，面積 6π。',
    ],
    visual: { type: 'geo', name: 'sector' },
  },
  'u9a2-u4-kp1': {
    title: '圓內接四邊形',
    captions: [
      '四個頂點都在圓上。',
      '對角加起來是 180°。',
      '一個角 70°，對面的角就是 110°。',
      '外角等於內對角。',
    ],
    visual: { type: 'geo', name: 'cyclic' },
  },
  'u9a5-u1-kp1': {
    title: '銳角三角比',
    captions: [
      '先分清對邊、鄰邊和斜邊。',
      '正弦是對邊除以斜邊。',
      '餘弦是鄰邊除以斜邊。',
      '正切是對邊除以鄰邊。',
    ],
    visual: { type: 'geo', name: 'trig' },
  },
  'u9a5-u2-kp1': {
    title: '30°、45°、60°',
    captions: [
      '30° 的正弦是 1/2。',
      '斜邊 10，30° 的對邊就是 5。',
      '45° 的正切是 1，對邊等於鄰邊。',
      '仰角 45° 時，高度等於水平距離。',
    ],
    visual: { type: 'geo', name: 'triguse' },
  },
  'u9a3-u3-kp1': {
    title: '最大和最小',
    captions: [
      '開口向下，頂點是最高點。',
      '開口向上，頂點是最低點。',
      '把對稱軸的 x 代回去，就得到那個值。',
      'y＝−x²＋6x＋1 的最大值是 10。',
    ],
    visual: {
      type: 'plane',
      phases: [
        { curve: 'down', note: '開口向下，有最高點' },
        { curve: 'vertex', note: '開口向上，頂點是最低點' },
        { curve: 'down', points: [{ x: 0, y: 0, label: '頂點' }], note: '最高點的高度就是最大值' },
        { curve: 'vertex', note: '平方項最小是 0' },
      ],
    },
  },
  'u9b2-u2-kp1': {
    title: '線和面',
    captions: [
      '長方體的上面和底面平行。',
      '不相交也不平行的兩條邊是歪斜。',
      '垂直於平面的線，垂直於過垂足的每一條線。',
      '直線和平面沒有交點，就是平行。',
    ],
    visual: { type: 'geo', name: 'space' },
  },
  'u9b3-u2-kp1': {
    title: '累積次數',
    captions: [
      '累積次數是從第一組加到這一組。',
      '4 和 6 加起來，前兩組的累積次數是 10。',
      '累積相對次數＝累積次數 ÷ 總次數。',
      '最後一組的累積次數等於全部筆數。',
    ],
    visual: { type: 'geo', name: 'cumul' },
  },
};
