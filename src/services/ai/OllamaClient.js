/**
 * Ollama API 客户端
 * 用于与本地 Ollama 服务通信,支持流式和非流式响应
 */

import aiConfig from '../../config/ai.config.js';

class OllamaClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || aiConfig.ollama.baseUrl;
    this.model = config.model || aiConfig.ollama.model;
    this.temperature = config.temperature || aiConfig.ollama.temperature;
    this.maxTokens = config.maxTokens || aiConfig.ollama.maxTokens;
    this.timeout = config.timeout || aiConfig.ollama.timeout;
  }

  /**
   * 规范化 URL，支持 IPv6 地址和域名
   * @param {string} url - 原始 URL
   * @returns {string} - 规范化后的 URL
   */
  normalizeUrl(url) {
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
      
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
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
      const response = await fetch(url);
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

      const url = this.normalizeUrl(`${this.baseUrl}/api/generate`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API 错误: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.response,
        model: data.model,
        done: data.done,
        context: data.context,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时,请检查 Ollama 服务是否正常运行');
      }
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

      const url = this.normalizeUrl(`${this.baseUrl}/api/chat`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API 错误: ${response.status}`);
      }

      const data = await response.json();
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
      const response = await fetch(`${this.baseUrl}/api/pull`, {
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
      const response = await fetch(`${this.baseUrl}/api/tags`, {
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
