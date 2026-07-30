import type { VideoContent } from '../types/video';

export const videoData: VideoContent = {
  meta: {
    id: 'part2-quiet-place-001',
    title: 'A Quiet River in the Forest',
    duration: 136,
    videoUrl: '/videos/places-living/quiet-place/part2-quiet-place-001.mp4',
    dataUrl: '',
    thumbnail: '/thumbnails/part2-quiet-place-001.jpg',
    tags: {
      difficulty: 'easy',
      speed: 'normal',
      durationTag: 'short',
    },
  },
  summary: `This clip is suitable for IELTS Part 2: "Describe a quiet place you like to go." The speaker talks about a river in a forest, explains that it is on a back road and surrounded by natural scenery, and says he goes there to relax, clear his head, and feel calmer when he is down. The language is simple and highly transferable for Chinese IELTS candidates because it focuses on location, natural surroundings, personal routine, and emotional benefits.

这段适合“安静的地方”Part 2。说话人介绍自己喜欢去森林里的一条河边，那里在偏僻的小路旁，四周都是树林。他去那里放松、清空思绪，在心情低落时让自己平静下来。表达不复杂，但很适合雅思考生迁移到公园、湖边、校园角落、图书馆附近或小区安静角落等场景。`,
  paragraphs: [
    { id: 1, startTime: 0, endTime: 4.12, english: 'A lot of it does have to do with this forest.', chinese: '这很大程度上和这片森林有关。' },
    { id: 2, startTime: 5.24, endTime: 13.56, english: 'I am here with my friend, but I want to talk to you guys about a certain river that I like going to.', chinese: '我现在和朋友在这里，但我想和大家聊聊一条我喜欢去的河。', parse: { grammar: 'a certain... 表示“某一个特定的……”，that I like going to 是定语从句，说明这个地方和说话人的关系。', collocations: [{ phrase: 'a certain river that I like going to', meaning: '我喜欢去的某条河' }], contextAnalysis: '这句可以直接迁移到 Part 2 开头，用来交代自己要描述的安静地点。' } },
    { id: 3, startTime: 14.72, endTime: 16.72, english: 'It is where I like to clear my head.', chinese: '那是我喜欢去清空思绪的地方。', parse: { grammar: 'where 引导表语从句，说明这个地方的作用。', collocations: [{ phrase: 'clear my head', meaning: '清空思绪；让头脑清醒' }], contextAnalysis: '这是本视频最适合“安静的地方”的核心表达，可以回答 why you go there 和 how you feel。' } },
    { id: 4, startTime: 25.28, endTime: 29.88, english: 'This is where it is. I am pretty sure it is pretty loud, but...', chinese: '这里就是它所在的地方。我很确定这里声音挺大的，不过……' },
    { id: 5, startTime: 29.88, endTime: 36.88, english: 'This is the type of stuff that I kind of clear my head to. This is where I go to relax, and I feel like more people should definitely do this.', chinese: '这种环境就是我用来清空思绪的地方。这是我放松的地方，我觉得更多人真的应该这样做。', parse: { grammar: 'This is where I go to... 是描述地点用途的高频句型；should definitely do this 表达建议。', collocations: [{ phrase: 'go to relax', meaning: '去那里放松' }, { phrase: 'clear my head to', meaning: '借着某种环境清空思绪' }], contextAnalysis: '这句可以自然回答 what you do there 和 explain how you feel about the place。' } },
    { id: 6, startTime: 45.24, endTime: 54.48, english: "Nowadays, the world can feel so stressful that you kind of need a place like this.", chinese: '如今，这个世界有时会让人觉得压力很大，所以你会有点需要这样的地方。' },
    { id: 7, startTime: 54.48, endTime: 62.2, english: "Unfortunately, stuff like therapy isn't readily available to me at the moment, so I come here.", chinese: '不幸的是，像心理咨询这样的帮助目前对我来说并不是很容易获得，所以我会来这里。', parse: { grammar: "isn't readily available 表示“并不容易获得”；so 引出结果。", collocations: [{ phrase: "isn't readily available", meaning: '不容易获得；不太方便得到' }], contextAnalysis: '这句可迁移为“城市里真正安静的地方并不容易找到，所以我会去某个固定地点放松”。' } },
    { id: 8, startTime: 64.2, endTime: 68.28, english: 'It is a nice place. It is a very nice place.', chinese: '这是个不错的地方。真的是个很好的地方。' },
    { id: 9, startTime: 69.28, endTime: 76.48, english: 'It is a blessing that I live in a state that has gorgeous pieces of landscape.', chinese: '我住在一个有美丽自然景观的州，这是一种幸运。', parse: { grammar: 'It is a blessing that... 表示“……是一件幸运的事”。', collocations: [{ phrase: 'a blessing', meaning: '一件幸运的事' }, { phrase: 'gorgeous pieces of landscape', meaning: '美丽的自然景观' }], contextAnalysis: '适合描述为什么喜欢某个地方，尤其是自然环境好的地方。' } },
    { id: 10, startTime: 77, endTime: 87.64, english: 'This is literally in a forest. This is on a back road. If you look around here, there is forest all around me.', chinese: '这里真的就在森林里。它在一条偏僻的小路旁。如果你看看周围，会发现我身边全是树林。', parse: { grammar: 'in a forest / on a back road 用不同介词准确描述位置；all around me 强调四周环境。', collocations: [{ phrase: 'on a back road', meaning: '在一条偏僻小路旁' }, { phrase: 'all around me', meaning: '在我四周' }], contextAnalysis: '这句特别适合回答 where it is 和 what it is like，画面感很强但不难。' } },
    { id: 11, startTime: 90.12, endTime: 95.56, english: 'This is where I go if I am feeling a bit down or if I am feeling a bit dour.', chinese: '如果我有点低落，或者情绪有点阴沉，我就会来这里。', parse: { grammar: 'This is where I go if... 用来说明自己在什么情况下会去这个地方。', collocations: [{ phrase: 'feel a bit down', meaning: '有点低落' }, { phrase: 'feel a bit dour', meaning: '心情有点阴沉' }], contextAnalysis: '适合回答 how often you go there 或为什么这个地方对你重要。' } },
    { id: 12, startTime: 95.56, endTime: 107.12, english: "I normally don't talk about it, mostly because it is a bit of a taboo, a bit of a thing that I don't like talking about.", chinese: '我平时不太谈这个，主要是因为它有点像一个禁忌，也是我不太喜欢谈的事。' },
    { id: 13, startTime: 107.64, endTime: 118.04, english: "But yeah, I usually come here to just kind of clear my head. I don't know how good the audio is right now. It could be awful.", chinese: '不过，是的，我通常会来这里清空一下思绪。我不知道现在音频效果怎么样，可能会很糟。' },
    { id: 14, startTime: 118.8, endTime: 124, english: 'I do this quick little video just to show you guys what I do in my spare time.', chinese: '我拍这个简短的小视频，只是想给大家看看我空闲时间会做什么。', parse: { grammar: 'what I do in my spare time 是宾语从句，可用于描述休闲活动。', collocations: [{ phrase: 'in my spare time', meaning: '在我的空闲时间' }], contextAnalysis: '可以迁移到 Part 2 中说明去这个地方的频率或日常习惯。' } },
    { id: 15, startTime: 127.84, endTime: 136.4, english: 'This is how I relax. This is how I chill. This is how I kind of keep myself sane. This is how I kept myself sane during the pandemic.', chinese: '这就是我放松的方式。这就是我让自己冷静下来的方式。这也是我保持理智的方式。疫情期间，我也是靠这种方式让自己撑下来的。', parse: { grammar: 'This is how... 连续使用，强调某件事对自己的作用。', collocations: [{ phrase: 'keep myself sane', meaning: '让自己保持清醒/不崩溃' }, { phrase: 'This is how I relax', meaning: '这就是我放松的方式' }], contextAnalysis: '这句适合 Part 2 结尾解释感受：这个地方不只是安静，还能帮人稳定情绪。' } },
  ],
  expressions: [
    { pattern: 'clear my head', meaning: '清空思绪；让头脑清醒', usage: '描述去安静地方的原因，比 simply relax 更有表达力。', topic: 'Describe a quiet place you like to go', topicZh: '描述一个你喜欢去的安静地方', example: 'I often go there after a busy day because it helps me clear my head.', exampleZh: '忙了一天之后我经常去那里，因为它能帮我清空思绪。' },
    { pattern: 'a certain river that I like going to', meaning: '我喜欢去的某条河', usage: 'a certain + 地点 可以自然引出一个具体但不必过度命名的地方。', topic: 'Where is it?', topicZh: '它在哪里？', example: 'There is a certain quiet corner in my neighborhood that I like going to.', exampleZh: '我小区附近有一个我喜欢去的安静角落。' },
    { pattern: 'This is where I go to relax', meaning: '这是我去放松的地方', usage: '非常适合说明地点功能，简单但地道。', topic: 'What do you do there?', topicZh: '你在那里做什么？', example: 'The small reading room near my campus is where I go to relax.', exampleZh: '校园附近那间小阅览室是我去放松的地方。' },
    { pattern: 'a place like this', meaning: '像这样的地方', usage: '适合泛指一类让人安静下来的地方，回答 Part 3 也能用。', topic: 'Is it easy to find quiet places in your country? Why?', topicZh: '在你的国家容易找到安静的地方吗？为什么？', example: 'In a crowded city, a place like this can be surprisingly hard to find.', exampleZh: '在拥挤的城市里，像这样的地方其实很难找。' },
    { pattern: "isn't readily available", meaning: '不容易获得；不太方便得到', usage: '可迁移为安静空间、公共设施或休闲资源不容易获得。', topic: 'Is it easy to find quiet places in your country? Why?', topicZh: '在你的国家容易找到安静的地方吗？为什么？', example: 'For many office workers, a truly quiet space is not readily available during the day.', exampleZh: '对很多上班族来说，白天真正安静的空间并不容易获得。' },
    { pattern: 'gorgeous pieces of landscape', meaning: '美丽的自然景观', usage: '描述自然环境时比 beautiful views 更具体。', topic: 'What is it like?', topicZh: '它是什么样的？', example: 'The park has gorgeous pieces of landscape, especially around the lake.', exampleZh: '那个公园有很美的自然景观，尤其是湖边一带。' },
    { pattern: 'on a back road', meaning: '在一条偏僻的小路旁', usage: '适合描述位置偏僻、安静、不被打扰。', topic: 'Where is it?', topicZh: '它在哪里？', example: 'The cafe is on a back road, so it is much quieter than places downtown.', exampleZh: '那家咖啡馆在一条偏僻小路旁，所以比市中心的地方安静很多。' },
    { pattern: 'feel a bit down', meaning: '有点低落', usage: '描述情绪状态自然，不夸张，适合说明为什么去安静的地方。', topic: 'How do you feel about the place?', topicZh: '你对这个地方感觉如何？', example: 'When I feel a bit down, I like to sit there and listen to the water.', exampleZh: '当我有点低落时，我喜欢坐在那里听水声。' },
    { pattern: 'in my spare time', meaning: '在我的空闲时间', usage: '用于回答 how often you go there 或 what you do there。', topic: 'How often do you go there?', topicZh: '你多久去一次？', example: 'In my spare time, I sometimes go there alone with a book.', exampleZh: '空闲时间里，我有时会带本书一个人去那里。' },
    { pattern: 'keep myself sane', meaning: '让自己保持清醒/稳定心态', usage: '口语化表达，适合描述一个地方对心理状态的帮助，但不要在正式语境中过度使用。', topic: 'And explain how you feel about the place', topicZh: '解释你对这个地方的感受', example: 'During exam season, walking in that quiet park helps me keep myself sane.', exampleZh: '考试季时，在那个安静的公园散步能帮我稳住心态。' },
  ],
};
