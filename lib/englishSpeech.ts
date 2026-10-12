/** Pull the English a learner should hear from one lesson step. */

const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;

const GLUE = new Set([
  "i", "you", "he", "she", "it", "we", "they",
  "a", "an", "the",
  "is", "am", "are", "was", "were",
  "do", "does", "did",
  "my", "your", "his", "her", "its", "our", "their",
  "this", "that", "these", "those", "there",
]);

function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function latinPart(raw: string): string {
  const spaced = raw
    .replace(/[／/|]/g, ", ")
    .replace(/→|⇒|->/g, ", ")
    .replace(/[_]+/g, " ")
    .replace(new RegExp(CJK.source, "g"), " ")
    .replace(/[、，。！？；：「」『』（）()【】]/g, " ")
    .replace(/\+/g, " ")
    .replace(/[^A-Za-z0-9'’.,:?!\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/[A-Za-z]/.test(spaced)) return "";
  return spaced.replace(/\s+([,.!?])/g, "$1").replace(/\s+/g, " ").trim();
}

function finish(text: string): string {
  const trimmed = dropEchoes(text).replace(/\s+/g, " ").trim().replace(/\s+([,.!?])/g, "$1");
  if (!trimmed) return "";
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function keyOf(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function dedupe(parts: string[]): string[] {
  const out: string[] = [];
  for (const part of parts) {
    const key = keyOf(part);
    if (!key) continue;
    const index = out.findIndex((item) => keyOf(item) === key);
    if (index === -1) {
      out.push(part);
      continue;
    }
    const caps = (value: string) => (value.match(/[A-Z]/g) || []).length;
    if (caps(part) > caps(out[index])) out[index] = part;
  }
  return out;
}

function isNounPhrase(text: string): boolean {
  return /^(a|an|the|my|your|his|her|its|our|their|this|that|these|those|\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(text);
}

function dropEchoes(text: string): string {
  const bits = text.split(/(?<=[.?!])\s+/).map((part) => part.trim()).filter(Boolean);
  const kept: string[] = [];
  for (const bit of bits) {
    const key = keyOf(bit);
    if (!key) continue;
    if (kept.some((item) => {
      const prev = keyOf(item);
      return prev.includes(key) && prev !== key;
    })) continue;
    for (let index = kept.length - 1; index >= 0; index -= 1) {
      const prev = keyOf(kept[index]);
      if (key.includes(prev) && key !== prev) kept.splice(index, 1);
    }
    kept.push(bit);
  }
  return kept.join(" ");
}

function joinBoxes(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  const single = parts.every((part) => words(part).length === 1 && !/[.?!]/.test(part));
  if (
    single &&
    parts.length >= 3 &&
    !parts.some((part) => GLUE.has(part.toLowerCase().replace(/[^a-z']/g, "")))
  ) {
    return parts.join(". ");
  }
  if (parts.every((part) => isNounPhrase(part))) return parts.join(". ");
  if (parts.every((part) => /^(at|on|in|by)\b/i.test(part))) return parts.join(". ");
  const separateClauses =
    parts.every((part, index) => index === 0 || !/^[a-z]/.test(part)) &&
    parts.every((part) => words(part).length >= 2 || /[.?!]/.test(part));
  if (separateClauses) return parts.join(". ");
  return parts.join(" ");
}


const LINK = new Set(["am", "is", "are", "was", "were", "be"]);

function speakArrowBox(box: string): string {
  const sides = box.split(/→|⇒|->/);
  const left = latinPart(sides[0] || "");
  const right = sides.length > 1 ? latinPart(sides.slice(1).join(" ")) : "";
  if (!left) return right;
  if (!right) return left;
  if (left.includes(",") || LINK.has(right.toLowerCase())) return `${left} ${right}`;
  return `${left}, ${right}`;
}

export function englishFromStep(input: {
  boxes?: string[];
  result?: string;
  caption?: string;
}): string {
  const resultRaw = input.result?.trim() ?? "";
  const result = resultRaw ? latinPart(resultRaw) : "";
  if (result && !CJK.test(resultRaw)) return finish(result);

  const rawBoxes = input.boxes ?? [];
  const arrowBoxes = rawBoxes.filter((box) => /→|⇒|->/.test(box));
  if (arrowBoxes.length >= 2) {
    const pairs = dedupe(arrowBoxes.map(speakArrowBox).filter(Boolean));
    if (pairs.length) return finish(pairs.join(". "));
  }

  const boxes = dedupe(rawBoxes.map(latinPart).filter(Boolean));
  if (boxes.length) return finish(joinBoxes(boxes));
  if (result) return finish(result);

  const caption = input.caption ? latinPart(input.caption) : "";
  return caption ? finish(caption) : "";
}

export function englishFromQuestion(stem: string, options?: string[]): string {
  const fromStem = /_/.test(stem) ? "" : latinPart(stem);
  const stemLine = fromStem && words(fromStem).length >= 3 ? finish(fromStem) : "";
  const optionLines = dedupe(
    (options ?? []).map(latinPart).filter(Boolean).map(finish),
  ).filter((line) => keyOf(line) !== keyOf(stemLine));
  const chunks = [...(stemLine ? [stemLine] : []), ...optionLines];
  if (!chunks.length) return stemLine;
  return chunks.join(" ");
}
