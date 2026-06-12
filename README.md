# 🎓 校园二手交易平台

> 基于 Spring Boot + Vue3 的校园二手交易平台，支持商品发布、在线聊天、订单管理、信誉评价等功能。

[License](https://img.shields.io/badge/license-MIT-blue.svg)
[Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-green.svg)
[Vue](https://img.shields.io/badge/Vue-3.4.21-brightgreen.svg)

## ✨ 功能特性

### 核心功能
- 🔐 **用户认证** - JWT + 校园身份认证
- 🛍️ **商品管理** - 发布、编辑、下架商品
- 💬 **即时聊天** - WebSocket 实时消息
- 📦 **订单系统** - 下单、支付、自提、完成
- ⭐ **信誉评价** - 买家卖家双向评价
- ❤️ **商品收藏** - 收藏感兴趣的商品
- 🔔 **消息通知** - WebSocket 实时推送

### 特色功能
- 🎨 **现代化UI** - 渐变紫色主题，响应式设计
- 🔍 **智能搜索** - 关键词搜索 + 分类筛选 + 价格区间
- 📊 **排序功能** - 综合/价格/时间排序
- 👤 **用户主页** - 查看卖家信息和历史评价
- ⏰ **超时提醒** - 订单超时自动提醒
- 💚 **信誉体系** - 好评+3，中评+1，差评-5

## 🛠️ 技术栈

### 后端技术
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.18 | 核心框架 |
| MyBatis-Plus | 3.5.5 | ORM框架 |
| MySQL | 8.0 | 数据库 |
| WebSocket | - | 实时通信 |
| JWT | 0.12.3 | 身份认证 |
| Maven | - | 构建工具 |

### 前端技术
| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | 3.4.21 | 前端框架 |
| Vue Router | 4.3.0 | 路由管理 |
| SockJS | 1.6.1 | WebSocket客户端 |
| STOMP | 7.0.0 | 消息协议 |
| Vite | 5.2.0 | 构建工具 |

## 📁 项目结构

```
campus-trade-platform/
├── campus-trade-api/          # 后端项目
│   ├── src/main/java/
│   │   └── com/campus/trade/
│   │       ├── config/        # 配置类
│   │       ├── controller/    # 控制器
│   │       ├── entity/        # 实体类
│   │       ├── mapper/        # 数据访问层
│   │       ├── service/       # 业务逻辑层
│   │       ├── websocket/     # WebSocket处理
│   │       └── task/          # 定时任务
│   └── src/main/resources/
│       └── application.yml    # 配置文件
│
├── campus-trade-web/          # 前端项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── components/        # 组件
│   │   ├── router/            # 路由配置
│   │   ├── services/          # 服务
│   │   ├── views/             # 页面视图
│   │   └── App.vue            # 根组件
│   └── package.json
│
└── README.md                  # 项目说明
```

## 🚀 快速开始

### 环境要求
- JDK 1.8+
- MySQL 8.0+
- Node.js 16+
- Maven 3.6+

### 1. 克隆项目
```bash
git clone https://github.com/zyf0408/campus-trade-platform.git
cd campus-trade-platform
```

### 2. 数据库配置
创建数据库并执行初始化脚本：
```sql
CREATE DATABASE campus_trade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改后端数据库配置 `campus-trade-api/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/campus_trade?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 3. 启动后端
```bash
cd campus-trade-api
mvn clean install
mvn spring-boot:run
```
后端服务默认运行在 `http://localhost:8081`

### 4. 启动前端
```bash
cd campus-trade-web
npm install
npm run dev
```
前端服务默认运行在 `http://localhost:3030`

## 📸 界面预览

### 首页
- 渐变紫色主题 Hero 区域
- 平台数据统计展示
- 商品分类快捷入口

### 商品列表
- 侧边栏分类筛选
- 价格区间筛选
- 多种排序方式
- 卡片式商品展示

### 商品详情
- 图片轮播展示
- 卖家信息展示
- 收藏/购买按钮
- 相似商品推荐

### 个人中心
- 用户信息管理
- 商品发布
- 我的商品/收藏
- 销售记录/评价

## 🔧 配置说明

### 后端配置
```yaml
# application.yml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/campus_trade
    username: root
    password: 123456

  redis:
    host: localhost
    port: 6379
    password:
    database: 0

jwt:
  secret: your-secret-key
  expiration: 86400000
```

### 前端配置
```javascript
// api/request.js
const baseURL = 'http://localhost:8080'
```

## 📚 API 文档

### 用户模块
| 接口 | 方法 | 说明 |
|------|------|------|
| /auth/register | POST | 用户注册 |
| /auth/login | POST | 用户登录 |
| /auth/profile | GET | 获取用户信息 |

### 商品模块
| 接口 | 方法 | 说明 |
|------|------|------|
| /product/list | GET | 商品列表 |
| /product/{id} | GET | 商品详情 |
| /product/publish | POST | 发布商品 |
| /product/offline/{id} | PUT | 下架商品 |

### 订单模块
| 接口 | 方法 | 说明 |
|------|------|------|
| /order/create | POST | 创建订单 |
| /order/my-orders | GET | 我的订单 |
| /order/pay/{id} | PUT | 支付订单 |
| /order/confirm-pickup/{id} | PUT | 确认自提 |

### 收藏模块
| 接口 | 方法 | 说明 |
|------|------|------|
| /favorite/{productId} | POST | 添加收藏 |
| /favorite/{productId} | DELETE | 取消收藏 |
| /favorite/list | GET | 我的收藏 |

### 通知模块
| 接口 | 方法 | 说明 |
|------|------|------|
| /notification/list | GET | 通知列表 |
| /notification/unread-count | GET | 未读数量 |
| /notification/read-all | PUT | 全部已读 |

## 🎯 更新日志

### v1.0.0 (2024-05)
- ✅ 用户注册/登录/认证
- ✅ 商品发布/浏览/搜索
- ✅ 订单管理（下单/支付/自提）
- ✅ 即时聊天（WebSocket）
- ✅ 信誉评价体系
- ✅ 商品收藏功能
- ✅ 消息通知系统
- ✅ 订单超时提醒
- ✅ 用户主页展示
- ✅ 现代化UI设计

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

## 👨‍💻 作者

- **周云富** - [GitHub](https://github.com/zyf0408)

---

> 💡 如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！