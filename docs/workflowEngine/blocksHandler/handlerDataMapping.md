# handlerDataMapping.js

**Path**: `workflowEngine/blocksHandler/handlerDataMapping.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [mapData](#mapdata) | function | ❌ | `data, sources` |
| [dataMapping](#datamapping) | function | ✅ | `{}` |

## Detailed Description

### <a id="mapdata"></a>mapData

- **Type**: `function`
- **Parameters**: `data, sources`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function mapData(data, sources) {
  const mappedData = {};

  sources.forEach((source) => {
    const dataExist = objectPath.has(data, source.name);
    if (!dataExist) return;

    const value = objectPath.get(data, source.name);

    source.destinations.forEach(({ name }) => {
      objectPath.set(mappedData, name, value);
    });
  });

  return mappedData;
// ...
```

---

### <a id="datamapping"></a>dataMapping

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function dataMapping({ id, data }) {
  let dataToMap = null;

  if (data.dataSource === 'table') {
    dataToMap = this.engine.referenceData.table;
  } else if (data.dataSource === 'variable') {
    const { variables } = this.engine.referenceData;

    if (!objectHasKey(variables, data.varSourceName)) {
      throw new Error(`Cant find "${data.varSourceName}" variable`);
    }

    dataToMap = variables[data.varSourceName];
  }

// ...
```

---

