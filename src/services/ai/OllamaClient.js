/**
 * Ollama API 客户端
 * 用于与本地 Ollama 服务通信,支持流式和非流式响应
 */

import aiConfig from '../../config/ai.config.js';
import { sendMessage } from '../../utils/message.js';

class OllamaClient {
  constructor(config = {}) {
    // kwaipilot-fix: FUNC-Issue-001/ycryz69oa5t87w1ynt2g
    // 修复 cleanBaseUrl 方法在调用前未定义的问题
    this.baseUrl = this.normalizeUrl(config.baseUrl || aiConfig.ollama.baseUrl);
    this.model = config.model || aiConfig.ollama.model;
    this.temperature = config.temperature || aiConfig.ollama.temperature;
    this.maxTokens = config.maxTokens || aiConfig.ollama.maxTokens;
    this.timeout = config.timeout || aiConfig.ollama.timeout;
    this.headers = config.headers || {};

    // Performance & Monitoring
    this.cache = new Map();
    this.metrics = {
      requests: 0,
      errors: 0,
      totalLatency: 0,
      cacheHits: 0,
    };
  }

  /**
   * 获取调用指标
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.requests
        ? Math.round(this.metrics.totalLatency / this.metrics.requests)
        : 0,
    };
  }

  /**
   * 通用请求方法，支持直接 fetch 和 Background 代理
   */
  async request(url, options = {}, responseType = 'json') {
    const startTime = Date.now();
    const cacheKey = `${url}:${JSON.stringify(options.body)}`;

    // Check Cache (Only for GET or specific POSTs if needed, but for now let's be careful with POST)
    // For AI generation, we might cache based on prompt if temperature is 0, but usually not.
    // Let's implement explicit caching support via options.
    if (options.cache && this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    this.metrics.requests++;

    const fetchOptions = {
      mode: 'cors', // 确保所有请求都启用 CORS
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      let result;
      // 1. 尝试直接 fetch
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        // ... (Error handling logic)
        if (response.status === 403) {
          console.warn('Direct fetch returned 403, trying background proxy...');
          throw new Error('403_FORBIDDEN');
        }
        throw new Error(`Ollama API 错误: ${response.status}`);
      }

      result = await response[responseType]();

      // Update Metrics & Cache
      this.metrics.totalLatency += Date.now() - startTime;
      if (options.cache) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.metrics.errors++;

      // ... (Proxy logic)
      if (error.name === 'AbortError') {
        throw new Error('请求超时,请检查 Ollama 服务是否正常运行');
      }

      try {
        console.log('Falling back to background fetch proxy for:', url);
        const result = await sendMessage(
          'fetch',
          {
            type: responseType,
            resource: {
              url,
              ...fetchOptions,
              body:
                typeof fetchOptions.body === 'object'
                  ? JSON.stringify(fetchOptions.body)
                  : fetchOptions.body,
            },
          },
          'background'
        );

        this.metrics.totalLatency += Date.now() - startTime;
        if (options.cache) {
          this.cache.set(cacheKey, result);
        }
        return result;
      } catch (proxyError) {
        console.error('Background proxy failed:', proxyError);

        if (
          error.message === '403_FORBIDDEN' ||
          proxyError.message.includes('403') ||
          proxyError.message.includes('Forbidden')
        ) {
          throw new Error(
            `Ollama API 拒绝访问 (403)。\n可能原因：\n1. 跨域限制：请在 Ollama 服务器设置环境变量 OLLAMA_ORIGINS="*" \n2. 认证失败：请检查是否需要 API Key\n3. 防火墙拦截`
          );
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error(
            `连接失败 (CORS/Network)。请确保 Ollama 允许跨域 (OLLAMA_ORIGINS="*") 且服务可访问。`
          );
        }

        throw error;
      }
    }
  }

  /**
   * 批量生成 (并发控制)
   * @param {Array<string>} prompts 提示词列表
   * @param {Object} options
   */
  async batchGenerate(prompts, options = {}) {
    const concurrency = options.concurrency || 3;
    const results = [];

    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const promises = batch.map((prompt) => this.generate(prompt, options));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 清理 Base URL，去除多余的空格、斜杠和 /api 后缀

  /**
   * 规范化 URL，支持 IPv6 地址和域名
   * @param {string} url - 原始 URL
   * @returns {string} - 规范化后的 URL
   */
  normalizeUrl(url) {
    // 移除末尾的斜杠
    url = url.replace(/\/+$/, '');
    
    // 如果 URL 已经是完整格式，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // 处理 IPv6 地址格式
    // 支持格式: [::1]:11434, [2001:db8::1]:11434
    const ipv6WithBrackets = url.match(/^\[([0-9a-fA-F:]+)\]:(\d+)(.*)$/);
    if (ipv6WithBrackets) {
      const [, ipv6, port, path] = ipv6WithBrackets;
      return `http://[${ipv6}]:${port}${path}`;
    }

    // 处理不带方括号的纯 IPv6 地址（如 ::1 或 2001:db8::1）
    // 注意：这里不处理 host:port 格式，因为可能与域名冲突
    const pureIpv6 = url.match(/^([0-9a-fA-F:]+)$/);
    if (pureIpv6 && pureIpv6[1].split(':').length > 2) {
      return `http://[${pureIpv6[1]}]:11434`;
    }

    // 处理普通域名或 IPv4 地址（如 localhost:11434, wsl.hamr.top:11434, 192.168.1.1:11434）
    // 浏览器会自动处理 DNS 解析，包括 IPv6-only 域名
    if (!url.includes('://')) {
      return `http://${url}`;
    }

    return url;
  }

  /**
   * 检查 Ollama 服务是否可用
   */
  async checkHealth() {
    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/tags`);

      await this.request(url, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(5000),
      });
      return true;
    } catch (error) {
      console.warn('Ollama 服务不可用:', error);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  async listModels() {
    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/tags`);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.warn('获取模型列表失败:', error);
      throw error;
    }
  }

  /**
   * 生成文本(非流式)
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选配置
   */
  async generate(prompt, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      const url = this.normalizeUrl(`${this.baseUrl}/api/generate`);

      const data = await this.request(
        url,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        },
        'json'
      );

      clearTimeout(timeoutId);

      return {
        text: data.response,
        model: data.model,
        done: data.done,
        context: data.context,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 聊天对话(支持多轮对话)
   * @param {Array} messages - 消息数组 [{role: 'user'|'assistant'|'system', content: '...'}]
   * @param {Object} options - 可选配置
   */
  async chat(messages, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      const url = this.normalizeUrl(`${this.baseUrl}/api/chat`);

      const data = await this.request(
        url,
        {
          method: 'POST',
          body: JSON.stringify(requestBody), // 修复: 序列化为 JSON 字符串
          signal: controller.signal,
        },
        'json'
      );

      clearTimeout(timeoutId);

      return {
        message: data.message,
        model: data.model,
        done: data.done,
      };
    } catch (error) {
      console.warn('Ollama chat failed:', error);
      throw error;
    }
  }

  /**
   * 流式生成文本
   * @param {string} prompt - 提示词
   * @param {Function} onChunk - 接收文本块的回调函数
   * @param {Object} options - 可选配置
   */
  async generateStream(prompt, onChunk, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      prompt,
      stream: true,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/generate`);
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API 错误: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullText += data.response;
              onChunk(data.response, fullText);
            }
            if (data.done) {
              return { text: fullText, done: true };
            }
          } catch (e) {
            console.warn('解析流式响应失败:', e);
          }
        }
      }

      return { text: fullText, done: true };
    } catch (error) {
      console.error('流式生成失败:', error);
      throw error;
    }
  }

  /**
   * 流式聊天对话
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收文本块的回调函数
   * @param {Object} options - 可选配置
   */
  async chatStream(messages, onChunk, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages,
      stream: true,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/chat`);
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API 错误: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullText += data.message.content;
              onChunk(data.message.content, fullText);
            }
            if (data.done) {
              return { text: fullText, message: data.message, done: true };
            }
          } catch (e) {
            console.warn('解析流式响应失败:', e);
          }
        }
      }

      return { text: fullText, done: true };
    } catch (error) {
      console.error('流式聊天失败:', error);
      throw error;
    }
  }

  /**
   * 拉取模型
   * @param {string} modelName - 模型名称
   * @param {Function} onProgress - 进度回调
   */
  async pullModel(modelName, onProgress) {
    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/pull`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`拉取模型失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (onProgress) {
              onProgress(data);
            }
            if (data.status === 'success') {
              return true;
            }
          } catch (e) {
            console.warn('解析拉取进度失败:', e);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('拉取模型失败:', error);
      throw error;
    }
  }

  /**
   * 列出所有已安装的模型
   * @returns {Promise<Array>} 模型列表
   */
  async listModels() {
    try {
      const url = this.normalizeUrl(`${this.baseUrl}/api/tags`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }
}

export default OllamaClient;
