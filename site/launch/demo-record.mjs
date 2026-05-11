// Frame-driven recorder: page exposes window.__renderAt(t_ms).
// We call it for each frame, then screenshot.
// Real wall-clock time is irrelevant; only fake-time is what the page shows.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const W = 1280;
const H = 800;
const FPS = 30;
const DURATION_MS = 13000;
const FRAMES = Math.round((DURATION_MS / 1000) * FPS);
const OUT_DIR = '/tmp/floom-demo/frames';

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const url = 'file://' + path.resolve('/tmp/floom-demo/demo.html');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Loading', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for fonts and renderAt to be ready
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.waitForFunction(() => window.__demoReady === true, { timeout: 10000 });
  await page.waitForTimeout(150); // settle

  const start = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    const tMs = (i / FPS) * 1000;
    await page.evaluate((t) => window.__renderAt(t), tMs);
    const fname = path.join(OUT_DIR, `frame-${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: fname, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
    if (i % 30 === 0) console.log(`frame ${i}/${FRAMES} (page-t=${tMs.toFixed(0)}ms)`);
  }

  const elapsed = Date.now() - start;
  await browser.close();
  console.log(`Captured ${FRAMES} frames into ${OUT_DIR} in ${(elapsed/1000).toFixed(1)}s`);
})();
