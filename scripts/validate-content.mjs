import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const manifest = fs.readFileSync(path.join(dataDir, 'contentManifest.ts'), 'utf8');
const files = fs.readdirSync(dataDir).filter((file) => /\.ts$/.test(file) && ![
  'accounts.ts',
  'contentManifest.ts',
  'topicTaxonomy.ts',
  'videoLibrary.ts',
  'videoUrlMap.ts',
].includes(file));
const errors = [];
const manifestIds = [...manifest.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
const manifestDurations = Object.fromEntries(
  [...manifest.matchAll(/id: '([^']+)'[\s\S]*?duration: (\d+),/g)].map((match) => [match[1], Number(match[2])]),
);
const seen = new Set();

for (const id of manifestIds) {
  if (seen.has(id)) errors.push(`duplicate manifest id: ${id}`);
  seen.add(id);
}

const freeCount = [...manifest.matchAll(/access: 'free'/g)].length;
if (freeCount !== 3) errors.push(`expected exactly 3 free videos, found ${freeCount}`);

for (const file of files) {
  const source = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const id = source.match(/id: '([^']+)'/)?.[1];
  const duration = Number(source.match(/duration: (\d+)/)?.[1]);
  if (!id || !Number.isFinite(duration) || duration <= 0) {
    errors.push(`${file}: missing valid meta id or duration`);
    continue;
  }
  if (!seen.has(id)) errors.push(`${file}: ${id} is not registered in contentManifest.ts`);
  if (manifestDurations[id] !== duration) errors.push(`${file}: duration ${duration} does not match manifest ${manifestDurations[id]}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`content validation passed: ${manifestIds.length} videos, ${freeCount} free`);
