import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileAndSync } from './build-tex.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const latexDir = path.join(root, 'latex');
const draftsDir = path.join(latexDir, 'drafts');
const draftsPdfDir = path.join(root, 'assets/pdfs/drafts');

const [arg] = process.argv.slice(2);

async function main() {
  if (!arg) {
    console.error('Usage: npm run tex:publish -- <slug>');
    process.exit(1);
  }
  const base = path.basename(arg).replace(/\.tex$/, '');
  const files = (await fs.readdir(draftsDir).catch(() => []))
    .filter(f => f.endsWith('.tex'));
  const matches = files.filter(f => f.replace(/\.tex$/, '').includes(base));
  if (matches.length === 0) {
    console.error(`No draft matches "${base}" in latex/drafts/.`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Multiple drafts match "${base}": ${matches.join(', ')}`);
    process.exit(1);
  }
  const slug = matches[0].replace(/\.tex$/, '');
  const texSrc = path.join(draftsDir, `${slug}.tex`);
  const texDest = path.join(latexDir, `${slug}.tex`);
  const imgSrc = path.join(draftsDir, slug);
  const imgDest = path.join(latexDir, slug);

  try {
    await fs.access(texDest);
    console.error(`latex/${slug}.tex already exists (already released).`);
    process.exit(1);
  } catch {}

  await fs.rename(texSrc, texDest);
  try {
    await fs.rename(imgSrc, imgDest);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  await fs.rm(path.join(draftsPdfDir, `${slug}.pdf`), { force: true });

  console.log(`Released ${slug}`);
  await compileAndSync(slug, { open: false });
}

main().catch(e => { console.error(e.message); process.exit(1); });
