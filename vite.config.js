/** Vite 配置
 * ---------------------------------------------------------------------------
 * base 使用相对路径 './'：兼容子路径部署（GH Pages /FJNU-Nav/ 等）。
 * 应用内路由为 Hash 路由（src/router.js），无需服务端 rewrite。
 * server.proxy 仅本地开发时把 /api 转发到本地网关（server/index.mjs，8788）。
 *
 * define：把 package.json 的 apkVersion 与仓库名注入前端，供 APK 下载量模块使用
 * （见 src/utils/apkRelease.js）。构建期替换成字面量，运行期零成本；
 * 在 node 里直接 import 源码做单测时不会被替换，模块内已用 typeof 兜底。
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { createHash } from 'crypto'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'))

/** 本地发布包的内容哈希：前端用它跟 Releases 里 asset 的 digest 比对，
 *  只要内容一致就认（与文件名无关，避免手动上传改名导致识别不到）。 */
function apkSha256() {
  try {
    const p = resolve(__dirname, 'public/downloads/feike-schedule.apk')
    if (!existsSync(p)) return ''
    return createHash('sha256').update(readFileSync(p)).digest('hex')
  } catch {
    return ''
  }
}

export default defineConfig({
  plugins: [vue()],
  base: './',
  define: {
    __APK_VERSION__: JSON.stringify(pkg.apkVersion || ''),
    __APK_REPO__: JSON.stringify('icyteacn/FJNU-Nav'),
    __APK_SHA256__: JSON.stringify(apkSha256())
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mobile: resolve(__dirname, 'mobile.html')
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8788',
      '/admin': 'http://localhost:8788',
      '/console': 'http://localhost:8788',
      '/.g': 'http://localhost:8788'
    }
  }
})
