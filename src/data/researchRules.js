/**
 * 科研创新加分档位（依据学院学业奖学金评审计分办法）
 * 被 ScorePicker 快速选档与科研分测算器共用。
 */
export const MEMBER_FACTORS = [
  { label: '负责人', f: 1 },
  { label: '第2~5成员', f: 0.9 },
  { label: '第6~8成员', f: 0.8 },
  { label: '第9~12成员', f: 0.7 },
  { label: '第13~15成员', f: 0.6 },
]

export const RESEARCH_GROUPS = [
  {
    id: 'paper', name: '学术论文', icon: '📝', mode: 'sum',
    tip: '须研究生一作；导师一作时研究生须通讯/共同一作；外文论文须有 DOI 且在线时间在截止日前',
    items: [
      { id: 'p160', label: '顶级学术期刊', pts: 160 },
      { id: 'p80', label: '国际A类期刊（含CCF-A）', pts: 80 },
      { id: 'p40', label: '国际B类期刊（含CCF-B）', pts: 40 },
      { id: 'p20', label: '国际C类 / 国内A类', pts: 20 },
      { id: 'p10', label: '国内B类期刊', pts: 10 },
      { id: 'p5', label: '国内C类期刊', pts: 5 },
    ],
  },
  {
    id: 'patent', name: '专利授权', icon: '📜', mode: 'sum',
    tip: '专利须导师一作、研究生二作；以授权通知书或专利证书为准',
    items: [
      { id: 'pt20', label: '发明专利授权', pts: 20 },
      { id: 'pt5', label: '实用新型专利授权', pts: 5 },
    ],
  },
  {
    id: 'project', name: '科研项目 · 成果转让', icon: '🔬', mode: 'sum',
    tip: '成果转让每项目限 1 名研究生（导师指定），须提供合同及发票复印件',
    items: [
      { id: 'pr60', label: '国家自然科学基金博士生项目', pts: 60 },
      { id: 'pr20', label: '国家一流网安学院创新资助立项', pts: 20 },
      { id: 'prT', label: '成果转让 / 技术服务', count: { per: 1, unit: '万元', cap: 40 }, note: '1 分/万元 · 上限 40 分' },
    ],
  },
  {
    id: 'conf', name: '学术交流', icon: '🎤', mode: 'sum', cap: 4,
    tip: '须提交会议议程秩序册与现场作报告照片；本类累计上限 4 分',
    items: [
      { id: 'cf4', label: '国际级会议（3 个及以上国家）', pts: 4 },
      { id: 'cf2', label: '国家级会议', pts: 2 },
      { id: 'cf1', label: '省级会议', pts: 1 },
    ],
  },
  {
    id: 'contestA', name: 'A类创新创业竞赛', icon: '🎯', mode: 'sum', factor: true,
    tip: '同项目多层次获奖按最高档次计；不同项目可累加；清单见学院高水平竞赛实施办法',
    items: [
      { id: 'ca80', label: '国家级特等奖（金奖）', pts: 80 },
      { id: 'ca54', label: '国家级一等奖（银奖）', pts: 54 },
      { id: 'ca36', label: '国家级二等奖（铜奖）', pts: 36 },
      { id: 'ca24', label: '国家级三等奖（入围奖）', pts: 24 },
      { id: 'ca20', label: '省级特等奖（金奖）', pts: 20 },
      { id: 'ca16', label: '省级一等奖（银奖）', pts: 16 },
      { id: 'ca12', label: '省级二等奖（铜奖）', pts: 12 },
      { id: 'ca9', label: '省级三等奖', pts: 9 },
      { id: 'ca4', label: '省级优秀奖', pts: 4 },
      { id: 'ca5', label: '校级一等奖', pts: 5 },
      { id: 'ca3', label: '校级二等奖', pts: 3 },
      { id: 'ca2', label: '校级三等奖', pts: 2 },
      { id: 'ca1', label: '校级优秀奖', pts: 1 },
      { id: 'cae2', label: '院级一等奖', pts: 2 },
      { id: 'cae1', label: '院级二等奖', pts: 1 },
      { id: 'cae05', label: '院级三等奖', pts: 0.5 },
    ],
  },
  {
    id: 'contestB', name: 'B类创新创业竞赛', icon: '🏅', mode: 'sum',
    tip: 'B 类团队项目每位成员均获对应奖励分（无需乘系数）',
    items: [
      { id: 'cb20', label: '国家级一等奖', pts: 20 },
      { id: 'cb16', label: '国家级二等奖', pts: 16 },
      { id: 'cb12', label: '国家级三等奖', pts: 12 },
      { id: 'cb5', label: '国家级优秀奖', pts: 5 },
      { id: 'cb10', label: '省级一等奖', pts: 10 },
      { id: 'cb8', label: '省级二等奖', pts: 8 },
      { id: 'cb6', label: '省级三等奖', pts: 6 },
      { id: 'cb2', label: '省级优秀奖', pts: 2 },
      { id: 'cbs3', label: '校级一等奖', pts: 3 },
      { id: 'cbs2', label: '校级二等奖', pts: 2 },
      { id: 'cbs1', label: '校级三等奖', pts: 1 },
      { id: 'cbs05', label: '校级优秀奖', pts: 0.5 },
      { id: 'cbe15', label: '院级一等奖', pts: 1.5 },
      { id: 'cbe1', label: '院级二等奖', pts: 1 },
      { id: 'cbe05', label: '院级三等奖', pts: 0.5 },
    ],
  },
]
