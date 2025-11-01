const fs = require('fs');
const path = require('path');

// Check if we can use sharp (image processing library)
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not available, will use alternative method');
}

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const sourceIconPath = path.join(__dirname, '..', 'assets', 'Assets.xcassets', 'AppIcon.appiconset', '512.png');

async function createCleanAndroidIcons() {
  console.log('🔧 Creating Clean Android Icons (No Borders)...\n');

  if (!fs.existsSync(sourceIconPath)) {
    console.error('❌ Source icon not found at:', sourceIconPath);
    return;
  }

  console.log('✅ Source icon found:', sourceIconPath);

  if (sharp) {
    console.log('🚀 Using Sharp to crop borders and resize icons...');
    
    try {
      const sourceBuffer = fs.readFileSync(sourceIconPath);
      
      // First, let's analyze the source image to find the logo area
      const metadata = await sharp(sourceBuffer).metadata();
      console.log(`📏 Source image: ${metadata.width}x${metadata.height}`);
      
      // For icons with borders, we need to crop to the center area where the actual logo is
      // Based on typical iOS icon structure, the logo is usually in the center 60-70% of the image
      const cropSize = Math.floor(Math.min(metadata.width, metadata.height) * 0.65);
      const left = Math.floor((metadata.width - cropSize) / 2);
      const top = Math.floor((metadata.height - cropSize) / 2);
      
      console.log(`✂️  Cropping to center area: ${cropSize}x${cropSize} from position (${left}, ${top})`);
      
      for (const [density, size] of Object.entries(iconSizes)) {
        const dirPath = path.join(androidResPath, density);
        
        // Generate clean icon by cropping the center area and resizing
        await sharp(sourceBuffer)
          .extract({ 
            left: left, 
            top: top, 
            width: cropSize, 
            height: cropSize 
          })
          .resize(size, size, { fit: 'cover' })
          .png()
          .toFile(path.join(dirPath, 'ic_launcher.png'));
        
        // Generate round icon (same as regular for now)
        await sharp(sourceBuffer)
          .extract({ 
            left: left, 
            top: top, 
            width: cropSize, 
            height: cropSize 
          })
          .resize(size, size, { fit: 'cover' })
          .png()
          .toFile(path.join(dirPath, 'ic_launcher_round.png'));
        
        console.log(`✅ Generated clean ${density} icons (${size}x${size}px)`);
      }
      
      console.log('\n🎉 Clean Android icons generated successfully!');
      console.log('🚀 Now run: cd android && ./gradlew clean && cd .. && npx react-native run-android');
      
    } catch (error) {
      console.error('❌ Error generating clean icons:', error.message);
      console.log('\n📋 Manual steps required - see alternative options below');
    }
  } else {
    console.log('📋 Sharp not available. Manual steps required:');
    console.log('\n🛠️  Option 1: Install Sharp');
    console.log('npm install sharp');
    console.log('Then run this script again');
    
    console.log('\n🛠️  Option 2: Use Online Icon Generator');
    console.log('1. Go to https://appicon.co/');
    console.log('2. Upload your assets/Assets.xcassets/AppIcon.appiconset/512.png');
    console.log('3. Download Android icons');
    console.log('4. Extract and place in the correct directories');
    
    console.log('\n🛠️  Option 3: Manual Image Editing');
    console.log('1. Open assets/Assets.xcassets/AppIcon.appiconset/512.png in an image editor');
    console.log('2. Crop out the outer borders (white circle and peach ring)');
    console.log('3. Keep only the center logo area');
    console.log('4. Resize to required Android sizes');
    console.log('5. Save as ic_launcher.png and ic_launcher_round.png in each density folder');
  }
}

createCleanAndroidIcons().catch(console.error);
