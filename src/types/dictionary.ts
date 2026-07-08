export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
  audio?: string;
  source?: 'local' | 'api';
  tags?: string[];
  frequency?: number;
  collins?: number;
  englishDefinitions?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
  }[];
}
