# Automa 浏览器插件 - Amazon 商品采集器

## 概述

本文档介绍如何使用 Automa 浏览器扩展自动采集亚马逊商品数据并写入 Supabase 数据库。

## 功能特性

- ✅ 自动提取亚马逊商品详情
- ✅ 支持多站点（amazon.com, amazon.sg, amazon.co.uk等）
- ✅ 实时数据写入 Supabase
- ✅ 数据去重和更新
- ✅ 自动通知采集结果

## 工作流配置

### 1. 导入工作流

1. 打开 Automa 扩展
2. 点击"工作流"标签
3. 点击"导入"按钮
4. 选择 `automa/workflows/amazon-product-collector.json` 文件
5. 工作流将自动导入

### 2. 配置 Supabase 连接

在使用工作流前，需要配置 Supabase 连接信息：

1. 在 Automa 中打开导入的工作流
2. 点击"变量"标签
3. 添加以下全局变量：

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `supabaseUrl` | `https://your-project.supabase.co` | Supabase 项目 URL |
| `supabaseKey` | `your-anon-key` | Supabase anon/public API key |

**获取 Supabase 配置：**
1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 Settings → API
4. 复制 Project URL 和 anon/public API key

### 3. 工作流节点说明

工作流包含以下主要节点：

#### 数据提取节点
1. **提取商品标题** - 从 `#productTitle` 提取
2. **提取 ASIN** - 从商品详情中提取唯一标识
3. **提取价格** - 支持多种价格选择器
4. **提取品牌** - 从 bylineInfo 提取
5. **提取评分** - 星级评分（0-5）
6. **提取评论数** - 评论总数
7. **提取主图** - 商品主图 URL
8. **提取库存状态** - 是否有货

#### 数据处理节点
9. **构建数据对象** - JavaScript 节点，清理和格式化数据
10. **发送数据到 Supabase** - Webhook 节点，调用 Supabase REST API
11. **显示成功通知** - 提示用户数据已保存

### 4. 使用方法

#### 方法一：手动触发

1. 访问任意亚马逊商品详情页
2. 点击浏览器工具栏的 Automa 图标
3. 选择"Amazon Product Collector"工作流
4. 点击"执行"按钮
5. 等待采集完成，系统将显示成功通知

#### 方法二：自动触发（推荐）

1. 在 Automa 中打开工作流编辑器
2. 编辑"触发器"节点
3. 设置触发条件：
   - 触发类型：`访问网址时`
   - URL 模式：`*://www.amazon.*/*/*/dp/*`
4. 保存工作流
5. 之后访问亚马逊商品详情页时会自动采集

## 数据结构

采集的数据将写入 Supabase 的 `product_details` 表，包含以下字段：

```json
{
  "product_url": "完整商品URL",
  "asin": "商品ASIN",
  "title": "商品标题",
  "brand": "品牌",
  "current_price": "当前价格（数字）",
  "currency": "货币代码",
  "rating": "评分（0-5）",
  "review_count": "评论数量",
  "availability": "库存状态",
  "main_image_url": "主图URL",
  "metadata": {
    "collected_at": "采集时间",
    "collector": "automa-extension",
    "url": "来源URL"
  }
}
```

## 数据去重

Supabase 配置了数据去重策略：

- 使用 `product_url` 作为唯一键
- 重复的商品会自动更新而不是插入新记录
- 在 Webhook 请求头中添加了 `Prefer: resolution=merge-duplicates`

## 进阶配置

### 1. 支持多站点

修改工作流中的货币代码逻辑：

```javascript
// 在 js-1 节点中
const getCurrency = (url) => {
  if (url.includes('amazon.com')) return 'USD';
  if (url.includes('amazon.sg')) return 'SGD';
  if (url.includes('amazon.co.uk')) return 'GBP';
  if (url.includes('amazon.de')) return 'EUR';
  return 'USD';
};

const productData = {
  // ...
  currency: getCurrency(productUrl),
  // ...
};
```

### 2. 采集更多字段

可以添加更多数据提取节点：

- 商品描述
- 商品图片列表
- 详细规格参数
- 卖家信息
- 运输信息

示例：提取商品描述

```json
{
  "id": "extract-description",
  "type": "get-text",
  "label": "提取商品描述",
  "data": {
    "selector": "#feature-bullets, #productDescription",
    "assignVariable": true,
    "variableName": "description"
  }
}
```

### 3. 错误处理

在 Webhook 节点中添加 fallback 连接：

1. 在工作流编辑器中选择 Webhook 节点
2. 添加"fallback"输出
3. 连接到错误处理节点（如记录日志或重试）

### 4. 批量采集

创建一个列表页工作流，提取所有商品链接后循环调用详情采集工作流：

```json
{
  "id": "loop-products",
  "type": "loop-data",
  "label": "循环商品列表",
  "data": {
    "loopId": "product-urls",
    "loopThrough": "numbers",
    "startIndex": 0,
    "endIndex": 50
  }
}
```

## 与 price-admin 集成

采集的数据会自动显示在 price-admin 管理后台：

1. 访问 price-admin 项目
2. 登录后台
3. 进入"商品详情"页面
4. 可以看到所有通过 Automa 采集的商品数据

price-admin 提供的功能：
- 查看商品列表和详情
- 筛选和搜索商品
- 查看价格历史
- 管理用户关注商品

## 与 price-spider 协同

- **Automa**: 用户主动访问时采集数据（实时、按需）
- **price-spider**: 定时批量爬取和更新数据（自动、定时）

两者互补：
- Automa 适合用户发现新商品时快速采集
- price-spider 适合已有商品的定期价格更新

## 常见问题

### 1. 数据未保存到 Supabase

检查：
- Supabase URL 和 API Key 是否正确
- 浏览器控制台是否有错误信息
- Supabase RLS 策略是否允许插入

### 2. 某些字段提取失败

亚马逊页面结构可能变化，需要更新选择器：
1. 右键检查元素
2. 找到正确的选择器
3. 更新工作流中的 selector 值

### 3. 触发器不工作

确保：
- URL 模式匹配正确
- 工作流已启用
- 浏览器权限已授予

### 4. 性能优化

- 增加节点间延迟（blockDelay）避免被检测
- 使用条件判断跳过已采集的商品
- 限制批量采集的数量

## 数据隐私和合规

⚠️ **重要提示**：
- 仅用于个人学习和研究
- 遵守亚马逊的使用条款和 robots.txt
- 控制采集频率，避免对服务器造成压力
- 不要用于商业目的或数据转售

## 技术支持

如有问题：
1. 查看 Automa 的日志（在扩展中打开工作流执行日志）
2. 检查 Supabase 的日志（在 Dashboard → Database → Logs）
3. 查看浏览器控制台的错误信息

## 相关资源

- [Automa 官方文档](https://docs.automa.site/)
- [Supabase 文档](https://supabase.com/docs)
- [Supabase REST API](https://supabase.com/docs/guides/api)
