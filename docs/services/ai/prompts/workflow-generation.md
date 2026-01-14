# workflow-generation.js

**Path**: `services/ai/prompts/workflow-generation.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [user](#user) | object_property_method | ❌ | `userInput, targetUrl?` |
| [user](#user) | object_property_method | ❌ | `` |
| [user](#user) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="user"></a>user

- **Type**: `object_property_method`
- **Parameters**: `userInput, targetUrl?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
user: function (userInput, targetUrl = '') {
    let prompt = `## 用户需求:\n${userInput}\n`;
    if (targetUrl) {
      prompt += `\n## 目标网站:\n${targetUrl}\n`;
    }
    prompt += `\n请根据以上信息，生成详细的数据抓取步骤（JSON 格式）。`;
    return prompt;
  }
```

---

### <a id="user"></a>user

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
user: function () {
    return '';
  }
```

---

### <a id="user"></a>user

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
user: function () {
    return '';
  }
```

---

