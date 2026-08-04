import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

const allErrors = [];
let currentLabel = 'startup';
page.on('console', (msg) => { if (msg.type() === 'error') allErrors.push(`[${currentLabel}] [console] ${msg.text()}`); });
page.on('pageerror', (err) => allErrors.push(`[${currentLabel}] [pageerror] ${err.message}`));
page.on('response', (res) => {
  if (res.status() >= 400 && !res.url().includes('/api/user/avatar/')) {
    allErrors.push(`[${currentLabel}] [http ${res.status()}] ${res.url()}`);
  }
});

function label(l) { currentLabel = l; console.log(`--- ${l} ---`); }

async function shot(name) {
  await page.screenshot({ path: `sweep-${name}.png` });
}

label('onboarding');
await page.goto('http://localhost:8090', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await shot('01-onboarding');

const skip = page.getByText('Skip', { exact: false });
if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(1200); }

label('login');
await shot('02-login');
await page.getByRole('textbox').first().fill('webtest+playwright@simfinity.local');
await page.getByRole('textbox').nth(1).fill('WebTest123!');
await page.getByText('Sign In', { exact: false }).first().click();
await page.waitForTimeout(2500);

label('home-tab');
await shot('03-home');
console.log('URL:', page.url());
const randomBtnCount = await page.getByText('Random', { exact: true }).count();
console.log('Random button count (expect 0):', randomBtnCount);

label('explore-tab');
await page.getByText('Explore', { exact: true }).last().click();
await page.waitForTimeout(2000);
await shot('04-explore');
console.log('URL:', page.url());

label('my-esims-tab');
await page.getByText('My eSIMs', { exact: true }).last().click();
await page.waitForTimeout(2000);
await shot('05-my-esims');
console.log('URL:', page.url());

label('account-tab');
await page.getByText('Account', { exact: true }).last().click();
await page.waitForTimeout(2000);
await shot('06-account');
console.log('URL:', page.url());

label('coverage-map');
await page.getByText('Explore', { exact: true }).last().click();
await page.waitForTimeout(1800);
const covBtnCount = await page.getByText('Coverage Map', { exact: true }).count();
if (covBtnCount > 0) {
  await page.getByText('Coverage Map', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  await shot('07-coverage-map');
  console.log('URL:', page.url());
} else {
  allErrors.push('[coverage-map] No Coverage Map button found');
}

label('checkout');
await page.goto('http://localhost:8090/plans', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1800);
const activateCount = await page.getByText('ACTIVATE NOW', { exact: true }).count();
if (activateCount > 0) {
  await page.getByText('ACTIVATE NOW', { exact: true }).first().click();
  await page.waitForTimeout(2500);
  await shot('08-checkout');
  console.log('URL:', page.url());
} else {
  allErrors.push('[checkout] No ACTIVATE NOW button found');
}

const secondaryRoutes = ['/personal-info', '/travel-docs', '/refer-friend', '/gift-esim', '/signup', '/privacy-policy', '/forgot-password'];
for (const route of secondaryRoutes) {
  label(`route:${route}`);
  await page.goto(`http://localhost:8090${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1800);
  await shot(`09-${route.replace(/\//g, '')}`);
}

label('logout-relogin-sanity');
await page.goto('http://localhost:8090', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
console.log('Final URL (should be tabs/home if session persisted):', page.url());

console.log('\n=== ALL ERRORS ===');
console.log(allErrors.length ? allErrors.join('\n') : '(none)');
console.log(`\nTotal errors: ${allErrors.length}`);

await browser.close();
