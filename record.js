const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

(async () => {
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }

  const outputVideo = path.join(assetsDir, 'recording.mp4');
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: "new", 
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://cricpulse-frontend-620647928221.asia-south1.run.app';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait 6 seconds for WebSockets and initial React renders to complete
  console.log('Waiting for application to load and initialize sockets...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  const config = {
    followNewTab: false,
    fps: 30,
    ffmpeg_Path: ffmpegPath,
    videoFrame: {
      width: 1440,
      height: 900,
    },
    aspectRatio: '16:9',
  };

  const recorder = new PuppeteerScreenRecorder(page, config);
  console.log(`Starting screen recording, output: ${outputVideo}`);
  await recorder.start(outputVideo);

  // Helper function for ultra-smooth scrolling using easeInOutCubic easing
  async function smoothScroll(page, distance, durationMs) {
    console.log(`Smooth scrolling by ${distance}px over ${durationMs}ms...`);
    await page.evaluate(async (distance, durationMs) => {
      await new Promise((resolve) => {
        const start = window.scrollY;
        const startTime = performance.now();
        
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          // cubic easing out
          const ease = 1 - Math.pow(1 - progress, 3);
          
          window.scrollTo(0, start + distance * ease);
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        window.requestAnimationFrame(step);
      });
    }, distance, durationMs);
  }

  console.log('--- Phase 1: Main Dashboard (Upper Section) ---');
  await new Promise(resolve => setTimeout(resolve, 4000)); // Show live scores & commentary

  console.log('--- Phase 2: Scrolling to Middle Components (Agent Thoughts & Rivalry Rooms) ---');
  await smoothScroll(page, 550, 2500);
  await new Promise(resolve => setTimeout(resolve, 4000)); // Let commentary stream and Agent Thoughts display

  console.log('--- Phase 3: Scrolling to Predict-the-Ball Arena & Crowd Pulse ---');
  await smoothScroll(page, 450, 2500);
  await new Promise(resolve => setTimeout(resolve, 4000)); // Display the predictor mechanics and graphs

  console.log('--- Phase 4: Scrolling back to top ---');
  await smoothScroll(page, -1000, 3000);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Final view of the live ticker and live score

  console.log('Stopping recording...');
  await recorder.stop();
  await browser.close();
  console.log('Recording complete!');
})();
