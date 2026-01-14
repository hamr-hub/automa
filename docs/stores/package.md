# package.js

**Path**: `stores/package.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [getById](#getbyid) | object_property_method | ❌ | `state` |
| [isShared](#isshared) | object_property_method | ❌ | `state` |
| [insert](#insert) | object_method | ✅ | `data, newId?` |
| [update](#update) | object_method | ✅ | `{}` |
| [delete](#delete) | object_method | ✅ | `id` |
| [deleteShared](#deleteshared) | object_method | ❌ | `id` |
| [insertShared](#insertshared) | object_method | ❌ | `id` |
| [loadData](#loaddata) | object_method | ✅ | `force?` |
| [loadShared](#loadshared) | object_method | ✅ | `` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    packages: [],
    sharedPkgs: [],
    retrieved: false,
    sharedRetrieved: false,
  })
```

---

### <a id="getbyid"></a>getById

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getById: (state) => (pkgId) => {
      return state.packages.find((pkg) => pkg.id === pkgId);
    }
```

---

### <a id="isshared"></a>isShared

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
isShared: (state) => (pkgId) => {
      return state.sharedPkgs.some((pkg) => pkg.id === pkgId);
    }
```

---

### <a id="insert"></a>insert

- **Type**: `object_method`
- **Parameters**: `data, newId?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async insert(data, newId = true) {
      const packageData = {
        ...defaultPackage,
        ...data,
        createdAt: Date.now(),
      };
      if (newId) packageData.id = nanoid();

      this.packages.push(packageData);
      await this.saveToStorage('packages');
    }
```

---

### <a id="update"></a>update

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async update({ id, data }) {
      const index = this.packages.findIndex((pkg) => pkg.id === id);
      if (index === -1) return null;

      Object.assign(this.packages[index], data);
      await this.saveToStorage('packages');

      return this.packages[index];
    }
```

---

### <a id="delete"></a>delete

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async delete(id) {
      const index = this.packages.findIndex((pkg) => pkg.id === id);
      if (index === -1) return null;

      const data = this.packages[index];
      this.packages.splice(index, 1);

      await this.saveToStorage('packages');

      return data;
    }
```

---

### <a id="deleteshared"></a>deleteShared

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
deleteShared(id) {
      const index = this.sharedPkgs.findIndex((item) => item.id === id);
      if (index !== -1) this.sharedPkgs.splice(index, 1);
    }
```

---

### <a id="insertshared"></a>insertShared

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
insertShared(id) {
      this.sharedPkgs.push({ id });
    }
```

---

### <a id="loaddata"></a>loadData

- **Type**: `object_method`
- **Parameters**: `force?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadData(force = false) {
      if (this.retrieved && !force) return this.packages;

      const { savedBlocks } = await browser.storage.local.get('savedBlocks');

      this.packages = savedBlocks || [];
      this.retrieved = true;

      return this.packages;
    }
```

---

### <a id="loadshared"></a>loadShared

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadShared() {
      try {
        if (this.sharedRetrieved) return;

        const result = await apiAdapter.getPackages();
        this.sharedPkgs = result;
        this.sharedRetrieved = true;
      } catch (error) {
        console.error(error.message);

        throw error;
      }
    }
```

---

