# IELTS 视频学习内容制作指南

本文档用于在 `ielts-learning-hub` 项目中新增一条 IELTS 视频学习内容。

新对话可以直接按本文档执行。

## 目标

把一个本地 MP4 视频制作成完整 IELTS 学习课。

每条课至少包含：

- 最终视频文件
- 缩略图
- 带时间戳的中英字幕
- 选择性句子解析
- 核心表达
- 中英双语总结
- 课程目录配置
- 本地页面验收

不要修改现有课程的数据内容。

保留当前工作区尚未提交的改动。

只增量新增本次视频需要的文件和配置。

## 输入信息

开始前先向用户确认或读取以下信息：

- 项目目录
- 原始视频路径
- IELTS 题库 PDF 路径
- 对应 IELTS Part
- 一级主题
- 二级话题
- 内容 ID
- 目标视频路径
- 目标缩略图路径
- 环境变量名

推荐命名格式：

- 内容 ID：`part2-tall-building-001`
- 数据文件：`src/data/part2-tall-building-001.ts`
- 视频文件：`public/videos/part2-tall-building-001.mp4`
- 缩略图：`public/thumbnails/part2-tall-building-001.jpg`
- 环境变量名：`VITE_VIDEO_PART2_TALL_BUILDING_001_URL`

## 第 1 步：检查项目结构

先阅读这些文件：

- `src/types/video.ts`
- `src/data/contentManifest.ts`
- `src/data/videoLibrary.ts`
- `src/data/videoUrlMap.ts`
- `src/data/topicTaxonomy.ts`
- `scripts/validate-content.mjs`
- 至少一条相似课程数据文件

理解当前数据结构后再编辑。

不要凭记忆改 manifest。

不要破坏已有免费视频权限。

## 第 2 步：检查工作区状态

执行：

```bash
git status --short
```

如果已有未提交改动，视为用户改动。

不要回退。

不要覆盖。

在现有改动基础上追加。

## 第 3 步：核对 IELTS 真题

从用户给的 PDF 中读取对应页。

以 PDF 原文为准。

需要记录：

- Part 2 题目
- Part 2 cue card bullet points
- Part 3 问题
- 可迁移的 Part 1 题目

内容设计优先服务核心 Part。

不要为了覆盖更多题目强行关联。

## 第 4 步：检查原始视频

必须先检查本地 MP4。

执行：

```bash
ffprobe -hide_banner -show_format -show_streams -print_format json "原始视频路径"
```

需要确认：

- 实际时长
- 分辨率
- 横竖屏
- 视频编码
- 音频编码
- 音轨是否存在
- 是否有字幕流

如果没有字幕流，必须从音轨 ASR。

不要使用猜测字幕。

不要用画面内容编台词。

## 第 5 步：决定是否裁剪

先看 ASR 和视频内容密度。

保留标准：

- 围绕 IELTS 题目
- 有真实口语表达
- 有地点、用途、外观、体验或观点
- 片段长度优先 3-5 分钟

裁剪标准：

- 去掉频道寒暄
- 去掉订阅提示
- 去掉无关广告
- 去掉结尾 CTA
- 去掉长时间无有效语言

如果裁剪，字幕时间必须从最终视频的 `0` 秒重新计算。

不要破坏用户提供的原视频。

最终视频保存到 `public/videos/`。

## 第 6 步：ASR 音转文

必须从本地视频音轨转写。

优先生成带时间戳的结果。

推荐流程：

```bash
ffmpeg -hide_banner -y -i "原始视频路径" -vn -ac 1 -ar 16000 -c:a mp3 /private/tmp/current-video-asr.mp3
```

然后调用可用 ASR。

如果使用 OpenAI Whisper API：

- 需要用户授权读取密钥
- 需要用户授权音频发送到外部 endpoint
- 使用英文语言参数
- 使用可保留 segment 时间戳的格式

如果 ASR 失败：

- 先检查本地是否有离线 ASR
- 检查是否有现成字幕文件
- 不要安装或修改项目依赖，除非用户明确允许
- 不得虚构字幕
- 汇报 blocker 和已完成部分

## 第 7 步：整理字幕

字幕字段：

- `id`
- `startTime`
- `endTime`
- `english`
- `chinese`
- 可选 `parse`

字幕切分是重点。

每段尽量只放一句话。

不要把两句完整句子拼成一段。

如果 ASR 把两句话合在一起，要拆开。

例如不要这样：

```ts
english: "But pro tip: don't buy the ticket as soon as you get to the page. Instead, stay on the page for a few seconds and then move your cursor like you're going to leave the page."
```

应该拆成：

```ts
{
  english: "But pro tip: don't buy the ticket as soon as you get to the page.",
  chinese: "不过有个小建议：不要一打开页面就买票。"
},
{
  english: "Instead, stay on the page for a few seconds and then move your cursor like you're going to leave the page.",
  chinese: "可以先在页面上停几秒，然后把鼠标移到像是要离开页面的位置。"
}
```

切分规则：

- 一段通常对应一句完整表达
- 很短的口语句可以单独成段
- 长句可以按自然停顿拆，但不要破坏语法
- 每段英文最好控制在一到两行屏幕内
- 中文也要跟着拆
- 不要逐词切分
- 不要堆超长段落

时间戳规则：

- 使用最终视频时间
- 误差尽量控制在约 `0.2-0.5` 秒
- 当前字幕切换要自然
- 开头、中段、结尾必须抽查
- 裁剪拼接点必须抽查

英文整理规则：

- 保留讲者真实口语
- 修正明显 ASR 拼写错误
- 补必要标点
- 不要改写成作文腔
- 严重影响阅读的重复和填充词可以轻度整理

中文翻译规则：

- 自然口语化
- 结合上下文
- 不逐词硬翻
- 不过度解释

专有名词必须人工校对。

常见校对对象：

- 人名
- 地名
- 建筑名
- 品牌名
- 城市区域
- 地标

## 第 8 步：选择句子解析

不要每句都加解析。

优先选择：

- 描述地点、建筑、外观、用途的句子
- 解释喜欢或不喜欢原因的句子
- 有因果、对比、让步、条件句的句子
- 有定语从句或名词性从句的句子
- 有可迁移搭配的句子

每个 `parse` 包含：

- `grammar`
- `collocations`
- `contextAnalysis`

`collocations` 建议 2-4 个。

解析要服务雅思迁移。

不要只写“这是主谓宾结构”。

不要把简单句硬讲复杂。

## 第 9 步：提取核心表达

每条表达字段：

- `pattern`
- `meaning`
- `usage`
- `topic`
- `example`

数量建议 6-10 条。

`pattern` 必须真实出现在字幕中。

最好使用字幕里的连续文本。

因为网页会用 `pattern` 匹配并高亮字幕。

提取优先级：

- 说明位置
- 说明用途
- 描述外观和高度
- 描述城市景观
- 描述参观体验
- 表达喜欢或不喜欢
- 分析优势或差异

不要收录：

- 单纯专有名词
- 过泛表达
- 普通单词
- 操作性强但雅思迁移弱的语言
- 视频中没有出现的表达
- 为凑数量选的低价值搭配

`usage` 要具体。

必须说明：

- 适合回答哪个题
- 哪些成分可以替换
- 语气或使用限制
- 如何放进雅思答案

`topic` 使用 IELTS 原题英文。

不要只写模糊的 `Building`。

`example` 必须是新的仿写句。

不要照抄原视频整句。

## 第 10 步：写双语总结

`summary` 使用一个模板字符串。

英文总结应包含：

- 视频讲的是谁或什么
- 地点在哪里
- 主要用途
- 外观、高度或功能特点
- 体验亮点
- 喜欢或不喜欢原因
- 对 IELTS 题目的帮助

中文总结要自然概括学习价值。

不要逐句翻译英文总结。

## 第 11 步：生成媒体文件

最终视频保存：

```bash
public/videos/内容ID.mp4
```

如果只复制：

```bash
cp "原始视频路径" public/videos/内容ID.mp4
```

如果裁剪并重新编码：

```bash
ffmpeg -hide_banner -y -ss 开始秒 -to 结束秒 -i "原始视频路径" \
  -c:v libx264 -preset veryfast -crf 20 \
  -c:a aac -b:a 128k -movflags +faststart \
  public/videos/内容ID.mp4
```

如果需要拼接多个片段，用 `trim / atrim / concat`。

完成后再次 `ffprobe` 最终视频。

确认：

- 横版
- 可播放
- 有音轨
- 时长与 manifest 一致
- 浏览器可加载

## 第 12 步：生成缩略图

从视频中选清晰、有代表性的一帧。

优先选择：

- 能看出主题
- 不模糊
- 不被大字遮挡
- 不是黑屏
- 不是过渡帧

生成命令：

```bash
ffmpeg -hide_banner -y -ss 秒数 -i "原始或最终视频路径" \
  -frames:v 1 -q:v 2 public/thumbnails/内容ID.jpg
```

用 `view_image` 人工看图。

不满意就换秒数。

## 第 13 步：新增数据文件

在 `src/data/内容ID.ts` 中导出：

```ts
import type { VideoContent } from '../types/video';

export const videoData: VideoContent = {
  meta: {
    id: '内容ID',
    title: '英文标题',
    duration: 真实秒数,
    videoUrl: '/videos/内容ID.mp4',
    dataUrl: '',
    thumbnail: '/thumbnails/内容ID.jpg',
    tags: {
      difficulty: 'medium',
      speed: 'normal',
      durationTag: 'medium',
    },
  },
  summary: `英文总结

中文总结`,
  paragraphs: [],
  expressions: [],
};
```

## 第 14 步：接入 manifest

编辑 `src/data/contentManifest.ts`。

新增一条：

```ts
{
  id: '内容ID',
  parts: ['Part 2', 'Part 3'],
  abilityTags: ['建筑描述', '观点理由'],
  themeId: 'places-living',
  topic: '二级话题名',
  titleZh: '中文标题',
  description: '一句话说明学习价值。',
  access: 'paid',
  duration: 真实秒数,
  loadContent: async () => (await import('./内容ID')).videoData,
  videoFile: '内容ID.mp4',
  videoEnvKey: 'VITE_VIDEO_XXX_URL',
}
```

注意：

- 不要改现有课程 access
- 不要改变已有免费视频数量
- `topic` 必须存在于 `topicTaxonomy.ts`
- `loadContent` 路径必须能动态导入
- `duration` 要和数据文件一致

如果课程页有标题映射，也要补上。

当前项目位置：

- `src/pages/LessonPage.tsx`
- `LESSON_HEADER_TITLES`

## 第 15 步：自检表达高亮

写入数据后检查每个表达是否能在字幕中找到。

可以运行：

```bash
node - <<'NODE'
import('./src/data/内容ID.ts').then(({ videoData }) => {
  const text = videoData.paragraphs.map((p) => p.english).join(' ');
  const missing = videoData.expressions
    .filter((expr) => !text.includes(expr.pattern))
    .map((expr) => expr.pattern);
  console.log({ paragraphs: videoData.paragraphs.length, parsed: videoData.paragraphs.filter((p) => p.parse).length, expressions: videoData.expressions.length, missing });
});
NODE
```

`missing` 必须为空。

## 第 16 步：运行质量验证

至少执行：

```bash
npm run validate:content
npm run build
npm run lint
```

如果失败，先修本次新增问题。

如果是历史问题，要明确说明。

本次新增不能引入新错误。

## 第 17 步：本地页面验收

启动开发服务器：

```bash
npm run dev -- --host 127.0.0.1
```

打开：

- `http://127.0.0.1:5173/catalog`
- `http://127.0.0.1:5173/lesson/内容ID`
- `http://127.0.0.1:5173/lesson/内容ID/expressions`

验收清单：

- 目录页出现新视频
- 一级主题正确
- 二级话题正确
- 未登录时付费课需要登录
- 登录后课程可打开
- 视频能播放
- 视频能暂停
- 进度条能拖动
- 开头字幕同步
- 中段字幕同步
- 结尾字幕同步
- 双语字幕显示正常
- 有解析的句子能打开解析面板
- 核心表达能在字幕中高亮
- 表达页展示 `pattern / meaning / usage / topic / example`
- 刷新课程路由后仍能访问
- 桌面端布局正常
- 移动端布局正常

## 第 18 步：最终汇报

完成后汇报：

- 最终使用的视频时段
- 最终时长
- 是否裁剪
- 裁剪原因
- ASR 使用方式
- 人工抽查和修正的重点
- 字幕段落数量
- 带解析段落数量
- 核心表达数量
- 新增或修改文件
- 校验结果
- 构建结果
- lint 结果
- 本地访问地址
- 尚存风险或需人工确认的地方

如果 `public/videos/` 被 `.gitignore` 忽略，要提醒用户视频只在本地存在。

## 字幕质量硬性标准

这是最容易影响学习体验的部分。

新增视频时必须遵守：

- 不要一段塞两三个完整句子
- 两句话之间有句号时，优先拆成两段
- 每段字幕要短，读起来不累
- 时间切换要贴近说话节奏
- 中文也要短
- 不要为了减少段落数量牺牲可读性
- 表达高亮所在句不能被切碎到无法匹配

一个好的字幕段应该像这样：

```ts
{
  id: 1,
  startTime: 13.56,
  endTime: 18.4,
  english: "But pro tip: don't buy the ticket as soon as you get to the page.",
  chinese: "不过有个小建议：不要一打开页面就买票。"
}
```

而不是这样：

```ts
{
  id: 1,
  startTime: 13.56,
  endTime: 25.56,
  english: "But pro tip: don't buy the ticket as soon as you get to the page. Instead, stay on the page for a few seconds and then move your cursor like you're going to leave the page.",
  chinese: "不过有个小建议：不要一打开页面就买票。可以先在页面上停几秒，然后把鼠标移到像是要离开页面的位置。"
}
```

## 常见风险

ASR 可能听错专有名词。

必须人工校对地名和建筑名。

视频裁剪后时间戳容易忘记归零。

表达 `pattern` 如果和字幕不完全一致，就无法高亮。

长字幕在移动端会显得很累。

不要把旅游购票表达强行包装成雅思核心表达。

不要为了覆盖 Part 3 全部问题而选择无关表达。

不要修改现有课程数据来适配新课。
