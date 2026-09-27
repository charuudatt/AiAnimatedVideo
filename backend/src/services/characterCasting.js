// Lightweight keyword-based "casting director": scans a scene's narration text
// and decides which stylized vector characters should appear and what they're
// doing, so the video shows illustrated characters acting out the story
// instead of just captions on a background.

const CHARACTER_KEYWORDS = {
  ganesha: { kind: "deity", variant: "elephant" },
  ganesh: { kind: "deity", variant: "elephant" },
  shiva: { kind: "deity", variant: "multiarm" },
  vishnu: { kind: "deity", variant: "multiarm" },
  krishna: { kind: "deity", variant: "multiarm" },
  god: { kind: "deity", variant: "generic" },
  goddess: { kind: "deity", variant: "generic" },
  lord: { kind: "deity", variant: "generic" },
  kubera: { kind: "person", variant: "king" },
  king: { kind: "person", variant: "king" },
  prince: { kind: "person", variant: "king" },
  queen: { kind: "person", variant: "queen" },
  princess: { kind: "person", variant: "queen" },
  child: { kind: "person", variant: "child" },
  boy: { kind: "person", variant: "child" },
  girl: { kind: "person", variant: "child" },
  kid: { kind: "person", variant: "child" },
  man: { kind: "person", variant: "man" },
  father: { kind: "person", variant: "man" },
  husband: { kind: "person", variant: "man" },
  woman: { kind: "person", variant: "woman" },
  mother: { kind: "person", variant: "woman" },
  wife: { kind: "person", variant: "woman" },
  warrior: { kind: "person", variant: "warrior" },
  soldier: { kind: "person", variant: "warrior" },
  general: { kind: "person", variant: "warrior" },
  guard: { kind: "person", variant: "warrior" },
  sage: { kind: "person", variant: "sage" },
  priest: { kind: "person", variant: "sage" },
  monk: { kind: "person", variant: "sage" },
  saint: { kind: "person", variant: "sage" },
  farmer: { kind: "person", variant: "man" },
  merchant: { kind: "person", variant: "man" },
  elephant: { kind: "animal", variant: "elephant" },
  cow: { kind: "animal", variant: "cow" },
  lion: { kind: "animal", variant: "lion" },
  tiger: { kind: "animal", variant: "lion" },
  bird: { kind: "animal", variant: "bird" },
  eagle: { kind: "animal", variant: "bird" },
  peacock: { kind: "animal", variant: "bird" },
  snake: { kind: "animal", variant: "snake" },
  serpent: { kind: "animal", variant: "snake" },
  monkey: { kind: "animal", variant: "monkey" },
  dog: { kind: "animal", variant: "dog" },
  cat: { kind: "animal", variant: "cat" },
  horse: { kind: "animal", variant: "horse" },
  deer: { kind: "animal", variant: "deer" },
  rabbit: { kind: "animal", variant: "rabbit" },
};

const ACTION_KEYWORDS = {
  eat: "eating",
  eats: "eating",
  ate: "eating",
  eating: "eating",
  hungry: "eating",
  feed: "eating",
  walk: "walking",
  walks: "walking",
  walked: "walking",
  arrived: "walking",
  went: "walking",
  ran: "walking",
  run: "walking",
  running: "walking",
  talk: "talking",
  talks: "talking",
  talked: "talking",
  said: "talking",
  speak: "talking",
  spoke: "talking",
  told: "talking",
  warn: "talking",
  warned: "talking",
  asked: "talking",
  replied: "talking",
  welcome: "talking",
  give: "giving",
  gave: "giving",
  giving: "giving",
  offered: "giving",
  offer: "giving",
  handed: "giving",
  sit: "sitting",
  sat: "sitting",
  sitting: "sitting",
  fly: "flying",
  flew: "flying",
  flying: "flying",
  point: "pointing",
  points: "pointing",
  pointed: "pointing",
  fear: "scared",
  feared: "scared",
  terrified: "scared",
  scared: "scared",
  afraid: "scared",
  love: "loving",
  loved: "loving",
  embraced: "loving",
  hugged: "loving",
  think: "thinking",
  thought: "thinking",
  wonder: "thinking",
  wondered: "thinking",
  fight: "fighting",
  fought: "fighting",
  attacked: "fighting",
  battled: "fighting",
  pray: "praying",
  prayed: "praying",
  praying: "praying",
  worship: "praying",
  worshipped: "praying",
  bowed: "praying",
  dance: "dancing",
  danced: "dancing",
  dancing: "dancing",
  celebrated: "dancing",
  jump: "jumping",
  jumped: "jumping",
  leapt: "jumping",
  leaped: "jumping",
  sleep: "sleeping",
  slept: "sleeping",
  sleeping: "sleeping",
  rested: "sleeping",
  cry: "crying",
  cried: "crying",
  crying: "crying",
  wept: "crying",
  laugh: "laughing",
  laughed: "laughing",
  laughing: "laughing",
  smiled: "laughing",
  chased: "walking",
  fled: "walking",
  fleeing: "walking",
  rushed: "walking",
};

const PRONOUNS = new Set([
  "he",
  "she",
  "him",
  "her",
  "they",
  "them",
  "it",
  "himself",
  "herself",
  "itself",
  "themselves",
  "his",
  "their",
]);

const PROP_KEYWORDS = {
  food: "food",
  dinner: "food",
  meal: "food",
  feast: "food",
  furniture: "food",
  bowl: "food",
  water: "water",
  mountain: "mountain",
  hill: "mountain",
  tree: "tree",
  forest: "tree",
  sun: "sun",
  moon: "moon",
  night: "moon",
  stars: "moon",
  fire: "fire",
  house: "house",
  home: "house",
  temple: "house",
  palace: "house",
};

const NAMED_KEYS = new Set(["ganesha", "ganesh", "shiva", "vishnu", "krishna", "kubera"]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []).map((w) => w.replace(/'s$/, ""));
}

function lookupCharacterKey(word) {
  if (CHARACTER_KEYWORDS[word]) return word;
  if (word.endsWith("s") && CHARACTER_KEYWORDS[word.slice(0, -1)]) {
    return word.slice(0, -1);
  }
  return null;
}

function signatureOf(def) {
  return `${def.kind}:${def.variant}`;
}

export function castScene(text, previousCharacters = []) {
  const tokens = tokenize(text);

  // Named characters (Ganesha, Shiva, Kubera...) take priority over generic
  // role nouns (king, god, man...) so a sentence like "Kubera the king" isn't
  // miscounted as two different people crowding out an actual second
  // character mentioned later in the same scene.
  const foundCharacters = [];
  const seenSignatures = new Set();

  const collect = (predicate) => {
    for (const token of tokens) {
      if (foundCharacters.length >= 2) return;
      const key = lookupCharacterKey(token);
      if (!key || !predicate(key)) continue;
      const def = CHARACTER_KEYWORDS[key];
      const sig = signatureOf(def);
      if (seenSignatures.has(sig)) continue;
      seenSignatures.add(sig);
      foundCharacters.push(def);
    }
  };

  collect((key) => NAMED_KEYS.has(key));
  collect((key) => !NAMED_KEYS.has(key));

  let action = "idle";
  for (const token of tokens) {
    if (ACTION_KEYWORDS[token]) {
      action = ACTION_KEYWORDS[token];
      break;
    }
  }

  // "bowl"/"food" are vague filler nouns that often co-occur with a more
  // specific prop word (e.g. "bowl of water") — let the specific one win
  // regardless of which appears first in the sentence.
  let prop = null;
  let vaguePropFallback = null;
  for (const token of tokens) {
    const match = PROP_KEYWORDS[token];
    if (!match) continue;
    if (match === "food" && (token === "bowl" || token === "furniture")) {
      vaguePropFallback = vaguePropFallback || match;
      continue;
    }
    prop = match;
    break;
  }
  prop = prop || vaguePropFallback;

  if (foundCharacters.length === 0) {
    // No named/role keyword in this scene — if it reads as a continuation
    // ("he arrived...", "they fled...") reuse whoever was on screen last
    // instead of dropping to a generic stand-in.
    const hasPronoun = tokens.some((t) => PRONOUNS.has(t));
    if (hasPronoun && previousCharacters.length > 0) {
      return {
        characters: previousCharacters.map((c, i) => ({
          kind: c.kind,
          variant: c.variant,
          pose: i === 0 ? action : action === "talking" ? "talking" : "idle",
          position: previousCharacters.length === 2 ? (i === 0 ? "left" : "right") : "center",
        })),
        prop,
      };
    }

    return {
      characters: [
        { kind: "person", variant: "generic", pose: action === "idle" ? "talking" : action, position: "center" },
      ],
      prop,
    };
  }

  if (foundCharacters.length === 1) {
    return {
      characters: [{ ...foundCharacters[0], pose: action, position: "center" }],
      prop,
    };
  }

  return {
    characters: [
      { ...foundCharacters[0], pose: action, position: "left" },
      { ...foundCharacters[1], pose: action === "talking" ? "talking" : "idle", position: "right" },
    ],
    prop,
  };
}
