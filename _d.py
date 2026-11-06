import re
p = "src/config/site.js"; t = open(p, encoding="utf8").read()
t = t.replace("version: '1.7.36'", "version: '1.7.37'")
open(p, "w", encoding="utf8", newline="\n").write(t)
r = "README.md"; t = open(r, encoding="utf8").read()
t = t.replace("v1.7.36", "v1.7.37", 1)
m = re.search(r"\| v1\.7\.36 \|[^\n]+\|", t)
if m: t = t[:m.end()] + "\n| v1.7.37 | 日程助手官方日程补录：11/7 海丝会议上午场（2/5班）+下午场（1/3班）+11/12-14 校运会停课，含签到/勿离场准备清单与 AI 分班提示(patch) |" + t[m.end():]
open(r, "w", encoding="utf8", newline="\n").write(t)
c = "CHANGELOG.md"; t = open(c, encoding="utf8").read()
entry = """## v1.7.37 — 日程助手补录 11 月官方日程（patch）

`orientationSchedule.js` 新增三条官方事件：
- `nov7-conference-am`：11/7 08:00 行政楼宏达厅，受众=2班（网安硕博）+5班（网安信安），
  audienceMajors 自动命中 cyber/ns；
- `nov7-conference-pm`：11/7 13:30 科研18号楼1004，受众=1班（计科）+3班（软工、海西联培 AI），
  tip 注明 AI 4班/6班不在名单；
- `nov12-sports-meet`：校运会停课 11/12-14（全天），提示 11/11 正常上课、课表已同步标注。
均带「提前到场找学委签到/勿提前离场」准备清单；日程页「下一个活动」卡实时倒计时已生效。
"""
m = re.search(r"## v1\.7\.36", t)
if m: t = t[:m.start()] + entry + "\n" + t[m.start():]
open(c, "w", encoding="utf8", newline="\n").write(t)
a = "AGENTS.md"; t = open(a, encoding="utf8").read()
anchor = "| --- | --- | --- |\n| 2026-11-06 | v1.7.36"
new = ("| --- | --- | --- |\n"
       "| 2026-11-06 | v1.7.37（patch） | **日程助手补录 11 月官方日程**：11/7 海丝会议上午场（2/5班→cyber/ns 自动命中）+下午场（1/3班，tip 注明 AI 4/6班除外）+11/12-14 校运会停课三条事件，准备清单/受众过滤/倒计时齐备，日程页实测「下一个活动」卡已生效。 |\n"
       "| 2026-11-06 | v1.7.36")
assert anchor in t
t = t.replace(anchor, new, 1)
open(a, "w", encoding="utf8", newline="\n").write(t)
print("ok")
