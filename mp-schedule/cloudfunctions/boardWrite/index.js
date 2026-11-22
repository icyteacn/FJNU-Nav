// 文件路径: /fjnu-nav/mp-schedule/cloudfunctions/boardWrite/index.js
// 建议墙写入云函数：发帖/评论先过官方内容安全检测（security.msgSecCheck），通过才落库
// action: 'post' | 'comment' | 'like'
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const LIMIT = { text: 300, nick: 16, comment: 200 };
const GAP_MS = { post: 5000, comment: 3000 }; // 简易防刷屏：同一人两次写入最小间隔

async function secCheck(openid, content, scene) {
  const r = await cloud.openapi.security.msgSecCheck({
    openid,
    scene,          // 1=资料 2=评论 3=论坛/留言板 4=社交日志
    version: 2,
    content: String(content).slice(0, 2500),
  });
  // v2 返回 result.suggest: 'pass' | 'risky' | 'review'
  return r && r.result && r.result.suggest === 'pass';
}

async function tooFast(openid, field, gap) {
  const r = await db.collection('suggestions')
    .where({ _openid: openid }).orderBy('ts', 'desc').limit(1).get()
    .catch(() => ({ data: [] }));
  const last = r.data && r.data[0];
  return last && Date.now() - (last[field] || last.ts) < gap;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action;
  const text = (event.text || '').trim();
  const nick = (event.nick || '').trim().slice(0, LIMIT.nick) || '同学';

  if (action === 'like') {
    if (!event.id) return { ok: false, reason: 'bad_args' };
    await db.collection('suggestions').doc(event.id).update({ data: { likes: _.inc(1) } });
    return { ok: true };
  }

  if (action === 'post') {
    if (!text || text.length > LIMIT.text) return { ok: false, reason: 'bad_args' };
    if (await tooFast(OPENID, 'ts', GAP_MS.post)) return { ok: false, reason: 'too_fast' };
    const pass = await secCheck(OPENID, `${nick} ${text}`, 3).catch(() => false);
    if (!pass) return { ok: false, reason: 'risky' };
    const r = await db.collection('suggestions').add({
      data: { text, nick, ts: Date.now(), likes: 0, comments: [] },
    });
    return { ok: true, id: r._id };
  }

  if (action === 'comment') {
    if (!event.id || !text || text.length > LIMIT.comment) return { ok: false, reason: 'bad_args' };
    const pass = await secCheck(OPENID, text, 2).catch(() => false);
    if (!pass) return { ok: false, reason: 'risky' };
    await db.collection('suggestions').doc(event.id).update({
      data: { comments: _.push([{ text, nick, ts: Date.now() }]) },
    });
    return { ok: true };
  }

  return { ok: false, reason: 'bad_args' };
};
