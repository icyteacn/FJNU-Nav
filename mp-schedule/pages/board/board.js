// 文件路径: /fjnu-nav/mp-schedule/pages/board/board.js
// 建议墙：全班共享的建议板（云开发）/ 本机兜底
const B = require('../../utils/board.js');

Page({
  data: {
    items: [], cloud: false, loading: true, dark: false,
    draft: '', nick: '', openId: -1,
  },
  onShareAppMessage() { return { title: '福star课表 · 建议墙', path: '/pages/board/board' }; },
  onPullDownRefresh() { this.load().then(() => wx.stopPullDownRefresh()); },
  onShow() {
    this.setData({
      dark: getApp().resolveDark ? getApp().resolveDark() : false,
      nick: wx.getStorageSync('fjnu_nick') || '',
    });
    if (getApp().applyChrome) getApp().applyChrome(this.data.dark);
    this.load();
  },
  async load() {
    this.setData({ loading: true });
    const r = await B.list();
    this.setData({ items: r.items, cloud: r.cloud, loading: false });
  },
  onDraft(e) { this.setData({ draft: e.detail.value }); },
  onNick(e) {
    this.setData({ nick: e.detail.value });
    wx.setStorageSync('fjnu_nick', e.detail.value);
  },
  async send() {
    const t = (this.data.draft || '').trim();
    if (!t) return wx.showToast({ title: '先写点内容', icon: 'none' });
    if (t.length > 200) return wx.showToast({ title: '太长了（≤200字）', icon: 'none' });
    const r = await B.post(t, this.data.nick);
    this.setData({ draft: '' });
    wx.showToast({ title: r.cloud ? '已发布' : '已存本机（云端未开通）', icon: 'none' });
    this.load();
  },
  toggle(e) {
    const i = +e.currentTarget.dataset.i;
    this.setData({ openId: this.data.openId === i ? -1 : i });
  },
  async like(e) {
    const i = +e.currentTarget.dataset.i;
    const it = this.data.items[i];
    if (!it) return;
    await B.like(it._id);
    this.load();
  },
  comment(e) {
    const i = +e.currentTarget.dataset.i;
    const it = this.data.items[i];
    if (!it) return;
    wx.showModal({
      title: `评论「${(it.text || '').slice(0, 12)}…」`,
      editable: true, placeholderText: '写评论（≤80字）',
      success: async r => {
        if (!r.confirm || !r.content || !r.content.trim()) return;
        await B.comment(it._id, r.content.slice(0, 80));
        this.setData({ openId: i });
        this.load();
      },
    });
  },
});
