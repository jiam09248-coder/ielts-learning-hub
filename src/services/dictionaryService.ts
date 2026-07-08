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

let localDictionaryPromise: Promise<Map<string, EcdictRow>> | null = null;

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

async function loadLocalDictionary() {
  if (!localDictionaryPromise) {
    localDictionaryPromise = fetch('/dictionaries/ecdict-compact.json')
      .then((response) => {
        if (!response.ok) throw new Error('Local dictionary unavailable');
        return response.json() as Promise<EcdictRow[]>;
      })
      .then((rows) => new Map(rows.map((row) => [row.w, row])));
  }

  return localDictionaryPromise;
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

async function lookupLocal(word: string) {
  const dictionary = await loadLocalDictionary();
  const directCandidates = getSimpleCandidates(word);

  for (const candidate of directCandidates) {
    const curated = CURATED_ENTRIES[candidate];
    if (curated) return { ...curated, word };

    const row = dictionary.get(candidate);
    if (row) return rowToEntry(row, word);
  }

  for (const row of dictionary.values()) {
    const roots = getExchangeRoots(row.x);
    if (roots.some((root) => directCandidates.includes(root))) return rowToEntry(row, word);
  }

  return null;
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

  const localEntry = await lookupLocal(cleanWord);
  if (localEntry) return localEntry;

  try {
    return await lookupFreeDictionary(cleanWord);
  } catch {
    return null;
  }
}
