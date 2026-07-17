#!/usr/bin/env node

/**
 * 将 Video Echo 生成的 JSON 转换为 IELTS Learning Hub 前端需要的 TS 数据文件。
 *
 * 同时自动从视频 URL 截取第 1 帧作为缩略图，并注册到 videoUrlMap.ts。
 *
 * 用法:
 *   node scripts/convert.mjs <echo-json-path> [video-id] [video-url]
 *
 * 示例:
 *   node scripts/convert.mjs ~/video-echo/public/downloads/xxx.json video-004 \
 *     "https://your-bucket.oss-cn-shanghai.aliyuncs.com/My%20Video.mp4"
 *
 * 输出:
 *   src/data/<video-id>.ts
 *   public/thumbnails/<video-id>.jpg   （自动截取）
 *   src/data/videoUrlMap.ts 中自动追加 video → url 和 thumbnail 映射
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DATA = path.join(ROOT, 'src', 'data');
const PUBLIC_THUMBS = path.join(ROOT, 'public', 'thumbnails');
const URL_MAP_FILE = path.join(SRC_DATA, 'videoUrlMap.ts');

const args = process.argv.slice(2);
const echoJsonPath = args[0];

if (!echoJsonPath) {
  console.error('错误: 请指定 Video Echo JSON 文件路径');
  console.error('用法: node scripts/convert.mjs <echo-json-path> [video-id] [video-url]');
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
const thumbnailPath = `/thumbnails/${videoId}.jpg`;

// 难度 / 速度 / 时长标签
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
const expressions = [];

// --- 生成 TS 文件 ---
const tsContent = `import type { VideoContent } from '../types/video';

export const videoData: VideoContent = {
  meta: {
    id: '${videoId}',
    title: '${title.replace(/'/g, "\\'")}',
    duration: ${duration},
    videoUrl: '${videoUrl}',
    dataUrl: '',
    thumbnail: '${thumbnailPath}',
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

// --- 截取缩略图 ---
if (!fs.existsSync(PUBLIC_THUMBS)) fs.mkdirSync(PUBLIC_THUMBS, { recursive: true });

let thumbnailGenerated = false;
try {
  const outJpg = path.join(PUBLIC_THUMBS, `${videoId}.jpg`);
  execSync(
    `ffmpeg -y -ss 1 -i "${videoUrl}" -vframes 1 -q:v 3 -update 1 "${outJpg}"`,
    { stdio: 'pipe', timeout: 60000 }
  );
  if (fs.existsSync(outJpg) && fs.statSync(outJpg).size > 100) {
    console.log(`🖼️  缩略图已截取: public/thumbnails/${videoId}.jpg (${(fs.statSync(outJpg).size / 1024).toFixed(1)} KB)`);
    thumbnailGenerated = true;
  } else {
    console.warn('⚠️  缩略图截取失败（文件过小或不存在），跳过');
  }
} catch (e) {
  console.warn('⚠️  ffmpeg 截图失败:', e.message?.slice(0, 100));
  console.warn('   请确保 ffmpeg 已安装且视频 URL 可访问');
}

// --- 自动更新 videoUrlMap.ts ---
try {
  updateUrlMap(videoId, videoUrl, thumbnailGenerated ? thumbnailPath : undefined);
  console.log('🔗 已更新 videoUrlMap.ts');
} catch (e) {
  console.warn('⚠️  更新 videoUrlMap.ts 失败:', e.message);
}

// --- 打印结果 ---
console.log('');
console.log(`✅ 转换完成！`);
console.log(`   源文件: ${echoJsonPath}`);
console.log(`   输出:   ${outPath}`);
console.log(`   标题:   ${title}`);
console.log(`   字幕段: ${paragraphs.length} 条`);
console.log(`   表达:   ${expressions.length} 条`);
console.log(`   时长:   ${duration}s (${Math.floor(duration / 60)}m${duration % 60}s)`);
console.log('');
console.log('接下来需要:');
console.log(`   1. 如果还没在 CatalogPage.tsx 中注册，记得添加视频卡片`);
console.log(`   2. 如果还没在 LessonPage.tsx 的 VIDEO_MAP 中注册，记得添加 import`);
console.log(`   3. 刷新页面`);

// ============================================================
// 辅助函数
// ============================================================

function updateUrlMap(videoId, url, thumbPath) {
  let mapContent = fs.readFileSync(URL_MAP_FILE, 'utf-8');

  // --- 如果已经有这个 videoId 的 case，不重复添加 ---
  if (mapContent.includes(`case '${videoId}':`)) {
    console.log(`   videoUrlMap.ts 中已存在 ${videoId}，跳过视频 URL 追加`);
  } else {
    // 在 getVideoUrl 的 default 前插入
    const videoCase = `
    case '${videoId}':
      return '${url}';`;
    mapContent = mapContent.replace(
      /(\s+default:\s*\n\s+return\s+`\/videos\/\$\{videoId\}\.mp4`;)/,
      `${videoCase}$1`
    );
  }

  // --- 缩略图映射 ---
  if (thumbPath) {
    if (mapContent.includes(`'${videoId}'`)) {
      console.log(`   videoUrlMap.ts 中已存在 ${videoId} 缩略图，跳过`);
    } else {
      const thumbCase = `
    case '${videoId}':
      return '${thumbPath}';`;
      mapContent = mapContent.replace(
        /(\s+default:\s*\n\s+return undefined;)/,
        `${thumbCase}$1`
      );
    }
  }

  fs.writeFileSync(URL_MAP_FILE, mapContent, 'utf-8');
}
