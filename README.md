# Marshall-Ge.github.io

基于 Jekyll / GitHub Pages 的个人博客，文章正文以 PDF 展示。

## 写作与生成 PDF

Markdown 源文保留在 `_posts/`，用于编辑、首页摘要及订阅。文章页通过 front matter 的 `pdf` 字段加载 `assets/pdfs/` 中的 PDF，保留原有文章 URL、分类和评论，并提供独立打开与下载入口。不支持内嵌 PDF 的浏览器可使用打开链接。

需要 Node.js 20+ 和 Chrome / Chromium：

```sh
npm ci
# Linux / CI 首次运行：
npx playwright install --with-deps chromium
npm run pdf:build
npm run pdf:check
```

macOS 默认使用 `/Applications/Google Chrome.app`，也可通过 `CHROME_PATH` 指定浏览器可执行文件。使用本机中文字体；Linux 建议安装 `fonts-noto-cjk`。

只更新某一篇：`npm run pdf:build -- interview_code_exam`。生成器会自动更新对应的 `pdf` 字段。提交 Markdown、PDF 及 `assets/pdfs/manifest.json`；线上 Jekyll 直接发布已生成的 PDF，无需运行浏览器。更换转换器、依赖或打印样式后应全量重建。

PDF 包含中文、代码自动换行、图片、KaTeX 公式及页码。`scripts/pdf.css` 控制打印排版。转换时检查图片和公式；未知的缺失图片会中止生成。比特币文章原站的 6 张图片已失效，列在 `scripts/unavailable-images.json`，PDF 中保留缺图说明与来源链接；恢复原图后重新生成即可。

`npm run pdf:check` 校验所有文章的 PDF 映射、文件签名以及正文/元数据/转换器摘要。图片修改后也需重新生成对应 PDF。
