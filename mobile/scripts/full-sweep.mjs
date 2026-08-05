import { chromium } from 'playwright';

const testEmail = `fullsweep+${Date.now()}@simfinity.local`;
const testPassword = 'FullSweep123!';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.setDefaultTimeout(60000);

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
async function shot(name) { await page.screenshot({ path: `sweep-${name}.png` }); }

label('onboarding');
await page.goto('http://localhost:8090', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await shot('01-onboarding');

const skip = page.getByText('Skip', { exact: false });
if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(1200); }

label('signup');
await page.getByText('Create Account', { exact: false }).first().click();
await page.waitForTimeout(1000);
await shot('02-signup');
const signupBoxes = await page.getByRole('textbox').all();
await signupBoxes[0].fill('Full Sweep Tester');
await signupBoxes[1].fill(testEmail);
await signupBoxes[2].fill(testPassword);
await page.getByText('I agree to the', { exact: false }).click();
await page.getByText('Register & Connect', { exact: true }).click();
// Render free tier can cold-start (30-60s), so poll instead of a fixed wait
await page.waitForURL(/verify-email/, { timeout: 90000 }).catch(() => {});
console.log('URL after signup:', page.url());
await shot('03-verify-email');

label('otp-verify');
const boxCount = await page.locator('text=/./').count();
// Enter a wrong code first, then skip (we can't read the real code without DB access)
const hiddenInput = page.locator('input[maxlength="6"]');
if (await hiddenInput.count()) {
  await hiddenInput.fill('000000');
  await page.waitForTimeout(2000);
  await shot('04-otp-wrong');
}
const skipForNow = page.getByText('Skip For Now', { exact: true });
if (await skipForNow.count()) { await skipForNow.click(); await page.waitForTimeout(2000); }

label('home-tab');
await shot('05-home');
console.log('URL:', page.url());
const randomBtnCount = await page.getByText('Random', { exact: true }).count();
console.log('Random button count (expect 0):', randomBtnCount);

label('explore-tab');
await page.getByText('Explore', { exact: true }).last().click();
await page.waitForTimeout(2500);
await shot('06-explore');
console.log('URL:', page.url());

label('my-esims-tab');
await page.getByText('My eSIMs', { exact: true }).last().click();
await page.waitForTimeout(2000);
await shot('07-my-esims');
console.log('URL:', page.url());

label('account-tab');
await page.getByText('Account', { exact: true }).last().click();
await page.waitForTimeout(2000);
await shot('08-account');
console.log('URL:', page.url());

label('coverage-map');
await page.getByText('Explore', { exact: true }).last().click();
await page.waitForTimeout(2000);
const covBtnCount = await page.getByText('Coverage Map', { exact: true }).count();
if (covBtnCount > 0) {
  await page.getByText('Coverage Map', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  await shot('09-coverage-map');
  console.log('URL:', page.url());
} else {
  allErrors.push('[coverage-map] No Coverage Map button found');
}

label('checkout');
await page.goto('http://localhost:8090/plans', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
const activateCount = await page.getByText('ACTIVATE NOW', { exact: true }).count();
if (activateCount > 0) {
  await page.getByText('ACTIVATE NOW', { exact: true }).first().click();
  await page.waitForTimeout(2500);
  await shot('10-checkout');
  console.log('URL:', page.url());
} else {
  allErrors.push('[checkout] No ACTIVATE NOW button found');
}

label('forgot-password');
await page.goto('http://localhost:8090/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.getByText('Forgot Password?', { exact: false }).click();
await page.waitForTimeout(1500);
await shot('11-forgot-password');
const fpBoxes = await page.getByRole('textbox').all();
if (fpBoxes.length) {
  await fpBoxes[0].fill(testEmail);
  await page.getByText('Send Reset Link', { exact: true }).click();
  await page.waitForTimeout(2500);
  await shot('12-forgot-password-sent');
}

const secondaryRoutes = ['/personal-info', '/refer-friend', '/gift-esim', '/privacy-policy'];
for (const route of secondaryRoutes) {
  label(`route:${route}`);
  await page.goto(`http://localhost:8090${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await shot(`13-${route.replace(/\//g, '')}`);
}

label('logout');
await page.goto('http://localhost:8090/account', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
const logoutBtn = page.getByText('Log Out', { exact: true });
if (await logoutBtn.count()) {
  await logoutBtn.click();
  await page.waitForTimeout(2000);
  await shot('14-after-logout');
  console.log('URL after logout:', page.url());
}

console.log('\n=== ALL ERRORS ===');
console.log(allErrors.length ? allErrors.join('\n') : '(none)');
console.log(`\nTotal errors: ${allErrors.length}`);
console.log(`\nTest account: ${testEmail} / ${testPassword}`);

await browser.close();
