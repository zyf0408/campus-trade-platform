-- 校园二手交易平台 - 商品分类修正脚本
-- 修正之前发布商品时分类选择错误的问题

-- 1. 书籍教材 (category_id = 2)
UPDATE c_product SET category_id = 2 
WHERE category_id = 5 
AND (title LIKE '%书%' OR title LIKE '%教材%' OR title LIKE '%考研%' 
     OR title LIKE '%笔记%' OR title LIKE '%真题%' OR title LIKE '%习题%'
     OR description LIKE '%书%' OR description LIKE '%教材%');

-- 2. 运动健身 (category_id = 5)
UPDATE c_product SET category_id = 5 
WHERE category_id = 2 
AND (title LIKE '%运动%' OR title LIKE '%健身%' OR title LIKE '%球%' 
     OR title LIKE '%跑步%' OR title LIKE '%瑜伽%' OR title LIKE '%哑铃%'
     OR title LIKE '%自行车%' OR title LIKE '%泳%');

-- 3. 数码电子 - 手机 (category_id = 1)
UPDATE c_product SET category_id = 1 
WHERE category_id IN (2, 5, 6, 7)
AND (title LIKE '%手机%' OR title LIKE '%iPhone%' OR title LIKE '%华为%' 
     OR title LIKE '%小米%' OR title LIKE '%OPPO%' OR title LIKE '%vivo%');

-- 4. 数码电子 - 电脑 (category_id = 1)
UPDATE c_product SET category_id = 1 
WHERE category_id IN (2, 5, 6, 7)
AND (title LIKE '%电脑%' OR title LIKE '%笔记本%' OR title LIKE '%MacBook%' 
     OR title LIKE '%游戏本%' OR title LIKE '%台式%' OR title LIKE '%显卡%');

-- 5. 数码电子 - 平板 (category_id = 1)
UPDATE c_product SET category_id = 1 
WHERE category_id IN (2, 5, 6, 7)
AND (title LIKE '%平板%' OR title LIKE '%iPad%' OR title LIKE '%MatePad%' 
     OR title LIKE '%Surface%');

-- 6. 服饰鞋包 (category_id = 3)
UPDATE c_product SET category_id = 3 
WHERE category_id IN (1, 4, 5, 6, 7)
AND (title LIKE '%衣服%' OR title LIKE '%T恤%' OR title LIKE '%裤子%' 
     OR title LIKE '%裙子%' OR title LIKE '%鞋%' OR title LIKE '%包%'
     OR title LIKE '%帽子%' OR title LIKE '%外套%' OR title LIKE '%卫衣%');

-- 7. 生活用品 (category_id = 4)
UPDATE c_product SET category_id = 4 
WHERE category_id IN (1, 3, 5, 6, 7)
AND (title LIKE '%台灯%' OR title LIKE '%收纳%' OR title LIKE '%床品%' 
     OR title LIKE '%水杯%' OR title LIKE '%收纳盒%' OR title LIKE '%衣架%'
     OR title LIKE '%插座%' OR title LIKE '%风扇%' OR title LIKE '%加湿器%');

-- 8. 美妆护肤 (category_id = 6)
UPDATE c_product SET category_id = 6 
WHERE category_id IN (1, 2, 3, 4, 5, 7, 8)
AND (title LIKE '%护肤%' OR title LIKE '%化妆品%' OR title LIKE '%口红%' 
     OR title LIKE '%粉底%' OR title LIKE '%香水%' OR title LIKE '%面膜%'
     OR title LIKE '%洗面奶%' OR title LIKE '%水乳%');

-- 9. 食品零食 (category_id = 7)
UPDATE c_product SET category_id = 7 
WHERE category_id IN (1, 2, 3, 4, 5, 6, 8)
AND (title LIKE '%零食%' OR title LIKE '%食品%' OR title LIKE '%饮料%' 
     OR title LIKE '%咖啡%' OR title LIKE '%茶叶%' OR title LIKE '%糖果%');

-- 10. 其他 (category_id = 8) - 作为默认值保留给无法识别的商品

-- 查看修正后的分类分布
SELECT category_id, COUNT(*) as count FROM c_product GROUP BY category_id ORDER BY category_id;
