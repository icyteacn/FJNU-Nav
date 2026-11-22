// 文件路径: /fjnu-nav/mp-schedule/app.js
App({
  onLaunch() {
    // 启动后台预热课表数据
    const { fetchSchedule } = require('./utils/api.js');
    fetchSchedule().catch(() => {});
    this.applyChrome(this.resolveDark());
  },
  /** 当前生效是否深色：fjnu_theme = auto|light|dark（auto 跟随系统） */
  resolveDark() {
    const pref = wx.getStorageSync('fjnu_theme') || 'auto';
    if (pref === 'dark') return true;
    if (pref === 'light') return false;
    try {
      const w = wx.getAppBaseInfo ? wx.getAppBaseInfo() : wx.getSystemInfoSync();
      return w.theme === 'dark';
    } catch (e) { return false; }
  },
  /** 导航栏/tabBar 随主题换色 */
  applyChrome(dark) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: dark ? '#161616' : '#c62828',
    }).catch(() => {});
    wx.setTabBarStyle({
      backgroundColor: dark ? '#161616' : '#ffffff',
      color: dark ? '#8a8f99' : '#8a8f99',
      selectedColor: dark ? '#ef9a9a' : '#c62828',
    }).catch(() => {});
  },
});
