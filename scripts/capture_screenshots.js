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

    // Target.createTarget or find page target
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

    const scrollTo = async (selectorOrPos) => {
      if (typeof selectorOrPos === 'string') {
        await pageCdp.send('Runtime.evaluate', {
          expression: `
            if (window.__lenis) {
              window.__lenis.scrollTo("${selectorOrPos}", { immediate: true });
            } else {
              const el = document.querySelector("${selectorOrPos}");
              if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
            }
          `,
        });
      } else {
        await pageCdp.send('Runtime.evaluate', {
          expression: `
            if (window.__lenis) {
              window.__lenis.scrollTo(${selectorOrPos}, { immediate: true });
            } else {
              window.scrollTo({ top: ${selectorOrPos}, behavior: "instant" });
            }
          `,
        });
      }
      await sleep(800);
    };

    console.log('Navigating to http://localhost:5173...');
    await pageCdp.send('Page.navigate', { url: 'http://localhost:5173' });
    // Wait for DOM and React to mount
    await pageCdp.send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const check = () => {
            if (document.querySelector('h1')) resolve(true);
            else setTimeout(check, 100);
          };
          check();
        });
      `,
      awaitPromise: true,
    });
    await sleep(2000); // Allow WebGL and GSAP animations to complete

    // 1. Desktop Hero (1440x900)
    console.log('Capturing Desktop Hero...');
    await setViewport(1440, 900);
    await scrollTo(0);
    await sleep(800);
    await capture('01-desktop-hero.png');

    // 2. Desktop Problem Section
    console.log('Capturing Desktop Problem Section...');
    await scrollTo('#problem');
    await capture('02-desktop-problem.png');

    // 3. Desktop Product Preview
    console.log('Capturing Desktop Product Preview...');
    await scrollTo('#platform');
    await capture('03-desktop-product-preview.png');

    // 4. Desktop Four Pillars
    console.log('Capturing Desktop Four Pillars...');
    await scrollTo('#product-pillars');
    await capture('04-desktop-four-pillars.png');

    // 5. Desktop Handover Section
    console.log('Capturing Desktop Handover Section...');
    await scrollTo('#handover');
    await capture('05-desktop-handover.png');

    // 6. Desktop Communities
    console.log('Capturing Desktop Communities...');
    await scrollTo('#communities');
    await capture('06-desktop-communities.png');

    // 7. Desktop CTA and Footer
    console.log('Capturing Desktop CTA and Footer...');
    await pageCdp.send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, document.body.scrollHeight);',
    });
    await sleep(600);
    await capture('07-desktop-cta-footer.png');

    // 8. Tablet Hero (768x1024)
    console.log('Capturing Tablet Hero...');
    await setViewport(768, 1024);
    await scrollTo(0);
    await sleep(600);
    await capture('08-tablet-hero.png');

    // 9. Mobile Hero (390x844)
    console.log('Capturing Mobile Hero...');
    await setViewport(390, 844, true);
    await scrollTo(0);
    await sleep(600);
    await capture('09-mobile-hero.png');

    // 10. Mobile Navigation
    console.log('Capturing Mobile Navigation...');
    await pageCdp.send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[aria-label="Toggle menu"]');
        if (btn) btn.click();
      `,
    });
    await sleep(600);
    await capture('10-mobile-navigation.png');

    pageCdp.close();
    cdp.close();
    console.log('All 10 review screenshots captured successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
