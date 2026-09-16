@echo off
REM 🐔🩸课表 Android 构建脚本
REM 构建前自动排除 public/downloads/ 中的 APK，避免打包自身

echo [1/5] 构建 Web 产物...
call npm run build

echo [2/5] 临时排除 APK 文件...
if exist "public\downloads\feike-schedule.apk" (
    move "public\downloads\feike-schedule.apk" "public\downloads\_temp_apk.bak" >nul 2>&1
)

echo [3/5] 同步 Capacitor...
call npx cap sync android

echo [4/5] 恢复 APK 文件...
if exist "public\downloads\_temp_apk.bak" (
    move "public\downloads\_temp_apk.bak" "public\downloads\feike-schedule.apk" >nul 2>&1
)

echo [5/5] 构建 APK...
set JAVA_HOME=C:\Program Files\Java\jdk-17.0.10
set ANDROID_SDK_ROOT=C:\Users\13111\AppData\Local\Android\Sdk
cd android
call gradlew.bat assembleRelease
cd ..

echo.
echo ✅ 构建完成！
echo Release APK: android\app\build\outputs\apk\release\app-release-unsigned.apk
echo Debug APK:   android\app\build\outputs\apk\debug\app-debug.apk
