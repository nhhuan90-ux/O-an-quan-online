import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = path.join('public', 'o-an-quan', 'assets', 'images');

const files = [
  'bg-game.png',
  'bg-home.png',
  'board-wood.png'
];

async function compress() {
  for (const file of files) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      console.log(`Compressing ${file}...`);
      const statsBefore = fs.statSync(inputPath);
      
      await sharp(inputPath)
        .webp({ quality: 75, effort: 6 }) // Convert to webp with high compression and 75% quality (excellent visually)
        .toFile(outputPath);
        
      const statsAfter = fs.statSync(outputPath);
      console.log(`Finished ${file}: ${(statsBefore.size / 1024 / 1024).toFixed(2)}MB -> ${(statsAfter.size / 1024).toFixed(2)}KB (${((1 - statsAfter.size / statsBefore.size) * 100).toFixed(1)}% saved)`);
    } else {
      console.log(`File not found: ${inputPath}`);
    }
  }
}

compress().catch(console.error);
