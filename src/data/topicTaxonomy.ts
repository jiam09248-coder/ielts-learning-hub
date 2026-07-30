export interface TopicTheme {
  id: string;
  name: string;
  shortName: string;
  topics: string[];
}

/**
 * The catalog has exactly two navigation levels:
 * theme (level 1) -> topic (level 2).
 *
 * IELTS Part information belongs to each video and must never be used as a
 * catalog level.
 */
export const TOPIC_TAXONOMY: TopicTheme[] = [
  {
    id: 'places-living',
    name: '地点、建筑与居住',
    shortName: '地点与居住',
    topics: [
      'Building', 'Crowded place', 'Home/accommodation', 'Hometown',
      'The area you live in', 'The city you live in', '喜欢或不喜欢的高建筑',
      '喜欢拜访但不想住的家', '有趣的建筑', '安静的地方',
    ],
  },
  {
    id: 'people-relationships',
    name: '人物、家庭与人际关系',
    shortName: '人物与关系',
    topics: [
      'Teachers', '发小', '别人帮助解决问题', '给别人建议', '微笑的场合',
      '为家人骄傲', '乐于助人的人', '鼓励别人做不愿做的事',
    ],
  },
  {
    id: 'daily-life',
    name: '日常生活与个人经历',
    shortName: '日常与经历',
    topics: [
      'Tidiness', 'Morning time', 'Walking', 'Childhood activities',
      'Life stages', 'Spare time', 'Memory', '去过的无聊地方',
      '早起经历', '近期改变的计划',
    ],
  },
  {
    id: 'interests-entertainment',
    name: '兴趣、艺术与娱乐',
    shortName: '兴趣与娱乐',
    topics: [
      'Music', 'Singing', 'Jokes & Comedies', 'Sports team', 'Hobby', 'Reading',
      '喜欢的现场体育赛事', '想见的名人', '喜欢画画的孩子',
      '不享受的音乐活动', '近期看过且享受的电影',
    ],
  },
  {
    id: 'learning-work',
    name: '学习、工作与个人成长',
    shortName: '学习与成长',
    topics: [
      'Science', 'Outer space and stars', 'Work or studies', '想从事医疗行业的人',
      '拥有成功商业的人', '在团队中工作', '重要决定', '擅长学习和说语言的人',
      '长久目标/抱负', '遇到困难终成功的人', '改变重要想法', '完美工作',
      '擅长做计划的人', '机智解决问题的人', '朋友自学', '发挥想象力',
      '想从事的短期海外工作',
    ],
  },
  {
    id: 'technology-media',
    name: '科技、媒体与沟通',
    shortName: '科技与沟通',
    topics: [
      'Social media', 'Websites', 'Typing', 'Headphones', '有趣视频',
      '遇到的科技问题', '名人出演的广告', '很久没收到回复的信息',
      '禁用手机的场合', '想拥有的科技产品', 'App/程序', '喜欢的电视/网络节目',
    ],
  },
  {
    id: 'objects-consumption',
    name: '物品、消费与饮食',
    shortName: '物品与消费',
    topics: [
      'Watch', 'Shopping', 'Mirrors', 'Clothing', 'Food', 'Gifts',
      '特别场合的食物', '对家庭重要的东西', '花费超过预期的物品', '商店',
    ],
  },
  {
    id: 'travel-transport',
    name: '旅行、交通与出行',
    shortName: '旅行与出行',
    topics: ['Cars', '推荐旅行过的地方', '自行车/摩托车/汽车旅行', '去过且喜欢的城市'],
  },
  {
    id: 'nature-outdoors',
    name: '自然、动物与户外环境',
    shortName: '自然与户外',
    topics: [
      'Public gardens and parks', 'Pets and Animals', 'Scenery Views',
      '喜欢在家/花园种菜的人', '包含动物的故事或书', '爱护自然之人',
    ],
  },
  {
    id: 'law-society',
    name: '法律、规则与社会议题',
    shortName: '法律与社会',
    topics: ['想颁布的新法律', '保护环境的法律', '想要颁布的环保法律'],
  },
];

export const TOPIC_COUNT = TOPIC_TAXONOMY.reduce(
  (count, theme) => count + theme.topics.length,
  0,
);
