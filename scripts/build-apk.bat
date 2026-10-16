@echo off
REM 🐔🩸课表 Android 构建脚本
REM 打包前把 APK 移出仓库目录（public/downloads 与 dist/downloads 两处副本），
REM 并清掉上次同步残留，避免把下载用 APK / 备份文件打进安装包；
REM 同步后再裁剪包内资产，只留课表单文件 + 数据接口（否则整个站点会被打进包）

echo [1/6] 构建 Web 产物...
call npm run build

echo [2/6] 临时排除 APK 文件...
set "HOLD=%TEMP%\feike-apk-hold"
if not exist "%HOLD%" mkdir "%HOLD%"
if exist "public\downloads\feike-schedule.apk" move /y "public\downloads\feike-schedule.apk" "%HOLD%\public.apk" >nul
if exist "dist\downloads\feike-schedule.apk" move /y "dist\downloads\feike-schedule.apk" "%HOLD%\dist.apk" >nul
if exist "android\app\src\main\assets\public" rmdir /s /q "android\app\src\main\assets\public"

echo [3/6] 同步 Capacitor...
call npx cap sync android

echo [4/6] 裁剪包内资产（只留课表单文件 + 数据接口）...
call node scripts\trim-apk-assets.mjs
if errorlevel 1 (
  echo 裁剪失败，已中止
  exit /b 1
)

echo [5/6] 恢复 APK 文件...
if exist "%HOLD%\public.apk" move /y "%HOLD%\public.apk" "public\downloads\feike-schedule.apk" >nul
if exist "%HOLD%\dist.apk" move /y "%HOLD%\dist.apk" "dist\downloads\feike-schedule.apk" >nul

echo [6/6] 构建 APK...
REM JDK / SDK：环境变量优先，失效时回退已知安装路径（各机器不同，勿写死单一路径）
REM Prefer a real JDK 17: AGP 8 requires it, and merely checking that JAVA_HOME exists
REM would silently keep an existing JDK 8 (build then fails with a cryptic variant error).
if exist "C:\Program Files\Java\jdk-17.0.10\bin\java.exe" set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.10"
if not exist "%JAVA_HOME%\bin\java.exe" set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
if not exist "%JAVA_HOME%\bin\java.exe" set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.10"
if not exist "%ANDROID_SDK_ROOT%" set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
if not exist "%ANDROID_SDK_ROOT%" if exist "F:\Android\Sdk" set "ANDROID_SDK_ROOT=F:\Android\Sdk"
if not exist "%ANDROID_SDK_ROOT%" set "ANDROID_SDK_ROOT=C:\Users\13111\AppData\Local\Android\Sdk"
echo       JAVA_HOME=%JAVA_HOME%
echo       ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%
cd android
REM 覆盖签名钥匙（本机文件，绝不入库）：存在则默认用它签名，
REM 保证打出的包能覆盖用户手机上已装的 Android Debug 版；否则回退仓库 keystore.jks
if exist "%USERPROFILE%\.android\cover-debug.keystore" (
  echo       签名: cover-debug.keystore（可覆盖已装调试版）
  call gradlew.bat assembleRelease "-PksPath=%USERPROFILE%\.android\cover-debug.keystore" -PksAlias=androiddebugkey -PksPass=android
) else (
  echo       签名: 仓库 keystore.jks
  call gradlew.bat assembleRelease
)
cd ..
REM gradle failure must not be reported as success (was printing [OK] either way)
if errorlevel 1 (
  echo [FAIL] gradle assembleRelease failed - no new APK produced. See errors above.
  echo        JAVA_HOME must point to JDK 17, which AGP 8 requires.
  exit /b 1
)

echo.
echo [OK] build done
echo Release APK: android\app\build\outputs\apk\release\app-release.apk (signed by keystore.jks)
echo Debug APK:   android\app\build\outputs\apk\debug\app-debug.apk
echo To update download entry:
echo   copy /y android\app\build\outputs\apk\release\app-release.apk public\downloads\feike-schedule.apk
