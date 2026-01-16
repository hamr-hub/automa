import Browser from 'webextension-polyfill';

/**
 * Get the simplified DOM context of the current active tab
 */
export async function getPageContext() {
  try {
    let [tab] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (
      tab?.url &&
      (tab.url.startsWith('chrome-extension:') ||
        tab.url.startsWith('moz-extension:'))
    ) {
      // Handle extension pages if needed, or ignore
    }

    if (!tab?.id) return null;

    const [result] = await Browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function simplify(root) {
          if (!root) return '';
          const clone = root.cloneNode(true);
          const removeTags = [
            'SCRIPT',
            'STYLE',
            'NOSCRIPT',
            'IFRAME',
            'SVG',
            'PATH',
            'LINK',
            'META',
          ];
          const walker = document.createTreeWalker(
            clone,
            NodeFilter.SHOW_ELEMENT
          );
          const nodesToRemove = [];
          while (walker.nextNode()) {
            if (removeTags.includes(walker.currentNode.tagName))
              nodesToRemove.push(walker.currentNode);
          }
          nodesToRemove.forEach((n) => n.remove());

          // Simple cleanup
          return clone.innerHTML.replace(/\s+/g, ' ').trim().slice(0, 30000);
        }

        return {
          url: window.location.href,
          title: document.title,
          dom: simplify(document.body),
        };
      },
    });

    return result?.result;
  } catch (e) {
    console.warn('Failed to get page context:', e);
    return null;
  }
}

/**
 * Execute a single block in the active tab
 * @param {Object} blockData - The block data to execute
 */
export async function executeBlockInTab(blockData) {
  try {
    const [tab] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) throw new Error('No active tab found');

    // Send message to content script
    // Content script listens to runtime.onMessage and handles { isBlock: true, ...blockData }
    const response = await Browser.tabs.sendMessage(tab.id, {
      isBlock: true,
      ...blockData,
    });

    return response;
  } catch (error) {
    console.error('Failed to execute block in tab:', error);
    throw error;
  }
}
