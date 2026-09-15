#!/bin/bash
# 🩸 课表 — 移动端构建脚本
# 用法: bash scripts/build-mobile.sh

set -e

echo "🩸 课表 — 开始构建移动端…"

# 1. 构建 Web 产物（包含 mobile.html 入口）
echo "📦 构建 Web 产物…"
npm run build

# 2. 检查 Capacitor 是否已安装
if ! npx cap --version > /dev/null 2>&1; then
  echo "📥 安装 Capacitor…"
  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/splash-screen @capacitor/status-bar
fi

# 3. 初始化 Capacitor（如果尚未初始化）
if [ ! -f "capacitor.config.json" ]; then
  echo "⚙️ 初始化 Capacitor…"
  npx cap init "🩸课表" com.feike.schedule --web-dir dist
fi

# 4. 添加 Android 平台（如果尚未添加）
if [ ! -d "android" ]; then
  echo "🤖 添加 Android 平台…"
  npx cap add android
fi

# 5. 添加 iOS 平台（如果尚未添加，仅 macOS）
if [ "$(uname)" = "Darwin" ] && [ ! -d "ios" ]; then
  echo "🍎 添加 iOS 平台…"
  npx cap add ios
fi

# 6. 同步 Web 产物到原生项目
echo "🔄 同步 Web 产物…"
npx cap sync

echo ""
echo "✅ Web 产物已同步到原生项目！"
echo ""
echo "📱 构建 APK（需要 Android Studio）："
echo "   cd android && ./gradlew assembleDebug"
echo "   APK 位置: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🍎 构建 iOS（需要 Xcode，仅 macOS）："
echo "   npx cap open ios"
echo ""
echo "🌐 或者直接在浏览器预览："
echo "   npx cap run android"
echo "   npx cap run ios"
