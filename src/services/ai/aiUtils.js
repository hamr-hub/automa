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

/**
 * 获取所有可用的标签页列表
 * @returns {Promise<Array>} 标签页列表
 */
export async function getAllTabs() {
  try {
    const tabs = await Browser.tabs.query({});
    
    return tabs
      .filter(tab => 
        tab.url && 
        !tab.url.startsWith('chrome-extension://') && 
        !tab.url.startsWith('moz-extension://') &&
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('about:')
      )
      .map(tab => ({
        id: tab.id,
        title: tab.title || 'Untitled',
        url: tab.url,
        active: tab.active,
        windowId: tab.windowId,
        favIconUrl: tab.favIconUrl
      }))
      .sort((a, b) => {
        // 活动标签页排在前面
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return 0;
      });
  } catch (error) {
    console.error('Failed to get all tabs:', error);
    return [];
  }
}

/**
 * 获取指定标签页的上下文
 * @param {number} tabId - 标签页ID
 * @returns {Promise<Object>} 页面上下文
 */
export async function getTabContext(tabId) {
  try {
    if (!tabId) return null;

    const [result] = await Browser.scripting.executeScript({
      target: { tabId },
      func: () => {
        function simplify(root) {
          if (!root) return '';
          const clone = root.cloneNode(true);
          const removeTags = [
            'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'PATH', 'LINK', 'META',
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

          return clone.innerHTML || '';
        }

        // 识别列表容器
        function identifyListContainers(element) {
          const containers = [];
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT
          );
          
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const tagName = node.tagName.toLowerCase();
            
            // 常见的列表容器
            if (['ul', 'ol', 'div', 'section', 'article'].includes(tagName)) {
              const children = node.children;
              if (children.length >= 3) { // 至少3个子项才认为是列表
                const childTags = Array.from(children).map(c => c.tagName.toLowerCase());
                const hasUniformItems = childTags.every(tag => 
                  ['li', 'div', 'article', 'section', 'a'].includes(tag)
                );
                
                if (hasUniformItems) {
                  containers.push({
                    selector: generateSelector(node),
                    isList: true,
                    itemCount: children.length,
                    itemTag: childTags[0]
                  });
                }
              }
            }
          }
          
          return containers;
        }
        
        function generateSelector(element) {
          if (element.id) return `#${element.id}`;
          if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) return `.${classes[0]}`;
          }
          
          // 生成路径选择器
          const path = [];
          let current = element;
          while (current && current !== document.body) {
            if (current.id) {
              path.unshift(`#${current.id}`);
              break;
            }
            if (current.className) {
              const classes = current.className.split(' ').filter(c => c.trim());
              if (classes.length > 0) {
                path.unshift(`.${classes[0]}`);
                break;
              }
            }
            path.unshift(current.tagName.toLowerCase());
            current = current.parentElement;
          }
          
          return path.join(' > ');
        }

        return {
          url: window.location.href,
          title: document.title,
          dom: simplify(document.body),
          listContainers: identifyListContainers(document.body),
        };
      },
    });

    return result?.result;
  } catch (error) {
    console.warn('Failed to get tab context:', error);
    return null;
  }
}

/**
 * 分析用户输入的复杂度，判断是否需要渐进式处理
 * @param {string} userInput - 用户输入
 * @returns {Object} 分析结果
 */
export function analyzeInputComplexity(userInput) {
  const input = userInput.toLowerCase();
  
  // 复杂度指标
  const complexityIndicators = {
    hasMultipleSteps: input.includes('然后') || input.includes('接着') || input.includes('之后') || input.includes('最后'),
    hasLooping: input.includes('循环') || input.includes('遍历') || input.includes('每个') || input.includes('所有'),
    hasConditions: input.includes('如果') || input.includes('当') || input.includes('否则') || input.includes('条件'),
    hasDataProcessing: input.includes('提取') || input.includes('抓取') || input.includes('获取') || input.includes('导出'),
    hasPagination: input.includes('下一页') || input.includes('分页') || input.includes('更多'),
    hasFormInteraction: input.includes('输入') || input.includes('填写') || input.includes('选择') || input.includes('点击'),
    hasMultipleSites: (input.match(/http[s]?:\/\//g) || []).length > 1,
  };
  
  // 计算复杂度分数
  const complexityScore = Object.values(complexityIndicators).filter(Boolean).length;
  
  // 判断是否需要渐进式处理
  const needsIncremental = complexityScore >= 3 || 
                         complexityIndicators.hasMultipleSteps || 
                         complexityIndicators.hasLooping;
  
  return {
    complexityScore,
    needsIncremental,
    indicators: complexityIndicators,
    suggestedApproach: needsIncremental ? 'incremental' : 'direct'
  };
}
