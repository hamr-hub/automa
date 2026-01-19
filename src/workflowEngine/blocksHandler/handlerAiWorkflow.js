import { postRunAPWorkflow } from '@/utils/getAIPoweredInfo';
import renderString from '../templating/renderString';
import aiService from '@/services/ai/AIService';

async function aiWorkflow(block, { refData }) {
  const {
    flowUuid,
    inputs,
    assignVariable,
    variableName,
    saveData,
    dataColumn,
    provider,
    ollamaHost,
    model,
    prompt,
    systemPrompt,
    temperature,
  } = block.data;

  const replacedValueList = {};

  // AI Power Logic
  if (provider === 'aipower' || (!provider && flowUuid)) {
    const aipowerToken = this.engine.workflow.settings?.aipowerToken;

    if (!aipowerToken) {
      throw new Error('AI Power token is not set');
    }

    const inputForAPI = {};
    for (const item of inputs) {
      if (typeof item.value === 'object' && item.value !== null) {
        // For file objects, we don't render them as strings.
        // We assume they contain the necessary structure like { filename, url }.
        inputForAPI[item.name] = item.value;
      } else {
        // For strings, we render them using the templating engine.
        const renderedValue = await renderString(
          item.value,
          refData,
          this.engine.isPopup
        );
        inputForAPI[item.name] = renderedValue.value;
        Object.assign(replacedValueList, renderedValue.list);
      }
    }

    try {
      const runResponse = await postRunAPWorkflow(
        { flowUuid, input: inputForAPI },
        aipowerToken
      );
      const { success, msg } = runResponse;

      if (!success) {
        throw new Error(msg || 'AI workflow execution failed');
      }

      if (assignVariable) {
        this.setVariable(variableName, runResponse.data.result);
      }

      if (saveData) {
        this.addDataToColumn(dataColumn, runResponse.data.result);
      }

      const nextBlockId = this.getBlockConnections(block.id);

      return {
        data: runResponse.data.result,
        nextBlockId,
        replacedValue: replacedValueList,
      };
    } catch (error) {
      console.error('AI workflow execution failed:', error);
      throw new Error(error.message);
    }
  }

  // Ollama Logic - 通过 AIService 调用 (统一经过 LangGraphService)
  // Render Prompts
  const renderedPrompt = await renderString(
    prompt || '',
    refData,
    this.engine.isPopup
  );
  Object.assign(replacedValueList, renderedPrompt.list);

  const renderedSystemPrompt = await renderString(
    systemPrompt || '',
    refData,
    this.engine.isPopup
  );
  Object.assign(replacedValueList, renderedSystemPrompt.list);

  try {
    // 确保 AIService 已初始化（会自动读取用户的 ollama 配置）
    if (!aiService.initialized) {
      await aiService.initialize();
    }

    const messages = [];
    if (renderedSystemPrompt.value) {
      messages.push({ role: 'system', content: renderedSystemPrompt.value });
    }
    messages.push({ role: 'user', content: renderedPrompt.value });

    // 通过 AIService.chat 调用,统一经过 LangGraphService
    const response = await aiService.chat(messages, {
      model: model || 'mistral',
      temperature: parseFloat(temperature) || 0.7,
    });

    const resultText = response.message.content;

    if (assignVariable) {
      this.setVariable(variableName, resultText);
    }

    if (saveData) {
      this.addDataToColumn(dataColumn, resultText);
    }

    const nextBlockId = this.getBlockConnections(block.id);

    return {
      data: resultText,
      nextBlockId,
      replacedValue: replacedValueList,
    };
  } catch (error) {
    console.error('Ollama execution failed:', error);
    throw new Error(`Ollama execution failed: ${error.message}`);
  }
}

export default aiWorkflow;
