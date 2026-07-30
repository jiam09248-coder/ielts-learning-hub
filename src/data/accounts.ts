import type { LoginCredentials } from '../types/auth';

export const PRESET_ACCOUNTS: LoginCredentials[] = [
  { username: '晨曦', password: '晨曦A7q!73' },
  { username: '星河', password: '星河M4z#84' },
  { username: '若宁', password: '若宁R9v@95' },
  { username: '知夏', password: '知夏T2k%106' },
  { username: '慕白', password: '慕白N8x&117' },
  { username: '清言', password: '清言P5w$128' },
  { username: '南乔', password: '南乔C3y*139' },
  { username: '云舒', password: '云舒L6d?150' },
  { username: '景行', password: '景行H1s+161' },
  { username: '林深', password: '林深V7m=172' },
  { username: '安禾', password: '安禾Q4n!183' },
  { username: '予安', password: '予安B8r#194' },
  { username: '书瑶', password: '书瑶K2p@205' },
  { username: '沐辰', password: '沐辰W9c%216' },
  { username: '锦年', password: '锦年D5t&227' },
  { username: '亦然', password: '亦然Y3f$238' },
  { username: '思远', password: '思远J6h*249' },
  { username: '初晴', password: '初晴E1g?260' },
  { username: '嘉树', password: '嘉树S8l+271' },
  { username: '听澜', password: '听澜U4a=282' },
  { username: '洛笙', password: '洛笙Z7b!293' },
  { username: '念舟', password: '念舟F2q#304' },
  { username: '青栀', password: '青栀G9z@315' },
  { username: '温言', password: '温言X5v%326' },
  { username: '子衿', password: '子衿I3k&337' },
  { username: '明澈', password: '明澈O6x$348' },
  { username: '秋白', password: '秋白A1w*359' },
  { username: '夏悠', password: '夏悠M8y?370' },
  { username: '以墨', password: '以墨R4d+381' },
  { username: '简宁', password: '简宁T7s=392' },
  { username: '禾遇', password: '禾遇N2m!403' },
  { username: '苏沫', password: '苏沫P9n#414' },
  { username: '雨眠', password: '雨眠C5r@425' },
  { username: '星野', password: '星野L3p%436' },
  { username: '云岫', password: '云岫H6c&447' },
  { username: '知微', password: '知微V1t$458' },
  { username: '清欢', password: '清欢Q8f*469' },
  { username: '北辰', password: '北辰B4h?480' },
  { username: '南絮', password: '南絮K7g+491' },
  { username: '若谷', password: '若谷W2l=502' },
  { username: '鹿鸣', password: '鹿鸣D9a!513' },
  { username: '晚柠', password: '晚柠Y5b#524' },
  { username: '景明', password: '景明J3q@535' },
  { username: '言蹊', password: '言蹊E6z%546' },
  { username: '月白', password: '月白S1v&557' },
  { username: '松间', password: '松间U8k$568' },
  { username: '一禾', password: '一禾Z4x*579' },
  { username: '时安', password: '时安F7w?590' },
  { username: '望舒', password: '望舒G2y+601' },
  { username: '芷晴', password: '芷晴X9d=612' },
];

export function validatePresetAccount(credentials: LoginCredentials): boolean {
  const username = credentials.username.trim().toLowerCase();
  const password = credentials.password.trim();

  return PRESET_ACCOUNTS.some(
    (account) => account.username === username && account.password === password,
  );
}
