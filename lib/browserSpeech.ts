/** Browser speech. Chinese explains the step; English is the sentence to shadow. */

let speakToken = 0;

function ready(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  return window.speechSynthesis;
}

export function stopSpeaking(): void {
  speakToken += 1;
  ready()?.cancel();
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => /en-US/i.test(voice.lang) && /natural|neural|aria|jenny|guy|google/i.test(voice.name)) ||
    voices.find((voice) => /en-US/i.test(voice.lang)) ||
    voices.find((voice) => /^en([-_]|$)/i.test(voice.lang))
  );
}

function queue(
  chunks: { text: string; lang: string; rate: number; voice?: SpeechSynthesisVoice }[],
): void {
  const synth = ready();
  if (!synth || chunks.length === 0) return;
  const mine = ++speakToken;
  synth.cancel();
  window.setTimeout(() => {
    if (mine !== speakToken) return;
    const current = ready();
    if (!current) return;
    for (const chunk of chunks) {
      const utter = new SpeechSynthesisUtterance(chunk.text);
      utter.lang = chunk.lang;
      utter.rate = chunk.rate;
      if (chunk.voice) utter.voice = chunk.voice;
      current.speak(utter);
    }
  }, 60);
}

export function speakChinese(text: string): void {
  const line = text.trim();
  if (!line) return;
  queue([{ text: line, lang: "zh-TW", rate: 0.92 }]);
}

export function speakEnglish(text: string): void {
  const chunks = text
    .split(/(?<=[.?!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!chunks.length) return;
  const voice = pickEnglishVoice(ready()?.getVoices() ?? []);
  queue(chunks.map((line) => ({ text: line, lang: "en-US", rate: 0.78, voice })));
}

export function primeVoices(): void {
  const synth = ready();
  if (!synth) return;
  synth.getVoices();
}
