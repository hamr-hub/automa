# handlerIncreaseVariable.js

**Path**: `workflowEngine/blocksHandler/handlerIncreaseVariable.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [increaseVariable](#increasevariable) | function | ✅ | `{}` |

## Detailed Description

### <a id="increasevariable"></a>increaseVariable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function increaseVariable({ id, data }) {
  const refVariables = this.engine.referenceData.variables;
  const variableExist = objectPath.has(refVariables, data.variableName);

  if (!variableExist) {
    throw new Error(`Cant find "${data.variableName}" variable`);
  }

  const currentVar = +objectPath.get(refVariables, data.variableName);
  if (Number.isNaN(currentVar)) {
    throw new Error(
      `The "${data.variableName}" variable value is not a number`
    );
  }

// ...
```

---

