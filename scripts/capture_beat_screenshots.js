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

    const pauseAtTime = async (timeSec) => {
      await pageCdp.send('Runtime.evaluate', {
        expression: `
          if (window.__heroTimeline) {
            window.__heroTimeline.seek(${timeSec}, false);
            window.__heroTimeline.pause();
          }
        `,
      });
      await new Promise((r) => setTimeout(r, 400));
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    console.log('Navigating to http://localhost:5173...');
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500); // Initial mount

    // Viewport 1440x900 (Desktop)
    await setViewport(1440, 900);
    await sleep(500);

    const timestamps = [0.5, 3.5, 4.5, 7.0];

    // Capture Desktop at 0.5s, 3.5s, 4.5s, 7.0s
    for (const t of timestamps) {
      console.log(`Capturing Desktop at ${t}s...`);
      await pauseAtTime(t);
      await capture(`hero-1440-${t}s.png`);
    }

    // Viewport 390x844 (Mobile)
    await setViewport(390, 844, true);
    await sleep(600);

    // Capture Mobile at 0.5s, 3.5s, 4.5s, 7.0s
    for (const t of timestamps) {
      console.log(`Capturing Mobile at ${t}s...`);
      await pauseAtTime(t);
      await capture(`hero-390-${t}s.png`);
    }

    pageCdp.close();
    cdp.close();
    console.log('All hero screenshots captured successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
