# App Icon Setup Guide

You're right! Just adding the icon to `app.json` is not enough for React Native. Here's how to properly set up your app icon for both Android and iOS.

## Current Status
- ✅ Updated `app.json` with icon reference
- ✅ Updated iOS `Contents.json` with proper filenames
- ⏳ Need to generate and replace actual icon files

## Required Icon Sizes

### Android Icons (in `android/app/src/main/res/`)
- `mipmap-mdpi/ic_launcher.png` - 48x48px
- `mipmap-hdpi/ic_launcher.png` - 72x72px  
- `mipmap-xhdpi/ic_launcher.png` - 96x96px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192px
- Same sizes for `ic_launcher_round.png` (round icons)

### iOS Icons (in `ios/mobile/Images.xcassets/AppIcon.appiconset/`)
- `20x20@2x.png` - 40x40px
- `20x20@3x.png` - 60x60px
- `29x29@2x.png` - 58x58px
- `29x29@3x.png` - 87x87px
- `40x40@2x.png` - 80x80px
- `40x40@3x.png` - 120x120px
- `60x60@2x.png` - 120x120px
- `60x60@3x.png` - 180x180px
- `1024x1024.png` - 1024x1024px (App Store)

## Method 1: Using ImageMagick (Recommended)

### Install ImageMagick
- **Windows**: Download from https://imagemagick.org/script/download.php#windows
- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt-get install imagemagick`

### Generate Android Icons
```bash
# Navigate to project root
cd /path/to/your/project

# Generate Android icons
magick assets/app-icon.jpg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick assets/app-icon.jpg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

magick assets/app-icon.jpg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
magick assets/app-icon.jpg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

magick assets/app-icon.jpg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
magick assets/app-icon.jpg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

magick assets/app-icon.jpg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
magick assets/app-icon.jpg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

magick assets/app-icon.jpg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
magick assets/app-icon.jpg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
```

### Generate iOS Icons
```bash
# Generate iOS icons
magick assets/app-icon.jpg -resize 40x40 ios/mobile/Images.xcassets/AppIcon.appiconset/20x20@2x.png
magick assets/app-icon.jpg -resize 60x60 ios/mobile/Images.xcassets/AppIcon.appiconset/20x20@3x.png
magick assets/app-icon.jpg -resize 58x58 ios/mobile/Images.xcassets/AppIcon.appiconset/29x29@2x.png
magick assets/app-icon.jpg -resize 87x87 ios/mobile/Images.xcassets/AppIcon.appiconset/29x29@3x.png
magick assets/app-icon.jpg -resize 80x80 ios/mobile/Images.xcassets/AppIcon.appiconset/40x40@2x.png
magick assets/app-icon.jpg -resize 120x120 ios/mobile/Images.xcassets/AppIcon.appiconset/40x40@3x.png
magick assets/app-icon.jpg -resize 120x120 ios/mobile/Images.xcassets/AppIcon.appiconset/60x60@2x.png
magick assets/app-icon.jpg -resize 180x180 ios/mobile/Images.xcassets/AppIcon.appiconset/60x60@3x.png
magick assets/app-icon.jpg -resize 1024x1024 ios/mobile/Images.xcassets/AppIcon.appiconset/1024x1024.png
```

## Method 2: Online Icon Generators (Easier)

### Option A: App Icon Generator
1. Go to https://appicon.co/
2. Upload your `assets/app-icon.jpg`
3. Download the generated icons
4. Extract and place them in the correct directories

### Option B: Icon Kitchen
1. Go to https://icon.kitchen/
2. Upload your `assets/app-icon.jpg`
3. Download the generated icons
4. Extract and place them in the correct directories

## Method 3: Manual (If you have the icons already)
1. Create icons in the required sizes using any image editor
2. Place them in the correct directories as listed above
3. Make sure filenames match exactly

## Verification
After setting up the icons:

### Android
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS
```bash
# Clean and rebuild
cd ios
rm -rf build
cd ..
npx react-native run-ios
```

## Important Notes
- The source image should be at least 1024x1024px for best quality
- Icons should be square (1:1 aspect ratio)
- For Android, both regular and round icons are recommended
- Make sure to clean and rebuild after replacing icons
- The `app.json` icon reference is mainly for Expo projects

## Troubleshooting
- If icons don't appear, try cleaning and rebuilding the project
- Make sure all required sizes are generated
- Check that filenames match exactly (case-sensitive)
- For Android, ensure both `ic_launcher.png` and `ic_launcher_round.png` exist
