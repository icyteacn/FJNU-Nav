// 菜品/档口库：由 src/data/canteens.js 的真实档口派生，菜价据福师大Wiki《校园餐饮》详细菜单整理
// 价格为在校生实测/官方菜单价，仅供食参考，实际以餐厅当日标价为准。
import { canteens } from './canteens'

export const halls = canteens.map((c) => ({ name: c.name, campus: c.campus, zone: c.area }))

/** 特色菜品与参考价（档口 → 菜品 → 价格 + 详情） */
export const menu = {
  '麦当劳': [
    { name: '麦满分套餐系列', price: 13, desc: '经典早餐套餐，含汉堡+饮品', tag: '早餐', spicy: 0, tags: ['快餐', '西式'] },
    { name: '随心配 1+1', price: 13.9, desc: '主食+小食自由搭配', tag: '正餐', spicy: 0, tags: ['快餐', '性价比'] },
    { name: '大堡口福系列', price: 22.9, desc: '大份牛肉堡套餐', tag: '正餐', spicy: 0, tags: ['快餐', '大份'] },
    { name: '巨无霸牛肉鱼堡系列', price: 33, desc: '豪华双层牛肉堡', tag: '正餐', spicy: 0, tags: ['快餐', '豪华'] }
  ],
  '面夫子': [
    { name: '包子系列', price: 2, desc: '鲜肉/菜包/豆沙包', tag: '早餐', spicy: 0, tags: ['面点', '传统'] },
    { name: '面点系列', price: 2, desc: '馒头/花卷/油条', tag: '早餐', spicy: 0, tags: ['面点', '传统'] },
    { name: '红枣豆浆', price: 2, desc: '现磨红枣豆浆', tag: '早餐', spicy: 0, tags: ['饮品', '养生'] }
  ],
  '伊樂拉面': [
    { name: '豚骨拉面系列', price: 18, desc: '日式浓郁豚骨汤底', tag: '正餐', spicy: 0, tags: ['日式', '拉面'] },
    { name: '地狱系列', price: 22, desc: '超辣地狱拉面', tag: '正餐', spicy: 3, tags: ['日式', '辣'] },
    { name: '蛋包饭系列', price: 20, desc: '日式滑蛋包饭', tag: '正餐', spicy: 0, tags: ['日式', '蛋包饭'] },
    { name: '咖喱饭系列', price: 20, desc: '日式咖喱配饭', tag: '正餐', spicy: 1, tags: ['日式', '咖喱'] }
  ],
  '百味佳自选快餐': [
    { name: '自选荤素搭配快餐', price: 11, desc: '自选菜品，荤素搭配', tag: '正餐', spicy: 0, tags: ['快餐', '自选'] }
  ],
  '港式煨汤': [
    { name: '自选荤素搭配', price: 11, desc: '家常荤素小炒', tag: '正餐', spicy: 0, tags: ['粤式', '家常'] },
    { name: '瓦罐系列', price: 6, desc: '慢火煨制瓦罐汤', tag: '正餐', spicy: 0, tags: ['粤式', '汤品'] }
  ],
  '饺饺者手工饺子': [
    { name: '水饺类', price: 14, desc: '现包手工水饺', tag: '正餐', spicy: 0, tags: ['饺子', '手工'] },
    { name: '大馄饨类', price: 12, desc: '皮薄馅大馄饨', tag: '正餐', spicy: 0, tags: ['馄饨', '手工'] },
    { name: '汤圆类', price: 7, desc: '黑芝麻/花生汤圆', tag: '正餐', spicy: 0, tags: ['甜品', '传统'] }
  ],
  '朱家小馆羊肉面': [
    { name: '汤面系列', price: 12, desc: '浓郁羊汤面', tag: '正餐', spicy: 0, tags: ['面食', '羊肉'] },
    { name: '拌面系列', price: 11, desc: '干拌羊肉面', tag: '正餐', spicy: 1, tags: ['面食', '干拌'] }
  ],
  '韩石记石锅饭': [
    { name: '韩式石锅拌饭系列', price: 13, desc: '正宗韩式石锅拌饭', tag: '正餐', spicy: 1, tags: ['韩式', '石锅'] },
    { name: '荤素搭配煲系列', price: 15, desc: '砂锅煲仔饭', tag: '正餐', spicy: 0, tags: ['煲仔', '荤素'] }
  ],
  '牛小贰原汤牛肉面': [
    { name: '原汤牛肉面', price: 15, desc: '熬制牛骨原汤', tag: '正餐', spicy: 0, tags: ['面食', '牛肉'] },
    { name: '汤面类', price: 13, desc: '多种汤面可选', tag: '正餐', spicy: 0, tags: ['面食', '汤面'] }
  ],
  '聚贤套餐饭': [
    { name: '一荤两素一蛋套餐饭', price: 13, desc: '经典学生套餐', tag: '正餐', spicy: 0, tags: ['套餐', '实惠'] },
    { name: '双拼套餐饭', price: 20, desc: '双荤搭配', tag: '正餐', spicy: 0, tags: ['套餐', '双荤'] }
  ],
  '张记石磨肠粉': [
    { name: '石磨肠粉系列', price: 10, desc: '广式石磨肠粉', tag: '正餐', spicy: 0, tags: ['粤式', '肠粉'] },
    { name: '福鼎肉片', price: 8, desc: '福建特色肉片汤', tag: '正餐', spicy: 0, tags: ['福建', '肉片'] },
    { name: '皮蛋瘦肉粥', price: 8, desc: '经典广式粥品', tag: '早餐', spicy: 0, tags: ['粥品', '经典'] }
  ],
  '云南小锅米线': [
    { name: '经典米线系列', price: 11, desc: '云南风味小锅米线', tag: '正餐', spicy: 1, tags: ['云南', '米线'] }
  ],
  '林真棒卤味饭': [
    { name: '自选卤味搭配', price: 11, desc: '卤味自选配饭', tag: '正餐', spicy: 0, tags: ['卤味', '自选'] }
  ],
  '北方手工饺子': [
    { name: '水饺系列', price: 13, desc: '北方风味手工水饺', tag: '正餐', spicy: 0, tags: ['饺子', '北方'] }
  ],
  '张记饸饹面': [
    { name: '盖浇面类', price: 14, desc: '浇头丰富盖浇面', tag: '正餐', spicy: 0, tags: ['面食', '盖浇'] },
    { name: '炒面类', price: 15, desc: '锅气十足炒面', tag: '正餐', spicy: 0, tags: ['面食', '炒面'] },
    { name: '大骨高汤类', price: 15, desc: '大骨熬制高汤面', tag: '正餐', spicy: 0, tags: ['面食', '汤面'] }
  ],
  '京元自选食堂': [
    { name: '自选荤素搭配', price: 10, desc: '自选菜品快餐', tag: '正餐', spicy: 0, tags: ['快餐', '自选'] },
    { name: '面点类', price: 2, desc: '包子馒头等', tag: '早餐', spicy: 0, tags: ['面点', '早餐'] },
    { name: '粥类', price: 2.5, desc: '白粥/皮蛋粥', tag: '早餐', spicy: 0, tags: ['粥品', '早餐'] }
  ],
  '元气锅盔': [
    { name: '荆州锅盔', price: 7, desc: '酥脆荆州锅盔', tag: '正餐', spicy: 1, tags: ['小吃', '酥脆'] },
    { name: '广东肠粉系列', price: 9, desc: '广式肠粉', tag: '正餐', spicy: 0, tags: ['粤式', '肠粉'] },
    { name: '粥类', price: 3, desc: '养胃粥品', tag: '早餐', spicy: 0, tags: ['粥品', '早餐'] }
  ],
  '玛格利塔披萨': [
    { name: '单片披萨', price: 7.9, desc: '意式现烤披萨', tag: '正餐', spicy: 0, tags: ['西式', '披萨'] },
    { name: '整个披萨', price: 18.9, desc: '分享装披萨', tag: '正餐', spicy: 0, tags: ['西式', '分享'] },
    { name: '爆款套餐系列', price: 16, desc: '披萨+饮品套餐', tag: '正餐', spicy: 0, tags: ['西式', '套餐'] }
  ],
  '自选食堂（5元营养餐）': [
    { name: '一荤一素管饱低保餐', price: 5, desc: '学生专属低保餐', tag: '正餐', spicy: 0, tags: ['套餐', '实惠'] },
    { name: '自选快餐系列', price: 8, desc: '自选菜品快餐', tag: '正餐', spicy: 0, tags: ['快餐', '自选'] },
    { name: '豆浆包子系列', price: 5, desc: '早餐套餐', tag: '早餐', spicy: 0, tags: ['早餐', '套餐'] },
    { name: '清汤面', price: 5, desc: '简单清汤面', tag: '正餐', spicy: 0, tags: ['面食', '清淡'] }
  ],
  '雀玲珑中国炸鸡': [
    { name: '2 个炸鸡腿', price: 9.9, desc: '酥脆炸鸡腿', tag: '正餐', spicy: 0, tags: ['炸鸡', '小吃'] },
    { name: '组合炸鸡套餐系列', price: 23, desc: '多人分享炸鸡套餐', tag: '正餐', spicy: 0, tags: ['炸鸡', '套餐'] }
  ],
  '匠心卤热卤拌饭': [
    { name: '金牌肘子饭', price: 16, desc: '秘制卤肘子', tag: '正餐', spicy: 1, tags: ['卤味', '招牌'] },
    { name: '热卤饭系列', price: 14, desc: '现卤现拌', tag: '正餐', spicy: 1, tags: ['卤味', '热卤'] }
  ],
  '潮腊烧腊': [
    { name: '招牌脆皮烧鸭饭', price: 13, desc: '潮式脆皮烧鸭', tag: '正餐', spicy: 0, tags: ['粤式', '烧腊'] },
    { name: '粤式烧腊饭系列', price: 14, desc: '叉烧/烧鹅/烧肉', tag: '正餐', spicy: 0, tags: ['粤式', '烧腊'] }
  ],
  '正粤营养糖水粥': [
    { name: '粥类', price: 4, desc: '广式养生粥', tag: '早餐', spicy: 0, tags: ['粥品', '粤式'] },
    { name: '山东杂粮煎饼', price: 6, desc: '杂粮煎饼果子', tag: '早餐', spicy: 0, tags: ['煎饼', '杂粮'] }
  ],
  '缘味先石锅饭': [
    { name: '肉末鸡蛋石锅饭', price: 12, desc: '经典石锅拌饭', tag: '正餐', spicy: 0, tags: ['石锅', '经典'] },
    { name: '石锅特色系列', price: 13, desc: '特色石锅饭', tag: '正餐', spicy: 1, tags: ['石锅', '特色'] },
    { name: '石锅荤菜系列', price: 16, desc: '荤菜石锅饭', tag: '正餐', spicy: 0, tags: ['石锅', '荤菜'] }
  ],
  '经典牛排·铁板板': [
    { name: '鸡排饭', price: 17, desc: '铁板鸡排饭', tag: '正餐', spicy: 0, tags: ['铁板', '鸡排'] },
    { name: '牛排系列', price: 24, desc: '铁板牛排', tag: '正餐', spicy: 0, tags: ['铁板', '牛排'] },
    { name: '意面系列', price: 13, desc: '意式面条', tag: '正餐', spicy: 0, tags: ['西式', '意面'] }
  ],
  '好煨道瓦罐套餐': [
    { name: '一荤一素套餐', price: 9, desc: '瓦罐煨汤套餐', tag: '正餐', spicy: 0, tags: ['瓦罐', '套餐'] },
    { name: '两荤一素套餐', price: 15, desc: '丰盛瓦罐套餐', tag: '正餐', spicy: 0, tags: ['瓦罐', '套餐'] },
    { name: '瓦罐汤系列', price: 6, desc: '慢火煨制瓦罐汤', tag: '正餐', spicy: 0, tags: ['瓦罐', '汤品'] }
  ],
  '烤肉饭·脆皮鸡饭': [
    { name: '烤肉饭系列', price: 13, desc: '日式烤肉饭', tag: '正餐', spicy: 0, tags: ['烤肉', '日式'] },
    { name: '脆皮鸡饭系列', price: 14, desc: '酥脆炸鸡饭', tag: '正餐', spicy: 0, tags: ['炸鸡', '脆皮'] }
  ],
  '塔斯汀中国汉堡': [
    { name: '辣堡三件套', price: 19.9, desc: '辣味汉堡套餐', tag: '正餐', spicy: 2, tags: ['快餐', '辣'] },
    { name: '1+1 随心配', price: 13, desc: '主食+小食搭配', tag: '正餐', spicy: 0, tags: ['快餐', '性价比'] }
  ],
  '老上海肠粉馄饨': [
    { name: '水饺系列', price: 13, desc: '手工水饺', tag: '正餐', spicy: 0, tags: ['饺子', '手工'] },
    { name: '肠粉系列', price: 8, desc: '广式肠粉', tag: '正餐', spicy: 0, tags: ['粤式', '肠粉'] },
    { name: '小馄饨系列', price: 8, desc: '皮薄馄饨', tag: '正餐', spicy: 0, tags: ['馄饨', '清淡'] }
  ],
  '西安大碗面': [
    { name: '经典干拌面系列', price: 13, desc: '陕西风味干拌面', tag: '正餐', spicy: 1, tags: ['面食', '陕西'] },
    { name: '油泼系列', price: 15, desc: '油泼辣子面', tag: '正餐', spicy: 2, tags: ['面食', '辣'] },
    { name: '武汉热干面系列', price: 14, desc: '正宗武汉热干面', tag: '正餐', spicy: 1, tags: ['面食', '武汉'] }
  ],
  '回洋號沙茶面': [
    { name: '沙茶面套餐系列', price: 14, desc: '闽南沙茶面', tag: '正餐', spicy: 1, tags: ['闽南', '沙茶'] },
    { name: '闽南鸭面套餐系列', price: 12, desc: '闽南风味鸭面', tag: '正餐', spicy: 0, tags: ['闽南', '鸭面'] }
  ],
  '沙小二醉沙县': [
    { name: '小吃系列', price: 5, desc: '沙县经典小吃', tag: '正餐', spicy: 0, tags: ['沙县', '小吃'] },
    { name: '炒面饭系列', price: 10, desc: '家常炒面炒饭', tag: '正餐', spicy: 0, tags: ['家常', '炒面'] },
    { name: '粉面系列', price: 11, desc: '沙县风味粉面', tag: '正餐', spicy: 0, tags: ['沙县', '粉面'] }
  ],
  '小哥瓦罐': [
    { name: '套餐饭系列', price: 12, desc: '瓦罐套餐饭', tag: '正餐', spicy: 0, tags: ['瓦罐', '套餐'] },
    { name: '瓦罐系列', price: 6, desc: '慢火煨汤', tag: '正餐', spicy: 0, tags: ['瓦罐', '汤品'] }
  ],
  '临榆炸鸡腿': [
    { name: '炸鸡腿 3 个', price: 15, desc: '酥脆大鸡腿', tag: '正餐', spicy: 0, tags: ['炸鸡', '小吃'] },
    { name: '炸鸡系列 250g', price: 13, desc: '现炸鸡肉', tag: '正餐', spicy: 0, tags: ['炸鸡', '小吃'] }
  ],
  '田阿婆麻辣烫': [
    { name: '自选菜称重 19.8 元/斤', price: 14, desc: '自选菜品麻辣烫', tag: '正餐', spicy: 2, tags: ['麻辣烫', '自选'] }
  ],
  '高八斗套餐饭': [
    { name: '菜饭套餐系列', price: 15, desc: '丰盛菜饭套餐', tag: '正餐', spicy: 0, tags: ['套餐', '丰盛'] }
  ],
  '美侍郎瓦香鸡': [
    { name: '瓦香鸡腿块饭', price: 14, desc: '瓦罐煨制鸡腿', tag: '正餐', spicy: 1, tags: ['瓦罐', '鸡肉'] },
    { name: '瓦香鸡饭系列', price: 13, desc: '瓦香风味鸡肉饭', tag: '正餐', spicy: 1, tags: ['瓦罐', '鸡肉'] }
  ],
  '汤居仕瓦罐煨汤': [
    { name: '瓦罐系列', price: 6, desc: '传统瓦罐煨汤', tag: '正餐', spicy: 0, tags: ['瓦罐', '汤品'] },
    { name: '自选荤素搭配', price: 10, desc: '自选小炒', tag: '正餐', spicy: 0, tags: ['家常', '自选'] }
  ],
  '小鲜肉手工水饺': [
    { name: '饺子系列', price: 13, desc: '现包手工水饺', tag: '正餐', spicy: 0, tags: ['饺子', '手工'] },
    { name: '锅贴系列', price: 10, desc: '香脆锅贴', tag: '正餐', spicy: 0, tags: ['饺子', '锅贴'] },
    { name: '馄饨系列', price: 10, desc: '皮薄馅大馄饨', tag: '正餐', spicy: 0, tags: ['馄饨', '手工'] }
  ],
  '豫味拉面': [
    { name: '汤面类', price: 13, desc: '河南风味拉面', tag: '正餐', spicy: 0, tags: ['面食', '河南'] }
  ],
  '沙县美食': [
    { name: '小吃类', price: 5, desc: '沙县经典小吃', tag: '正餐', spicy: 0, tags: ['沙县', '小吃'] },
    { name: '小炒类', price: 8, desc: '家常小炒', tag: '正餐', spicy: 0, tags: ['家常', '小炒'] },
    { name: '粉面类', price: 8, desc: '沙县风味粉面', tag: '正餐', spicy: 0, tags: ['沙县', '粉面'] }
  ],
  '云尚云南小锅米线': [
    { name: '米线系列', price: 13, desc: '云南风味米线', tag: '正餐', spicy: 1, tags: ['云南', '米线'] }
  ],
  '河林鸿老鸭粉丝': [
    { name: '粉面类', price: 13, desc: '老鸭粉丝汤', tag: '正餐', spicy: 0, tags: ['汤品', '粉丝'] },
    { name: '精品粉面类', price: 17, desc: '精品老鸭粉丝', tag: '正餐', spicy: 0, tags: ['汤品', '精品'] }
  ],
  '雨佳烧烤': [
    { name: '自选烧烤系列', price: 20, desc: '夜宵烧烤', tag: '夜宵', spicy: 1, tags: ['烧烤', '夜宵'] },
    { name: '拉丝芝士棒+烤鸡腿+茄子', price: 23, desc: '烧烤套餐', tag: '夜宵', spicy: 0, tags: ['烧烤', '套餐'] }
  ],
  '梦想咖喱': [
    { name: '咖喱饭类', price: 14, desc: '日式咖喱饭', tag: '正餐', spicy: 1, tags: ['日式', '咖喱'] },
    { name: '滑蛋饭类', price: 15, desc: '滑嫩蛋包饭', tag: '正餐', spicy: 0, tags: ['日式', '蛋包饭'] }
  ],
  '福记麻辣烫': [
    { name: '自助称重 1.98 元/两', price: 14, desc: '自选菜品麻辣烫', tag: '正餐', spicy: 2, tags: ['麻辣烫', '自选'] }
  ],
  '东福兴港式烧腊': [
    { name: '烧腊系列', price: 11, desc: '港式烧腊', tag: '正餐', spicy: 0, tags: ['粤式', '烧腊'] }
  ],
  '香熏鸭仔面': [
    { name: '招牌鸭仔面系列', price: 12, desc: '熏制鸭肉面', tag: '正餐', spicy: 0, tags: ['面食', '鸭肉'] }
  ],
  '旺比包子': [
    { name: '包子系列', price: 1.5, desc: '手工包子', tag: '早餐', spicy: 0, tags: ['面点', '早餐'] },
    { name: '面点系列', price: 2.5, desc: '馒头花卷', tag: '早餐', spicy: 0, tags: ['面点', '早餐'] }
  ],
  '米婆婆': [
    { name: '自选一荤一素', price: 10, desc: '米饭套餐', tag: '正餐', spicy: 0, tags: ['套餐', '米饭'] },
    { name: '自选半荤半素', price: 6, desc: '经济套餐', tag: '正餐', spicy: 0, tags: ['套餐', '实惠'] }
  ],
  '淳百味': [
    { name: '拌面系列', price: 6, desc: '沙县风味拌面', tag: '正餐', spicy: 0, tags: ['沙县', '拌面'] },
    { name: '扁肉系列', price: 12, desc: '沙县扁肉', tag: '正餐', spicy: 0, tags: ['沙县', '扁肉'] },
    { name: '汤面系列', price: 15, desc: '沙县汤面', tag: '正餐', spicy: 0, tags: ['沙县', '汤面'] }
  ],
  '蜀合记担担面': [
    { name: '招牌担担面', price: 13, desc: '四川风味担担面', tag: '正餐', spicy: 2, tags: ['川味', '担担面'] },
    { name: '汤面系列', price: 14, desc: '川味汤面', tag: '正餐', spicy: 1, tags: ['川味', '汤面'] },
    { name: '米粉系列', price: 14, desc: '川味米粉', tag: '正餐', spicy: 1, tags: ['川味', '米粉'] }
  ],
  '东方匠作中国汉堡': [
    { name: '低配两件套', price: 12.9, desc: '汉堡+饮品', tag: '正餐', spicy: 0, tags: ['快餐', '套餐'] },
    { name: '高配三件套', price: 19.9, desc: '汉堡+小食+饮品', tag: '正餐', spicy: 0, tags: ['快餐', '套餐'] }
  ],
  '乡外乡套餐饭': [
    { name: '1 素 1 荤 1 半荤套餐', price: 9.9, desc: '经济实惠套餐', tag: '正餐', spicy: 0, tags: ['套餐', '实惠'] },
    { name: '1 素 2 荤 1 半荤套餐', price: 14.9, desc: '丰盛套餐', tag: '正餐', spicy: 0, tags: ['套餐', '丰盛'] }
  ],
  '咖喱饱饱': [
    { name: '咖喱饭套餐系列', price: 14.8, desc: '日式咖喱饭', tag: '正餐', spicy: 1, tags: ['日式', '咖喱'] },
    { name: '滑蛋饭系列', price: 15.3, desc: '滑嫩蛋包饭', tag: '正餐', spicy: 0, tags: ['日式', '蛋包饭'] }
  ],
  '金日升烤盘饭': [
    { name: '自助称重 8.9 元/三两', price: 16, desc: '烤盘饭自助', tag: '正餐', spicy: 0, tags: ['自助', '烤盘'] }
  ],
  '食膳简餐': [
    { name: '套餐系列', price: 13, desc: '健康简餐', tag: '正餐', spicy: 0, tags: ['简餐', '健康'] }
  ],
  '赣味小炒': [
    { name: '招牌小炒肉系列', price: 14, desc: '江西风味小炒', tag: '正餐', spicy: 2, tags: ['赣味', '小炒'] },
    { name: '甄选菜品系列', price: 13, desc: '精选家常菜', tag: '正餐', spicy: 1, tags: ['赣味', '家常'] }
  ],
  '莫小喃自选水饺': [
    { name: '自选水饺系列', price: 12, desc: '自选口味水饺', tag: '正餐', spicy: 0, tags: ['饺子', '自选'] },
    { name: '肠粉系列', price: 8, desc: '广式肠粉', tag: '正餐', spicy: 0, tags: ['粤式', '肠粉'] }
  ],
  '犇犇客家牛肉面': [
    { name: '汤粉面类系列', price: 13, desc: '客家风味牛肉面', tag: '正餐', spicy: 0, tags: ['客家', '牛肉'] },
    { name: '干拌面类系列', price: 13, desc: '干拌牛肉面', tag: '正餐', spicy: 1, tags: ['客家', '干拌'] }
  ],
  '重庆面馆': [
    { name: '汤面系列', price: 13, desc: '重庆风味汤面', tag: '正餐', spicy: 2, tags: ['重庆', '面食'] },
    { name: '酸辣粉系列', price: 14, desc: '正宗重庆酸辣粉', tag: '正餐', spicy: 3, tags: ['重庆', '酸辣'] },
    { name: '双拼系列', price: 19, desc: '双拼套餐', tag: '正餐', spicy: 1, tags: ['重庆', '套餐'] }
  ],
  '稻香缘渔粉': [
    { name: '粉面系列', price: 12, desc: '渔粉风味', tag: '正餐', spicy: 0, tags: ['粉面', '渔粉'] },
    { name: '锡纸系列', price: 13, desc: '锡纸烤粉', tag: '正餐', spicy: 1, tags: ['粉面', '锡纸'] }
  ],
  '西北拉面': [
    { name: '拉面系列', price: 12, desc: '西北风味拉面', tag: '正餐', spicy: 0, tags: ['面食', '西北'] },
    { name: '刀削面系列', price: 13, desc: '手工刀削面', tag: '正餐', spicy: 0, tags: ['面食', '刀削'] },
    { name: '水饺系列', price: 12, desc: '手工水饺', tag: '正餐', spicy: 0, tags: ['饺子', '手工'] }
  ],
  '煮飞的鸡·云南鸡汤米线': [
    { name: '鸡汤米线', price: 9.9, desc: '鲜熬鸡汤米线', tag: '正餐', spicy: 0, tags: ['云南', '米线'] },
    { name: '原汤鸡肉米线系列', price: 13.9, desc: '原汁原味鸡汤', tag: '正餐', spicy: 0, tags: ['云南', '鸡汤'] }
  ],
  '喜姐炸串': [
    { name: '招牌必吃系列', price: 20, desc: '夜宵炸串', tag: '夜宵', spicy: 1, tags: ['炸串', '夜宵'] },
    { name: '超嗨套餐系列', price: 30, desc: '多人炸串套餐', tag: '夜宵', spicy: 0, tags: ['炸串', '套餐'] }
  ],
  '五谷鱼粉': [
    { name: '鱼粉系列', price: 13, desc: '五谷鱼粉', tag: '正餐', spicy: 0, tags: ['粉面', '鱼粉'] }
  ],
  '兰州拉面': [
    { name: '拉面系列', price: 12, desc: '正宗兰州拉面', tag: '正餐', spicy: 0, tags: ['面食', '兰州'] }
  ],
  '小锅米线': [
    { name: '小锅米线', price: 12, desc: '云南小锅米线', tag: '正餐', spicy: 1, tags: ['云南', '米线'] }
  ],
  '自选食堂': [
    { name: '自选荤素搭配', price: 10, desc: '自选快餐', tag: '正餐', spicy: 0, tags: ['快餐', '自选'] }
  ]
}

export const foods = []
for (const c of canteens) {
  for (const f of c.foods) {
    const dish = menu[f] || []
    const price = dish.length ? dish[0].price : 0
    const desc = dish.length ? dish[0].desc : ''
    const spicy = dish.length ? dish[0].spicy : 0
    const tags = dish.length ? dish[0].tags : []
    const tag = c.type === 'basic' ? '大众窗口' : '风味档口'
    foods.push({ name: f, hall: c.name, campus: c.campus, zone: c.area, tag, price, desc, spicy, tags })
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