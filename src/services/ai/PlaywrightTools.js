/**
 * Playwright MCP Server 工具包装器
 * 提供页面分析、元素定位、数据提取等功能
 */

import aiConfig from '@/config/ai.config';

class PlaywrightTools {
  constructor() {
    this.mcpConfig = aiConfig.playwright.mcp;
    this.timeout = aiConfig.playwright.timeout;
    this.currentPage = null;
  }

  /**
   * 初始化 Playwright MCP 连接
   * 注意: 在浏览器扩展环境中,我们使用 Chrome DevTools Protocol
   */
  async initialize() {
    try {
      // 在扩展环境中,我们通过 chrome.debugger API 连接
      // 这里先返回成功,实际实现需要根据环境调整
      console.log('Playwright Tools 初始化成功');
      return true;
    } catch (error) {
      console.error('Playwright Tools 初始化失败:', error);
      return false;
    }
  }

  /**
   * 分析页面结构
   * @param {number} tabId - Chrome 标签页 ID
   * @returns {Object} 页面结构信息
   */
  async analyzePage(tabId) {
    try {
      // 获取页面标题
      const title = await this.executeScript(tabId, 'document.title');

      // 获取页面 URL
      const url = await this.executeScript(tabId, 'window.location.href');

      // 获取所有可见元素的统计
      const elementStats = await this.executeScript(
        tabId,
        `
        (() => {
          const stats = {
            links: document.querySelectorAll('a').length,
            images: document.querySelectorAll('img').length,
            buttons: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length,
            inputs: document.querySelectorAll('input, textarea, select').length,
            tables: document.querySelectorAll('table').length,
            lists: document.querySelectorAll('ul, ol').length,
          };
          return stats;
        })()
      `
      );

      // 获取主要内容区域
      const mainContent = await this.executeScript(
        tabId,
        `
        (() => {
          const main = document.querySelector('main, [role="main"], #main, .main');
          if (main) {
            return {
              tagName: main.tagName,
              className: main.className,
              id: main.id,
            };
          }
          return null;
        })()
      `
      );

      return {
        title,
        url,
        elementStats,
        mainContent,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('页面分析失败:', error);
      throw error;
    }
  }

  /**
   * 查找元素
   * @param {number} tabId - Chrome 标签页 ID
   * @param {string} selector - CSS 选择器
   * @returns {Array} 元素信息数组
   */
  async findElements(tabId, selector) {
    try {
      const elements = await this.executeScript(
        tabId,
        `
        (() => {
          const elements = document.querySelectorAll('${selector}');
          return Array.from(elements).slice(0, 50).map((el, index) => ({
            index,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            text: el.textContent?.trim().substring(0, 100),
            href: el.href || null,
            src: el.src || null,
            visible: el.offsetParent !== null,
            rect: el.getBoundingClientRect(),
          }));
        })()
      `
      );

      return elements;
    } catch (error) {
      console.error('查找元素失败:', error);
      return [];
    }
  }

  /**
   * 智能查找数据列表
   * @param {number} tabId - Chrome 标签页 ID
   * @returns {Array} 可能的数据列表
   */
  async findDataLists(tabId) {
    try {
      const lists = await this.executeScript(
        tabId,
        `
        (() => {
          // 查找重复的结构化元素
          const candidates = [];
          
          // 查找列表容器
          const listContainers = document.querySelectorAll('ul, ol, [class*="list"], [class*="items"]');
          
          listContainers.forEach((container, containerIndex) => {
            const children = Array.from(container.children);
            if (children.length >= 3) {
              // 至少3个子元素才认为是列表
              const sample = children.slice(0, 3).map(child => ({
                tagName: child.tagName,
                className: child.className,
                text: child.textContent?.trim().substring(0, 50),
              }));
              
              candidates.push({
                containerIndex,
                selector: this.generateSelector(container),
                itemCount: children.length,
                sample,
              });
            }
          });
          
          // 查找表格
          const tables = document.querySelectorAll('table');
          tables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tr');
            if (rows.length >= 2) {
              const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim());
              candidates.push({
                type: 'table',
                tableIndex,
                selector: this.generateSelector(table),
                rowCount: rows.length,
                headers,
              });
            }
          });
          
          return candidates.slice(0, 10);
          
          function generateSelector(element) {
            if (element.id) return '#' + element.id;
            if (element.className) {
              const classes = element.className.split(' ').filter(c => c);
              if (classes.length > 0) return '.' + classes.join('.');
            }
            return element.tagName.toLowerCase();
          }
        })()
      `
      );

      return lists;
    } catch (error) {
      console.error('查找数据列表失败:', error);
      return [];
    }
  }

  /**
   * 提取数据样本
   * @param {number} tabId - Chrome 标签页 ID
   * @param {string} containerSelector - 容器选择器
   * @param {string} itemSelector - 项目选择器
   * @param {number} limit - 提取数量限制
   */
  async extractDataSample(tabId, containerSelector, itemSelector, limit = 5) {
    try {
      const data = await this.executeScript(
        tabId,
        `
        (() => {
          const container = document.querySelector('${containerSelector}');
          if (!container) return [];
          
          const items = container.querySelectorAll('${itemSelector}');
          return Array.from(items).slice(0, ${limit}).map((item, index) => {
            // 提取所有文本内容
            const texts = Array.from(item.querySelectorAll('*'))
              .filter(el => el.children.length === 0)
              .map(el => ({
                tagName: el.tagName,
                text: el.textContent?.trim(),
                className: el.className,
              }))
              .filter(t => t.text);
            
            // 提取所有链接
            const links = Array.from(item.querySelectorAll('a')).map(a => ({
              text: a.textContent?.trim(),
              href: a.href,
            }));
            
            // 提取所有图片
            const images = Array.from(item.querySelectorAll('img')).map(img => ({
              src: img.src,
              alt: img.alt,
            }));
            
            return {
              index,
              texts,
              links,
              images,
            };
          });
        })()
      `
      );

      return data;
    } catch (error) {
      console.error('提取数据样本失败:', error);
      return [];
    }
  }

  /**
   * 生成最优选择器
   * @param {number} tabId - Chrome 标签页 ID
   * @param {Object} elementInfo - 元素信息
   */
  async generateSelector(tabId, elementInfo) {
    try {
      // 使用 CSS Selector Generator 库生成最优选择器
      // 这里简化实现,实际应该使用更智能的算法
      if (elementInfo.id) {
        return `#${elementInfo.id}`;
      }

      if (elementInfo.className) {
        const classes = elementInfo.className.split(' ').filter((c) => c);
        if (classes.length > 0) {
          return `.${classes.join('.')}`;
        }
      }

      return elementInfo.tagName.toLowerCase();
    } catch (error) {
      console.error('生成选择器失败:', error);
      return null;
    }
  }

  /**
   * 检测分页
   * @param {number} tabId - Chrome 标签页 ID
   */
  async detectPagination(tabId) {
    try {
      const pagination = await this.executeScript(
        tabId,
        `
        (() => {
          // 查找常见的分页元素
          const paginationSelectors = [
            '.pagination',
            '[class*="pager"]',
            '[class*="page"]',
            'nav[aria-label*="page" i]',
          ];
          
          for (const selector of paginationSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              const nextButton = element.querySelector('a[rel="next"], button:contains("下一页"), a:contains("Next")');
              const prevButton = element.querySelector('a[rel="prev"], button:contains("上一页"), a:contains("Previous")');
              
              return {
                found: true,
                selector,
                hasNext: !!nextButton,
                hasPrev: !!prevButton,
                nextSelector: nextButton ? this.generateSelector(nextButton) : null,
              };
            }
          }
          
          return { found: false };
          
          function generateSelector(element) {
            if (element.id) return '#' + element.id;
            if (element.className) {
              const classes = element.className.split(' ').filter(c => c);
              if (classes.length > 0) return '.' + classes.join('.');
            }
            return element.tagName.toLowerCase();
          }
        })()
      `
      );

      return pagination;
    } catch (error) {
      console.error('检测分页失败:', error);
      return { found: false };
    }
  }

  /**
   * 检测无限滚动
   * @param {number} tabId - Chrome 标签页 ID
   */
  async detectInfiniteScroll(tabId) {
    try {
      // 记录初始高度
      const initialHeight = await this.executeScript(
        tabId,
        'document.documentElement.scrollHeight'
      );

      // 滚动到底部
      await this.executeScript(
        tabId,
        'window.scrollTo(0, document.documentElement.scrollHeight)'
      );

      // 等待 2 秒
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 检查高度是否变化
      const newHeight = await this.executeScript(
        tabId,
        'document.documentElement.scrollHeight'
      );

      return {
        hasInfiniteScroll: newHeight > initialHeight,
        initialHeight,
        newHeight,
      };
    } catch (error) {
      console.error('检测无限滚动失败:', error);
      return { hasInfiniteScroll: false };
    }
  }

  /**
   * 执行脚本
   * @param {number} tabId - Chrome 标签页 ID
   * @param {string} code - JavaScript 代码
   */
  async executeScript(tabId, code) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // 在页面上下文中执行代码
          return eval(arguments[0]);
        },
        args: [code],
      });

      return results[0]?.result;
    } catch (error) {
      console.error('执行脚本失败:', error);
      throw error;
    }
  }

  /**
   * 截图
   * @param {number} tabId - Chrome 标签页 ID
   */
  async screenshot(tabId) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
      });
      return dataUrl;
    } catch (error) {
      console.error('截图失败:', error);
      return null;
    }
  }
}

export default PlaywrightTools;
