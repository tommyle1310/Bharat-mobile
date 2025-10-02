@echo off
echo Generating app icons from assets/app-icon.jpg...
echo.

REM Check if ImageMagick is installed
magick -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: ImageMagick is not installed or not in PATH
    echo Please install ImageMagick from: https://imagemagick.org/script/download.php#windows
    echo.
    pause
    exit /b 1
)

echo ImageMagick found! Generating icons...
echo.

REM Generate Android icons
echo Generating Android icons...
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

echo Android icons generated!
echo.

REM Generate iOS icons
echo Generating iOS icons...
magick assets/app-icon.jpg -resize 40x40 ios/mobile/Images.xcassets/AppIcon.appiconset/20x20@2x.png
magick assets/app-icon.jpg -resize 60x60 ios/mobile/Images.xcassets/AppIcon.appiconset/20x20@3x.png
magick assets/app-icon.jpg -resize 58x58 ios/mobile/Images.xcassets/AppIcon.appiconset/29x29@2x.png
magick assets/app-icon.jpg -resize 87x87 ios/mobile/Images.xcassets/AppIcon.appiconset/29x29@3x.png
magick assets/app-icon.jpg -resize 80x80 ios/mobile/Images.xcassets/AppIcon.appiconset/40x40@2x.png
magick assets/app-icon.jpg -resize 120x120 ios/mobile/Images.xcassets/AppIcon.appiconset/40x40@3x.png
magick assets/app-icon.jpg -resize 120x120 ios/mobile/Images.xcassets/AppIcon.appiconset/60x60@2x.png
magick assets/app-icon.jpg -resize 180x180 ios/mobile/Images.xcassets/AppIcon.appiconset/60x60@3x.png
magick assets/app-icon.jpg -resize 1024x1024 ios/mobile/Images.xcassets/AppIcon.appiconset/1024x1024.png

echo iOS icons generated!
echo.
echo All icons have been generated successfully!
echo.
echo Next steps:
echo 1. Clean and rebuild your project:
echo    - Android: cd android ^&^& gradlew clean ^&^& cd .. ^&^& npx react-native run-android
echo    - iOS: cd ios ^&^& rm -rf build ^&^& cd .. ^&^& npx react-native run-ios
echo.
pause
