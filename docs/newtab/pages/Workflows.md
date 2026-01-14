# Workflows.vue

**Path**: `newtab/pages/Workflows.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [addTab](#addtab) | function | ❌ | `detail?` |
| [closeTab](#closetab) | function | ❌ | `index, tab` |
| [getTabTitle](#gettabtitle) | function | ❌ | `` |

## Detailed Description

### <a id="addtab"></a>addTab

- **Type**: `function`
- **Parameters**: `detail?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addTab(detail = {}) {
  const workflowsTab = state.tabs.find(
    (tab) => tab.path === '/' || tab.path === '/workflows'
  );

  if (workflowsTab) {
    state.activeTab = workflowsTab.id;
    return;
  }

  const tabId = nanoid();

  state.tabs.push({
    id: tabId,
    path: '/',
// ...
```

---

### <a id="closetab"></a>closeTab

- **Type**: `function`
- **Parameters**: `index, tab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeTab(index, tab) {
  if (state.tabs.length === 1) {
    state.tabs[0] = {
      path: '/',
      id: nanoid(),
      name: 'Workflows',
    };
  } else {
    state.tabs.splice(index, 1);
  }

  if (tab.id === state.activeTab) {
    state.activeTab = state.tabs[0].id;
  }
}
```

---

### <a id="gettabtitle"></a>getTabTitle

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getTabTitle() {
  if (route.name === 'workflows') return 'Workflows';

  return `${document.title}`.replace(' - Automa', '');
}
```

---

