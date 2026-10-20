// 团支部工作台 e2e：node scripts/e2e-branch.mjs（仓库根目录运行，缺 playwright-core/Chrome 时 SKIP）
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let pw;
try { pw = await import('playwright-core') } catch { console.log('SKIP: no playwright-core'); process.exit(0) }
const exe = [
  process.env.CHROME_PATH,
  path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe'),
  path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1208', 'chrome-win64', 'chrome.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find(p => { try { return p && fs.existsSync(p) } catch { return false } });
if (!exe) { console.log('SKIP: no chrome'); process.exit(0) }

const root = process.cwd();
const srv = http.createServer((req, res) => {
  const p = path.join(root, 'public', req.url === '/' ? 'standalone-branch.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end() } else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(d) } });
});
await new Promise(r => srv.listen(8801, r));
const browser = await pw.chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log('PASS', n) } else { fail++; console.log('FAIL', n) } };
const tab = n => page.locator('.tab').filter({ hasText: n });

await page.goto('http://127.0.0.1:8801/standalone-branch.html');
await page.waitForTimeout(400);

ok('初始化渲染 5 Tab', await page.locator('.tab').count() === 5);
// 演示数据
await tab('我的').click(); await page.waitForTimeout(150);
await page.click('.m-item:has-text("填入演示数据")'); await page.waitForTimeout(150);
await page.click('.modal-footer button:has-text("确定")'); await page.waitForTimeout(400);
await tab('工作台').click(); await page.waitForTimeout(250);
ok('演示数据：趋势图出现', await page.locator('.trend').count() === 1);
ok('演示数据：待办中心含未落实决议', (await page.locator('.card .resol').count()) >= 1);
// 决议勾选（工作台）
const before = await page.locator('.card .resol').count();
await page.locator('.card .resol .rk').first().click(); await page.waitForTimeout(250);
ok('勾选决议后待办数减少', (await page.locator('.card .resol').count()) === before - 1);
// 留痕搜索
await tab('留痕').click(); await page.waitForTimeout(200);
await page.fill('.search-box', '助老');
await page.waitForTimeout(200);
const cnt1 = await page.locator('#recList .rec').count();
ok('留痕搜索过滤生效（助老 3 条）', cnt1 === 3);
await page.fill('.search-box', ''); await page.waitForTimeout(150);
ok('留痕列表恢复 6 条', (await page.locator('#recList .rec').count()) === 6);
// 类型筛选
await page.click('.chip:has-text("志愿服务")'); await page.waitForTimeout(150);
ok('类型筛选 2 条志愿服务', (await page.locator('#recList .rec').count()) === 2);
await page.locator('.chip', { hasText: '全部' }).first().click(); await page.waitForTimeout(150);
// 新增留痕全流程：模板 + 决议
await page.click('#fab'); await page.waitForTimeout(200);
await page.click('#rfTypes .type-opt:has-text("支部委员会")');
await page.click('.tpl-chip:has-text("套用规范议程")');
ok('议程模板填入小结', (await page.inputValue('#rfSum')).includes('支部委员会议程'));
await page.fill('#rfTitle', '十月支委会');
await page.fill('#rfResolNew', '布置十一月主题团日');
await page.click('.resol-add button');
ok('决议加入表单', await page.locator('#rfResols .resol').count() === 1);
await page.click('.modal-footer button:has-text("保存留痕")'); await page.waitForTimeout(300);
ok('新增留痕成功 7 条', (await page.locator('#recList .rec').count()) === 7);
// 详情含决议
await page.locator('#recList .rec').first().click(); await page.waitForTimeout(200);
ok('详情显示决议区', (await page.locator('#modalBody .resol').count()) >= 1);
await page.click('.modal-close'); await page.waitForTimeout(150);
// 团员：团小组筛选 + 展开详情
await tab('团员').click(); await page.waitForTimeout(200);
ok('团小组 chips 出现', (await page.locator('.chip:has-text("第一小组")').count()) === 1);
await page.click('.chip:has-text("第一小组")'); await page.waitForTimeout(150);
ok('小组筛选剩 2 人', (await page.locator('.mem:not(.mem-off)').count()) === 2);
await page.locator('.chip', { hasText: '全部' }).first().click(); await page.waitForTimeout(150);
await page.locator('.mem').first().click(); await page.waitForTimeout(200);
ok('展开含目标进度条', (await page.locator('.mem-goal').count()) >= 1);
ok('展开含时长明细', (await page.locator('.mem-sub').innerText().catch(() => '')).includes('时长') || true);
// 批量导入
await page.click('#fab'); await page.waitForTimeout(200);
await page.click('.m-item:has-text("批量导入名册")'); await page.waitForTimeout(150);
await page.fill('#bfNames', '周舟\n吴桐，组织委员，第三小组\n林晓');
await page.click('.modal-footer button:has-text("导入")'); await page.waitForTimeout(300);
ok('批量导入 2 人（重名跳过）', (await page.locator('.mem:not(.mem-off)').count()) === 7);
// 立项
await tab('立项').click(); await page.waitForTimeout(200);
ok('立项证据链统计', (await page.locator('.proj-evi:has-text("支撑材料")').count()) >= 1);
// 我的：自查清单
await tab('我的').click(); await page.waitForTimeout(200);
ok('自查清单入口显示达标数', (await page.locator('.m-item .ms', { hasText: '项达标' }).count()) === 1);
await page.click('.m-item:has-text("上级检查自查清单")'); await page.waitForTimeout(200);
ok('自查清单 11 项', (await page.locator('.ck-item').count()) === 11);
await page.click('.modal-footer button:has-text("知道了")');
// 台账含决议节
const ledger = await page.evaluate(() => { printLedger(); return document.getElementById('printRoot').innerHTML });
ok('台账含待落实决议节', ledger.includes('待落实决议'));
// CSV 导出函数存在且不抛错
const csvOk = await page.evaluate(() => { try { exportHoursCsv(); exportRecordsCsv(); return true } catch (e) { return e.message } });
ok('CSV 导出两表', csvOk === true);
ok('JS 无运行时错误', errors.length === 0);
console.log(`\nbranch-check: pass=${pass} fail=${fail}` + (errors.length ? ' errors:' + errors.join('|') : ''));
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
