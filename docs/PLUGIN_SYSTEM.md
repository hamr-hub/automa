# Automa Plugin System

This document describes how to create custom blocks for Automa.

## Overview

Automa's plugin system allows developers to add custom blocks that integrate seamlessly with the workflow editor. Blocks are defined in `business/dev/blocks/` directory.

## Directory Structure

```
business/dev/blocks/
├── index.js              # Block metadata definitions
├── backgroundHandler.js  # Background script handlers
└── contentHandler.js     # Content script handlers
```

## Creating a Custom Block

### Step 1: Define Block Metadata

Edit `business/dev/blocks/index.js`:

```javascript
const customBlocks = {
  'my-custom-block': {
    name: 'My Custom Block',
    description: 'Does something awesome',
    icon: 'riStarLine',
    component: 'BlockBasic',
    editComponent: 'EditMyCustomBlock',
    category: 'general',
    inputs: 1,
    outputs: 1,
    allowedInputs: true,
    maxConnection: 1,
    refDataKeys: ['param1', 'param2'],
    data: {
      disableBlock: false,
      param1: '',
      param2: '',
    },
  },
};

export default function () {
  return customBlocks;
}
```

### Step 2: Create Background Handler (if needed)

Edit `business/dev/blocks/backgroundHandler.js` for operations that don't require page access:

```javascript
const backgroundHandlers = {
  'my-custom-block': async function ({ data }, { refData }) {
    const nextBlockId = this.getBlockConnections(this.currentBlock.id);

    // Your logic here
    const result = await someAsyncOperation(data.param1);

    return {
      data: result,
      nextBlockId,
      status: 'success',
      ctxData: {
        // Optional: additional context for logs
      },
    };
  },
};

export default function () {
  return backgroundHandlers;
}
```

### Step 3: Create Content Handler (if DOM access needed)

Edit `business/dev/blocks/contentHandler.js` for page interactions:

```javascript
const contentHandlers = {
  'my-custom-block': async function ({ data }, { refData }) {
    const nextBlockId = this.getBlockConnections(this.currentBlock.id);

    // Send message to content script
    const result = await this._sendMessageToTab({
      type: 'my-custom-action',
      data: data,
    });

    return {
      data: result,
      nextBlockId,
    };
  },
};

export default function () {
  return contentHandlers;
}
```

## Handler Interface

### Background Handler Context

The context object provides:

| Property    | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| `refData`   | Reference data (variables, table, loopData, globalData, etc.) |
| `prevBlock` | Previous block execution result                               |

Available `this` methods:

| Method                                 | Description           |
| -------------------------------------- | --------------------- |
| `getBlockConnections(id, outputIndex)` | Get next block IDs    |
| `setVariable(name, value)`             | Set workflow variable |
| `addDataToColumn(key, value)`          | Add data to table     |

### Return Value

```javascript
{
  data: any,              // Data passed to next block
  nextBlockId: string[],  // IDs of next blocks
  status: 'success' | 'error',  // Execution status
  ctxData: object,        // Additional context for logs
  destroyWorker: boolean, // Destroy worker after execution
}
```

## Block Categories

| Category         | Description                            |
| ---------------- | -------------------------------------- |
| `interaction`    | Web interaction (click, input, hover)  |
| `browser`        | Browser operations (tabs, screenshots) |
| `general`        | General purpose blocks                 |
| `data`           | Data manipulation                      |
| `conditions`     | Control flow (loops, conditions)       |
| `onlineServices` | External services (Google Sheets)      |

## Icons

Use Remix icons (https://remixicon.com):

- `riStarLine` - General
- `riFlashlightLine` - Triggers
- `riCursorLine` - Click
- `riCodeSSlashLine` - JavaScript
- `riEarthLine` - HTTP/Web
- `riDatabase2Line` - Data
- `riRefreshLine` - Loops

## Ref Data Keys

The `refDataKeys` array specifies which block parameters support templating:

```javascript
refDataKeys: ['url', 'variableName', 'selector'];
```

Users can use variables like `{{variables.myVar}}` in these fields.

## Example: API Fetcher Block

See `business/dev/templates/example-plugin.js` for a complete example.

## Best Practices

1. **Validate input** - Check required parameters before processing
2. **Error handling** - Throw meaningful error messages
3. **Templating support** - Use `renderString` for dynamic values
4. **Logging** - Return `ctxData` for debugging
5. **Timeouts** - Add timeout handling for external requests

## Troubleshooting

### Block not appearing

1. Check console for errors
2. Verify block metadata is correctly exported
3. Ensure handler function name matches block label

### Handler not executing

1. Check background script errors in extension page
2. Verify handler is properly registered
3. Check workflow console logs

## See Also

- [Block Handler Reference](../src/workflowEngine/blocksHandler/)
- [Content Handlers](../src/content/blocksHandler/)
- [Shared Block Definitions](../src/utils/shared.js)
