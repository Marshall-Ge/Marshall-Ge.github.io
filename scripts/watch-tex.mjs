import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { compileAndSync } from './build-tex.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const latexDir = path.join(root, 'latex');
const scanInterval = 1000;

function latexWorkshopHandlesTex() {
  try {
    const extensions = fs.readdirSync(path.join(os.homedir(), '.vscode', 'extensions'));
    if (!extensions.some(name => name.startsWith('james-yu.latex-workshop-'))) return false;
    const settings = fs.readFileSync(path.join(root, '.vscode', 'settings.json'), 'utf8');
    return /"latex-workshop\.latex\.autoBuild\.run"\s*:\s*"onSave"/.test(settings);
  } catch {
    return false;
  }
}

const vscodeBuildsTex = latexWorkshopHandlesTex() &&
  spawnSync('pgrep', ['-f', 'MacOS/Code'], { stdio: 'ignore' }).status === 0;

const opened = new Set();
const pending = new Map();
const watched = new Map();

function schedule(slug, draft) {
  const key = `${draft ? 'draft:' : ''}${slug}`;
  const prev = pending.get(key);
  if (prev) clearTimeout(prev);
  pending.set(key, setTimeout(() => {
    pending.delete(key);
    (async () => {
      try {
        console.log(`Building ${slug}.tex …`);
        const { destination } = await compileAndSync(slug, { draft });
        if (!opened.has(key)) {
          opened.add(key);
          spawnSync('open', [destination], { stdio: 'ignore' });
        }
      } catch (e) {
        console.error(e.message);
      }
    })();
  }, 200));
}

function watch(file, slug, draft) {
  if (watched.has(file)) return;
  let watcher;
  try { watcher = fs.watch(file); } catch { return; }
  watched.set(file, watcher);
  watcher.on('change', (eventType) => {
    if (fs.existsSync(file)) schedule(slug, draft);
    if (eventType === 'rename') {
      watcher.close();
      watched.delete(file);
      setTimeout(() => {
        if (fs.existsSync(file)) watch(file, slug, draft);
      }, 100);
    }
  });
  watcher.on('error', () => {
    watcher.close();
    watched.delete(file);
  });
}

function scanDir(dir, draft) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue;
    if (!draft && ent.name === 'drafts') continue;
    const full = path.join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith('.tex')) {
      if (!vscodeBuildsTex) watch(full, ent.name.replace(/\.tex$/, ''), draft);
    } else if (ent.isDirectory()) {
      let files;
      try { files = fs.readdirSync(full); } catch { continue; }
      for (const name of files) {
        if (name.startsWith('.')) continue;
        watch(path.join(full, name), ent.name, draft);
      }
    }
  }
}

function scan() {
  scanDir(latexDir, false);
  scanDir(path.join(latexDir, 'drafts'), true);
}

scan();
setInterval(scan, scanInterval);
console.log(`Watching ${latexDir} … (Ctrl-C to stop)`);
if (vscodeBuildsTex) {
  console.log('LaTeX Workshop handles .tex saves; watching image folders only.');
}
