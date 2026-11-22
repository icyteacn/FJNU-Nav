// 文件路径: /fjnu-nav/mp-schedule/utils/board.js
// 建议墙数据层：优先微信云开发（全班共享、实时可见）→ 未开通云环境时回落本机存储
// 开通方式（一次性）：开发者工具顶部「云开发」→ 开通免费环境 → 建集合 `suggestions`
// 集合字段：{ text, nick, ts, likes, comments:[{text, ts}] }
// 集合权限建议：「所有用户可读，所有人可写」（班内小范围使用）

const KEY = 'fjnu_board_local';
let _cloudReady = null; // null=未探测 true/false

function cloudReady() {
  if (_cloudReady !== null) return _cloudReady;
  try {
    if (!wx.cloud) { _cloudReady = false; return false; }
    wx.cloud.init({ traceUser: true });
    // 探测：默认环境是否存在（失败会在后续调用 reject，这里先乐观标记）
    _cloudReady = true;
  } catch (e) { _cloudReady = false; }
  return _cloudReady;
}
function db() { return wx.cloud.database().collection('suggestions'); }

const _local = () => wx.getStorageSync(KEY) || [];
const _save = l => wx.setStorageSync(KEY, l);
const fmt = ts => {
  const d = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const day = Math.round((today - dd) / 864e5);
  return day === 0 ? `今天 ${hm}` : day === 1 ? `昨天 ${hm}` : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
};

async function list() {
  if (cloudReady()) {
    try {
      const r = await db().orderBy('ts', 'desc').limit(50).get();
      return { cloud: true, items: r.data.map(x => ({ ...x, time: fmt(x.ts) })) };
    } catch (e) { _cloudReady = false; }
  }
  return { cloud: false, items: _local().sort((a, b) => b.ts - a.ts).map(x => ({ ...x, time: fmt(x.ts) })) };
}
async function post(text, nick) {
  const doc = { text: text.trim(), nick: (nick || '').trim() || '同学', ts: Date.now(), likes: 0, comments: [] };
  if (cloudReady()) {
    try { await db().add({ data: doc }); return { cloud: true }; } catch (e) { _cloudReady = false; }
  }
  const l = _local(); doc._id = `l${doc.ts}`; l.push(doc); _save(l);
  return { cloud: false };
}
async function comment(id, text) {
  const c = { text: text.trim(), ts: Date.now() };
  if (cloudReady()) {
    try {
      await db().doc(id).update({ data: { comments: wx.cloud.database().command.push([c]) } });
      return { cloud: true };
    } catch (e) { _cloudReady = false; }
  }
  const l = _local(); const it = l.find(x => x._id === id);
  if (it) { it.comments = it.comments || []; it.comments.push(c); _save(l); }
  return { cloud: false };
}
async function like(id) {
  if (cloudReady()) {
    try {
      await db().doc(id).update({ data: { likes: wx.cloud.database().command.inc(1) } });
      return { cloud: true };
    } catch (e) { _cloudReady = false; }
  }
  const l = _local(); const it = l.find(x => x._id === id);
  if (it) { it.likes = (it.likes || 0) + 1; _save(l); }
  return { cloud: false };
}
module.exports = { list, post, comment, like };
