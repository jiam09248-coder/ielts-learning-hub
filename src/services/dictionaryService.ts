import { FREE_DICT_API } from '../constants';
import type { DictionaryEntry, DictionaryMeaning } from '../types/dictionary';

interface EcdictRow {
  w: string;
  p?: string;
  t?: string;
  d?: string;
  pos?: string;
  c?: number;
  o?: number;
  tag?: string;
  f?: number;
  x?: string;
}

interface FreeDictionaryDefinition {
  definition?: string;
  example?: string;
}

interface FreeDictionaryMeaning {
  partOfSpeech?: string;
  definitions?: FreeDictionaryDefinition[];
}

interface FreeDictionaryPhonetic {
  text?: string;
}

interface FreeDictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
  meanings?: FreeDictionaryMeaning[];
}

type DictionaryMap = Map<string, EcdictRow>;

let lessonDictionaryPromise: Promise<DictionaryMap> | null = null;
let fullDictionaryPromise: Promise<DictionaryMap> | null = null;
const dictionaryRootIndexes = new WeakMap<DictionaryMap, Map<string, EcdictRow>>();
const wordResultCache = new Map<string, DictionaryEntry | null>();
const wordRequestCache = new Map<string, Promise<DictionaryEntry | null>>();
const WORD_CACHE_KEY = 'ielts_hub_dictionary_cache_v2';

const LESSON_DICTIONARY_URLS = [
  '/dictionaries/home-accommodation-ecdict.json',
  'https://cdn.jsdelivr.net/gh/jiam09248-coder/ielts-learning-hub@deploy-dist/dictionaries/home-accommodation-ecdict.json',
];

const FULL_DICTIONARY_URLS = [
  '/dictionaries/ecdict-compact.json',
  'https://cdn.jsdelivr.net/gh/jiam09248-coder/ielts-learning-hub@deploy-dist/dictionaries/ecdict-compact.json',
];

const CURATED_ENTRIES: Record<string, DictionaryEntry> = {
  coastal: {
    word: 'coastal',
    phonetic: '/ˈkoʊstəl/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'adj', definitions: [{ definition: '沿海的；海岸的', example: 'a coastal town' }] }],
    englishDefinitions: ['located on or near a coast'],
  },
  iconic: {
    word: 'iconic',
    phonetic: '/aɪˈkɑːnɪk/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'adj', definitions: [{ definition: '标志性的；具有代表性的', example: 'an iconic building' }] }],
    englishDefinitions: ['widely recognized and strongly associated with a place, brand, or idea'],
  },
  vibrant: {
    word: 'vibrant',
    phonetic: '/ˈvaɪbrənt/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'adj', definitions: [{ definition: '充满活力的；鲜艳的；热闹的', example: 'a vibrant arts scene' }] }],
    englishDefinitions: ['full of energy, color, or activity'],
  },
  commercialized: {
    word: 'commercialized',
    phonetic: '/kəˈmɝːʃəlaɪzd/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'adj', definitions: [{ definition: '商业化的', example: 'The area has become too commercialized.' }] }],
    englishDefinitions: ['changed to focus strongly on making money'],
  },
  skyrocketed: {
    word: 'skyrocketed',
    phonetic: '/ˈskaɪrɑːkɪtɪd/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: '飞涨；猛增', example: 'Prices have skyrocketed.' }] }],
    englishDefinitions: ['increased very quickly'],
  },
  belonging: {
    word: 'belonging',
    phonetic: '/bɪˈlɔːŋɪŋ/',
    source: 'local',
    tags: ['ielts'],
    meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: '归属感；属于某群体的感觉', example: 'a sense of belonging' }] }],
    englishDefinitions: ['the feeling of being accepted as part of a group or place'],
  },
};

export function normalizeLookupWord(word: string) {
  return word
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '')
    .toLowerCase();
}

async function loadDictionary(urls: string[]) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) continue;

      const rows = (await response.json()) as EcdictRow[];
      if (!Array.isArray(rows)) continue;

      return new Map(rows.map((row) => [row.w, row]));
    } catch {
      // Try the next dictionary source.
    }
  }

  throw new Error('Local dictionary unavailable');
}

async function loadLessonDictionary() {
  if (!lessonDictionaryPromise) lessonDictionaryPromise = loadDictionary(LESSON_DICTIONARY_URLS);
  return lessonDictionaryPromise;
}

async function loadFullDictionary() {
  if (!fullDictionaryPromise) fullDictionaryPromise = loadDictionary(FULL_DICTIONARY_URLS);
  return fullDictionaryPromise;
}

export function preloadLessonDictionary() {
  void loadLessonDictionary().catch(() => undefined);
}

function getSimpleCandidates(word: string) {
  const candidates = new Set([word]);

  if (word.endsWith('ies') && word.length > 4) candidates.add(`${word.slice(0, -3)}y`);
  if (word.endsWith('ied') && word.length > 4) candidates.add(`${word.slice(0, -3)}y`);
  if (word.endsWith('ing') && word.length > 5) {
    const base = word.slice(0, -3);
    candidates.add(base);
    candidates.add(`${base}e`);
    if (/([b-df-hj-np-tv-z])\1$/i.test(base)) candidates.add(base.slice(0, -1));
  }
  if (word.endsWith('ed') && word.length > 4) {
    const base = word.slice(0, -2);
    candidates.add(base);
    candidates.add(`${base}e`);
    if (/([b-df-hj-np-tv-z])\1$/i.test(base)) candidates.add(base.slice(0, -1));
  }
  if (word.endsWith('es') && word.length > 4) candidates.add(word.slice(0, -2));
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) candidates.add(word.slice(0, -1));

  return [...candidates];
}

function getExchangeRoots(exchange?: string) {
  if (!exchange) return [];

  return exchange
    .split('/')
    .map((part) => part.split(':'))
    .filter(([kind]) => kind === '0')
    .map(([, value]) => value)
    .filter(Boolean);
}

function getRootIndex(dictionary: DictionaryMap) {
  const cached = dictionaryRootIndexes.get(dictionary);
  if (cached) return cached;

  const index = new Map<string, EcdictRow>();
  for (const row of dictionary.values()) {
    for (const root of getExchangeRoots(row.x)) {
      if (!index.has(root)) index.set(root, row);
    }
  }
  dictionaryRootIndexes.set(dictionary, index);
  return index;
}

function splitDefinitions(text?: string) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function rowToEntry(row: EcdictRow, displayedWord: string): DictionaryEntry {
  const definitions = splitDefinitions(row.t);
  const englishDefinitions = splitDefinitions(row.d);
  const tags = (row.tag || '').split(/\s+/).filter(Boolean);
  const partOfSpeech = row.pos || definitions[0]?.match(/^([a-z.]+)\s/)?.[1]?.replace(/\.$/, '') || '';

  const meanings: DictionaryMeaning[] = [
    {
      partOfSpeech,
      definitions: definitions.length
        ? definitions.map((definition) => ({ definition }))
        : englishDefinitions.slice(0, 2).map((definition) => ({ definition })),
    },
  ];

  return {
    word: displayedWord || row.w,
    phonetic: row.p ? `/${row.p.replace(/^\/|\/$/g, '')}/` : '',
    meanings,
    source: 'local',
    tags,
    frequency: row.f || undefined,
    collins: row.c || undefined,
    englishDefinitions,
  };
}

function lookupInDictionary(dictionary: DictionaryMap, word: string) {
  const directCandidates = getSimpleCandidates(word);

  for (const candidate of directCandidates) {
    const curated = CURATED_ENTRIES[candidate];
    if (curated) return { ...curated, word };

    const row = dictionary.get(candidate);
    if (row) return rowToEntry(row, word);
  }

  const rootIndex = getRootIndex(dictionary);
  for (const candidate of directCandidates) {
    const row = rootIndex.get(candidate);
    if (row) return rowToEntry(row, word);
  }

  return null;
}

async function lookupLocal(word: string) {
  const lessonDictionary = await loadLessonDictionary();
  const lessonEntry = lookupInDictionary(lessonDictionary, word);
  if (lessonEntry) return lessonEntry;

  const fullDictionary = await loadFullDictionary();
  return lookupInDictionary(fullDictionary, word);
}

function readStoredWord(word: string) {
  if (wordResultCache.has(word)) return { found: true, value: wordResultCache.get(word) || null };
  if (typeof window === 'undefined') return { found: false, value: null };

  try {
    const raw = window.sessionStorage.getItem(WORD_CACHE_KEY);
    const stored = raw ? JSON.parse(raw) as Record<string, DictionaryEntry | null> : {};
    if (Object.prototype.hasOwnProperty.call(stored, word)) {
      wordResultCache.set(word, stored[word]);
      return { found: true, value: stored[word] || null };
    }
  } catch {
    // Ignore unavailable or malformed browser storage.
  }

  return { found: false, value: null };
}

function storeWord(word: string, entry: DictionaryEntry | null) {
  wordResultCache.set(word, entry);
  if (typeof window === 'undefined') return;

  try {
    const raw = window.sessionStorage.getItem(WORD_CACHE_KEY);
    const stored = raw ? JSON.parse(raw) as Record<string, DictionaryEntry | null> : {};
    stored[word] = entry;
    window.sessionStorage.setItem(WORD_CACHE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore unavailable browser storage; memory cache still works.
  }
}

async function lookupFreeDictionary(word: string): Promise<DictionaryEntry | null> {
  const response = await fetch(`${FREE_DICT_API}/${encodeURIComponent(word)}`);
  if (!response.ok) return null;

  const json = await response.json();
  if (!Array.isArray(json) || !json.length) return null;

  const entry = json[0] as FreeDictionaryEntry;
  const meanings = (entry.meanings || []).map((meaning) => ({
    partOfSpeech: meaning.partOfSpeech || '',
    definitions: (meaning.definitions || []).slice(0, 3).map((definition) => ({
      definition: definition.definition || '',
      example: definition.example || '',
    })),
  }));

  return {
    word: entry.word || word,
    phonetic: entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || '',
    meanings,
    source: 'api',
  };
}

export async function lookupWord(word: string): Promise<DictionaryEntry | null> {
  const cleanWord = normalizeLookupWord(word);
  if (!cleanWord) return null;

  const cached = readStoredWord(cleanWord);
  if (cached.found) return cached.value;

  const inFlight = wordRequestCache.get(cleanWord);
  if (inFlight) return inFlight;

  const request = (async () => {
    const localEntry = await lookupLocal(cleanWord);
    if (localEntry) {
      storeWord(cleanWord, localEntry);
      return localEntry;
    }

    try {
      const apiEntry = await lookupFreeDictionary(cleanWord);
      storeWord(cleanWord, apiEntry);
      return apiEntry;
    } catch {
      storeWord(cleanWord, null);
      return null;
    }
  })();

  wordRequestCache.set(cleanWord, request);
  try {
    return await request;
  } finally {
    wordRequestCache.delete(cleanWord);
  }
}
