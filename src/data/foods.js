// 菜品/档口库：由 src/data/canteens.js 的真实档口派生，菜价据福师大Wiki《校园餐饮》详细菜单整理
// 价格为在校生实测/官方菜单价，仅供食参考，实际以餐厅当日标价为准。
import { canteens } from './canteens'

export const halls = canteens.map((c) => ({ name: c.name, campus: c.campus, zone: c.area }))

/** 特色菜品与参考价（档口 → 菜品 → 价格） */
export const menu = {
  '麦当劳': [
    { name: '麦满分套餐系列', price: '13元', tag: '早餐' },
    { name: '随心配 1+1', price: '13.9元', tag: '正餐' },
    { name: '大堡口福系列', price: '22.9元', tag: '正餐' },
    { name: '巨无霸牛肉鱼堡系列', price: '33元', tag: '正餐' }
  ],
  '面夫子': [
    { name: '包子系列', price: '2元', tag: '早餐' },
    { name: '面点系列', price: '2元', tag: '早餐' },
    { name: '红枣豆浆', price: '2元', tag: '早餐' }
  ],
  '伊樂拉面': [
    { name: '豚骨拉面系列', price: '18元', tag: '正餐' },
    { name: '地狱系列', price: '22元', tag: '正餐' },
    { name: '蛋包饭系列', price: '20元', tag: '正餐' },
    { name: '咖喱饭系列', price: '20元', tag: '正餐' }
  ],
  '百味佳自选快餐': [{ name: '自选荤素搭配快餐', price: '11元', tag: '正餐' }],
  '港式煨汤': [
    { name: '自选荤素搭配', price: '11元', tag: '正餐' },
    { name: '瓦罐系列', price: '6元', tag: '正餐' }
  ],
  '饺饺者手工饺子': [
    { name: '水饺类', price: '14元', tag: '正餐' },
    { name: '大馄饨类', price: '12元', tag: '正餐' },
    { name: '汤圆类', price: '7元', tag: '正餐' }
  ],
  '朱家小馆羊肉面': [
    { name: '汤面系列', price: '12元', tag: '正餐' },
    { name: '拌面系列', price: '11元', tag: '正餐' }
  ],
  '韩石记石锅饭': [
    { name: '韩式石锅拌饭系列', price: '13元', tag: '正餐' },
    { name: '荤素搭配煲系列', price: '15元', tag: '正餐' }
  ],
  '牛小贰原汤牛肉面': [
    { name: '原汤牛肉面', price: '15元', tag: '正餐' },
    { name: '汤面类', price: '13元', tag: '正餐' }
  ],
  '聚贤套餐饭': [
    { name: '一荤两素一蛋套餐饭', price: '13元', tag: '正餐' },
    { name: '双拼套餐饭', price: '20元', tag: '正餐' }
  ],
  '张记石磨肠粉': [
    { name: '石磨肠粉系列', price: '10元', tag: '正餐' },
    { name: '福鼎肉片', price: '8元', tag: '正餐' },
    { name: '皮蛋瘦肉粥', price: '8元', tag: '早餐' }
  ],
  '云南小锅米线': [{ name: '经典米线系列', price: '11元', tag: '正餐' }],
  '林真棒卤味饭': [{ name: '自选卤味搭配', price: '11元', tag: '正餐' }],
  '北方手工饺子': [{ name: '水饺系列', price: '13元', tag: '正餐' }],
  '张记饸饹面': [
    { name: '盖浇面类', price: '14元', tag: '正餐' },
    { name: '炒面类', price: '15元', tag: '正餐' },
    { name: '大骨高汤类', price: '15元', tag: '正餐' }
  ],
  '京元自选食堂': [
    { name: '自选荤素搭配', price: '10元', tag: '正餐' },
    { name: '面点类', price: '2元', tag: '早餐' },
    { name: '粥类', price: '2.5元', tag: '早餐' }
  ],
  '元气锅盔': [
    { name: '荆州锅盔', price: '7元', tag: '正餐' },
    { name: '广东肠粉系列', price: '9元', tag: '正餐' },
    { name: '粥类', price: '3元', tag: '早餐' }
  ],
  '玛格利塔披萨': [
    { name: '单片披萨', price: '7.9元', tag: '正餐' },
    { name: '整个披萨', price: '18.9元', tag: '正餐' },
    { name: '爆款套餐系列', price: '16元', tag: '正餐' }
  ],
  '自选食堂（5元营养餐）': [
    { name: '一荤一素管饱低保餐', price: '5元', tag: '正餐' },
    { name: '自选快餐系列', price: '8元', tag: '正餐' },
    { name: '豆浆包子系列', price: '5元', tag: '早餐' },
    { name: '清汤面', price: '5元', tag: '正餐' }
  ],
  '雀玲珑中国炸鸡': [
    { name: '2 个炸鸡腿', price: '9.9元', tag: '正餐' },
    { name: '组合炸鸡套餐系列', price: '23元', tag: '正餐' }
  ],
  '匠心卤热卤拌饭': [
    { name: '金牌肘子饭', price: '16元', tag: '正餐' },
    { name: '热卤饭系列', price: '14元', tag: '正餐' }
  ],
  '潮腊烧腊': [
    { name: '招牌脆皮烧鸭饭', price: '13元', tag: '正餐' },
    { name: '粤式烧腊饭系列', price: '14元', tag: '正餐' }
  ],
  '正粤营养糖水粥': [
    { name: '粥类', price: '4元', tag: '早餐' },
    { name: '山东杂粮煎饼', price: '6元', tag: '早餐' }
  ],
  '缘味先石锅饭': [
    { name: '肉末鸡蛋石锅饭', price: '12元', tag: '正餐' },
    { name: '石锅特色系列', price: '13元', tag: '正餐' },
    { name: '石锅荤菜系列', price: '16元', tag: '正餐' }
  ],
  '经典牛排·铁板板': [
    { name: '鸡排饭', price: '17元', tag: '正餐' },
    { name: '牛排系列', price: '24元', tag: '正餐' },
    { name: '意面系列', price: '13元', tag: '正餐' }
  ],
  '好煨道瓦罐套餐': [
    { name: '一荤一素套餐', price: '9元', tag: '正餐' },
    { name: '两荤一素套餐', price: '15元', tag: '正餐' },
    { name: '瓦罐汤系列', price: '6元', tag: '正餐' }
  ],
  '烤肉饭·脆皮鸡饭': [
    { name: '烤肉饭系列', price: '13元', tag: '正餐' },
    { name: '脆皮鸡饭系列', price: '14元', tag: '正餐' }
  ],
  '塔斯汀中国汉堡': [
    { name: '辣堡三件套', price: '19.9元', tag: '正餐' },
    { name: '1+1 随心配', price: '13元', tag: '正餐' }
  ],
  '老上海肠粉馄饨': [
    { name: '水饺系列', price: '13元', tag: '正餐' },
    { name: '肠粉系列', price: '8元', tag: '正餐' },
    { name: '小馄饨系列', price: '8元', tag: '正餐' }
  ],
  '西安大碗面': [
    { name: '经典干拌面系列', price: '13元', tag: '正餐' },
    { name: '油泼系列', price: '15元', tag: '正餐' },
    { name: '武汉热干面系列', price: '14元', tag: '正餐' }
  ],
  '回洋號沙茶面': [
    { name: '沙茶面套餐系列', price: '14元', tag: '正餐' },
    { name: '闽南鸭面套餐系列', price: '12元', tag: '正餐' }
  ],
  '沙小二醉沙县': [
    { name: '小吃系列', price: '5元', tag: '正餐' },
    { name: '炒面饭系列', price: '10元', tag: '正餐' },
    { name: '粉面系列', price: '11元', tag: '正餐' }
  ],
  '小哥瓦罐': [
    { name: '套餐饭系列', price: '12元', tag: '正餐' },
    { name: '瓦罐系列', price: '6元', tag: '正餐' }
  ],
  '临榆炸鸡腿': [
    { name: '炸鸡腿 3 个', price: '15元', tag: '正餐' },
    { name: '炸鸡系列 250g', price: '13元', tag: '正餐' }
  ],
  '田阿婆麻辣烫': [{ name: '自选菜称重 19.8 元/斤', price: '14元', tag: '正餐' }],
  '高八斗套餐饭': [{ name: '菜饭套餐系列', price: '15元', tag: '正餐' }],
  '美侍郎瓦香鸡': [
    { name: '瓦香鸡腿块饭', price: '14元', tag: '正餐' },
    { name: '瓦香鸡饭系列', price: '13元', tag: '正餐' }
  ],
  '汤居仕瓦罐煨汤': [
    { name: '瓦罐系列', price: '6元', tag: '正餐' },
    { name: '自选荤素搭配', price: '10元', tag: '正餐' }
  ],
  '小鲜肉手工水饺': [
    { name: '饺子系列', price: '13元', tag: '正餐' },
    { name: '锅贴系列', price: '10元', tag: '正餐' },
    { name: '馄饨系列', price: '10元', tag: '正餐' }
  ],
  '豫味拉面': [{ name: '汤面类', price: '13元', tag: '正餐' }],
  '沙县美食': [
    { name: '小吃类', price: '5元', tag: '正餐' },
    { name: '小炒类', price: '8元', tag: '正餐' },
    { name: '粉面类', price: '8元', tag: '正餐' }
  ],
  '云尚云南小锅米线': [{ name: '米线系列', price: '13元', tag: '正餐' }],
  '河林鸿老鸭粉丝': [
    { name: '粉面类', price: '13元', tag: '正餐' },
    { name: '精品粉面类', price: '17元', tag: '正餐' }
  ],
  '雨佳烧烤': [
    { name: '自选烧烤系列', price: '20元', tag: '夜宵' },
    { name: '拉丝芝士棒+烤鸡腿+茄子', price: '23元', tag: '夜宵' }
  ],
  '梦想咖喱': [
    { name: '咖喱饭类', price: '14元', tag: '正餐' },
    { name: '滑蛋饭类', price: '15元', tag: '正餐' }
  ],
  '福记麻辣烫': [{ name: '自助称重 1.98 元/两', price: '14元', tag: '正餐' }],
  '东福兴港式烧腊': [{ name: '烧腊系列', price: '11元', tag: '正餐' }],
  '香熏鸭仔面': [{ name: '招牌鸭仔面系列', price: '12元', tag: '正餐' }],
  '旺比包子': [
    { name: '包子系列', price: '1.5元', tag: '早餐' },
    { name: '面点系列', price: '2.5元', tag: '早餐' }
  ],
  '米婆婆': [
    { name: '自选一荤一素', price: '10元', tag: '正餐' },
    { name: '自选半荤半素', price: '6元', tag: '正餐' }
  ],
  '淳百味': [
    { name: '拌面系列', price: '6元', tag: '正餐' },
    { name: '扁肉系列', price: '12元', tag: '正餐' },
    { name: '汤面系列', price: '15元', tag: '正餐' }
  ],
  '蜀合记担担面': [
    { name: '招牌担担面', price: '13元', tag: '正餐' },
    { name: '汤面系列', price: '14元', tag: '正餐' },
    { name: '米粉系列', price: '14元', tag: '正餐' }
  ],
  '东方匠作中国汉堡': [
    { name: '低配两件套', price: '12.9元', tag: '正餐' },
    { name: '高配三件套', price: '19.9元', tag: '正餐' }
  ],
  '乡外乡套餐饭': [
    { name: '1 素 1 荤 1 半荤套餐', price: '9.9元', tag: '正餐' },
    { name: '1 素 2 荤 1 半荤套餐', price: '14.9元', tag: '正餐' }
  ],
  '咖喱饱饱': [
    { name: '咖喱饭套餐系列', price: '14.8元', tag: '正餐' },
    { name: '滑蛋饭系列', price: '15.3元', tag: '正餐' }
  ],
  '金日升烤盘饭': [{ name: '自助称重 8.9 元/三两', price: '16元', tag: '正餐' }],
  '食膳简餐': [{ name: '套餐系列', price: '13元', tag: '正餐' }],
  '赣味小炒': [
    { name: '招牌小炒肉系列', price: '14元', tag: '正餐' },
    { name: '甄选菜品系列', price: '13元', tag: '正餐' }
  ],
  '莫小喃自选水饺': [
    { name: '自选水饺系列', price: '12元', tag: '正餐' },
    { name: '肠粉系列', price: '8元', tag: '正餐' }
  ],
  '犇犇客家牛肉面': [
    { name: '汤粉面类系列', price: '13元', tag: '正餐' },
    { name: '干拌面类系列', price: '13元', tag: '正餐' }
  ],
  '重庆面馆': [
    { name: '汤面系列', price: '13元', tag: '正餐' },
    { name: '酸辣粉系列', price: '14元', tag: '正餐' },
    { name: '双拼系列', price: '19元', tag: '正餐' }
  ],
  '稻香缘渔粉': [
    { name: '粉面系列', price: '12元', tag: '正餐' },
    { name: '锡纸系列', price: '13元', tag: '正餐' }
  ],
  '西北拉面': [
    { name: '拉面系列', price: '12元', tag: '正餐' },
    { name: '刀削面系列', price: '13元', tag: '正餐' },
    { name: '水饺系列', price: '12元', tag: '正餐' }
  ],
  '煮飞的鸡·云南鸡汤米线': [
    { name: '鸡汤米线', price: '9.9元', tag: '正餐' },
    { name: '原汤鸡肉米线系列', price: '13.9元', tag: '正餐' }
  ],
  '喜姐炸串': [
    { name: '招牌必吃系列', price: '20元', tag: '夜宵' },
    { name: '超嗨套餐系列', price: '30元', tag: '夜宵' }
  ],
  '五谷鱼粉': [{ name: '鱼粉系列', price: '13元', tag: '正餐' }],
  '兰州拉面': [{ name: '拉面系列', price: '12元', tag: '正餐' }],
  '小锅米线': [{ name: '小锅米线', price: '12元', tag: '正餐' }],
  '自选食堂': [{ name: '自选荤素搭配', price: '10元', tag: '正餐' }]
}

export const foods = []
for (const c of canteens) {
  for (const f of c.foods) {
    const dish = menu[f] || []
    const price = dish.length ? dish[0].price : ''
    const tag = c.type === 'basic' ? '大众窗口' : '风味档口'
    foods.push({ name: f, hall: c.name, campus: c.campus, zone: c.area, tag, price })
  }
}

/** 附带菜价详情的抽取（含同档口其他菜品），无菜价档口仅给档口名 */
export function pickFoods(count = 3) {
  const pool = [...foods]
  const picks = []
  while (picks.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    picks.push(pool.splice(i, 1)[0])
  }
  return picks.map((p) => {
    const dish = menu[p.name] || []
    return { ...p, dishes: dish }
  })
}