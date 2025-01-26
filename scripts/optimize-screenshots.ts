import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function optimizeScreenshots() {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  const publicDir = path.join(process.cwd(), 'public');

  try {
    // Ensure directories exist
    await fs.mkdir(screenshotsDir, { recursive: true });
    await fs.mkdir(publicDir, { recursive: true });

    // Get all PNG files in screenshots directory
    const files = await fs.readdir(screenshotsDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));

    // Create a collage of screenshots
    const screenshots = await Promise.all(
      pngFiles.map(async file => {
        const image = await sharp(path.join(screenshotsDir, file));
        const metadata = await image.metadata();
        return {
          input: path.join(screenshotsDir, file),
          metadata,
        };
      })
    );

    // Sort screenshots by width (desktop -> tablet -> mobile)
    screenshots.sort((a, b) => (b.metadata.width || 0) - (a.metadata.width || 0));

    // Create optimized individual screenshots
    for (const screenshot of screenshots) {
      const filename = path.basename(screenshot.input);
      await sharp(screenshot.input)
        .resize(1200, null, { withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(path.join(publicDir, filename));
    }

    // Create main screenshot for README
    await sharp(screenshots[0].input)
      .resize(1200, null, { withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(publicDir, 'screenshot.png'));

    // Create OpenGraph image
    await sharp(screenshots[0].input)
      .resize(1200, 630, { fit: 'contain', background: '#ffffff' })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(publicDir, 'og-image.png'));

    console.log('Screenshots optimized successfully!');
  } catch (error) {
    console.error('Error optimizing screenshots:', error);
    process.exit(1);
  }
}

optimizeScreenshots().catch(console.error); 