// 截图脚本：1440×900 视口，2 倍像素，打开 index.html?annotate=1，按章节 id 截图。
// 本地运行：
//   npm install
//   npx playwright install chromium
//   node scripts/screenshot.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const shots = [
  ['ch1', '01-user-flow'],
  ['ch2', '02-states'],
  ['ch3', '03-edge-cases'],
  ['ch4', '04-ai-vs-me'],
  ['ch5', '05-funnel'],
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?annotate=1');
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

for (const [id, name] of shots) {
  const file = path.join(outDir, `${name}.png`);
  await page.locator(`#${id}`).screenshot({ path: file, animations: 'disabled' });
  console.log(`saved ${path.relative(root, file)}`);
}

await browser.close();
if (errors.length) {
  console.error('Console errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
