# AI 主图 PRD（HTML 作品）

SaleCapitAI「AI 主图」功能的 HTML PRD 和可点击原型。卖家上传 1 张实拍照片，AI 换掉杂乱的背景，一次生成 4 张主图。

- 在线 PRD：<https://xurongliu.github.io/aigc-main-image-prd/>
- 带标注的版本：<https://xurongliu.github.io/aigc-main-image-prd/?annotate=1>
- 可点击原型：<https://xurongliu.github.io/aigc-main-image-prd/prototype.html>

> 在线链接需要先开启 GitHub Pages：仓库 Settings → Pages → Source 选 **GitHub Actions**。开启后，每次推送到 `main` 都会自动部署。

## 内容

| 文件 | 内容 |
| --- | --- |
| `index.html` | PRD 主文档。第 0 章概览，第 1–5 章：用户路径、多状态页面、边界异常、AI 初稿对照、埋点与漏斗。 |
| `prototype.html` | 可点击原型。主路径可从头点到尾；右侧切换器可打开 23 个状态。`prototype.html#genFail` 这样的链接可直接打开某个状态。 |
| `assets/` | CSS 和 JS。手机界面只写一份（`assets/js/screens.js`），PRD 和原型共用。商品图是自绘 SVG（`assets/js/art.js`）。 |
| `drafts/` | AI 初稿（v0）、生成它的 prompt、审查记录。 |
| `screenshots/` | 5 张截图：1440 宽，2 倍像素，带标注。 |
| `scripts/screenshot.mjs` | 截图脚本。 |
| `application-answer.md` | 申请题可以直接粘贴的回答。 |
| `interview-notes.md` | 逐章讲解稿和可能被追问的问题。 |

## 本地查看

不需要构建。双击 `index.html` 或 `prototype.html` 即可打开。

标注模式：在地址后加 `?annotate=1`，或点击左侧目录底部的「标注模式」。标注模式会显示红框、编号和每章的「设计决策」说明。

## 重新截图

需要 Node.js 18 或更高版本。

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
node scripts/screenshot.mjs
```

截图保存到 `screenshots/`：

| 文件 | 章节 |
| --- | --- |
| `01-user-flow.png` | 第 1 章 用户路径与模块流程 |
| `02-states.png` | 第 2 章 核心页面多状态 |
| `03-edge-cases.png` | 第 3 章 交互标注与边界异常 |
| `04-ai-vs-me.png` | 第 4 章 AI 初稿 vs 我的修改 |
| `05-funnel.png` | 第 5 章 埋点与漏斗 |

如果页面有控制台报错，脚本会列出报错，并以非 0 状态退出。

## 说明

- **数值**：所有指标都是假设目标值；漏斗是示意数据，不是真实数据。
- **素材**：商品图和生成结果都是自绘 SVG。不使用真实品牌、他人照片或有版权的素材。
- **AI 初稿**：`drafts/v0-ai-draft.md` 由 Claude 子 agent 根据一句 prompt（`drafts/v0-prompt.txt`）生成。子 agent 能读取 capstone 仓库的文档。公开版删去了 5 处 capstone 内部细节，原位有标注。除此之外，原文未改。
- **审查记录**：`drafts/review-log.md` 列出 v0 的 15 处问题和处理结果。第 4 章选了其中 5 处。
- **隐私**：仓库只使用 SaleCapitAI 的产品层面信息（类目、照片规则、发布流程）。不包含 capstone 的代码、客户信息或队友信息。
