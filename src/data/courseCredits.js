/**
 * 研究生奖学金计分课程目录（依据学院评审计分办法 · 附件2）
 * 仅公共必修 + 专业必修计入综合成绩；未修/多修课程不计入。
 */
export const MAJORS = [
  {
    id: 'phd-cyber', label: '网络空间安全 · 学术型博士', degree: 'phd',
    courses: [
      { id: 'd1', name: '中国马克思主义与当代', credit: 2 },
      { id: 'd2', name: '马克思恩格斯列宁经典著作选读', credit: 1 },
      { id: 'd3', name: '博士生第一外国语', credit: 3 },
      { id: 'd4', name: '科研伦理与学术规范', credit: 1 },
      { id: 'd5', name: '实验室安全知识', credit: 1 },
      { id: 'd6', name: '学术论文写作', credit: 2 },
      { id: 'd7', name: '网络空间安全导论', credit: 2 },
      { id: 'd8', name: '网络安全（硕博连读/直博）', credit: 3 },
      { id: 'd9', name: '现代密码学（硕博连读/直博）', credit: 3 },
      { id: 'd10', name: '新技术安全（硕博连读/直博）', credit: 3 },
    ],
  },
  {
    id: 'ms-cs', label: '计算机科学与技术 · 学术型硕士', degree: 'master',
    courses: [
      { id: 'c1', name: '新时代中国特色社会主义理论与实践研究', credit: 2 },
      { id: 'c2', name: '自然辩证法概论', credit: 1 },
      { id: 'c3', name: '硕士生第一外国语', credit: 4 },
      { id: 'c4', name: '科研伦理与学术规范', credit: 1 },
      { id: 'c5', name: '实验室安全知识', credit: 1 },
      { id: 'c6', name: '学术论文写作', credit: 2 },
      { id: 'c7', name: '高等工程数学', credit: 3 },
      { id: 'c8', name: '高级算法设计与分析', credit: 3 },
      { id: 'c9', name: '机器学习', credit: 3 },
    ],
  },
  {
    id: 'ms-cyber', label: '网络空间安全 · 学术型硕士', degree: 'master',
    courses: [
      { id: 'w1', name: '新时代中国特色社会主义理论与实践研究', credit: 2 },
      { id: 'w2', name: '自然辩证法概论', credit: 1 },
      { id: 'w3', name: '硕士生第一外国语', credit: 4 },
      { id: 'w4', name: '科研伦理与学术规范', credit: 1 },
      { id: 'w5', name: '实验室安全知识', credit: 1 },
      { id: 'w6', name: '学术论文写作', credit: 2 },
      { id: 'w7', name: '网络空间安全导论', credit: 2 },
      { id: 'w8', name: '网络安全', credit: 3 },
      { id: 'w9', name: '现代密码学', credit: 3 },
      { id: 'w10', name: '新技术安全', credit: 3 },
    ],
  },
  {
    id: 'ms-se', label: '软件工程 · 专业型硕士', degree: 'master',
    courses: [
      { id: 's1', name: '新时代中国特色社会主义理论与实践研究', credit: 2 },
      { id: 's2', name: '硕士生外语', credit: 2 },
      { id: 's3', name: '自然辩证法概论', credit: 1 },
      { id: 's4', name: '科研伦理与学术规范', credit: 1 },
      { id: 's5', name: '工程伦理', credit: 2 },
      { id: 's6', name: '实验室安全知识', credit: 1 },
      { id: 's7', name: '论文写作指导', credit: 2 },
      { id: 's8', name: '高等工程数学', credit: 3 },
      { id: 's9', name: '高级算法设计与分析', credit: 3 },
      { id: 's10', name: '软件体系结构', credit: 2 },
      { id: 's11', name: '软件过程管理', credit: 2 },
    ],
  },
  {
    id: 'ms-cybersec', label: '网络与信息安全 · 专业型硕士', degree: 'master',
    courses: [
      { id: 'n1', name: '新时代中国特色社会主义理论与实践研究', credit: 2 },
      { id: 'n2', name: '硕士生外语', credit: 2 },
      { id: 'n3', name: '自然辩证法概论', credit: 1 },
      { id: 'n4', name: '科研伦理与学术规范', credit: 1 },
      { id: 'n5', name: '工程伦理', credit: 2 },
      { id: 'n6', name: '实验室安全知识', credit: 1 },
      { id: 'n7', name: '论文写作指导', credit: 2 },
      { id: 'n8', name: '高等工程数学', credit: 3 },
      { id: 'n9', name: '算法设计与分析', credit: 3 },
      { id: 'n10', name: '高级网络安全技术', credit: 2 },
      { id: 'n11', name: '数据安全导论', credit: 2 },
    ],
  },
  {
    id: 'ms-ai', label: '人工智能 · 专业型硕士', degree: 'master',
    courses: [
      { id: 'a1', name: '新时代中国特色社会主义理论与实践研究', credit: 2 },
      { id: 'a2', name: '硕士生外语', credit: 2 },
      { id: 'a3', name: '自然辩证法概论', credit: 1 },
      { id: 'a4', name: '科研伦理与学术规范', credit: 1 },
      { id: 'a5', name: '工程伦理', credit: 2 },
      { id: 'a6', name: '实验室安全知识', credit: 1 },
      { id: 'a7', name: '论文写作指导', credit: 2 },
      { id: 'a8', name: '高等工程数学', credit: 3 },
      { id: 'a9', name: '算法设计与分析', credit: 3 },
      { id: 'a10', name: '人工智能模型与理论', credit: 2 },
      { id: 'a11', name: '机器学习', credit: 2 },
    ],
  },
]

export function majorsForDegree(degree) {
  return MAJORS.filter(m => m.degree === degree)
}

export function majorById(id) {
  return MAJORS.find(m => m.id === id) || null
}
