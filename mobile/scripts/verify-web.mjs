import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:8090';
const shot = process.argv[3] || 'web-check.png';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000); // let RN Web finish its first render pass
await page.screenshot({ path: shot });

console.log('--- CONSOLE ERRORS ---');
console.log(errors.length ? errors.join('\n') : '(none)');

await browser.close();
