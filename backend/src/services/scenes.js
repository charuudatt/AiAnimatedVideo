// Splits raw input text into narration "scenes" — small chunks of 1-3 sentences
// each of which becomes one animated slide with its own narration audio.

import { castScene } from "./characterCasting.js";

const MAX_SENTENCES_PER_SCENE = 2;
const MAX_CHARS_PER_SCENE = 220;

function splitSentences(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const matches = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
  return matches.map((s) => s.trim()).filter(Boolean);
}

export function buildScenes(rawText) {
  const sentences = splitSentences(rawText);
  const scenes = [];
  let current = [];
  let currentLen = 0;

  let lastCharacters = [];

  const flush = () => {
    if (current.length === 0) return;
    const text = current.join(" ");
    const { characters, prop } = castScene(text, lastCharacters);
    lastCharacters = characters;
    scenes.push({ text, words: text.split(/\s+/).filter(Boolean), characters, prop });
    current = [];
    currentLen = 0;
  };

  for (const sentence of sentences) {
    const wouldBeLen = currentLen + sentence.length + 1;
    if (
      current.length > 0 &&
      (current.length >= MAX_SENTENCES_PER_SCENE || wouldBeLen > MAX_CHARS_PER_SCENE)
    ) {
      flush();
    }
    current.push(sentence);
    currentLen += sentence.length + 1;
  }
  flush();

  if (scenes.length === 0) {
    throw new Error("No narration text was provided.");
  }

  return scenes;
}
