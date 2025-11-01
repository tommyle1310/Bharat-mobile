const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const sourceIconPath = path.join(__dirname, '..', 'assets', 'Assets.xcassets', 'AppIcon.appiconset', '512.png');

async function createProperAndroidIcon() {
  console.log('🔧 Creating Proper Android Icon (Logo Only, No Borders)...\n');

  if (!fs.existsSync(sourceIconPath)) {
    console.error('❌ Source icon not found at:', sourceIconPath);
    return;
  }

  console.log('✅ Source icon found:', sourceIconPath);

  try {
    const sourceBuffer = fs.readFileSync(sourceIconPath);
    const metadata = await sharp(sourceBuffer).metadata();
    console.log(`📏 Source image: ${metadata.width}x${metadata.height}`);
    
    // The logo is in the center square area, we need to extract just that part
    // Based on typical iOS icon design, the center logo area is usually about 50-60% of the total
    const logoSize = Math.floor(Math.min(metadata.width, metadata.height) * 0.55);
    const left = Math.floor((metadata.width - logoSize) / 2);
    const top = Math.floor((metadata.height - logoSize) / 2);
    
    console.log(`✂️  Extracting logo area: ${logoSize}x${logoSize} from position (${left}, ${top})`);
    
    for (const [density, size] of Object.entries(iconSizes)) {
      const dirPath = path.join(androidResPath, density);
      
      // Extract the logo area and resize to fill the entire Android icon
      await sharp(sourceBuffer)
        .extract({ 
          left: left, 
          top: top, 
          width: logoSize, 
          height: logoSize 
        })
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(path.join(dirPath, 'ic_launcher.png'));
      
      // Same for round icon
      await sharp(sourceBuffer)
        .extract({ 
          left: left, 
          top: top, 
          width: logoSize, 
          height: logoSize 
        })
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(path.join(dirPath, 'ic_launcher_round.png'));
      
      console.log(`✅ Generated proper ${density} icons (${size}x${size}px)`);
    }
    
    console.log('\n🎉 Proper Android icons generated!');
    console.log('📱 Your logo will now fill the entire icon space');
    console.log('🚀 Run: cd android && ./gradlew clean && cd .. && npx react-native run-android');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createProperAndroidIcon().catch(console.error);
