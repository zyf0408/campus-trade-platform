const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// 定义边框样式
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

// 创建表格单元格的辅助函数
function createCell(text, width, options = {}) {
    return new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({
            alignment: options.align || AlignmentType.CENTER,
            children: [new TextRun({ text, bold: options.bold, size: 18 })]
        })]
    });
}

// 创建文档
const doc = new Document({
    styles: {
        default: {
            document: {
                run: {
                    font: { ascii: "宋体", hAnsi: "宋体", eastAsia: "宋体" },
                    size: 24
                }
            }
        },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 32, bold: true, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } },
                paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0, keepNext: false, keepLines: false } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } },
                paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1, keepNext: false, keepLines: false } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, bold: true, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } },
                paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 2, keepNext: false, keepLines: false } },
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1440, right: 1800, bottom: 1440, left: 1800 }
            }
        },
        children: [
            // 封面
            new Paragraph({ spacing: { before: 600 }, children: [] }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 },
                children: [new TextRun({ text: "应用软件综合课程设计 I", bold: true, size: 44, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 600 },
                children: [new TextRun({ text: "实验报告------系统设计与实现", bold: true, size: 36, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } })]
            }),
            
            // 信息表格
            new Table({
                width: { size: 85, type: WidthType.PERCENTAGE },
                columnWidths: [3500, 5500],
                rows: [
                    new TableRow({
                        children: [
                            createCell("项目名称：", 3500, { bold: true }),
                            createCell("校园二手交易平台", 5500)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createCell("专业年级：", 3500, { bold: true }),
                            createCell("软件工程专业2023级", 5500)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createCell("姓名（学号）：", 3500, { bold: true }),
                            createCell("周云富（2023112549）", 5500)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createCell("指导老师（职称）：", 3500, { bold: true }),
                            createCell("韩敏（教授）", 5500)
                        ]
                    }),
                    new TableRow({
                        children: [
                            createCell("提交日期：", 3500, { bold: true }),
                            createCell("2026年5月29日", 5500)
                        ]
                    })
                ]
            }),
            
            new Paragraph({ children: [new PageBreak()] }),
            
            // 目录
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 400 },
                children: [new TextRun({ text: "目  录", bold: true, size: 32, font: { ascii: "黑体", hAnsi: "黑体", eastAsia: "黑体" } })]
            }),
            new Paragraph({ children: [new TextRun({ text: "1、前言", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.1 系统目标", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.2 编写目的", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.3 读者对象", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.4 背景", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.5 术语与缩写解释", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "1.6 参考资料", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2、系统解决方案", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "2.1 总体解决方案", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "2.2 软件结构设计", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "2.3 系统业务描述", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3、数据库设计", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "3.1 系统数据库的概念模型设计", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "3.2 数据库的表结构", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "4、系统功能详细设计", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "4.1 用户管理模块", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "4.2 商品管理模块", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "4.3 订单管理模块", size: 24 })] }),
            new Paragraph({ indent: { left: 400 }, children: [new TextRun({ text: "4.4 聊天通讯模块", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "5、系统程序和技术实现", size: 24 })] }),
            
            new Paragraph({ children: [new PageBreak()] }),
            
            // 1、前言
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: "1、前言", bold: true })]
            }),
            
            // 1.1 系统目标
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.1 系统目标", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "本系统设计与实施完成应实现以下目标：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（1）构建一个安全、便捷的校园二手交易平台，为在校学生提供闲置物品交易服务；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（2）实现用户注册认证、商品发布浏览、在线即时聊天、订单交易管理等核心功能；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（3）建立完善的信誉评价体系，保障交易双方的权益；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（4）提供智能匹配推荐功能，帮助买家快速找到所需商品；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（5）支持毕业季专场活动，方便毕业生处理闲置物品。", size: 24 })]
            }),
            
            // 1.2 编写目的
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.2 编写目的", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "本文档作为校园二手交易平台的设计说明书，详细描述了系统的功能设计、数据库设计、详细设计和实现方案。本文档也作为后期程序开发和项目实施的依据，用于指导开发人员完成系统编码工作，并作为系统测试和验收的参考标准。", size: 24 })]
            }),
            
            // 1.3 读者对象
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.3 读者对象", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "本文档预期读者为所有参与此项目的人员，具体包括：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 最终用户：使用平台进行二手交易的学生", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 概要和详细设计者：系统架构师和设计师", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 编码者：前端和后端开发人员", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 系统测试者：质量保证人员", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 系统维护者：运维和技术支持人员", size: 24 })]
            }),
            
            // 1.4 背景
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.4 背景", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "系统名称：校园二手交易平台", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "项目委托单位：软件工程学院", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "项目开发单位：2023级软件工程课程设计小组", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "随着校园生活的发展，学生在校期间会产生大量闲置物品，如教材、电子产品、生活用品等。传统的线下交易方式存在信息不对称、交易效率低、安全隐患等问题。本项目旨在构建一个专门针对校园场景的二手交易平台，通过线上发布、智能匹配、即时通讯等功能，提高闲置物品的流转效率，促进资源的合理利用。", size: 24 })]
            }),
            
            // 1.5 术语与缩写解释
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.5 术语与缩写解释", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "1.5.1 JWT（JSON Web Token）", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "一种开放标准（RFC 7519），用于在网络应用环境间安全地将信息作为JSON对象传输，本系统用于用户身份认证。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "1.5.2 WebSocket", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "一种在单个TCP连接上进行全双工通信的协议，本系统用于实现即时聊天和消息推送功能。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "1.5.3 RESTful API", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "Representational State Transfer，一种软件架构风格，本系统后端采用RESTful风格设计API接口。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "1.5.4 ORM（Object-Relational Mapping）", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "对象关系映射，本系统使用MyBatis-Plus框架实现Java对象与数据库表的映射。", size: 24 })]
            }),
            
            // 1.6 参考资料
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "1.6 参考资料", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（1）中华人民共和国国家标准《计算机软件开发文件编制指南》GB8567-88", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（2）中华人民共和国国家标准《计算机软件需求说明编制指南》GB8585-88", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（3）Spring Boot官方文档：https://spring.io/projects/spring-boot", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（4）Vue.js官方文档：https://vuejs.org/", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（5）MyBatis-Plus官方文档：https://baomidou.com/", size: 24 })]
            }),
            
            new Paragraph({ children: [new PageBreak()] }),
            
            // 2、系统解决方案
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: "2、系统解决方案", bold: true })]
            }),
            
            // 2.1 总体解决方案
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "2.1 总体解决方案", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "2.1.1 系统应用模式", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "本系统采用B/S（浏览器/服务器）模式设计，用户通过浏览器访问系统，无需安装客户端软件。系统分为前端展示层和后端服务层两部分：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（1）前端展示层：基于Vue 3框架开发，提供用户界面交互，包括商品浏览、搜索、发布、聊天等功能；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（2）后端服务层：基于Spring Boot框架开发，提供RESTful API接口，处理业务逻辑、数据存储、消息推送等；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（3）数据库层：使用MySQL存储业务数据，Redis作为缓存，Elasticsearch提供搜索服务。", size: 24 })]
            }),
            
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "2.1.2 系统开发及应用环境", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（1）系统开发环境：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 开发语言：Java 8、JavaScript", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 后端框架：Spring Boot 2.7.18", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 前端框架：Vue 3.4.21", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 数据库：MySQL 8.0", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 开发工具：IntelliJ IDEA、VS Code", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "（2）系统运行环境：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 服务器端：JDK 1.8+、MySQL 8.0+、Redis、RabbitMQ、Elasticsearch", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 客户端：Chrome、Firefox、Edge等现代浏览器", size: 24 })]
            }),
            
            // 2.2 软件结构设计
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "2.2 软件结构设计", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "2.2.1 总体结构", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "系统采用前后端分离的架构设计，总体结构分为三层：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（1）表现层（Presentation Layer）：Vue 3前端应用，负责用户界面渲染和交互；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（2）业务逻辑层（Business Logic Layer）：Spring Boot后端服务，处理业务规则和数据处理；", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "（3）数据访问层（Data Access Layer）：MyBatis-Plus ORM框架，负责数据库操作。", size: 24 })]
            }),
            
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "2.2.2 前端功能结构", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "前端应用包含以下功能模块：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 用户模块：注册、登录、个人中心、认证管理", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 商品模块：商品列表、商品详情、商品发布、商品搜索", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 订单模块：购物车、订单创建、订单支付、订单管理", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 聊天模块：即时通讯、消息列表、聊天记录", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 通知模块：系统通知、消息推送", size: 24 })]
            }),
            
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "2.2.3 后端功能结构", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "后端服务按业务领域划分为以下模块：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 用户服务：用户管理、认证授权、信誉管理", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 商品服务：商品管理、分类管理、求购管理、匹配推荐", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 订单服务：订单管理、支付管理、自提管理", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 消息服务：WebSocket通讯、通知推送、聊天记录", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 80 },
                indent: { left: 400 },
                children: [new TextRun({ text: "- 平台服务：举报管理、维权管理、公告管理", size: 24 })]
            }),
            
            // 2.3 系统业务描述
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "2.3 系统业务描述", bold: true })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "系统主要包括以下几个核心业务：", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 用户认证管理", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "用户通过学号或手机号注册账号，提交校园卡照片进行实名认证。认证通过后获得初始信誉分，可正常使用平台功能。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 商品发布与浏览", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "卖家可以发布闲置商品，填写商品信息、上传图片、设置价格和自提地点。买家可以浏览商品列表，通过分类、关键词、价格区间等条件筛选商品。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 智能匹配推荐", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "系统根据买家发布的求购信息，自动匹配符合条件的商品，并向买卖双方推送匹配通知，提高交易成功率。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 在线交易流程", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "买家选择商品后下单，双方通过即时聊天约定交易细节，选择自提点进行线下交易。交易完成后双方互评，评价影响信誉分。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 信誉评价体系", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "系统建立完善的信誉评价机制，好评增加信誉分，差评降低信誉分。信誉分影响用户在平台的权限，如发布商品数量限制、求购匹配优先级等。", size: 24 })]
            }),
            new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: "- 毕业季专场", size: 24, bold: true })]
            }),
            new Paragraph({
                spacing: { before: 80, after: 120 },
                indent: { left: 400 },
                children: [new TextRun({ text: "针对毕业生推出专场活动，毕业生可以批量发布闲置物品，设置清仓折扣，方便快速处理离校物品。", size: 24 })]
            }),
            
            new Paragraph({ children: [new PageBreak()] }),
        ]
    }]
});

// 保存文档
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("c:\\Users\\周云富\\Desktop\\校园二手交易平台\\系统设计与实现_完整版.docx", buffer);
    console.log("文档生成成功！");
});
