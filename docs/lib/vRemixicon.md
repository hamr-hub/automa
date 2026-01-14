# vRemixicon.js

**Path**: `lib/vRemixicon.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props` |
| [install](#install) | object_method | ❌ | `app` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props) {
    const injectIcons = inject('remixicons');
    const icon = computed(() => {
      if (props.path) return props.path;

      const iconStr = injectIcons[props.name];

      if (typeof iconStr === 'undefined') {
        console.error(
          `[v-remixicon] ${props.name} name of the icon is incorrect`
        );
        return null;
      }

      return iconStr;
// ...
```

---

### <a id="install"></a>install

- **Type**: `object_method`
- **Parameters**: `app`
- **Description**: *No description provided.*

**Implementation**:
```javascript
install(app) {
    app.provide('remixicons', icons);
    app.component('VRemixicon', component);
  }
```

---

