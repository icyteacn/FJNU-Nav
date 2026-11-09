// 文件路径: /fjnu-nav/mp-weixin/app.js
App({
  onLaunch() {
    // 启动后台预热课表数据
    const { fetchSchedule } = require('./utils/api.js');
    fetchSchedule().catch(() => {});
  },
});
