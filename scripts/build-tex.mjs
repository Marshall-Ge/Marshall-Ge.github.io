import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';

const root = fileURLToPath(new URL('../', import.meta.url));
const latexDir = path.join(root, 'latex');
const draftsDir = path.join(latexDir, 'drafts');
const postsDir = path.join(root, '_posts');
const pdfsDir = path.join(root, 'assets/pdfs');
const draftsPdfDir = path.join(pdfsDir, 'drafts');
const manifestPath = path.join(pdfsDir, 'tex-manifest.json');
const check = process.argv.includes('--check');
const openPdf = process.argv.includes('--open');
const selected = process.argv.slice(2)
  .filter(a => !a.startsWith('--'))
  .map(a => path.basename(a).replace(/\.tex$/, ''));

function extractBraceArg(src, cmd) {
  const re = new RegExp('\\\\' + cmd + '\\s*\\{');
  const m = re.exec(src);
  if (!m) return null;
  let depth = 1;
  let out = '';
  for (let i = m.index + m[0].length; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') { out += '\\'; if (i + 1 < src.length) { out += src[i + 1]; i++; } continue; }
    if (ch === '{') { depth++; out += ch; continue; }
    if (ch === '}') { depth--; if (depth === 0) return out; out += ch; continue; }
    out += ch;
  }
  return out;
}

function stripLatex(text) {
  let t = text;
  t = t.replace(/\\([_%&#${}])/g, '$1');
  t = t.replace(/%.*$/gm, ' ');
  t = t.replace(/\\\[[\s\S]*?\\\]/g, ' ');
  t = t.replace(/\\\([\s\S]*?\\\)/g, ' ');
  t = t.replace(/\$\$[\s\S]*?\$\$/g, ' ');
  t = t.replace(/\$[^$\n]*?\$/g, ' ');
  t = t.replace(/\\(?:begin|end)\{[^}]*\}/g, ' ');
  t = t.replace(/\\[a-zA-Z]+/g, ' ');
  t = t.replace(/\\[^a-zA-Z]/g, ' ');
  t = t.replace(/[{}]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function parseTags(raw) {
  if (!raw) return [];
  let s = raw.trim();
  if (s.startsWith('[')) s = s.slice(1);
  if (s.endsWith(']')) s = s.slice(0, -1);
  if (!s.trim()) return [];
  return s.split(/[,，]/).map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

function autoExcerpt(src) {
  const start = src.indexOf('\\begin{document}');
  const end = src.indexOf('\\end{document}');
  if (start === -1) return '';
  const body = end === -1 ? src.slice(start) : src.slice(start, end);
  const text = stripLatex(body);
  if (text.length <= 200) return text;
  const cut = text.slice(0, 200);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '…';
}

function parseMeta(src, slug) {
  const meta = {};
  const header = src.slice(0, 2000);
  const lineRe = /^%\s*([a-z_]+)\s*:\s*(.*)$/gm;
  let m;
  while ((m = lineRe.exec(header))) {
    if (!(m[1] in meta)) meta[m[1]] = m[2].trim();
  }
  const rawTitle = extractBraceArg(src, 'title');
  const cleanedTitle = rawTitle != null ? stripLatex(rawTitle) : '';
  const title = cleanedTitle || meta.title || slug;
  return {
    title,
    tags: parseTags(meta.tags),
    author: meta.author || 'marshall',
    excerpt: (meta.excerpt && meta.excerpt.trim()) || autoExcerpt(src)
  };
}

async function readManifest() {
  try { return JSON.parse(await fs.readFile(manifestPath, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}

function assertDate(slug) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(slug)) {
    throw new Error(`latex/${slug}.tex: filename must start with YYYY-MM-DD-.`);
  }
}

export async function compileAndSync(slug, { open = false, draft = false } = {}) {
  assertDate(slug);
  const texPath = path.join(draft ? draftsDir : latexDir, `${slug}.tex`);
  const src = await fs.readFile(texPath, 'utf8');
  const { title, tags, author, excerpt } = parseMeta(src, slug);
  const date = slug.slice(0, 10);
  const hash = createHash('sha256').update(src).digest('hex');
  const pdf = draft ? `/assets/pdfs/drafts/${slug}.pdf` : `/assets/pdfs/${slug}.pdf`;
  const destination = path.join(root, pdf);
  const outDir = draft ? draftsPdfDir : pdfsDir;

  await fs.mkdir(outDir, { recursive: true });
  const res = spawnSync('tectonic', ['-o', outDir, texPath], { stdio: 'inherit' });
  if (res.error) throw new Error(`tectonic not found: ${res.error.message}`);
  if (res.status !== 0) throw new Error(`tectonic failed for ${slug}.tex`);

  if (!draft) {
    const fm = [
      `pdf: ${pdf}`,
      'layout: post',
      `title: ${JSON.stringify(title)}`,
      `date: ${date}`,
      `tags: ${JSON.stringify(tags)}`,
      'comments: true',
      `author: ${author}`,
      'latex: true'
    ].join('\n');
    const stub = `---\n${fm}\n---\n${excerpt}\n\n<!-- more -->\n`;
    await fs.writeFile(path.join(postsDir, `${slug}.md`), stub);

    const manifest = await readManifest();
    manifest[slug] = { pdf, sha256: hash };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }

  if (open) spawnSync('open', [destination], { stdio: 'ignore' });
  console.log(`Generated ${pdf}`);
  return { pdf, destination, title, draft };
}

async function checkSlug(slug) {
  assertDate(slug);
  const src = await fs.readFile(path.join(latexDir, `${slug}.tex`), 'utf8');
  const hash = createHash('sha256').update(src).digest('hex');
  const pdf = `/assets/pdfs/${slug}.pdf`;
  const destination = path.join(root, pdf);
  const manifest = await readManifest();
  let bytes;
  try { bytes = await fs.readFile(destination); }
  catch { throw new Error(`${slug}.tex: PDF missing. Run npm run tex:build.`); }
  let data;
  try { data = matter(await fs.readFile(path.join(postsDir, `${slug}.md`), 'utf8')).data; }
  catch { throw new Error(`${slug}.tex: _posts stub missing. Run npm run tex:build.`); }
  if (manifest[slug]?.sha256 !== hash || data.pdf !== pdf || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error(`${slug}.tex: PDF stale or mapping incorrect. Run npm run tex:build.`);
  }
  console.log(`OK ${slug}.tex`);
}

async function main() {
  await fs.mkdir(pdfsDir, { recursive: true });
  await fs.mkdir(draftsPdfDir, { recursive: true });
  const releaseFiles = (await fs.readdir(latexDir)).filter(f => f.endsWith('.tex') && !f.startsWith('_')).sort();
  const draftFiles = (await fs.readdir(draftsDir).catch(() => [])).filter(f => f.endsWith('.tex')).sort();

  const targets = [];
  for (const f of releaseFiles) {
    if (selected.length === 0 || selected.some(a => f.includes(a))) targets.push({ slug: f.replace(/\.tex$/, ''), draft: false });
  }
  for (const f of draftFiles) {
    if (selected.length === 0 || selected.some(a => f.includes(a))) targets.push({ slug: f.replace(/\.tex$/, ''), draft: true });
  }

  for (const { slug, draft } of targets) {
    if (check) {
      if (!draft) await checkSlug(slug);
    } else {
      await compileAndSync(slug, { open: openPdf, draft });
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
