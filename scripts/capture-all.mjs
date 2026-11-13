import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'public/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching Chrome headless with remote debugging on port 9222...');
  const chromeProcess = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--remote-debugging-port=9222',
      '--user-data-dir=/tmp/chrome_ss_profile',
      '--window-size=1440,960',
      '--hide-scrollbars',
    ],
    { stdio: 'ignore' }
  );

  chromeProcess.on('error', (err) => {
    console.error('Failed to spawn Chrome:', err);
  });

  // Wait for Chrome remote debugging port to become ready
  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      const json = await res.json();
      if (json && json.length > 0 && json[0].webSocketDebuggerUrl) {
        targetWsUrl = json[0].webSocketDebuggerUrl;
        break;
      }
    } catch (_) {
      await sleep(300);
    }
  }

  if (!targetWsUrl) {
    // Try creating a new target if list was empty
    try {
      const newRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000');
      const target = await newRes.json();
      targetWsUrl = target.webSocketDebuggerUrl;
    } catch (e) {
      console.error('Could not get target:', e);
      chromeProcess.kill();
      process.exit(1);
    }
  }

  console.log('Connected to target WS:', targetWsUrl);
  const ws = new WebSocket(targetWsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    } catch (err) {
      console.error('WS parse error:', err);
    }
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 2,
    mobile: false,
  });

  async function navigate(url, waitTime = 2500) {
    console.log(`Navigating to ${url}...`);
    await send('Page.navigate', { url });
    await sleep(waitTime);
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res?.result?.value;
  }

  async function capture(filename, clip = null) {
    const params = { format: 'png', quality: 90 };
    if (clip) params.clip = clip;
    const { data } = await send('Page.captureScreenshot', params);
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`✓ Saved screenshot: ${filename}`);
  }

  try {
    // 1. Landing Page (Hero)
    await navigate('http://localhost:3000/', 2500);
    await capture('01-landing-page.png');

    // 2. Landing Page (Features section)
    await evaluate(`window.scrollTo({ top: 900, behavior: 'instant' });`);
    await sleep(1000);
    await capture('02-landing-features.png');

    // 3. Farm Setup Page
    await navigate('http://localhost:3000/dashboard/setup', 2000);
    await capture('03-farm-setup.png');

    // Seed localStorage with Rajshahi demo farm & climate data so subsequent pages render fully
    console.log('Seeding demo farm & climate data in browser context...');
    await evaluate(`
      (async () => {
        const farm = {
          location: { lat: 24.3745, lon: 88.6042, name: 'Rajshahi District, Bangladesh' },
          currentCrop: 'Rice',
          soilType: 'Clay-Loam',
          waterAvailability: 'Moderate',
          irrigationAvailable: true,
          farmingSeason: 'Kharif',
          farmSize: '1–5 ha',
          challenges: ['Increasing temperature', 'Irregular rainfall', 'Drought'],
        };
        localStorage.setItem('fieldshift-farm', JSON.stringify(farm));

        try {
          const res = await fetch('/api/climate?lat=24.3745&lon=88.6042&demo=true');
          const json = await res.json();
          if (json.data) {
            localStorage.setItem('fieldshift-climate', JSON.stringify(json.data));
            localStorage.setItem('fieldshift-demo', 'true');
          }
        } catch (e) {
          console.error(e);
        }
      })()
    `);
    await sleep(1500);

    // 4. Farm Climate Dashboard
    await navigate('http://localhost:3000/dashboard', 3500);
    await capture('04-farm-dashboard.png');

    // 5. Crop Recommendation Engine
    await navigate('http://localhost:3000/crop-recommendation', 3500);
    await capture('05-crop-recommendations.png');

    // 6. Crop Comparison Matrix
    await navigate('http://localhost:3000/compare', 2500);
    // Let's ensure crops are selected if needed
    await capture('06-crop-comparison.png');

    // 7. Crop Rotation Planner
    await navigate('http://localhost:3000/rotation-planner', 3000);
    await capture('07-rotation-planner.png');

    // 8. Farm Adaptation Planner
    await navigate('http://localhost:3000/adaptation-planner', 3000);
    await capture('08-adaptation-planner.png');

    // 9. Interactive Climate Explorer
    await navigate('http://localhost:3000/climate', 3000);
    await capture('09-climate-explorer.png');

    // 10. About & Scientific Methodology
    await navigate('http://localhost:3000/about', 2500);
    await capture('10-about-methodology.png');

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    ws.close();
    chromeProcess.kill();
  }
}

main();

