import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const latexDir = path.join(root, 'latex');
const templatePath = path.join(latexDir, '_template.tex');

const args = process.argv.slice(2);
const release = args.includes('--release');
const [slug, ...titleParts] = args.filter(a => a !== '--release');
if (!slug) {
  console.error('Usage: npm run tex:new -- <slug> ["标题"] [--release]');
  process.exit(1);
}
const title = titleParts.join(' ').trim() || slug;
const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const filename = `${date}-${slug}.tex`;
const slugName = filename.replace(/\.tex$/, '');
const dir = release ? latexDir : path.join(latexDir, 'drafts');
const dest = path.join(dir, filename);
const imagesDir = path.join(dir, slugName);

const template = await fs.readFile(templatePath, 'utf8');
const content = template
  .replace(/\\title\{[^{}]*\}/, `\\title{${title}}`)
  .replaceAll('__IMAGES_DIR__', slugName);
await fs.mkdir(dir, { recursive: true });
try {
  await fs.writeFile(dest, content, { flag: 'wx' });
} catch (e) {
  if (e.code === 'EEXIST') { console.error(`${filename} already exists.`); process.exit(1); }
  throw e;
}
await fs.mkdir(imagesDir, { recursive: true });
await fs.writeFile(path.join(imagesDir, '.gitkeep'), '');
const relDir = release ? 'latex' : 'latex/drafts';
console.log(`Created ${relDir}/${filename}`);
console.log(`Created ${relDir}/${slugName}/ (put this article's images here)`);
console.log(release
  ? '接下来：编辑正文 → npm run tex:watch（自动编译预览）→ commit'
  : `这是草稿，不会被 git 跟踪。发布时运行：npm run tex:publish -- ${slug}`);
