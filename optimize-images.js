const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, options = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  const baseName = path.basename(inputPath, ext);
  const dirName = path.dirname(inputPath);

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  console.log(`\nProcessing: ${inputPath}`);
  console.log(`  Original: ${metadata.width}x${metadata.height}, ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB`);

  // Resize if too large
  let resizeOptions = {};
  if (options.maxWidth && metadata.width > options.maxWidth) {
    resizeOptions.width = options.maxWidth;
  }

  // Create optimized JPG/PNG
  let optimizedPath = inputPath;
  if (ext === '.jpg' || ext === '.jpeg') {
    await image
      .resize(resizeOptions)
      .jpeg({ quality: options.quality || 80, mozjpeg: true })
      .toFile(inputPath + '.tmp');
    fs.renameSync(inputPath + '.tmp', inputPath);
  } else if (ext === '.png') {
    await image
      .resize(resizeOptions)
      .png({ compressionLevel: 9, palette: true })
      .toFile(inputPath + '.tmp');
    fs.renameSync(inputPath + '.tmp', inputPath);
  }

  // Create WebP version
  const webpPath = path.join(dirName, baseName + '.webp');
  await sharp(inputPath)
    .resize(resizeOptions)
    .webp({ quality: options.webpQuality || 80 })
    .toFile(webpPath);

  const newSize = fs.statSync(inputPath).size;
  const webpSize = fs.statSync(webpPath).size;

  console.log(`  Optimized: ${(newSize / 1024).toFixed(1)} KB`);
  console.log(`  WebP: ${(webpSize / 1024).toFixed(1)} KB`);

  return { original: inputPath, webp: webpPath, savedKB: (metadata.size - newSize) / 1024 };
}

async function main() {
  console.log('=== Otimizando Imagens ===\n');

  // Hero background - resize to max 1920px width, quality 75
  await optimizeImage('./assets/hero-bg.jpg', { maxWidth: 1920, quality: 75, webpQuality: 75 });

  // Logo - optimize PNG
  await optimizeImage('./sorcery-logo.png', { webpQuality: 85 });

  // Screenshot - resize and compress
  await optimizeImage('./screenshot.png', { maxWidth: 1280, webpQuality: 80 });

  // Element icons - already small, just create WebP
  const elements = ['fire', 'water', 'earth', 'air'];
  for (const el of elements) {
    await optimizeImage(`./assets/elements/${el}.png`, { webpQuality: 90 });
  }

  // Icons - optimize larger ones
  const largeIcons = ['icon-384.png', 'icon-512.png', 'icon-maskable-512.png'];
  for (const icon of largeIcons) {
    const iconPath = `./icons/${icon}`;
    if (fs.existsSync(iconPath)) {
      await optimizeImage(iconPath, { webpQuality: 85 });
    }
  }

  console.log('\n=== Otimizacao Concluida ===');
}

main().catch(console.error);
