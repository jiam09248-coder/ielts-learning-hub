import type { VideoContent } from '../types/video';

export const mockVideoContent: VideoContent = {
  meta: {
    id: 'pilot-001',
    title: 'IELTS Speaking: Describing Your Hometown',
    duration: 180,
    videoUrl: import.meta.env.VITE_VIDEO_URL || '/videos/video.mp4',
    dataUrl: '',
    tags: { difficulty: 'medium', speed: 'normal', durationTag: 'short' },
  },
  summary:
    'This video demonstrates a native speaker describing their hometown in a natural, conversational style. It covers geography, local culture, and personal memories, providing excellent models for IELTS Speaking Part 1 and Part 2.',
  paragraphs: [
    { id: 1, startTime: 0, endTime: 8.5, english: "I grew up in a small coastal town called Brighton, which is located on the southern coast of England.", chinese: '我在一个名叫布莱顿的海滨小镇长大，它位于英格兰南部海岸。', parse: { grammar: "主句为 'I grew up in...'，使用一般过去时描述过去的经历。'which is located on...' 为非限制性定语从句。", collocations: [{ phrase: 'grow up in', meaning: '在……长大' }, { phrase: 'coastal town', meaning: '海滨小镇' }, { phrase: 'located on', meaning: '位于' }, { phrase: 'southern coast', meaning: '南部海岸' }], contextAnalysis: '说话者以描述成长地点开篇，这是 IELTS Speaking 中介绍个人背景的经典开场方式。' } },
    { id: 2, startTime: 8.5, endTime: 18.2, english: "It's famous for its beautiful beaches, the iconic Royal Pavilion, and a really vibrant arts scene that draws tourists from all over the world.", chinese: '它以美丽的海滩、标志性的英皇阁和充满活力的艺术氛围而闻名，吸引着来自世界各地的游客。', parse: { grammar: "使用 'It's famous for...' 经典句型介绍某地特色。'that draws tourists...' 为限制性定语从句。", collocations: [{ phrase: 'famous for', meaning: '以……闻名' }, { phrase: 'beautiful beaches', meaning: '美丽的海滩' }, { phrase: 'arts scene', meaning: '艺术氛围' }, { phrase: 'all over the world', meaning: '全世界' }], contextAnalysis: '说话者使用递进式列举丰富描述层次，展现词汇多样性。' } },
    { id: 3, startTime: 18.2, endTime: 28.0, english: "What I love most about it is the atmosphere — there's always something going on, whether it's street performers along the seafront or indie music gigs in the Lanes.", chinese: '我最喜欢的是那里的氛围——总有事情在发生，无论是海滨的街头艺人表演，还是巷区里的独立音乐演出。', parse: { grammar: "'What I love most about it' 为主语从句。'whether it's... or...' 为让步状语从句，展示平行结构。", collocations: [{ phrase: 'what I love most', meaning: '我最喜欢的' }, { phrase: 'street performers', meaning: '街头艺人' }, { phrase: 'seafront', meaning: '海滨' }, { phrase: 'music gigs', meaning: '音乐演出' }], contextAnalysis: '说话者从客观描述转向主观感受。' } },
    { id: 4, startTime: 28.0, endTime: 38.5, english: "But to be honest, it has changed quite a bit over the years. It's become much more commercialized, and the rent has skyrocketed, which makes it tough for local artists to stay.", chinese: '但说实话，这些年来它变化很大。它变得商业化得多，租金也飞涨，这让当地艺术家很难留下来。', parse: { grammar: "'But to be honest' 为口语化转折过渡语。'It has changed... over the years' 使用现在完成时强调持续变化。", collocations: [{ phrase: 'to be honest', meaning: '说实话' }, { phrase: 'over the years', meaning: '这些年来' }, { phrase: 'skyrocketed', meaning: '飞涨' }, { phrase: 'tough for... to', meaning: '对……来说很难' }], contextAnalysis: '通过 "but" 引入批判性视角，展现回答的深度和思辨能力。' } },
    { id: 5, startTime: 38.5, endTime: 48.0, english: "Still, whenever I go back, I feel this sense of belonging. The smell of the sea, the sound of seagulls — it all brings back so many childhood memories.", chinese: '不过，每当我回去，都会有一种归属感。大海的气息、海鸥的声音——这一切都唤起了许多童年回忆。', parse: { grammar: "'Still' 为让步副词。'whenever I go back' 为时间状语从句。", collocations: [{ phrase: 'sense of belonging', meaning: '归属感' }, { phrase: 'brings back', meaning: '唤起' }, { phrase: 'childhood memories', meaning: '童年回忆' }], contextAnalysis: '以感官细节结尾，让抽象情感具象化。' } },
  ],
  expressions: [
    { pattern: 'grow up in', meaning: '在……长大', usage: '用于介绍成长背景，口语常用', topic: 'Part 1 Hometown', example: 'I grew up in a small village in the countryside.' },
    { pattern: 'located on', meaning: '位于……', usage: '描述地理位置', topic: 'Part 1 Hometown', example: 'The university is located on the outskirts of the city.' },
    { pattern: 'famous for', meaning: '以……闻名', usage: '介绍某地特色', topic: 'Part 2 Describe a place', example: 'My hometown is famous for its traditional tea culture.' },
    { pattern: 'something going on', meaning: '有活动在发生', usage: '描述热闹氛围', topic: 'Part 1 Hometown', example: 'There is always something going on in big cities.' },
    { pattern: 'to be honest', meaning: '说实话', usage: '口语转折缓冲语', topic: 'Part 2 Describe a change', example: 'To be honest, I prefer working from home.' },
    { pattern: 'over the years', meaning: '这些年来', usage: '描述长期变化，搭配现在完成时', topic: 'Part 1 Changes', example: 'My English has improved a lot over the years.' },
    { pattern: 'sense of belonging', meaning: '归属感', usage: '描述情感连接的高级表达', topic: 'Part 1 Hometown', example: 'Volunteering gave me a real sense of belonging.' },
    { pattern: 'brings back memories', meaning: '唤起回忆', usage: '感官触发回忆的地道表达', topic: 'Part 2 Describe a memory', example: 'That song always brings back memories of my school days.' },
  ],
};
