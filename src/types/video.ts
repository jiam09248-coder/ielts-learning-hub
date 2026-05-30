export interface VideoTags {
  difficulty: 'easy' | 'medium' | 'hard';
  speed: 'slow' | 'normal' | 'fast';
  durationTag: 'short' | 'medium' | 'long';
}

export interface VideoMeta {
  id: string;
  title: string;
  duration: number;
  videoUrl: string;
  dataUrl: string;
  thumbnail?: string;
  tags: VideoTags;
}

export interface Paragraph {
  id: number;
  startTime: number;
  endTime: number;
  english: string;
  chinese: string;
  parse?: ParagraphParse;
}

export interface ParagraphParse {
  grammar: string;
  collocations: string[];
  contextAnalysis: string;
}

export interface Expression {
  text: string;
  meaning: string;
  usage: string;
  contextUsage: string;
  example: string;
}

export interface VideoContent {
  meta: VideoMeta;
  summary: string;
  paragraphs: Paragraph[];
  expressions: Expression[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  videos: VideoMeta[];
}

export interface Phase {
  id: string;
  title: string;
  categories: Category[];
}

export interface ContentIndex {
  phases: Phase[];
}
