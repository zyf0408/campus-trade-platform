# PowerShell 执行 MySQL 脚本指南

## 方法一：使用 Get-Content 管道（推荐）

```powershell
# 执行 schema.sql 创建表结构
Get-Content "campus-trade-api/src/main/resources/schema.sql" | mysql -u root -p

# 执行 test_data.sql 插入测试数据
Get-Content "campus-trade-api/src/main/resources/test_data.sql" | mysql -u root -p campus_trade
```

执行后会提示输入密码，输入你的MySQL密码即可（默认是 `123456`）。

## 方法二：使用 mysql 命令行交互模式

```powershell
# 1. 进入 MySQL 命令行
mysql -u root -p

# 2. 输入密码后，执行以下命令
source campus-trade-api/src/main/resources/schema.sql;
source campus-trade-api/src/main/resources/test_data.sql;

# 3. 退出
exit;
```

## 方法三：使用完整路径

如果当前目录不对，可以使用完整路径：

```powershell
$schemaPath = "C:\Users\周云富\Desktop\校园二手交易平台\campus-trade-api\src\main\resources\schema.sql"
$testDataPath = "C:\Users\周云富\Desktop\校园二手交易平台\campus-trade-api\src\main\resources\test_data.sql"

Get-Content $schemaPath | mysql -u root -p
Get-Content $testDataPath | mysql -u root -p campus_trade
```

## 方法四：使用 MySQL Workbench（可视化方式）

1. 打开 MySQL Workbench
2. 连接到你的 MySQL 服务器
3. 打开 schema.sql 文件并执行
4. 打开 test_data.sql 文件并执行

## 注意事项

1. **确保 MySQL 已启动**
   ```powershell
   # 检查 MySQL 服务状态
   Get-Service MySQL*
   
   # 如果未运行，启动服务
   Start-Service MySQL80  # 或你的服务名
   ```

2. **确保 mysql 命令在 PATH 中**
   ```powershell
   # 如果 mysql 命令找不到
   # 添加 MySQL bin 目录到 PATH
   $env:PATH += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```

3. **数据库密码**
   - 默认密码是 `123456`
   - 如果你的密码不同，请修改 application.yml 中的配置

## 验证数据

执行成功后，可以验证：

```powershell
mysql -u root -p -e "USE campus_trade; SELECT COUNT(*) FROM product; SELECT username FROM user;"
```

应该看到：
- 商品数量：18
- 用户数量：6（4个卖家 + 2个管理员）
