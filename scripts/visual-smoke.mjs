import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:4173';
const server = spawn('npx', ['vite', 'preview', '--config', 'client/vite.config.ts', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  env: process.env, stdio: 'inherit',
});
let browser;
try {
  let ready = false;
  for (let attempt=0;attempt<60;attempt++){
    if (server.exitCode !== null) throw new Error('Vite preview server exited early');
    try { const response = await fetch(base); if (response.ok){ready=true; break;} } catch {}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.ok(ready, 'Vite preview did not become ready');
  await mkdir('artifacts/ui', { recursive: true });
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:3440,height:1440},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Armament Supply Chain & AM Candidate Analysis'}).waitFor();
  assert.equal(await page.locator('.kpi').count(),6,'Exactly six KPI cards');
  assert.equal(await page.locator('.workflow-step').count(),6,'Exactly six workflow stages');
  assert.equal(await page.locator('.table-wrap tbody tr').count(),10,'Ten mock part records appear');
  assert.ok((await page.locator('.hero-cta').innerText()).includes('Request Assistance'));
  const systemBox = await page.locator('.system-card').boundingBox();
  const methodBox = await page.locator('.method-card').boundingBox();
  const factorBox = await page.locator('.factors').boundingBox();
  assert.ok(systemBox && methodBox && factorBox && systemBox.x < methodBox.x && methodBox.x < factorBox.x, 'Weapon system selection leads the control row at the left');
  const kpi=await page.locator('.kpi-row').boundingBox();
  const hero=await page.locator('.hero').boundingBox();
  const table=await page.locator('.results-panel').boundingBox();
  assert.ok(kpi && hero && table && kpi.y < hero.y && hero.y < table.y,'Contract layout order');
  const tableBottom = table.y + table.height;
  assert.ok(tableBottom > 0.78 * 1440, 'At 3440×1440 the page should use most of the available vertical display, not render as tiny controls at the top');
  assert.ok(await page.locator('.weapon-tile img').first().evaluate(img=>img.complete && img.naturalWidth > 0), 'Approved GAU-8/A image loads');
  assert.ok(await page.locator('.weapon-tile img').nth(1).evaluate(img=>img.complete && img.naturalWidth > 0), 'M61A1 Vulcan image loads in second card');
  assert.ok(await page.locator('.weapon-tile img').nth(2).evaluate(img=>img.complete && img.naturalWidth > 0), 'UAL image loads in third card');
  assert.match(await page.locator('.weapon-tile').nth(2).innerText(), /UAL/, 'Third card identifies UAL');
  assert.ok(await page.locator('.rso-brand img').evaluate(img=>img.complete && img.naturalWidth > 0), 'Official RSO logo loads');
  assert.ok(await page.locator('.division-emblem').evaluate(img=>img.complete && img.naturalWidth > 0), 'Official Weapons Superiority Division crest loads');
  assert.ok(await page.locator('.af-logo img').evaluate(i=>i.complete && i.naturalWidth>0),'USAF logo loads');
  const a10Asset = await page.evaluate(async () => {
    const response = await fetch('/brand/a10.webp');
    if (!response.ok) return false;
    const image = new Image();
    image.src = URL.createObjectURL(await response.blob());
    try {
      await image.decode();
      return image.naturalWidth === 2200 && image.naturalHeight === 190;
    } finally {
      URL.revokeObjectURL(image.src);
    }
  });
  assert.ok(a10Asset, 'Approved 2200 × 190 A-10 Hero background loads and decodes');
  await page.screenshot({path:'artifacts/ui/armament-dashboard-3440x1440.png',fullPage:false});
  await page.getByRole('button',{name:/Request Assistance/i}).first().click();
  await page.getByRole('dialog',{name:'REQUEST ASSISTANCE'}).waitFor();
  assert.equal(await page.locator('.request-types button').count(),5);
  await page.locator('.request-find input').nth(0).fill('1010-01-234-5678');
  await page.getByRole('button',{name:/Look up/i}).click();
  await page.getByText('Feed Pawl (Bolt Carrier Subassy)').last().waitFor();
  await page.getByRole('button',{name:/Feed Pawl \(Bolt Carrier Subassy\)/i}).click();
  await page.getByRole('button',{name:/Level II TDP/i}).click();
  await page.getByRole('button',{name:'Prepare Draft'}).click();
  await page.getByText(/No request was submitted/i).waitFor();
  await page.screenshot({path:'artifacts/ui/armament-request-assistance-3440x1440.png',fullPage:false});
  assert.deepEqual(errors,[],'No client runtime exceptions');
  console.log('Visual acceptance smoke tests passed. Screenshots available in artifacts/ui.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
