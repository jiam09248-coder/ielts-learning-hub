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
  collocations: { phrase: string; meaning: string }[];
  contextAnalysis: string;
}

export interface Expression {
  pattern: string;   // 句型模板：同时也是高亮匹配文本
  meaning: string;   // 中文意思
  usage: string;     // 用法说明
  topic: string;     // 雅思话题
  example: string;   // 仿写例句
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
