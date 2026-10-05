import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'assets/pdfs');
const check = process.argv.includes('--check');
const selected = process.argv.slice(2).filter(arg => arg !== '--check');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new MarkdownIt({ html: true, linkify: true }).use(texmath, {
  engine: katex, delimiters: ['dollars', 'brackets'],
  katexOptions: { throwOnError: true, strict: 'ignore' }
});
const css = await fs.readFile(path.join(root, 'scripts/pdf.css'), 'utf8');
const unavailableImages = JSON.parse(await fs.readFile(path.join(root, 'scripts/unavailable-images.json'), 'utf8'));
const katexCss = pathToFileURL(path.join(root, 'node_modules/katex/dist/katex.min.css')).href;
const files = (await fs.readdir(path.join(root, '_posts'))).filter(f => f.endsWith('.md')).sort();
let manifest = {};
try { manifest = JSON.parse(await fs.readFile(path.join(output, 'manifest.json'), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await fs.mkdir(output, { recursive: true });
let browser;
try {
  if (!check) {
    const options = { headless: true };
    if (process.env.CHROME_PATH) options.executablePath = process.env.CHROME_PATH;
    else if (process.platform === 'darwin') options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    browser = await chromium.launch(options);
  }
  for (const file of files) {
    if (selected.length && !selected.some(arg => file.includes(arg))) continue;
    const sourcePath = path.join(root, '_posts', file);
    const source = await fs.readFile(sourcePath, 'utf8');
    const { data, content } = matter(source);
    const pdf = `/assets/pdfs/${file.replace(/\.md$/, '.pdf')}`;
    const hash = createHash('sha256').update(content).update(JSON.stringify({ title: data.title, date: data.date, author: data.author })).update(css)
      .update(await fs.readFile(fileURLToPath(import.meta.url))).update(await fs.readFile(path.join(root, 'package-lock.json')))
      .update(JSON.stringify(unavailableImages)).digest('hex');
    const destination = path.join(root, pdf);
    if (check) {
      const bytes = await fs.readFile(destination);
      if (data.pdf !== pdf || manifest[file]?.sha256 !== hash || bytes.subarray(0, 5).toString() !== '%PDF-') {
        throw new Error(`${file}: PDF missing, stale, or front matter mapping incorrect. Run npm run pdf:build.`);
      }
      console.log(`OK ${file}`);
      continue;
    }
    const page = await browser.newPage();
    // Local base preserves both Markdown and raw HTML images relative to _posts.
    const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><base href="${pathToFileURL(path.join(root, '_posts/')).href}"><title>${escape(data.title)}</title><link rel="stylesheet" href="${katexCss}"><style>${css}</style></head><body><h1>${escape(data.title)}</h1><div class="metadata">${escape(date)} · ${escape(data.author || 'Marshall')}</div>${md.render(content)}</body></html>`;
    const tempDir = path.join(root, 'tmp/pdfs');
    await fs.mkdir(tempDir, { recursive: true });
    const htmlPath = path.join(tempDir, file.replace(/\.md$/, '.html'));
    await fs.writeFile(htmlPath, html);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.evaluate(async () => {
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
      return [...document.images].filter(img => !img.naturalWidth).map(img => img.src);
    });
    const unexpected = broken.filter(url => !unavailableImages.includes(url));
    if (unexpected.length) throw new Error(`${file}: broken images: ${unexpected.join(', ')}`);
    if (broken.length) {
      await page.evaluate(urls => {
        for (const img of [...document.images]) {
          if (!urls.includes(img.src)) continue;
          const note = document.createElement('p');
          const link = document.createElement('a');
          note.textContent = '原图暂不可用（原站链接失效）：';
          link.href = img.src;
          link.textContent = img.src.split('/').pop();
          note.append(link);
          img.replaceWith(note);
        }
      }, broken);
      console.warn(`${file}: ${broken.length} known unavailable images labelled with source links.`);
    }
    const mathErrors = await page.locator('.katex-error').allTextContents();
    if (mathErrors.length) throw new Error(`${file}: invalid formulas: ${mathErrors.join(', ')}`);
    await page.pdf({ path: destination, format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="font-size:9px;color:#798391;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
    // Only add the PDF reference; leave the original Markdown and YAML intact.
    if (data.pdf !== pdf) {
      const updated = data.pdf
        ? source.replace(/^pdf:.*$/m, `pdf: ${pdf}`)
        : source.replace(/^(---\r?\n)/, `$1pdf: ${pdf}\n`);
      await fs.writeFile(sourcePath, updated);
    }
    manifest[file] = { pdf, sha256: hash };
    await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Generated ${pdf}`);
    await page.close();
  }
} finally {
  await browser?.close();
}
