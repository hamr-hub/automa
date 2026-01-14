# triggerText.js

**Path**: `utils/triggerText.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `trigger, t, workflowId, includeManual?` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `trigger, t, workflowId, includeManual?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (trigger, t, workflowId, includeManual = false) {
  if (!trigger || (trigger.type === 'manual' && !includeManual)) return null;

  const triggerLocale = t('workflow.blocks.trigger.name');

  if (trigger.type === 'manual') {
    return `${triggerLocale}: ${t('workflow.blocks.trigger.items.manual')}`;
  }

  const triggerName = t(`workflow.blocks.trigger.items.${trigger.type}`);
  let text = '';

  if (trigger.type === 'keyboard-shortcut') {
    text = getReadableShortcut(trigger.shortcut);
  } else if (trigger.type === 'visit-web') {
// ...
```

---

