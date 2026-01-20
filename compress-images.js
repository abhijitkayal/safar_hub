const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const minSizeInBytes = 5 * 1024 * 1024; // 5MB

async function compressImage(filePath) {
  const stats = fs.statSync(filePath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  if (stats.size < minSizeInBytes) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} (${sizeInMB}MB - already small)`);
    return;
  }

  try {
    console.log(`📸 Compressing ${path.basename(filePath)} (${sizeInMB}MB)...`);
    
    const tempPath = filePath + '.tmp';
    
    await sharp(filePath)
      .jpeg({ quality: 75, progressive: true })
      .toFile(tempPath);
    
    const newStats = fs.statSync(tempPath);
    const newSizeInMB = (newStats.size / (1024 * 1024)).toFixed(2);
    const savedPercent = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);
    
    // Replace original with compressed
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    
    console.log(`✅ ${path.basename(filePath)}: ${sizeInMB}MB → ${newSizeInMB}MB (saved ${savedPercent}%)`);
  } catch (error) {
    console.error(`❌ Error compressing ${path.basename(filePath)}:`, error.message);
  }
}

async function findAndCompressImages(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await findAndCompressImages(filePath);
    } else if (/\.(jpg|jpeg|JPG|JPEG)$/i.test(file)) {
      await compressImage(filePath);
    }
  }
}

console.log('🚀 Starting image compression...\n');
findAndCompressImages(publicDir)
  .then(() => {
    console.log('\n✅ All images compressed successfully!');
    console.log('📊 You can now commit and push to GitHub');
  })
  .catch(error => {
    console.error('❌ Compression failed:', error);
    process.exit(1);
  });
