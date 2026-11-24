import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const OUTPUT_DIR = path.resolve('docs/screenshots');
const ARTIFACT_DIR = '/home/chjaswanthkumar/.gemini/antigravity/brain/91407159-029d-47a0-90bd-5fb5bc32a90c/screenshots';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function getWsUrl(port = 9222) {
  for (let i = 0; i < 30; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error('Failed to connect to Chrome debug port');
}

function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  });

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const currentId = id++;
      callbacks.set(currentId, { resolve, reject });
      ws.send(JSON.stringify({ id: currentId, method, params }));
    });
  };

  return new Promise((resolve, reject) => {
    ws.on('open', () => resolve({ send, close: () => ws.close() }));
    ws.on('error', reject);
  });
}

async function run() {
  const chrome = spawn(
    '/usr/bin/google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    const wsUrl = await getWsUrl(9222);
    const cdp = await createCdpClient(wsUrl);

    const { targetId } = await cdp.send('Target.createTarget', { url: 'http://localhost:5173' });
    const targetWsUrl = `ws://127.0.0.1:9222/devtools/page/${targetId}`;
    const pageCdp = await createCdpClient(targetWsUrl);

    await pageCdp.send('Page.enable');
    await pageCdp.send('Runtime.enable');
    await pageCdp.send('DOM.enable');

    const setViewport = async (width, height, mobile = false) => {
      await pageCdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile,
      });
      await pageCdp.send('Emulation.setVisibleSize', { width, height });
    };

    const capture = async (filename) => {
      const { data } = await pageCdp.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
      fs.writeFileSync(path.join(ARTIFACT_DIR, filename), buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    console.log('Navigating to http://localhost:5173...');
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500); // Initial mount

    // 1. Desktop Beat 1: Scattered (1440x900)
    console.log('Capturing Beat 1 (Scattered)...');
    await setViewport(1440, 900);
    await sleep(1000);
    await capture('01-hero-beat1-scattered.png');

    // 2. Desktop Beat 2: Gathered (wait ~2.5s for timeline to transition to Gathered)
    console.log('Waiting for Beat 2 (Gathered)...');
    await sleep(2500);
    await capture('02-hero-beat2-gathered.png');

    // 3. Desktop Beat 3: Handed Over (wait ~2.6s for timeline to transition to Handed Over)
    console.log('Waiting for Beat 3 (Handed Over)...');
    await sleep(2600);
    await capture('03-hero-beat3-handed-over.png');

    // 4. Mobile Hero (390x844)
    console.log('Capturing Mobile Hero...');
    await setViewport(390, 844, true);
    await sleep(800);
    await capture('04-hero-mobile-390.png');

    // 5. Reduced-Motion Fallback (emulate prefers-reduced-motion)
    console.log('Emulating prefers-reduced-motion: reduce...');
    await pageCdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await setViewport(1440, 900);
    await sleep(1000);
    await capture('05-hero-reduced-motion-fallback.png');

    pageCdp.close();
    cdp.close();
    console.log('All hero beat screenshots captured successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Error during beat screenshot capture:', err);
  process.exit(1);
});
