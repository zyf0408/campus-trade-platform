# 校园二手交易平台 - 快速启动指南

## 🚀 三步快速启动

### 第一步：准备数据库

```bash
# 1. 确保 MySQL 服务已启动
# 2. 执行数据库初始化脚本
mysql -u root -p < campus-trade-api/src/main/resources/schema.sql
mysql -u root -p campus_trade < campus-trade-api/src/main/resources/test_data.sql
```

**注意**：如果你的 MySQL 密码不是 `123456`，请先修改 `application.yml` 中的数据库配置。

### 第二步：启动后端服务

```bash
cd campus-trade-api
mvn spring-boot:run
```

等待看到 `Started CampusTradeApplication` 表示启动成功！

后端地址：http://localhost:8080/api

### 第三步：启动前端服务

```bash
cd campus-trade-web
npm install
npm run dev
```

前端地址：http://localhost:3000

## 📱 开始体验

### 买家体验
1. 打开 http://localhost:3000
2. 点击「注册」创建一个新账号
3. 浏览商品列表，已有 18 件预置商品
4. 点击商品查看详情
5. 点击「立即购买」下单
6. 前往「我的订单」完成支付和收货

### 卖家体验
使用预置卖家账号登录（密码都是 `123456`）：
- seller1（小明学长）
- seller2（图书达人）
- seller3（数码控）
- seller4（生活小帮手）

登录后可以：
- 查看个人信息
- 发布新商品
- 管理已发布商品

## 🎁 预置测试数据

### 商品分类
| 分类 | 商品数量 |
|------|----------|
| 教材 | 4 |
| 考研资料 | 1 |
| 文具 | 1 |
| 笔记 | 1 |
| 日用品 | 4 |
| 装饰品 | 1 |
| 运动器材 | 1 |
| 手机 | 1 |
| 电脑 | 1 |
| 平板 | 1 |
| 配件 | 3 |

### 价格区间
- ¥15 - ¥100：12件
- ¥100 - ¥1000：3件
- ¥1000 - ¥5000：3件

## 🔧 常见问题

### Q: 前端启动失败？
A: 确保 Node.js 版本 >= 16，先运行 `npm install` 安装依赖

### Q: 后端启动失败？
A: 检查：
1. MySQL 是否启动
2. 数据库密码是否正确（application.yml）
3. 端口 8080 是否被占用

### Q: 商品图片不显示？
A: Unsplash 图片在国内可能加载较慢，可以：
1. 使用 VPN
2. 替换为其他图床链接
3. 使用本地图片

### Q: 如何重新初始化数据？
A: 重新执行 schema.sql 和 test_data.sql 即可

## 📚 详细文档

更多说明请查看：`TEST_DATA_README.md`

## 💡 提示

- 注册新账号后即可购买
- 可以使用 seller1-seller4 账号体验卖家功能
- 所有测试账号密码都是：123456
- 商品都已预置为已审核通过状态
