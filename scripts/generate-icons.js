const fs = require('fs');
const path = require('path');

// Android icon sizes (in dp, converted to px for different densities)
const androidSizes = {
  'mipmap-mdpi': 48,    // 1x
  'mipmap-hdpi': 72,    // 1.5x
  'mipmap-xhdpi': 96,   // 2x
  'mipmap-xxhdpi': 144, // 3x
  'mipmap-xxxhdpi': 192 // 4x
};

// iOS icon sizes
const iosSizes = {
  '20x20@2x': 40,
  '20x20@3x': 60,
  '29x29@2x': 58,
  '29x29@3x': 87,
  '40x40@2x': 80,
  '40x40@3x': 120,
  '60x60@2x': 120,
  '60x60@3x': 180,
  '1024x1024': 1024
};

console.log('Icon generation script created!');
console.log('');
console.log('To generate app icons, you need to:');
console.log('');
console.log('1. Install ImageMagick (for image resizing):');
console.log('   - Windows: Download from https://imagemagick.org/script/download.php#windows');
console.log('   - macOS: brew install imagemagick');
console.log('   - Linux: sudo apt-get install imagemagick');
console.log('');
console.log('2. Run the following commands to generate Android icons:');
console.log('');

// Generate Android commands
Object.entries(androidSizes).forEach(([folder, size]) => {
  console.log(`magick assets/app-icon.jpg -resize ${size}x${size} android/app/src/main/res/${folder}/ic_launcher.png`);
  console.log(`magick assets/app-icon.jpg -resize ${size}x${size} android/app/src/main/res/${folder}/ic_launcher_round.png`);
});

console.log('');
console.log('3. For iOS, you need to manually add icons to:');
console.log('   ios/mobile/Images.xcassets/AppIcon.appiconset/');
console.log('');
console.log('4. Update the Contents.json file in iOS with proper filenames');
console.log('');
console.log('Alternative: Use an online icon generator like:');
console.log('- https://appicon.co/');
console.log('- https://icon.kitchen/');
console.log('- https://makeappicon.com/');
