# Ollama CORS 配置指南

## 问题描述

当Chrome插件调用Ollama `/api/chat` 接口时返回 **403 Forbidden** 错误,原因是浏览器CORS跨域限制。

## 解决方案

### 方案 1: 环境变量配置(推荐)

在启动 Ollama 服务时设置 `OLLAMA_ORIGINS` 环境变量:

#### macOS/Linux
```bash
export OLLAMA_ORIGINS="*"
ollama serve
```

或添加到 `~/.bashrc` / `~/.zshrc`:
```bash
echo 'export OLLAMA_ORIGINS="*"' >> ~/.zshrc
source ~/.zshrc
ollama serve
```

#### Windows PowerShell
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

永久设置(系统环境变量):
1. 右键"此电脑" → "属性" → "高级系统设置"
2. "环境变量" → 新建系统变量
   - 变量名: `OLLAMA_ORIGINS`
   - 变量值: `*`
3. 重启终端,运行 `ollama serve`

#### Windows CMD
```cmd
set OLLAMA_ORIGINS=*
ollama serve
```

### 方案 2: systemd 服务配置(Linux)

编辑 Ollama systemd 服务文件:

```bash
sudo systemctl edit ollama
```

添加环境变量:
```ini
[Service]
Environment="OLLAMA_ORIGINS=*"
```

重启服务:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
sudo systemctl status ollama
```

### 方案 3: Docker 部署

```bash
docker run -d \
  -p 11434:11434 \
  -e OLLAMA_ORIGINS="*" \
  -v ollama:/root/.ollama \
  --name ollama \
  ollama/ollama
```

### 方案 4: Docker Compose

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_ORIGINS=*
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

## 安全建议

⚠️ **生产环境请限制来源:**

```bash
# 仅允许特定域名
export OLLAMA_ORIGINS="chrome-extension://your-extension-id,http://localhost:3000"
```

## 验证配置

### 1. 检查环境变量
```bash
# Linux/macOS
echo $OLLAMA_ORIGINS

# Windows PowerShell
$env:OLLAMA_ORIGINS
```

### 2. 测试API访问
```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: chrome-extension://test" \
  -d '{
    "model": "mistral",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

### 3. 检查响应头
```bash
curl -i http://localhost:11434/api/tags
```

应包含:
```
Access-Control-Allow-Origin: *
```

## 常见错误

### 错误 1: 环境变量未生效
- **原因**: 未重启Ollama服务
- **解决**: 重启服务 `pkill ollama && ollama serve`

### 错误 2: systemd配置未生效
- **原因**: 未执行 `daemon-reload`
- **解决**: 
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl restart ollama
  ```

### 错误 3: Docker容器未传递环境变量
- **原因**: `-e` 参数缺失
- **解决**: 确保 `docker run` 命令包含 `-e OLLAMA_ORIGINS="*"`

## 插件端代码确认

插件代码已正确设置CORS模式(`src/services/ai/OllamaClient.js`):

```javascript
const fetchOptions = {
  mode: 'cors', // ✅ 已启用CORS
  headers: {
    'Content-Type': 'application/json',
  },
};
```

## 参考资料

- [Ollama官方文档 - FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)
- [Ollama环境变量配置](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux)
