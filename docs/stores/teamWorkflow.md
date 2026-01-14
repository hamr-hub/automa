# teamWorkflow.js

**Path**: `stores/teamWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [toArray](#toarray) | object_property_method | ❌ | `state` |
| [getByTeam](#getbyteam) | object_property_method | ❌ | `state` |
| [getById](#getbyid) | object_property_method | ❌ | `state` |
| [insert](#insert) | object_method | ✅ | `teamId, data` |
| [update](#update) | object_method | ✅ | `{}` |
| [delete](#delete) | object_method | ✅ | `teamId, id` |
| [loadData](#loaddata) | object_method | ✅ | `` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    workflows: {},
    retrieved: false,
  })
```

---

### <a id="toarray"></a>toArray

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
toArray: (state) => Object.values(state.workflows)
```

---

### <a id="getbyteam"></a>getByTeam

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getByTeam: (state) => (teamId) => {
      if (!state.workflows) return [];

      return Object.values(state.workflows[teamId] || {});
    }
```

---

### <a id="getbyid"></a>getById

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getById: (state) => (teamId, id) => {
      if (!state.workflows || !state.workflows[teamId]) return null;

      return state.workflows[teamId][id] || null;
    }
```

---

### <a id="insert"></a>insert

- **Type**: `object_method`
- **Parameters**: `teamId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async insert(teamId, data) {
      if (!this.workflows[teamId]) this.workflows[teamId] = {};

      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.workflows[teamId][item.id] = item;
        });
      } else {
        this.workflows[teamId][data.id] = data;
      }

      await this.saveToStorage('workflows');
    }
```

---

### <a id="update"></a>update

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async update({ teamId, id, data, deepmerge = false }) {
      const isWorkflowExists = Boolean(this.workflows[teamId]?.[id]);
      if (!isWorkflowExists) return null;

      if (deepmerge) {
        this.workflows[teamId][id] = lodashDeepmerge(
          this.workflows[teamId][id],
          data
        );
      } else {
        Object.assign(this.workflows[teamId][id], data);
      }

      await this.saveToStorage('workflows');

// ...
```

---

### <a id="delete"></a>delete

- **Type**: `object_method`
- **Parameters**: `teamId, id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async delete(teamId, id) {
      if (!this.workflows[teamId]) return;

      delete this.workflows[teamId][id];

      await this.saveToStorage('workflows');
      await cleanWorkflowTriggers(id);
    }
```

---

### <a id="loaddata"></a>loadData

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadData() {
      const { teamWorkflows } = await browser.storage.local.get(
        'teamWorkflows'
      );

      this.workflows = teamWorkflows || {};
      this.retrieved = true;
    }
```

---

