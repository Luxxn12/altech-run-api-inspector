#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: npx altech-api-inspector setup [--force]');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function copyDashboardTemplate(projectRoot, force = false) {
  const source = path.join(__dirname, '..', 'templates', 'dashboard.js');
  const targetDir = path.join(projectRoot, 'scripts');
  const target = path.join(targetDir, 'altech-api-inspector-dashboard.js');

  ensureDir(targetDir);

  if (!fs.existsSync(target) || force) {
    fs.copyFileSync(source, target);
    console.log(`${fs.existsSync(target) && force ? 'Updated' : 'Created'} ${path.relative(projectRoot, target)}`);
  } else {
    console.log(`Skipped ${path.relative(projectRoot, target)} (already exists)`);
  }
}

function copyReverseTemplate(projectRoot, force = false) {
  const source = path.join(__dirname, '..', 'templates', 'adb-reverse.js');
  const targetDir = path.join(projectRoot, 'scripts');
  const target = path.join(targetDir, 'altech-api-inspector-adb-reverse.js');

  ensureDir(targetDir);

  if (!fs.existsSync(target) || force) {
    const existedBefore = fs.existsSync(target);
    fs.copyFileSync(source, target);
    console.log(`${existedBefore ? 'Updated' : 'Created'} ${path.relative(projectRoot, target)}`);
  } else {
    console.log(`Skipped ${path.relative(projectRoot, target)} (already exists)`);
  }
}

function createBootstrapFile(projectRoot, force = false) {
  const target = path.join(projectRoot, 'api-inspector.bootstrap.js');
  const content = `import { NativeModules, Platform } from "react-native";
import { attachAxiosInspector, initApiInspector } from "altech-run-api-inspector";

const DASHBOARD_PORT = Number(process.env.API_INSPECTOR_DASHBOARD_PORT || 3939);
function getDevServerHost() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL || typeof scriptURL !== "string") {
      return null;
    }

    const hostPart = scriptURL.replace(/^https?:\\/\\//, "").split("/")[0];
    const host = hostPart.split(":")[0];
    return host || null;
  } catch {
    return null;
  }
}

const DASHBOARD_HOST = process.env.API_INSPECTOR_DASHBOARD_HOST || null;
const DEV_SERVER_HOST = getDevServerHost();
const HOST_CANDIDATES = [
  DASHBOARD_HOST,
  DEV_SERVER_HOST,
  Platform.OS === "android" ? "10.0.2.2" : null,
  "localhost",
  "127.0.0.1",
].filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);
const DASHBOARD_SCAN = Number(process.env.API_INSPECTOR_DASHBOARD_SCAN || 20);
const DASHBOARD_PORTS = Array.from({ length: DASHBOARD_SCAN + 1 }, (_, i) => DASHBOARD_PORT + i);
const DASHBOARD_TIMEOUT = Number(process.env.API_INSPECTOR_DASHBOARD_TIMEOUT_MS || 700);
const DASHBOARD_FETCH = typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;
let resolvedPort = DASHBOARD_PORT;
let resolvedHost = null;

function isDashboardLogUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  return HOST_CANDIDATES.some((host) => url.includes(\`\${host}:\`) && /\\/logs(\\?.*)?$/.test(url));
}

async function pushLogToDashboard(log) {
  const candidatePorts = [resolvedPort, ...DASHBOARD_PORTS.filter((p) => p !== resolvedPort)];
  const candidateHosts = [
    resolvedHost,
    ...HOST_CANDIDATES.filter((host) => host !== resolvedHost),
  ].filter(Boolean);

  for (const port of candidatePorts) {
    for (const host of candidateHosts) {
      const endpoint = \`http://\${host}:\${port}/logs\`;
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = setTimeout(() => controller?.abort(), DASHBOARD_TIMEOUT);

      try {
        const response = await (DASHBOARD_FETCH ?? fetch)(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(log),
          signal: controller?.signal,
        });
        clearTimeout(timer);

        if (response.ok) {
          resolvedPort = port;
          resolvedHost = host;
          return;
        }
      } catch {
        // try next candidate
      } finally {
        clearTimeout(timer);
      }
    }
  }
}

if (__DEV__ && !globalThis.__ALTECH_API_INSPECTOR_BOOTSTRAPPED__) {
  globalThis.__ALTECH_API_INSPECTOR_BOOTSTRAPPED__ = true;

  initApiInspector({
    mode: "ui",
    console: {
      verbosity: "compact",
      maxBodyLength: 800,
      onLog: (log) => {
        if (isDashboardLogUrl(log.url)) {
          return;
        }
        const { retry, ...serializableLog } = log;
        return pushLogToDashboard(serializableLog);
      },
    },
  });

  try {
    const axiosModule = require("axios");
    const axiosInstance = axiosModule.default || axiosModule;
    if (axiosInstance?.interceptors?.request && axiosInstance?.interceptors?.response) {
      attachAxiosInspector(axiosInstance, {
        mode: "ui",
        console: {
          verbosity: "compact",
          maxBodyLength: 800,
          onLog: (log) => {
            if (isDashboardLogUrl(log.url)) {
              return;
            }
            const { retry, ...serializableLog } = log;
            return pushLogToDashboard(serializableLog);
          },
        },
      });
    }
  } catch {
    // axios is optional
  }
}
`;

  if (!fs.existsSync(target) || force) {
    fs.writeFileSync(target, content, 'utf8');
    console.log(`${fs.existsSync(target) && force ? 'Updated' : 'Created'} ${path.relative(projectRoot, target)}`);
  } else {
    console.log(`Skipped ${path.relative(projectRoot, target)} (already exists)`);
  }
}

function findEntryFile(projectRoot) {
  const candidates = ['index.js', 'index.ts', 'index.tsx', 'index.jsx'];
  for (const item of candidates) {
    const fullPath = path.join(projectRoot, item);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function injectBootstrapImport(projectRoot) {
  const entryFile = findEntryFile(projectRoot);
  if (!entryFile) {
    console.log('Skipped bootstrap import (entry file not found).');
    return;
  }

  const marker = "import './api-inspector.bootstrap';";
  const current = fs.readFileSync(entryFile, 'utf8');
  if (current.includes('api-inspector.bootstrap')) {
    console.log(`Skipped ${path.relative(projectRoot, entryFile)} (bootstrap already imported)`);
    return;
  }

  const next = `${marker}\n${current}`;
  fs.writeFileSync(entryFile, next, 'utf8');
  console.log(`Updated ${path.relative(projectRoot, entryFile)} (bootstrap import added)`);
}

function setup() {
  const projectRoot = process.cwd();
  const force = process.argv.includes('--force');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found in current directory.');
    process.exit(1);
  }

  const pkg = readJson(packageJsonPath);
  pkg.scripts = pkg.scripts || {};
  pkg.devDependencies = pkg.devDependencies || {};

  const hasStartClean = Boolean(pkg.scripts['start:clean']);
  const hasStart = Boolean(pkg.scripts.start);
  const metroScriptName = hasStartClean ? 'start:clean' : hasStart ? 'start' : null;

  if (!pkg.scripts['api-inspector:dashboard']) {
    pkg.scripts['api-inspector:dashboard'] = 'node scripts/altech-api-inspector-dashboard.js';
  }

  if (!pkg.scripts['api-inspector:start']) {
    pkg.scripts['api-inspector:start'] = metroScriptName
      ? `npm run api-inspector:reverse && npm run ${metroScriptName}`
      : 'node scripts/altech-api-inspector-adb-reverse.js && react-native start --client-logs';
  }

  if (!pkg.scripts['api-inspector:reverse']) {
    pkg.scripts['api-inspector:reverse'] = 'node scripts/altech-api-inspector-adb-reverse.js';
  }

  if (!pkg.scripts['api-inspector:dev']) {
    pkg.scripts['api-inspector:dev'] =
      'concurrently -k -n DASHBOARD,METRO -c green,cyan "npm:api-inspector:dashboard" "npm:api-inspector:start"';
  }

  if (!pkg.devDependencies.concurrently && !(pkg.dependencies && pkg.dependencies.concurrently)) {
    pkg.devDependencies.concurrently = '^9.2.1';
  }

  writeJson(packageJsonPath, pkg);
  copyDashboardTemplate(projectRoot, force);
  copyReverseTemplate(projectRoot, force);
  createBootstrapFile(projectRoot, force);
  injectBootstrapImport(projectRoot);

  console.log('\nSetup completed.');
  console.log('Next steps:');
  console.log('1. npm install');
  console.log('2. npm run api-inspector:dev');
  console.log('3. run your app (npm run android / npm run ios)');
}

const [, , command] = process.argv;

if (!command || command === '--help' || command === '-h') {
  usage();
  process.exit(0);
}

if (command === 'setup') {
  setup();
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
usage();
process.exit(1);
