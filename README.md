# Marshall-Ge.github.io

基于 Jekyll / GitHub Pages 的个人博客，文章正文以 PDF 展示。

## 写作与生成 PDF

Markdown 源文保留在 `_posts/`，用于编辑、首页摘要及订阅。首页、分类和搜索结果通过 front matter 的 `pdf` 字段直接链接到 `assets/pdfs/` 中的 PDF，由浏览器显示。原有文章 URL 自动跳转到对应 PDF；不再显示内嵌阅读器、评论或打开/下载按钮。

需要 Node.js 20+ 和 Chrome / Chromium：

```sh
npm ci
# Linux / CI 首次运行：
npx playwright install --with-deps chromium
npm run pdf:build
npm run pdf:check
```

macOS 默认使用 `/Applications/Google Chrome.app`，也可通过 `CHROME_PATH` 指定浏览器可执行文件。正文和代码统一使用中文宋体（SimSun）、英文 Times New Roman，公式保留 KaTeX 数学字体。生成需要本机安装这些字体；macOS 默认可加载 Microsoft Word 内的 `Simsun.ttc`，也可通过 `SIMSUN_PATH` 指定本机合法字体文件。字体文件不复制到仓库；缺少指定字体时转换会报错。

只更新某一篇：`npm run pdf:build -- interview_code_exam`。生成器会自动更新对应的 `pdf` 字段。提交 Markdown、PDF 及 `assets/pdfs/manifest.json`；线上 Jekyll 直接发布已生成的 PDF，无需运行浏览器。更换转换器、依赖或打印样式后应全量重建。


`npm run pdf:check` 校验所有文章的 PDF 映射、文件签名以及正文/元数据/转换器摘要。图片修改后也需重新生成对应 PDF。

## LaTeX 写作

除了 Markdown，也可以直接用 LaTeX 写正文：在 `latex/` 下写一份自包含的 `.tex` 文档，编译出 PDF 并自动生成对应的 `_posts/*.md` 存根，从而无缝接入首页 / 搜索 / RSS。

需要 [Tectonic](https://tectonic-typesetting.github.io/)（`brew install tectonic`），首次编译某个宏包时会联网下载。

```sh
# 新建一篇：latex/YYYY-MM-DD-slug.tex（从 latex/_template.tex 复制并填入标题）
npm run tex:new -- my-post "文章标题"

# 编译全部，或只编某一篇
npm run tex:build
npm run tex:build -- my-post

# 边写边预览：保存后自动重编译，并打开系统 PDF 阅读器
npm run tex:watch

# 校验 PDF 是否与源文一致
npm run tex:check
```

`.tex` 顶部用注释块声明博客元数据；标题取自 `\title{...}`，日期取自文件名：

```latex
% ---
% tags: [AI, 数学]
% author: marshall
% excerpt: 一句话摘要（可选，缺省取正文首段）
% ---
\documentclass[11pt]{article}
...
```

每篇 LaTeX 文章的图片放在与 `.tex` 同名的文件夹里（`npm run tex:new` 会自动创建），例如 `latex/2026-10-27-my-post/fig1.png`。模板已通过 `\graphicspath` 把该目录加入搜索路径，正文中直接写 `\includegraphics{fig1.png}` 即可；`tex:watch` 也会监听这些图片文件夹并自动重编译。根目录的 `images/` 仅供 Markdown 文章使用。

仓库内的 `.vscode/settings.json` 让 LaTeX Workshop 在保存 `.tex` 时调用本项目的 `tex:build`，并用其内置 PDF 查看器自动刷新。首次使用需重载 VS Code 窗口，并用 “LaTeX Workshop: View LaTeX PDF” 打开 PDF；此时 `tex:watch` 只负责图片变化。若不用 VS Code，直接 `npm run tex:watch` 即可监听全部改动。

提交时一并提交 `.tex`、`_posts/*.md`、`assets/pdfs/*.pdf` 及 `assets/pdfs/tex-manifest.json`。中文默认使用 Microsoft Word 内的 `Simsun.ttc`，如需其它字体请修改 `latex/_template.tex` 中的 `\setCJKmainfont` 路径。
