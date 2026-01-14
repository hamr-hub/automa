# folder.js

**Path**: `stores/folder.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [addFolder](#addfolder) | object_method | ✅ | `name` |
| [deleteFolder](#deletefolder) | object_method | ✅ | `id` |
| [updateFolder](#updatefolder) | object_method | ✅ | `id, data?` |
| [load](#load) | object_method | ❌ | `` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    items: [],
    retrieved: false,
  })
```

---

### <a id="addfolder"></a>addFolder

- **Type**: `object_method`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async addFolder(name) {
      this.items.push({
        name,
        id: nanoid(),
      });

      await this.saveToStorage('items');

      return this.items.at(-1);
    }
```

---

### <a id="deletefolder"></a>deleteFolder

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async deleteFolder(id) {
      const index = this.items.findIndex((folder) => folder.id === id);
      if (index === -1) return null;

      this.items.splice(index, 1);
      await this.saveToStorage('items');

      return index;
    }
```

---

### <a id="updatefolder"></a>updateFolder

- **Type**: `object_method`
- **Parameters**: `id, data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updateFolder(id, data = {}) {
      const index = this.items.findIndex((folder) => folder.id === id);
      if (index === -1) return null;

      Object.assign(this.items[index], data);
      await this.saveToStorage('items');

      return this.items[index];
    }
```

---

### <a id="load"></a>load

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
load() {
      return browser.storage.local.get('folders').then(({ folders }) => {
        this.items = folders || [];
        this.retrieved = true;
        return folders;
      });
    }
```

---

