# conditionCode.js

**Path**: `workflowEngine/utils/conditionCode.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `activeTab, payload` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `activeTab, payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (activeTab, payload) {
  const variableId = `automa${nanoid()}`;

  if (
    !payload.data.context ||
    payload.data.context === 'website' ||
    !payload.isPopup
  ) {
    if (!activeTab.id) throw new Error('no-tab');

    const refDataScriptStr = automaRefDataStr(variableId);

    // 构建一个完全自包含的函数字符串，其中所有变量都是硬编码的
    // 这确保在跨环境执行时不依赖闭包变量
    const callbackFunctionStr = `
// ...
```

---

