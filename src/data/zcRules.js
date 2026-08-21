/**
 * 综合素质测评分档位（依据学院学业奖学金评审计分办法 · 综合素质评定表）
 * mode: sum 可累加 / max 组内就高（不叠加） / neg 扣分项；cap 为本类累计上限。
 */
export const ZC_GROUPS = [
  {
    id: 'social', name: '社会工作职务', icon: '💼', mode: 'max',
    tip: '同一年度受聘不同岗位按最高分计、不叠加；任满一学期未满一学年减半；长期不在岗或考评不合格酌减直至不予加分',
    items: [
      { id: 's8', label: '校/院研究生会主席 · 研究生团总支副书记', opts: [{ label: '主席级', pts: 8 }] },
      { id: 's6', label: '主席团成员 · 各部门部长 · 班长/团支部书记 · 党支部书记 · 研究生辅导员助理 · 闽盾青锋团长', opts: [{ label: '核心岗', pts: 6 }] },
      { id: 's4', label: '各部门副部长 · 党支部副书记', opts: [{ label: '副部长级', pts: 4 }] },
      { id: 's3', label: '班委 · 党支部委员 · 研究生助管/助教', opts: [{ label: '班委级', pts: 3 }] },
      { id: 's1', label: '舍长 · 学生组织/社团干事 · 闽盾青锋干事', opts: [{ label: '干事级', pts: 1 }] },
    ],
  },
  {
    id: 'honor', name: '荣誉称号', icon: '🎖️', mode: 'sum',
    tip: '荣誉称号不含获奖学金者；某级别下属协会（社团）评选的按降一级计',
    items: [
      { id: 'h10', label: '国家级荣誉称号', opts: [{ label: '国家级', pts: 10 }] },
      { id: 'h7', label: '省级荣誉称号', opts: [{ label: '省级', pts: 7 }] },
      { id: 'h5', label: '市/校级荣誉称号', opts: [{ label: '市/校级', pts: 5 }] },
      { id: 'h3', label: '其他校级荣誉称号', opts: [{ label: '其他校级', pts: 3 }] },
      { id: 'h2', label: '院级荣誉称号', opts: [{ label: '院级', pts: 2 }] },
    ],
  },
  {
    id: 'praise', name: '学校嘉奖 · 通报表扬', icon: '📣', mode: 'sum',
    tip: '团队嘉奖按人均+贡献分配，单人上限 10 分；多学院组合团队只取本院成员分值',
    items: [
      { id: 'pr6', label: '学校嘉奖（校级）', opts: [{ label: '嘉奖', pts: 6 }] },
      { id: 'pb5', label: '通报表扬 · 省级', opts: [{ label: '省级', pts: 5 }] },
      { id: 'pb3', label: '通报表扬 · 市/校级', opts: [{ label: '市/校级', pts: 3 }] },
      { id: 'pb1', label: '通报表扬 · 院级', opts: [{ label: '院级', pts: 1 }] },
      { id: 'brave', label: '见义勇为 / 抢险救灾 / 拾金不昧等突出事迹', opts: [
        { label: '5 分', pts: 5 }, { label: '6 分', pts: 6 }, { label: '7 分', pts: 7 }, { label: '8 分', pts: 8 }, { label: '9 分', pts: 9 }, { label: '10 分', pts: 10 },
      ], note: '酌情加 5-10 分' },
    ],
  },
  {
    id: 'collective', name: '集体荣誉（班级 / 团支部 / 党支部）', icon: '🏛️', mode: 'sum',
    tip: '按本人在集体中的角色取对应档位；同一集体同一荣誉只计一次',
    items: [
      { id: 'bj4', label: '先进班集体 · 省级及以上', opts: [{ label: '班长/团支书', pts: 4 }, { label: '其他班委/团支委', pts: 3 }, { label: '其他成员', pts: 2 }] },
      { id: 'bj3', label: '先进班集体 · 市/校级', opts: [{ label: '班长/团支书', pts: 3 }, { label: '其他班委/团支委', pts: 2 }, { label: '其他成员', pts: 1 }] },
      { id: 'w54', label: '五四红旗团支部（标兵）· 省级及以上', opts: [{ label: '团支书', pts: 4 }, { label: '班长', pts: 3 }, { label: '其他班委/团支委', pts: 2.5 }, { label: '其他成员', pts: 2 }] },
      { id: 'w53', label: '五四红旗团支部（标兵）· 市/校级', opts: [{ label: '团支书', pts: 3 }, { label: '班长', pts: 2 }, { label: '其他班委/团支委', pts: 1.5 }, { label: '其他成员', pts: 1 }] },
      { id: 'tl5', label: '研究生五佳团立项 · 校级', opts: [{ label: '团支书/研究生团副', pts: 5 }, { label: '班长/团支委/组宣部正副部长', pts: 3 }, { label: '其他成员', pts: 1.5 }] },
      { id: 'dz5', label: '党支部立项 · 省级及以上', opts: [{ label: '党支部书记', pts: 5 }, { label: '其他支委(含副书记)', pts: 4 }, { label: '其他成员', pts: 3 }] },
      { id: 'dz4', label: '党支部立项 · 市/校级', opts: [{ label: '党支部书记', pts: 4 }, { label: '其他支委(含副书记)', pts: 3 }, { label: '其他成员', pts: 2 }] },
      { id: 'dyA', label: '主题党日策划 / 党员好故事 / 书记好党课 / 支部好案例 · 校级', opts: [{ label: '一等负责', pts: 5 }, { label: '一等成员', pts: 2.5 }, { label: '二等负责', pts: 4 }, { label: '二等成员', pts: 2 }, { label: '三等负责', pts: 3 }, { label: '三等成员', pts: 1.5 }, { label: '其他负责', pts: 2 }, { label: '其他成员', pts: 1 }] },
      { id: 'qm', label: '青马思政微课 · 校级', opts: [{ label: '一等负责', pts: 5 }, { label: '一等成员', pts: 2.5 }, { label: '二等负责', pts: 4 }, { label: '二等成员', pts: 2 }, { label: '三等负责', pts: 3 }, { label: '三等成员', pts: 1.5 }, { label: '其他负责', pts: 2 }, { label: '其他成员', pts: 1 }] },
      { id: 'qmy', label: '青马思政微课 · 院级', opts: [{ label: '一等负责', pts: 2.5 }, { label: '一等成员', pts: 1.25 }, { label: '二等负责', pts: 2 }, { label: '二等成员', pts: 1 }, { label: '三等负责', pts: 1.5 }, { label: '三等成员', pts: 0.75 }, { label: '其他负责', pts: 1 }, { label: '其他成员', pts: 0.5 }] },
      { id: 'sj5', label: '社会实践优秀团队 · 省级及以上', opts: [{ label: '负责人', pts: 5 }, { label: '其他成员', pts: 2.5 }] },
      { id: 'sj4', label: '社会实践优秀团队 · 校级一等', opts: [{ label: '负责人', pts: 4 }, { label: '其他成员', pts: 2 }] },
      { id: 'sj3', label: '社会实践优秀团队 · 校级二等', opts: [{ label: '负责人', pts: 3 }, { label: '其他成员', pts: 1.5 }] },
      { id: 'sj2', label: '社会实践优秀团队 · 校级三等', opts: [{ label: '负责人', pts: 2 }, { label: '其他成员', pts: 1 }] },
    ],
  },
  {
    id: 'volunteer', name: '志愿公益', icon: '❤️', mode: 'sum',
    tip: '志愿服务以志愿汇截图为准',
    items: [
      { id: 'blood', label: '无偿献血', count: { per: 1, unit: '次', cap: 2 }, note: '1 分/次 · 当学年上限 2 分' },
      { id: 'vol', label: '青年志愿者服务（每满 20 小时）', count: { per: 1, unit: '×20h', cap: 4 }, note: '每满 20 小时 1 分 · 上限 4 分' },
    ],
  },
  {
    id: 'sports', name: '体育 · 美育', icon: '🏃', mode: 'sum',
    tip: '仅计学校/学院统一发布目录内赛事；下属协会组织的按降一级计；团体比赛参照个人标准减半',
    items: [
      { id: 'spJoin', label: '文体比赛参赛（有证明/成绩）', cap: 6, opts: [{ label: '国家级', pts: 5 }, { label: '省级', pts: 3 }, { label: '市/校级', pts: 2 }, { label: '院级', pts: 1 }], note: '本条累计上限 6 分' },
      { id: 'spWin', label: '文体比赛获奖名次', cap: 10, opts: [
        { label: '国一', pts: 8 }, { label: '国二', pts: 7 }, { label: '国三', pts: 6 }, { label: '国优', pts: 5 },
        { label: '省一', pts: 6 }, { label: '省二', pts: 5 }, { label: '省三', pts: 4 }, { label: '省优', pts: 2 },
        { label: '市/校一', pts: 4 }, { label: '市/校二', pts: 3 }, { label: '市/校三', pts: 2 }, { label: '市/校优', pts: 1 },
        { label: '院一', pts: 3 }, { label: '院二', pts: 2 }, { label: '院三', pts: 1 }, { label: '院优', pts: 0.5 },
      ], note: '第1名参照一等奖…第9-12名参照优秀奖；本条累计上限 10 分' },
      { id: 'spRec', label: '破纪录', cap: 10, opts: [{ label: '国家级', pts: 10 }, { label: '省级', pts: 8 }, { label: '市/校级', pts: 6 }, { label: '院级', pts: 4 }] },
      { id: 'spOth', label: '校/院运会入场式 · 迎新晚会节目表演', opts: [{ label: '入场式', pts: 2 }, { label: '晚会表演', pts: 2 }] },
    ],
  },
  {
    id: 'labor', name: '劳育 · 宿舍', icon: '🧹', mode: 'sum',
    tip: '宿舍加减分为宿舍成员人均；协会/社团组织的评比按降一级计',
    items: [
      { id: 'lbSkill', label: '劳动技能评比 / 竞赛获奖', opts: [
        { label: '1 分', pts: 1 }, { label: '2 分', pts: 2 }, { label: '3 分', pts: 3 }, { label: '4 分', pts: 4 }, { label: '5 分', pts: 5 },
      ], note: '按名次酌情 1-5 分；团体获奖减半' },
      { id: 'lbDorm', label: '宿舍卫生检查通报「卫生较好」', opts: [{ label: '人均 +2', pts: 2 }] },
      { id: 'lbCivil', label: '院「文明宿舍」', opts: [{ label: '人均 +2', pts: 2 }] },
      { id: 'lbSocial', label: '寒暑假社会实践（含扬帆计划）', cap: 3, opts: [{ label: '校级', pts: 2 }, { label: '院级', pts: 1 }], note: '本条上限 3 分' },
    ],
  },
  {
    id: 'deduct', name: '扣分项', icon: '⚠️', mode: 'neg',
    tip: '同一事件受党团纪与纪律处分不重复扣分；考勤以公示文件为准',
    items: [
      { id: 'dd7', label: '留校察看', opts: [{ label: '-7', pts: -7 }] },
      { id: 'dd5', label: '记过', opts: [{ label: '-5', pts: -5 }] },
      { id: 'dd4', label: '严重警告', opts: [{ label: '-4', pts: -4 }] },
      { id: 'dd3', label: '警告', opts: [{ label: '-3', pts: -3 }] },
      { id: 'dn2', label: '院通报批评', count: { per: -2, unit: '次' }, note: '每次 -2' },
      { id: 'dn1', label: '年级通报批评', count: { per: -1, unit: '次' }, note: '每次 -1' },
      { id: 'dnAct', label: '无故不参加文体 / 劳育活动', count: { per: -1, unit: '次' }, note: '每次 -1' },
      { id: 'dnDormC', label: '宿舍校级卫生检查被通报', count: { per: -2, unit: '次' }, note: '人均扣；年 3 次及以上直接扣 5 分' },
      { id: 'dnDormY', label: '宿舍院级卫生检查被通报', count: { per: -1, unit: '次' }, note: '人均扣' },
    ],
  },
]
