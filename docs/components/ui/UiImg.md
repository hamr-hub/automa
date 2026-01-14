# UiImg.vue

**Path**: `components/ui/UiImg.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [handleImageLoad](#handleimageload) | function | ❌ | `` |
| [handleImageError](#handleimageerror) | function | ❌ | `` |
| [loadImage](#loadimage) | function | ❌ | `` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const imageContainer = ref(null);
    const state = shallowReactive({
      loading: true,
      error: false,
    });

    function handleImageLoad() {
      state.loading = false;
      state.error = false;

      emit('load', true);
    }
    function handleImageError() {
      state.loading = false;
// ...
```

---

### <a id="handleimageload"></a>handleImageLoad

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleImageLoad() {
      state.loading = false;
      state.error = false;

      emit('load', true);
    }
```

---

### <a id="handleimageerror"></a>handleImageError

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleImageError() {
      state.loading = false;
      state.error = true;

      emit('error', true);
    }
```

---

### <a id="loadimage"></a>loadImage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function loadImage() {
      const image = new Image();

      image.onload = () => handleImageLoad(image);
      image.onerror = handleImageError;
      image.src = props.src;
    }
```

---

