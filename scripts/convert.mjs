#!/usr/bin/env node

/**
 * 将 Video Echo 生成的 JSON 转换为 IELTS Learning Hub 前端需要的 TS 数据文件。
 *
 * 用法:
 *   node scripts/convert.mjs <echo-json-path> [video-id] [video-file]
 *
 * 示例:
 *   node scripts/convert.mjs ~/video-echo/public/downloads/xxx.json video-001 "/videos/video-001.mp4"
 *
 * 输出:
 *   src/data/<video-id>.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DATA = path.resolve(__dirname, '..', 'src', 'data');

const args = process.argv.slice(2);
const echoJsonPath = args[0];

if (!echoJsonPath) {
  console.error('错误: 请指定 Video Echo JSON 文件路径');
  console.error('用法: node scripts/convert.mjs <echo-json-path> [video-id] [video-file]');
  process.exit(1);
}

// --- 读取源 JSON ---
let src;
try {
  src = JSON.parse(fs.readFileSync(echoJsonPath, 'utf-8'));
} catch (e) {
  console.error('无法读取 JSON 文件:', e.message);
  process.exit(1);
}

// --- 提取数据 ---
const title = src.metadata?.title || src.title || '未命名视频';
const duration = src.metadata?.duration || src.duration || 0;
const videoId = args[1] || src.id || 'video-001';
const videoUrl = args[2] || `/videos/${videoId}.mp4`;

// 难度 / 速度 / 时长标签（可以根据实际情况手动调整）
function guessDifficulty(dur) {
  if (dur < 180) return 'easy';
  if (dur < 600) return 'medium';
  return 'hard';
}
function guessSpeed(dur) {
  if (dur < 300) return 'slow';
  if (dur < 600) return 'normal';
  return 'fast';
}
function guessDurationTag(dur) {
  if (dur < 180) return 'short';
  if (dur < 600) return 'medium';
  return 'long';
}

// --- 字幕段落 ---
const segments = src.transcription?.segments || [];
const paragraphs = segments.map((seg, i) => ({
  id: i + 1,
  startTime: seg.start || 0,
  endTime: seg.end || 0,
  english: (seg.text || '').trim(),
  chinese: (seg.translation || '').trim(),
}));

// --- 总结 ---
let summary = '';
if (typeof src.summary === 'string') {
  summary = src.summary;
} else if (src.summary) {
  const parts = [];
  if (src.summary.english) parts.push(src.summary.english);
  if (src.summary.chinese) parts.push(src.summary.chinese);
  summary = parts.join('\n\n');
}

// --- 地道表达 ---
const expressions = (src.expressions || []).map((ex) => ({
  text: ex.text || '',
  original: ex.original || ex.surface || '',
  meaning: ex.meaning || '',
  usage: ex.usage || '',
  topic: ex.topic || '',
  example: ex.example || '',
}));

// --- 生成 TS 文件 ---
const tsContent = `import type { VideoContent } from '../types/video';

export const videoData: VideoContent = {
  meta: {
    id: '${videoId}',
    title: '${title.replace(/'/g, "\\'")}',
    duration: ${duration},
    videoUrl: '${videoUrl}',
    dataUrl: '',
    tags: {
      difficulty: '${guessDifficulty(duration)}',
      speed: '${guessSpeed(duration)}',
      durationTag: '${guessDurationTag(duration)}',
    },
  },
  summary: \`${summary.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
  paragraphs: ${JSON.stringify(paragraphs, null, 2)},
  expressions: ${JSON.stringify(expressions, null, 2)},
};
`;

const outPath = path.join(SRC_DATA, `${videoId}.ts`);
if (!fs.existsSync(SRC_DATA)) fs.mkdirSync(SRC_DATA, { recursive: true });
fs.writeFileSync(outPath, tsContent, 'utf-8');

console.log('');
console.log(`✅ 转换完成！`);
console.log(`   源文件: ${echoJsonPath}`);
console.log(`   输出:   ${outPath}`);
console.log(`   标题:   ${title}`);
console.log(`   字幕段: ${paragraphs.length} 条`);
console.log(`   表达:   ${expressions.length} 条`);
console.log(`   时长:   ${duration}s (${Math.floor(duration / 60)}m${duration % 60}s)`);
console.log('');
console.log('⚠️  注意: 语法解析(parse) 未自动生成，需要手动或用 AI 补充。');
console.log('   paragraphs 中的 parse 字段目前为空，你可以：');
console.log('   1. 不填 → 解析按钮不显示');
console.log('   2. 手动为关键句子添加 parse.grammar / parse.collocations / parse.contextAnalysis');
console.log('   3. 用大模型逐句生成解析');
console.log('');
console.log('接下来需要:');
console.log(`   1. 把视频文件放入 public/videos/`);
console.log(`   2. 修改 src/pages/LessonPage.tsx 中的 import，指向新的数据文件`);
console.log(`   3. 刷新页面`);
