import captureWebsite from 'capture-website';
import fs from 'fs/promises';
import path from 'path';

async function captureScreenshots() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  // Define screenshot configurations
  const screenshots = [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
    },
    {
      name: 'tablet',
      width: 1024,
      height: 768,
    },
    {
      name: 'mobile',
      width: 375,
      height: 812,
    }
  ];

  // Capture screenshots for different devices
  for (const config of screenshots) {
    console.log(`Capturing ${config.name} screenshot...`);
    await captureWebsite.file(
      'http://localhost:5173/',
      path.join(screenshotsDir, `screenshot-${config.name}.png`),
      {
        width: config.width,
        height: config.height,
        delay: 2,
        scaleFactor: 2, // For retina quality
        fullPage: true,
      }
    );
  }

  console.log('Screenshots captured successfully!');
}

captureScreenshots().catch(console.error); 