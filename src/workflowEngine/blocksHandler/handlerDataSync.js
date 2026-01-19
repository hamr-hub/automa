import { isWhitespace } from '@/utils/helper';
import { executeWebhook } from '../utils/webhookUtil';
import renderString from '../templating/renderString';

/**
 * 数据同步处理器
 * 将抓取到的数据通过 JSON 方式同步到其他系统的 API 接口
 */
export async function dataSync({ data, id }, { refData }) {
  const nextBlockId = this.getBlockConnections(id);
  const fallbackOutput = this.getBlockConnections(id, 'fallback');

  try {
    // 验证必填字段
    if (isWhitespace(data.url)) {
      throw new Error('url-empty');
    }

    if (!data.url.startsWith('http')) {
      const error = new Error('invalid-url');
      error.data = { url: data.url };
      throw error;
    }

    // 处理请求头
    const newHeaders = [];
    for (const { value, name } of data.headers) {
      const renderedValue = await renderString(
        value,
        refData,
        this.engine.isPopup
      );
      newHeaders.push({ name, value: renderedValue.value });
    }

    // 构建请求体
    let body = '{}';

    if (data.dataSource === 'table') {
      // 从数据表中获取数据
      const tableData = refData.table || [];

      if (data.tableFormat === 'array') {
        // 数组格式，直接发送整个表格数据
        body = JSON.stringify(tableData);
      } else if (data.tableFormat === 'object' && data.tableKey) {
        // 对象格式，将表格数据作为某个键的值
        body = JSON.stringify({
          [data.tableKey]: tableData,
        });
      } else if (data.tableFormat === 'single') {
        // 单条记录格式，发送第一条记录
        if (Array.isArray(tableData) && tableData.length > 0) {
          body = JSON.stringify(tableData[0]);
        } else {
          body = JSON.stringify(tableData);
        }
      } else if (data.tableFormat === 'batch') {
        // 批量格式，按批次发送
        const batchSize = data.batchSize || 100;
        const results = [];

        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize);
          const batchResponse = await executeWebhook({
            url: data.url,
            method: data.method || 'POST',
            headers: newHeaders,
            timeout: data.timeout || 30000,
            body: JSON.stringify({
              [data.tableKey || 'data']: batch,
              _batch: {
                index: Math.floor(i / batchSize),
                total: Math.ceil(tableData.length / batchSize),
                size: batchSize,
              },
            }),
            contentType: 'json',
          });

          if (!batchResponse.ok) {
            throw new Error(
              `Batch ${Math.floor(i / batchSize) + 1} failed: ${batchResponse.statusText}`
            );
          }

          results.push({
            batch: Math.floor(i / batchSize) + 1,
            status: batchResponse.status,
            ok: batchResponse.ok,
          });
        }

        return {
          data: JSON.stringify({ batches: results }),
          nextBlockId,
        };
      }
    } else if (data.dataSource === 'variable') {
      // 从变量中获取数据
      const variableData = refData.variables[data.variableName] || [];

      if (data.variableFormat === 'array') {
        body = JSON.stringify(variableData);
      } else if (data.variableFormat === 'object' && data.variableKey) {
        body = JSON.stringify({
          [data.variableKey]: variableData,
        });
      } else {
        body = JSON.stringify(variableData);
      }
    } else if (data.dataSource === 'custom') {
      // 自定义 JSON
      body = await renderString(data.customJson, refData, this.engine.isPopup);
      body = body.value;

      // 验证 JSON 格式
      try {
        JSON.parse(body);
      } catch {
        throw new Error('invalid-json-body');
      }
    }

    // 渲染 body 中的模板变量
    if (data.dataSource !== 'custom') {
      const renderedBody = await renderString(
        body,
        refData,
        this.engine.isPopup
      );
      body = renderedBody.value;
    }

    // 执行 HTTP 请求
    const response = await executeWebhook({
      url: data.url,
      method: data.method || 'POST',
      headers: newHeaders,
      timeout: data.timeout || 30000,
      body,
      contentType: 'json',
    });

    // 处理响应
    if (!response.ok) {
      const { status, statusText } = response;
      const responseData = await response.json().catch(() => response.text());

      if (fallbackOutput && fallbackOutput.length > 0) {
        return {
          data: JSON.stringify({ status, statusText, data: responseData }),
          nextBlockId: fallbackOutput,
        };
      }

      const error = new Error(`HTTP ${status}: ${statusText}`);
      error.ctxData = {
        request: { status, statusText, data: responseData },
      };
      throw error;
    }

    // 处理成功响应
    let responseData = null;
    if (data.saveResponse || data.assignResponseVariable) {
      if (data.responseType === 'json') {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    }

    // 保存响应到变量
    if (data.assignResponseVariable && data.responseVariableName) {
      await this.setVariable(data.responseVariableName, responseData);
    }

    // 保存响应到数据表
    if (data.saveResponse && data.responseDataColumn) {
      this.addDataToColumn(data.responseDataColumn, responseData);
    }

    return {
      data: responseData ? JSON.stringify(responseData) : '',
      nextBlockId,
    };
  } catch (error) {
    // 处理特定错误
    const fallbackErrors = [
      'Failed to fetch',
      'user aborted',
      'url-empty',
      'invalid-url',
      'invalid-json-body',
    ];
    const executeFallback =
      fallbackOutput &&
      fallbackErrors.some((message) => error.message.includes(message));

    if (executeFallback) {
      return {
        data: '',
        nextBlockId: fallbackOutput,
      };
    }

    error.nextBlockId = nextBlockId;
    throw error;
  }
}

export default dataSync;
