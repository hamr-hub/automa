/**
 * Example Content Handler - Element Scraper
 *
 * This example shows how to create a content handler that:
 * 1. Extracts structured data from page elements
 * 2. Handles multiple elements with pagination
 * 3. Returns data in a format usable by other blocks
 *
 * Content handlers work differently from background handlers:
 * - They send messages to the content script
 * - The content script performs DOM operations
 * - Results are passed back to the workflow
 */

// =============================================================================
// Background Handler (in business/blocks/backgroundHandler.js)
// =============================================================================

/*
import renderString from '@/workflowEngine/templating/renderString';

async function elementScraper({ data }, { refData }) {
  const nextBlockId = this.getBlockConnections(this.currentBlock.id);

  // Render dynamic values using templating
  const selector = (
    await renderString(data.selector, refData, this.engine.isPopup)
  ).value;

  // Send message to content script to scrape elements
  const result = await this._sendMessageToTab({
    type: 'scrape-elements',
    data: {
      selector,
      extractAttributes: data.extractAttributes || ['textContent'],
      multiple: data.multiple || true,
    },
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to scrape elements');
  }

  // Optionally save to variable
  if (data.assignVariable && data.variableName) {
    await this.setVariable(data.variableName, result.data);
  }

  return {
    data: result.data,
    nextBlockId,
    status: 'success',
    ctxData: {
      scraped: {
        count: result.data.length,
        selector,
      },
    },
  };
}
*/

// =============================================================================
// Content Script Handler (in src/content/blocksHandler/)
// =============================================================================

/*
// This would be added to the content script's handler system
function scrapeElementsHandler(blockData) {
  return new Promise((resolve, reject) => {
    const { selector, extractAttributes, multiple } = blockData.data;

    // Use the selector engine to find elements
    handleSelector(blockData, {
      onSelected(element) {
        if (multiple) {
          // Get all matching elements
          const elements = document.querySelectorAll(selector);
          const results = Array.from(elements).map(el => {
            const item = {};
            for (const attr of extractAttributes) {
              if (attr === 'textContent') {
                item.text = el.textContent.trim();
              } else if (attr === 'innerHTML') {
                item.html = el.innerHTML;
              } else {
                item[attr] = el.getAttribute(attr);
              }
            }
            return item;
          });
          resolve({ success: true, data: results });
        } else {
          // Single element
          const item = {};
          for (const attr of extractAttributes) {
            if (attr === 'textContent') {
              item.text = element.textContent.trim();
            } else if (attr === 'innerHTML') {
              item.html = element.innerHTML;
            } else {
              item[attr] = element.getAttribute(attr);
            }
          }
          resolve({ success: true, data: item });
        }
      },
      onError(error) {
        reject(error);
      },
      onSuccess() {
        resolve({ success: true, data: [] });
      },
    });
  });
}
*/

// =============================================================================
// Block Definition (in business/blocks/blocks/index.js)
// =============================================================================

/*
const elementScraperBlock = {
  name: 'Element Scraper',
  description: 'Extract data from page elements',
  icon: 'riScrubberLine',
  component: 'BlockBasic',
  editComponent: 'EditElementScraper',
  category: 'interaction',
  inputs: 1,
  outputs: 1,
  allowedInputs: true,
  maxConnection: 1,
  refDataKeys: ['selector', 'variableName'],
  autocomplete: ['variableName'],
  data: {
    disableBlock: false,
    description: '',
    findBy: 'cssSelector',
    selector: '',
    extractAttributes: ['textContent'],
    multiple: true,
    assignVariable: false,
    variableName: '',
  },
};
*/

// =============================================================================
// Content Handler Registry Update (src/content/blocksHandler.js)
// =============================================================================

/*
import customHandlers from '@business/blocks/contentHandler';

const blocksHandler = require.context('./blocksHandler', false, /\.js$/);
// ... existing code ...

export default function () {
  return {
    ...(customHandlers() || {}),
    ...handlers,
  };
}
*/
