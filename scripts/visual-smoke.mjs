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
  const kpi=await page.locator('.kpi-row').boundingBox();
  const hero=await page.locator('.hero').boundingBox();
  const table=await page.locator('.results-panel').boundingBox();
  assert.ok(kpi && hero && table && kpi.y < hero.y && hero.y < table.y,'Contract layout order');
  const tableBottom = table.y + table.height;
  assert.ok(tableBottom > 0.78 * 1440, 'At 3440×1440 the page should use most of the available vertical display, not render as tiny controls at the top');
  assert.ok(await page.locator('.weapon-tile img').first().evaluate(img=>img.complete && img.naturalWidth > 0), 'Approved GAU-8/A image loads');
  assert.ok(await page.locator('.rso-brand img').evaluate(img=>img.complete && img.naturalWidth > 0), 'Official RSO logo loads');
  await page.screenshot({path:'artifacts/ui/armament-dashboard-3440x1440.png',fullPage:true});
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
  await page.screenshot({path:'artifacts/ui/armament-request-assistance-3440x1440.png',fullPage:true});
  assert.deepEqual(errors,[],'No client runtime exceptions');
  console.log('Visual acceptance smoke tests passed. Screenshots available in artifacts/ui.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
