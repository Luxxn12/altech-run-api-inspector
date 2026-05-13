const { spawnSync } = require('child_process');

const START = Number(process.env.API_INSPECTOR_DASHBOARD_PORT || 3939);
const SCAN = Number(process.env.API_INSPECTOR_DASHBOARD_SCAN || 20);
const ports = [8081, ...Array.from({ length: SCAN + 1 }, (_, i) => START + i)];

function runAdb(args) {
  return spawnSync('adb', args, { stdio: 'pipe', encoding: 'utf8' });
}

const devices = runAdb(['devices']);
if (devices.status !== 0) {
  console.log('[api-inspector] adb not available, skip port reverse');
  process.exit(0);
}

for (const port of ports) {
  const res = runAdb(['reverse', `tcp:${port}`, `tcp:${port}`]);
  if (res.status === 0) {
    console.log(`[api-inspector] adb reverse tcp:${port} tcp:${port}`);
  }
}
