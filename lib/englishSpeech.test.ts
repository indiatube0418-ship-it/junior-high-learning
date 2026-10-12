import test from "node:test";
import assert from "node:assert/strict";
import { englishFromQuestion, englishFromStep } from "./englishSpeech.ts";

test("句子結果只唸英文那一句", () => {
  assert.equal(
    englishFromStep({
      boxes: ["This", "is", "a pen"],
      result: "This is a pen.",
      caption: "I am Mia. 就是「我是 Mia」。",
    }),
    "This is a pen.",
  );
});

test("大小寫對照只留正確的那一句", () => {
  assert.equal(
    englishFromStep({
      boxes: ["i am mia", "I am Mia"],
      caption: "開頭大寫，I 和人名也大寫。",
    }),
    "I am Mia.",
  );
});

test("半句接起來唸", () => {
  assert.equal(
    englishFromStep({
      boxes: ["She doesn't", "like cats"],
    }),
    "She doesn't like cats.",
  );
  assert.equal(
    englishFromStep({
      boxes: ["He never", "eats candy"],
      result: "他從不吃糖",
    }),
    "He never eats candy.",
  );
});

test("對照句分開唸", () => {
  assert.equal(
    englishFromStep({
      boxes: ["I walk", "She walks"],
    }),
    "I walk. She walks.",
  );
  assert.equal(
    englishFromStep({
      boxes: ["a student", "two students"],
    }),
    "a student. two students.",
  );
});

test("單字分開唸", () => {
  assert.equal(
    englishFromStep({
      boxes: ["student 學生", "teacher 老師", "classroom 教室"],
    }),
    "student. teacher. classroom.",
  );
  assert.equal(
    englishFromStep({
      boxes: ["always", "usually", "often", "sometimes", "never"],
    }),
    "always. usually. often. sometimes. never.",
  );
});

test("對照箭頭分成幾句", () => {
  assert.equal(
    englishFromStep({
      boxes: ["I → am", "he／she／it → is", "you／we／they → are"],
    }),
    "I am. he, she, it is. you, we, they are.",
  );
  assert.equal(
    englishFromStep({
      boxes: ["go → went", "eat → ate", "see → saw"],
    }),
    "go, went. eat, ate. see, saw.",
  );
});

test("沒有英文就不唸", () => {
  assert.equal(
    englishFromStep({
      boxes: ["從左邊開始", "一個字一個字往右"],
      caption: "先從左邊讀到右邊。",
    }),
    "",
  );
});

test("說明裡的英文可以補上", () => {
  assert.equal(
    englishFromStep({
      boxes: ["講完一件事"],
      caption: "I am Mia. 就是「我是 Mia」。",
    }),
    "I am Mia.",
  );
});

test("題目唸選項，空格題不唸破掉的題幹", () => {
  assert.equal(
    englishFromQuestion("I ___ a student.", ["is", "am", "are", "be"]),
    "is. am. are. be.",
  );
  assert.equal(
    englishFromQuestion("哪一句的大小寫是對的？", [
      "i am mia.",
      "I am mia.",
      "I am Mia.",
      "i am Mia.",
    ]),
    "I am Mia.",
  );
});

test("題幹裡的範例句會先唸", () => {
  assert.equal(
    englishFromQuestion("He is too young to drive. 哪一句意思最接近？", [
      "He is so young that he can drive.",
      "He is so young that he can't drive.",
    ]),
    "He is too young to drive. He is so young that he can drive. He is so young that he can't drive.",
  );
});
