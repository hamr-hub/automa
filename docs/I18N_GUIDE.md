# 国际化 (i18n) 完善指南

本指南介绍如何为用户认证系统添加完整的国际化支持。

## 已完成的工作

### 1. 创建认证翻译文件

新增了两个语言文件:

- `src/locales/en/auth.json` - 英文翻译
- `src/locales/zh/auth.json` - 中文翻译

### 2. 翻译覆盖范围

完整覆盖以下模块:

#### 登录注册 (`auth.*`)
- 登录页面所有文案
- 注册流程文案
- 密码登录/OTP登录
- Passkey 登录
- 忘记密码

#### Passkey 相关 (`auth.webauthn.*`)
- 浏览器支持提示
- 注册流程文案
- 错误提示
- 设备管理

#### 个人中心 (`settings.profile.*`)
- 基本信息
- 账号安全
- MFA 设置
- 近期活动

#### 通用文案 (`common.*`)
- 操作按钮
- 状态提示
- 常用词汇

---

## 集成到项目

### 方法 1: 合并到现有文件 (推荐)

如果项目已有 i18n 配置,将新翻译合并到现有文件:

```bash
# 合并到 newtab.json
cat src/locales/en/auth.json >> src/locales/en/newtab.json
cat src/locales/zh/auth.json >> src/locales/zh/newtab.json
```

### 方法 2: 独立认证模块

保持 `auth.json` 独立,在 i18n 配置中加载:

```javascript
// src/utils/i18n.js (示例)
import enAuth from '@/locales/en/auth.json';
import zhAuth from '@/locales/zh/auth.json';
import enNewtab from '@/locales/en/newtab.json';
import zhNewtab from '@/locales/zh/newtab.json';

const messages = {
  en: {
    ...enNewtab,
    ...enAuth,
  },
  zh: {
    ...zhNewtab,
    ...zhAuth,
  },
};

export default createI18n({
  locale: 'en',
  messages,
});
```

---

## 使用翻译

### 在 Vue 组件中使用

```vue
<template>
  <h1>{{ t('auth.login.title') }}</h1>
  <p>{{ t('auth.login.subtitle') }}</p>
  
  <button>{{ t('auth.signIn') }}</button>
  
  <p>{{ t('auth.webauthn.intro') }}</p>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
```

### 带参数的翻译 (可选)

如果需要动态内容,可以扩展:

```json
{
  "auth": {
    "welcome": "Welcome back, {name}!",
    "emailSent": "Verification code sent to {email}"
  }
}
```

使用:
```javascript
t('auth.welcome', { name: 'John' })
t('auth.emailSent', { email: user.email })
```

---

## 添加更多语言

### 步骤 1: 创建新语言文件

```bash
# 复制英文模板
cp src/locales/en/auth.json src/locales/es/auth.json
cp src/locales/en/auth.json src/locales/fr/auth.json
```

### 步骤 2: 翻译内容

使用专业翻译服务或工具:
- [DeepL](https://www.deepl.com/) - 高质量机器翻译
- [Google Translate](https://translate.google.com/)
- [Crowdin](https://crowdin.com/) - 协作翻译平台

### 步骤 3: 更新 i18n 配置

```javascript
import esAuth from '@/locales/es/auth.json';
import frAuth from '@/locales/fr/auth.json';

const messages = {
  // ...existing
  es: { ...esAuth },
  fr: { ...frAuth },
};
```

---

## 翻译质量检查

### 1. 完整性检查

确保所有语言包含相同的 key:

```bash
# 使用工具比对
npm install -g i18n-json-check
i18n-json-check src/locales/en/auth.json src/locales/zh/auth.json
```

### 2. 文案审核清单

- [ ] 语法正确,无拼写错误
- [ ] 语气一致 (正式/非正式)
- [ ] 术语统一 (如 "Passkey" 不翻译)
- [ ] 长度适中 (避免 UI 溢出)
- [ ] 符合目标语言习惯

### 3. 上下文测试

在实际 UI 中测试:
- 切换语言查看显示效果
- 检查按钮文字是否过长
- 验证错误提示是否清晰

---

## 常见问题

### 1. 翻译文件冲突

如果 `auth.json` 的 key 与现有文件冲突:

**解决**: 使用命名空间前缀
```json
{
  "userAuth": { 
    "login": { ... }
  }
}
```

### 2. 缺少翻译回退

如果某个 key 缺失,默认显示 key 名称:

**解决**: 配置回退语言
```javascript
createI18n({
  locale: 'zh',
  fallbackLocale: 'en', // 缺失时使用英文
  messages,
});
```

### 3. 动态切换语言

```vue
<template>
  <select v-model="locale" @change="changeLocale">
    <option value="en">English</option>
    <option value="zh">中文</option>
  </select>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function changeLocale(event) {
  locale.value = event.target.value;
  localStorage.setItem('locale', locale.value);
}
</script>
```

---

## 最佳实践

### 1. 翻译组织

```
src/locales/
├── en/
│   ├── common.json       # 通用词汇
│   ├── auth.json         # 认证模块
│   ├── workflow.json     # 工作流模块
│   └── settings.json     # 设置模块
└── zh/
    ├── common.json
    ├── auth.json
    ├── workflow.json
    └── settings.json
```

### 2. Key 命名规范

```json
{
  "模块名": {
    "子模块": {
      "具体功能": "翻译文本"
    }
  }
}
```

示例:
```json
{
  "auth": {
    "login": {
      "title": "Sign in"
    },
    "errors": {
      "invalidEmail": "Invalid email"
    }
  }
}
```

### 3. 避免硬编码

❌ 不推荐:
```vue
<p>Please enter your email</p>
```

✅ 推荐:
```vue
<p>{{ t('auth.emailPlaceholder') }}</p>
```

### 4. 术语表

维护统一的术语翻译:

| 英文 | 中文 | 西班牙语 |
|------|------|----------|
| Passkey | Passkey | Passkey |
| Two-Factor Authentication | 两步验证 | Autenticación de dos factores |
| Magic Link | Magic Link | Enlace mágico |

---

## 进阶功能

### 1. 复数形式

某些语言需要区分单复数:

```json
{
  "auth": {
    "passkeyCount": "{count} Passkey | {count} Passkeys"
  }
}
```

使用:
```javascript
t('auth.passkeyCount', { count: 1 })  // "1 Passkey"
t('auth.passkeyCount', { count: 5 })  // "5 Passkeys"
```

### 2. 日期格式化

不同语言的日期格式不同:

```javascript
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const formatDate = (date) => {
  return new Intl.DateTimeFormat(locale.value).format(date);
};
```

### 3. 货币格式化

```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

---

## 测试清单

- [ ] 所有语言文件 JSON 格式正确
- [ ] 所有 key 在各语言中都存在
- [ ] UI 中所有文本都使用 `t()` 函数
- [ ] 切换语言后界面正常显示
- [ ] 长文本不会导致布局溢出
- [ ] 错误提示在各语言下清晰易懂

---

## 贡献翻译

欢迎社区贡献更多语言翻译:

1. Fork 项目
2. 复制 `en/auth.json` 为 `{lang}/auth.json`
3. 翻译所有文案
4. 提交 Pull Request

---

## 相关资源

- [Vue I18n 文档](https://vue-i18n.intlify.dev/)
- [i18next 文档](https://www.i18next.com/)
- [CLDR - 语言数据](http://cldr.unicode.org/)
- [Localizely - 翻译管理](https://localizely.com/)

---

**完成时间**: 2024-01-16  
**版本**: v1.0  
**支持语言**: en, zh (可扩展)
