# handlerElementScroll.js

**Path**: `content/blocksHandler/handlerElementScroll.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isElScrollable](#iselscrollable) | function | ❌ | `element` |
| [findScrollableElement](#findscrollableelement) | function | ❌ | `element?, dir?, maxDepth?` |
| [elementScroll](#elementscroll) | function | ❌ | `block` |
| [incScrollPos](#incscrollpos) | function | ❌ | `element, data, vertical?` |
| [onSelected](#onselected) | object_method | ❌ | `element` |
| [onError](#onerror) | object_method | ❌ | `error` |
| [onSuccess](#onsuccess) | object_method | ❌ | `` |

## Detailed Description

### <a id="iselscrollable"></a>isElScrollable

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isElScrollable(element) {
  const excludedTags = ['SCRIPT', 'STYLE', 'SVG', 'HEAD'];
  const isScrollable =
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth;
  const isExcluded =
    element.tagName.includes('-') || excludedTags.includes(element.tagName);

  return isScrollable && !isExcluded;
}
```

---

### <a id="findscrollableelement"></a>findScrollableElement

- **Type**: `function`
- **Parameters**: `element?, dir?, maxDepth?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findScrollableElement(
  element = document.documentElement,
  dir = 'down',
  maxDepth = 5
) {
  if (maxDepth === 0) return null;

  const isScrollable = isElScrollable(element);
  if (isScrollable) return element;

  if (dir === 'up') {
    const parentEl = element.parentElement;
    if (!parentEl) return null;

    const scrollableElement = findScrollableElement(
// ...
```

---

### <a id="elementscroll"></a>elementScroll

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function elementScroll(block) {
  function incScrollPos(element, data, vertical = true) {
    let currentPos = vertical ? element.scrollTop : element.scrollLeft;

    if (data.incY) {
      currentPos += data.scrollY;
    } else if (data.incX) {
      currentPos += data.scrollX;
    }

    return currentPos;
  }

  return new Promise((resolve, reject) => {
    const { data } = block;
// ...
```

---

### <a id="incscrollpos"></a>incScrollPos

- **Type**: `function`
- **Parameters**: `element, data, vertical?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function incScrollPos(element, data, vertical = true) {
    let currentPos = vertical ? element.scrollTop : element.scrollLeft;

    if (data.incY) {
      currentPos += data.scrollY;
    } else if (data.incX) {
      currentPos += data.scrollX;
    }

    return currentPos;
  }
```

---

### <a id="onselected"></a>onSelected

- **Type**: `object_method`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSelected(element) {
        if (data.scrollIntoView) {
          element.scrollIntoView({ behavior, block: 'center' });
        } else {
          const scrollableEl =
            findScrollableElement(element, 'up', 3) ||
            findScrollableElement(element, 'down', 3) ||
            element;

          scrollableEl.scroll({
            behavior,
            top: data.incY ? incScrollPos(element, data) : data.scrollY,
            left: data.incX ? incScrollPos(element, data, false) : data.scrollX,
          });
        }
// ...
```

---

### <a id="onerror"></a>onError

- **Type**: `object_method`
- **Parameters**: `error`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onError(error) {
        reject(error);
      }
```

---

### <a id="onsuccess"></a>onSuccess

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSuccess() {
        window.dispatchEvent(new Event('scroll'));
        resolve('');
      }
```

---

