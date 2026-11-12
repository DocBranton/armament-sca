import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const port = 8123;
const url = `http://127.0.0.1:${port}/`;
const child = spawn('npm', ['run', 'start'], {
  env: { ...process.env, DATABRICKS_APP_PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});
let output = '';
child.stdout.on('data', data => { output += data.toString(); });
child.stderr.on('data', data => { output += data.toString(); });
try {
  let ok = false, reason = '';
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) throw Error(`AppKit process exited prematurely (${child.exitCode}):\n${output}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        const html = await response.text();
        assert.match(html, /id="root"/, 'AppKit must serve built React page');
        ok = true;
        break;
      }
      reason = `HTTP ${response.status}`;
    } catch(e) { reason = String(e); }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ok, `AppKit server did not serve homepage: ${reason}\n${output}`);
  console.log('AppKit production server smoke passed at '+url);
} finally {
  child.kill('SIGTERM');
}
