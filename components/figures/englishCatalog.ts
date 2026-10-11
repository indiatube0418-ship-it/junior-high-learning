import type { Visual } from './draw';

export interface LangFigure {
  title: string;
  captions: [string, string, string, string];
  visual: Visual;
  voice: 'language';
}

function fig(
  title: string,
  captions: [string, string, string, string],
  phases: { boxes: string[]; hot?: number; result?: string }[],
): LangFigure {
  return { title, captions, voice: 'language', visual: { type: 'flow', phases } };
}

export const englishFigures: Record<string, LangFigure> = {
  "en7a-u01-kp1": fig("英文句子怎麼讀", [
    "先從左邊讀到右邊。",
    "開頭大寫，I 和人名也大寫。",
    "講完一件事就放句點。",
    "I am Mia. 就是「我是 Mia」。",
  ], [
    { boxes: ["從左邊開始", "一個字一個字往右"] },
    { boxes: ["i am mia", "I am Mia"], hot: 1 },
    { boxes: ["I", "am", "Mia"], result: "I am Mia." },
    { boxes: ["This", "is", "a pen"], result: "This is a pen." },
  ]),
  "en7a-u02-kp1": fig("be 動詞 am／is／are", [
    "「是」要在 am、is、are 裡挑一個。",
    "I 只配 am。",
    "一個人或一件東西配 is。",
    "你、我們、他們配 are。",
  ], [
    { boxes: ["I → am", "he／she／it → is", "you／we／they → are"] },
    { boxes: ["I", "am a student"], hot: 0 },
    { boxes: ["She", "is my sister"], result: "She is my sister." },
    { boxes: ["They", "are classmates"], result: "They are classmates." },
  ]),
  "en7a-u03-kp1": fig("be 的否定與 Yes／No", [
    "否定就是 be 後面加 not。",
    "問句把 be 搬到最前面。",
    "回答沿用原來的 be。",
    "I 的否定是 I'm not，不是 amn't。",
  ], [
    { boxes: ["She is a cook", "She is not a cook"] },
    { boxes: ["She is a cook", "Is she a cook?"], hot: 1 },
    { boxes: ["Is she a cook?"], result: "Yes, she is." },
    { boxes: ["Are they students?"], result: "No, they aren't." },
  ]),
  "en7a-u04-kp1": fig("主格與受格", [
    "動詞前面用主格。",
    "動詞或介系詞後面用受格。",
    "you 和 it 兩格相同。",
    "likes 後面的「我」要寫 me。",
  ], [
    { boxes: ["主格 I／he／she", "受格 me／him／her"] },
    { boxes: ["She likes", "me"], hot: 1 },
    { boxes: ["I", "know", "him"], result: "I know him." },
    { boxes: ["This gift is for", "them"], result: "This gift is for them." },
  ]),
  "en7a-u05-kp1": fig("所有格", [
    "所有格放在名詞前面。",
    "his 是他的，her 是她的。",
    "its 沒有撇號；it's 等於 it is。",
    "Mia's book 是 Mia 的書。",
  ], [
    { boxes: ["I → my", "he → his", "she → her", "they → their"] },
    { boxes: ["her", "book"], hot: 0 },
    { boxes: ["This is", "Mia's bag"], result: "This is Mia's bag." },
    { boxes: ["The dog wagged", "its tail"], result: "The dog wagged its tail." },
  ]),
  "en7a-u06-kp1": fig("this／that 與 a／an", [
    "近的 this，遠的 that。",
    "a book，an apple。",
    "兩個以上，名詞加 s 或 es。",
    "these／those 後面要複數。",
  ], [
    { boxes: ["this 近", "that 遠", "these／those 很多"] },
    { boxes: ["a book", "an apple"], hot: 1 },
    { boxes: ["this", "watch"], result: "this watch" },
    { boxes: ["these", "watches"], result: "these watches" },
  ]),
  "en7a-u07-kp1": fig("There is／There are", [
    "一個用 There is，很多用 There are。",
    "in 裡面，on 上面，under 下面。",
    "next to 旁邊，between 中間。",
    "問句：Is there ...?／Are there ...?",
  ], [
    { boxes: ["There is 一個", "There are 很多"] },
    { boxes: ["a cat", "under the chair"], hot: 1 },
    { boxes: ["There is a cat", "under the chair"], result: "There is a cat under the chair." },
    { boxes: ["Are there any books", "on the desk?"], result: "Yes, there are." },
  ]),
  "en7a-u08-kp1": fig("祈使句", [
    "命令句直接用原形動詞。",
    "禁止用 Don't + 原形。",
    "Please 讓句子客氣一點。",
    "Let's + 原形是「我們一起」。",
  ], [
    { boxes: ["Open the door", "Don't open the door"] },
    { boxes: ["Don't", "run"], hot: 0 },
    { boxes: ["Please", "sit down"], result: "Please sit down." },
    { boxes: ["Let's", "read"], result: "Let's read." },
  ]),
  "en7a-u09-kp1": fig("Wh- 問句", [
    "What 東西，Who 人，Where 地方。",
    "有 be：疑問詞 + be + 主詞。",
    "一般動詞：疑問詞 + do／does + 原形。",
    "How old are you? 用 be。",
  ], [
    { boxes: ["What 什麼", "Where 哪裡", "Who 誰"] },
    { boxes: ["Where", "is", "the library?"], hot: 0 },
    { boxes: ["Where do you", "live?"], result: "Where do you live?" },
    { boxes: ["How old", "are you?"], result: "I am twelve." },
  ]),
  "en7a-u10-kp1": fig("學校與家人單字", [
    "student、teacher、classmate、classroom。",
    "family、parent、brother、sister。",
    "一個加 a，很多加 s。",
    "parents 是父母兩個人。",
  ], [
    { boxes: ["student 學生", "teacher 老師", "classroom 教室"] },
    { boxes: ["family 家庭", "brother 兄弟", "sister 姊妹"], hot: 0 },
    { boxes: ["a student", "two students"], result: "two students" },
    { boxes: ["my parents", "爸爸和媽媽"], result: "my parents" },
  ]),
  "en7b-u01-kp1": fig("現在簡單式", [
    "習慣和事實用現在簡單式。",
    "I／you／we／they + 原形。",
    "he／she／it + 動詞加 s 或 es。",
    "study 要變成 studies。",
  ], [
    { boxes: ["每天的習慣", "用現在簡單式"] },
    { boxes: ["I walk", "She walks"], hot: 1 },
    { boxes: ["She", "watches TV"], result: "She watches TV." },
    { boxes: ["He", "studies English"], result: "He studies English." },
  ]),
  "en7b-u02-kp1": fig("do／does 問句與否定", [
    "多數用 don't，第三人稱用 doesn't。",
    "don't／doesn't 後面是原形。",
    "問句把 Do 或 Does 放前面。",
    "簡答：Yes, she does.",
  ], [
    { boxes: ["I like cats", "I don't like cats"] },
    { boxes: ["She doesn't", "like cats"], hot: 1 },
    { boxes: ["Does she like cats?"], result: "Yes, she does." },
    { boxes: ["Do they walk to school?"], result: "No, they don't." },
  ]),
  "en7b-u03-kp1": fig("頻率副詞", [
    "always 到 never，頻率由高到低。",
    "放在一般動詞前面。",
    "有 be 時，放在 be 後面。",
    "never 不要再加 don't。",
  ], [
    { boxes: ["always", "usually", "often", "sometimes", "never"] },
    { boxes: ["She", "always", "walks"], hot: 1 },
    { boxes: ["She is", "always happy"], result: "She is always happy." },
    { boxes: ["He never", "eats candy"], result: "他從不吃糖" },
  ]),
  "en7b-u04-kp1": fig("時間的 at／on／in", [
    "鐘點用 at。",
    "星期和日期用 on。",
    "月、年、早上用 in。",
    "例外：at night。",
  ], [
    { boxes: ["at 7:00", "on Monday", "in May"] },
    { boxes: ["in the morning", "at night"], hot: 1 },
    { boxes: ["I get up", "at 6:30"], result: "I get up at 6:30." },
    { boxes: ["The test is", "on Friday"], result: "The test is on Friday." },
  ]),
  "en7b-u05-kp1": fig("可數、不可數與 some／any", [
    "book 可數，water 不可數。",
    "肯定 some，問句和否定 any。",
    "some books，some water。",
    "homework 不加 a，也不加 s。",
  ], [
    { boxes: ["a book 可數", "water 不可數"] },
    { boxes: ["some apples", "not any milk"], hot: 1 },
    { boxes: ["I have", "some water"], result: "I have some water." },
    { boxes: ["Do you have", "any homework?"], result: "Do you have any homework?" },
  ]),
  "en7b-u06-kp1": fig("How many／How much", [
    "數得清用 How many。",
    "數不清用 How much。",
    "問多少錢也用 How much。",
    "很多：a lot of。一點點不可數：a little。",
  ], [
    { boxes: ["How many + 複數", "How much + 不可數"] },
    { boxes: ["How many", "apples"], hot: 1 },
    { boxes: ["How much", "is the ticket?"], result: "It is fifty dollars." },
    { boxes: ["a lot of rice", "a few friends"], result: "rice 不可數，friends 可數" },
  ]),
  "en7b-u07-kp1": fig("can／can't", [
    "誰都用 can，不加 s。",
    "can 後面是原形，沒有 to。",
    "不會：can't。問句：Can ...?",
    "簡答用 can 或 can't。",
  ], [
    { boxes: ["I can swim", "I can't swim"] },
    { boxes: ["can", "play the piano"], hot: 1 },
    { boxes: ["Can you cook?"], result: "Yes, I can." },
    { boxes: ["She can", "ride a bike"], result: "She can ride a bike." },
  ]),
  "en7b-u08-kp1": fig("現在進行式", [
    "正在做：be + V-ing。",
    "be 還是看主詞。",
    "make → making，run → running。",
    "看到 now、look、listen 先想進行式。",
  ], [
    { boxes: ["am／is／are", "+ V-ing"] },
    { boxes: ["She is", "reading"], hot: 1 },
    { boxes: ["Look! The baby", "is sleeping"], result: "Look! The baby is sleeping." },
    { boxes: ["They are", "running"], result: "They are running now." },
  ]),
  "en7b-u09-kp1": fig("一天的飲食單字", [
    "breakfast、lunch、dinner。",
    "hungry、delicious、vegetable、fruit。",
    "eat breakfast，不加 a。",
    "some fruit，some vegetables。",
  ], [
    { boxes: ["breakfast 早餐", "lunch 午餐", "dinner 晚餐"] },
    { boxes: ["hungry 餓", "delicious 好吃"], hot: 0 },
    { boxes: ["I eat", "breakfast at seven"], result: "I eat breakfast at seven." },
    { boxes: ["some fruit", "some vegetables"], result: "水果、蔬菜" },
  ]),
  "en8a-u01-kp1": fig("規則過去式", [
    "yesterday、last、ago 常配過去式。",
    "一般加 ed。",
    "live → lived，study → studied。",
    "stop → stopped。",
  ], [
    { boxes: ["現在 play", "過去 played"] },
    { boxes: ["yesterday", "played basketball"], hot: 1 },
    { boxes: ["She", "studied", "last night"], result: "She studied last night." },
    { boxes: ["The bus", "stopped"], result: "The bus stopped." },
  ]),
  "en8a-u02-kp1": fig("不規則過去式", [
    "不規則動詞要整組記。",
    "go／eat／see／come 的過去式。",
    "have／do／get／make 的過去式。",
    "buy → bought，take → took。",
  ], [
    { boxes: ["go → went", "eat → ate", "see → saw"] },
    { boxes: ["have → had", "do → did"], hot: 0 },
    { boxes: ["I", "went", "to the library"], result: "I went to the library." },
    { boxes: ["She", "bought", "a ticket"], result: "She bought a ticket." },
  ]),
  "en8a-u03-kp1": fig("did 的問句與否定", [
    "didn't + 原形。",
    "Did + 主詞 + 原形？",
    "簡答用 did。",
    "不能說 didn't went。",
  ], [
    { boxes: ["I went", "I didn't go"] },
    { boxes: ["Did you", "go?"], hot: 1 },
    { boxes: ["Did she see it?"], result: "Yes, she did." },
    { boxes: ["They didn't", "eat breakfast"], result: "They didn't eat breakfast." },
  ]),
  "en8a-u04-kp1": fig("be going to", [
    "計畫：be going to + 原形。",
    "be 看主詞。",
    "否定：be not going to。",
    "問句把 be 放前面。",
  ], [
    { boxes: ["計畫", "be going to + 原形"] },
    { boxes: ["I am going to", "visit Grandma"], hot: 0 },
    { boxes: ["She isn't going to", "stay home"], result: "She isn't going to stay home." },
    { boxes: ["Are they going to", "take the train?"], result: "Yes, they are." },
  ]),
  "en8a-u05-kp1": fig("will", [
    "will + 原形。",
    "否定是 won't。",
    "Will you ...?  Yes, I will.",
    "臨時決定用 will，早有計畫用 be going to。",
  ], [
    { boxes: ["預測／臨時決定", "will + 原形"] },
    { boxes: ["I will", "help you"], hot: 0 },
    { boxes: ["She won't", "forget"], result: "She won't forget." },
    { boxes: ["Will it rain?"], result: "I think it will." },
  ]),
  "en8a-u06-kp1": fig("比較級", [
    "短詞 + er + than。",
    "長詞用 more ... than。",
    "nicer、happier、bigger。",
    "good 的比較級是 better。",
  ], [
    { boxes: ["tall → taller", "careful → more careful"] },
    { boxes: ["bigger", "than"], hot: 0 },
    { boxes: ["Amy is", "taller than Ken"], result: "Amy is taller than Ken." },
    { boxes: ["This book is", "better"], result: "better than that one" },
  ]),
  "en8a-u07-kp1": fig("最高級", [
    "最高級前面有 the。",
    "短詞 the -est，長詞 the most。",
    "in 加團體，of 加數字範圍。",
    "the best、the worst。",
  ], [
    { boxes: ["taller 兩者", "the tallest 很多"] },
    { boxes: ["the most", "careful"], hot: 0 },
    { boxes: ["Ken is", "the tallest", "in the class"], result: "the tallest in the class" },
    { boxes: ["This is", "the best", "of the three"], result: "the best of the three" },
  ]),
  "en8a-u08-kp1": fig("連接詞 and／but／so／because", [
    "and 加上，but 轉彎。",
    "so 接結果，because 接原因。",
    "because 和 so 不要同時出現。",
    "or 是或，也可以是否則。",
  ], [
    { boxes: ["and 而且", "but 但是"] },
    { boxes: ["because 原因", "so 結果"], hot: 0 },
    { boxes: ["I was tired", "so I sat down"], result: "結果在 so 後面" },
    { boxes: ["I sat down", "because I was tired"], result: "原因在 because 後面" },
  ]),
  "en8a-u09-kp1": fig("旅行與天氣單字", [
    "weather、sunny、rainy。",
    "train、ticket、map、hotel、camera。",
    "What's the weather like?",
    "take a train，buy a ticket。",
  ], [
    { boxes: ["sunny 晴天", "rainy 雨天"] },
    { boxes: ["train 火車", "ticket 票", "map 地圖"], hot: 0 },
    { boxes: ["What's the weather like?"], result: "It is rainy." },
    { boxes: ["buy a ticket", "take a train"], result: "買票搭火車" },
  ]),
  "en8b-u01-kp1": fig("不定詞 to + 原形", [
    "want／need／decide + to + 原形。",
    "to 後面保持原形。",
    "to + 原形也可以表示目的。",
    "不是 to + V-ing。",
  ], [
    { boxes: ["want", "to", "原形"] },
    { boxes: ["decide to", "join the team"], hot: 0 },
    { boxes: ["She wants", "to read"], result: "She wants to read." },
    { boxes: ["He studies", "to pass the test"], result: "為了通過考試" },
  ]),
  "en8b-u02-kp1": fig("動名詞 V-ing", [
    "enjoy／practice／finish + V-ing。",
    "like swimming 是喜歡游泳。",
    "介系詞後面用 V-ing。",
    "這裡的 V-ing 前面沒有 be。",
  ], [
    { boxes: ["enjoy + V-ing", "不是 enjoy to"] },
    { boxes: ["practice", "playing"], hot: 1 },
    { boxes: ["Thank you for", "helping me"], result: "for + V-ing" },
    { boxes: ["He finished", "writing"], result: "He finished writing." },
  ]),
  "en8b-u03-kp1": fig("to 還是 V-ing", [
    "want 那一組用 to。",
    "enjoy 那一組用 V-ing。",
    "like 兩種都對。",
    "先看前面的動詞。",
  ], [
    { boxes: ["want to swim", "enjoy swimming"] },
    { boxes: ["finish", "doing"], hot: 1 },
    { boxes: ["I like", "to draw"], result: "I like to draw." },
    { boxes: ["I like", "drawing"], result: "I like drawing." },
  ]),
  "en8b-u04-kp1": fig("授與動詞 give", [
    "先人再物：gave me a pen。",
    "先物再 to 人：gave a pen to me。",
    "兩種都對，意思一樣。",
    "it 常用 give it to me。",
  ], [
    { boxes: ["give + 人 + 物", "give + 物 + to + 人"] },
    { boxes: ["gave me", "a pen"], hot: 0 },
    { boxes: ["showed the map", "to us"], result: "showed the map to us" },
    { boxes: ["Give it", "to her"], result: "Give it to her." },
  ]),
  "en8b-u05-kp1": fig("should／must／have to", [
    "should 應該，must 必須。",
    "has to 是第三人稱的 have to。",
    "不必：don't have to。",
    "不准：must not。",
  ], [
    { boxes: ["should 建議", "must 必須"] },
    { boxes: ["must not 不准", "don't have to 不必"], hot: 0 },
    { boxes: ["You should", "sleep early"], result: "You should sleep early." },
    { boxes: ["She has to", "wear a uniform"], result: "She has to wear a uniform." },
  ]),
  "en8b-u06-kp1": fig("too...to／enough to", [
    "too + 形容詞 + to：不能。",
    "形容詞 + enough + to：能夠。",
    "enough 在形容詞後面。",
    "too young to drive 是太小不能開。",
  ], [
    { boxes: ["too young to drive", "不能"] },
    { boxes: ["old enough", "to drive"], hot: 0 },
    { boxes: ["The soup is", "too hot to eat"], result: "太燙而不能吃" },
    { boxes: ["She is", "tall enough to reach it"], result: "夠高，搆得到" },
  ]),
  "en8b-u07-kp1": fig("反身代名詞", [
    "myself、yourself、himself、herself。",
    "同一個人才用反身代名詞。",
    "by myself 是獨自。",
    "Enjoy yourself.",
  ], [
    { boxes: ["I → myself", "he → himself", "they → themselves"] },
    { boxes: ["I hurt", "myself"], hot: 1 },
    { boxes: ["She did it", "by herself"], result: "她一個人做的" },
    { boxes: ["Enjoy", "yourselves"], result: "你們玩得開心" },
  ]),
  "en8b-u08-kp1": fig("when／before／after", [
    "when 當時，before 之前，after 之後。",
    "後面是完整的一句。",
    "子句在前要逗號。",
    "before I sleep，用現在式。",
  ], [
    { boxes: ["before 先", "after 後", "when 同時"] },
    { boxes: ["Before I sleep", "I brush my teeth"], hot: 0 },
    { boxes: ["When I got home", "I washed my hands"], result: "When I got home, I washed my hands." },
    { boxes: ["We play", "after class"], result: "after class 後面不是句子也可以" },
  ]),
  "en8b-u09-kp1": fig("興趣與規定單字", [
    "hobby、practice、team、rule。",
    "library、borrow、quiet。",
    "borrow 是借入，lend 是借出。",
    "圖書館裡要 be quiet。",
  ], [
    { boxes: ["hobby 興趣", "team 隊伍", "rule 規定"] },
    { boxes: ["borrow 借入", "lend 借出"], hot: 0 },
    { boxes: ["borrow a book", "from the library"], result: "從圖書館借書" },
    { boxes: ["be quiet", "in the library"], result: "保持安靜" },
  ]),
  "en9a-u01-kp1": fig("現在完成式", [
    "have／has + 過去分詞。",
    "he／she／it 用 has。",
    "seen、gone、eaten 是過去分詞。",
    "有 yesterday 就不要用完成式。",
  ], [
    { boxes: ["have／has", "+ 過去分詞"] },
    { boxes: ["She has", "finished"], hot: 1 },
    { boxes: ["I have", "seen this movie"], result: "我看過這部電影" },
    { boxes: ["yesterday", "用過去式 saw"], result: "不說 have seen yesterday" },
  ]),
  "en9a-u02-kp1": fig("since／for、ever／never", [
    "since 是從何時開始。",
    "for 是多久。",
    "How long have you ...?",
    "ever 曾經，never 從未。",
  ], [
    { boxes: ["since 2020 起點", "for 3 years 一段"] },
    { boxes: ["How long", "have you lived here?"], hot: 0 },
    { boxes: ["since Monday", "for two days"], result: "起點用 since" },
    { boxes: ["Have you ever", "been to Tainan?"], result: "曾經去過嗎" },
  ]),
  "en9a-u03-kp1": fig("被動語態", [
    "被動：be + 過去分詞。",
    "現在 is／are，過去 was／were。",
    "by 後面是做這件事的人。",
    "原來的受詞變成新主詞。",
  ], [
    { boxes: ["The boy broke the window", "主動"] },
    { boxes: ["The window", "was broken"], hot: 1 },
    { boxes: ["The window was broken", "by the boy"], result: "被動加上 by" },
    { boxes: ["The rooms are cleaned", "every day"], result: "現在被動" },
  ]),
  "en9a-u04-kp1": fig("關係代名詞 who", [
    "who 接在人後面。",
    "who 後面有動詞。",
    "先找到 who 修飾的那個人。",
    "東西不用 who。",
  ], [
    { boxes: ["the boy", "who is tall", "is Tom"] },
    { boxes: ["who", "has a dog"], hot: 0 },
    { boxes: ["The girl who won", "is my sister"], result: "贏的那個女孩" },
    { boxes: ["people who help others", "are kind"], result: "幫助別人的人" },
  ]),
  "en9a-u05-kp1": fig("which／that", [
    "which 接東西。",
    "that 人事物都可以。",
    "關係詞緊貼在名詞後面。",
    "桌上的那本書：the book which is on the desk。",
  ], [
    { boxes: ["人 who／that", "物 which／that"] },
    { boxes: ["the book", "which is on the desk"], hot: 1 },
    { boxes: ["the dog that", "is brown"], result: "棕色的那隻狗" },
    { boxes: ["the girl that", "you met"], result: "that 也可以指人" },
  ]),
  "en9a-u06-kp1": fig("if 條件句", [
    "If + 現在式，結果用 will。",
    "if 裡面不放 will。",
    "If 在前面要逗號。",
    "還沒發生的假設用這個句型。",
  ], [
    { boxes: ["If + 現在式", "will + 原形"] },
    { boxes: ["If it rains", "不要 will"], hot: 0 },
    { boxes: ["If it rains,", "I will stay home"], result: "逗號在 If 子句後面" },
    { boxes: ["I will call you", "if I am free"], result: "放後面不加逗號" },
  ]),
  "en9a-u07-kp1": fig("附加問句", [
    "前肯後否，前否後肯。",
    "後面用代名詞。",
    "be、can、do 要和前面同一族。",
    "I am ..., aren't I?",
  ], [
    { boxes: ["前面肯定", "後面否定"] },
    { boxes: ["She likes cats", "doesn't she?"], hot: 1 },
    { boxes: ["You aren't late", "are you?"], result: "前面有 not，後面用肯定" },
    { boxes: ["I am right", "aren't I?"], result: "I am 的特別問法" },
  ]),
  "en9a-u08-kp1": fig("感嘆句 How／What", [
    "How + 形容詞。",
    "What + a／an + 名詞。",
    "不可數名詞不加 a。",
    "先看驚嘆的是性質還是東西。",
  ], [
    { boxes: ["How + 形容詞", "What + 名詞"] },
    { boxes: ["How tall", "she is!"], hot: 0 },
    { boxes: ["What a cute dog", "it is!"], result: "a dog 是單數名詞" },
    { boxes: ["What nice weather", "it is!"], result: "weather 不加 a" },
  ]),
  "en9a-u09-kp1": fig("故事裡的單字", [
    "story、hero、village、dream。",
    "brave、kind、suddenly、finally。",
    "suddenly 突然，finally 最後。",
    "heroes 是 hero 的複數。",
  ], [
    { boxes: ["story 故事", "hero 英雄", "village 村莊"] },
    { boxes: ["suddenly 突然", "finally 最後"], hot: 0 },
    { boxes: ["a brave hero", "in the village"], result: "村裡的勇敢英雄" },
    { boxes: ["Finally,", "they found the map"], result: "最後找到了" },
  ]),
  "en9b-u01-kp1": fig("so...that", [
    "so + 形容詞 + that + 結果。",
    "that 後面是完整的一句。",
    "太燙所以不能吃。",
    "so that 連寫是「為了」。",
  ], [
    { boxes: ["so + 形容詞", "that + 結果"] },
    { boxes: ["so hot", "that I can't eat it"], hot: 0 },
    { boxes: ["He ran so fast", "that we couldn't catch him"], result: "快到我們追不上" },
    { boxes: ["so that", "中間沒有形容詞", "為了"], result: "I study so that I can pass." },
  ]),
  "en9b-u02-kp1": fig("not only...but also", [
    "不但…而且…。",
    "動詞看後面的 B。",
    "兩邊都是動詞，或兩邊都是名詞。",
    "A 和 B 要對稱。",
  ], [
    { boxes: ["not only A", "but also B"] },
    { boxes: ["動詞跟", "B 走"], hot: 1 },
    { boxes: ["Not only you but also he", "is right"], result: "靠近 he，用 is" },
    { boxes: ["She not only sings", "but also dances"], result: "兩邊都是動詞" },
  ]),
  "en9b-u03-kp1": fig("used to", [
    "used to + 原形：以前。",
    "不加 s。",
    "be used to + V-ing：習慣。",
    "有沒有 be，意思不一樣。",
  ], [
    { boxes: ["used to + 原形", "以前"] },
    { boxes: ["be used to", "+ V-ing"], hot: 0 },
    { boxes: ["I used to", "live in Tainan"], result: "以前住台南" },
    { boxes: ["I am used to", "getting up early"], result: "現在習慣早起" },
  ]),
  "en9b-u04-kp1": fig("使役動詞 make／let", [
    "make／let + 人 + 原形。",
    "不加 to。",
    "make 比較像使，let 是讓。",
    "make + 人 + 形容詞，表示造成心情。",
  ], [
    { boxes: ["make + 人 + 原形", "不加 to"] },
    { boxes: ["let me", "try"], hot: 1 },
    { boxes: ["The story made", "her sad"], result: "使她難過" },
    { boxes: ["Don't let him", "go out"], result: "不要讓他出去" },
  ]),
  "en9b-u05-kp1": fig("連綴動詞", [
    "五個感官動詞。",
    "後面放形容詞。",
    "sweet、nice 是形容詞。",
    "不要加 ly。",
  ], [
    { boxes: ["look", "sound", "taste", "smell", "feel"] },
    { boxes: ["tastes", "sweet"], hot: 1 },
    { boxes: ["You look", "tired"], result: "tired 是形容詞" },
    { boxes: ["It sounds", "nice"], result: "不是 nicely" },
  ]),
  "en9b-u06-kp1": fig("間接問句", [
    "放進去之後，主詞在動詞前面。",
    "where he is，不是 where is he。",
    "拿掉 do／does。",
    "是否，用 if 或 whether。",
  ], [
    { boxes: ["Where is he?", "where he is"] },
    { boxes: ["Do you know", "where he is?"], hot: 1 },
    { boxes: ["what this word", "means"], result: "不是 what does it mean" },
    { boxes: ["if she", "is at home"], result: "Do you know if she is at home?" },
  ]),
  "en9b-u07-kp1": fig("分詞當形容詞", [
    "-ing：令人怎樣。",
    "-ed：人感到怎樣。",
    "interesting 對 interested。",
    "先看主詞是人還是事物。",
  ], [
    { boxes: ["boring 令人無聊", "bored 感到無聊"] },
    { boxes: ["The movie is", "boring"], hot: 1 },
    { boxes: ["I am", "bored"], result: "人用 bored" },
    { boxes: ["exciting news", "excited students"], result: "新聞令人興奮，學生感到興奮" },
  ]),
  "en9b-u08-kp1": fig("時態怎麼選", [
    "習慣：現在簡單。正在：進行式。",
    "過去的時間：過去式。",
    "already、for、since：完成式。",
    "先圈時間詞。",
  ], [
    { boxes: ["every day 現在簡單", "now 進行式"] },
    { boxes: ["yesterday 過去", "tomorrow will"], hot: 0 },
    { boxes: ["already", "have／has + 過去分詞"], result: "已經" },
    { boxes: ["for three years", "現在完成"], result: "一段時間到現在" },
  ]),
  "en9b-u09-kp1": fig("新聞與環境單字", [
    "news 不可數。",
    "environment、earth、protect。",
    "recycle、plastic、reduce。",
    "reduce plastic，protect the earth。",
  ], [
    { boxes: ["news 新聞", "不可數"] },
    { boxes: ["recycle 回收", "reduce 減少"], hot: 0 },
    { boxes: ["protect", "the earth"], result: "保護地球" },
    { boxes: ["reduce plastic", "to protect the environment"], result: "少用塑膠以保護環境" },
  ]),
};
