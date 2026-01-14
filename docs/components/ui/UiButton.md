# UiButton.vue

**Path**: `components/ui/UiButton.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup() {
    const variants = {
      transparent: {
        default: 'hoverable',
      },
      fill: {
        default: 'bg-input',
        accent:
          'bg-[var(--color-accent)] hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-black text-white',
        primary:
          'bg-primary text-white dark:bg-secondary dark:hover:bg-primary hover:bg-secondary',
        danger:
          'bg-red-400 text-white dark:bg-red-500 dark:hover:bg-red-500 hover:bg-red-400',
      },
    };
// ...
```

---

