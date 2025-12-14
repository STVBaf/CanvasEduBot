import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private config: any = {};

  // 1. 初始化时读取配置文件
  onModuleInit() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'agent-config.json');
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(fileContent);
        this.logger.log('✅ 成功加载 agent-config.json');
      } else {
        this.logger.warn('⚠️ 未找到 agent-config.json，请在 server 目录下创建');
      }
    } catch (error: any) {
      this.logger.error('❌ 读取 Agent 配置文件失败', error?.message || error);
    }
  }

  private async callCozeAgent(agentConfig: any, prompt: string, userId = 'canvas_user'): Promise<string> {
    if (!agentConfig || !agentConfig.api_token || !agentConfig.bot_id) {
      this.logger.error('❌ Agent 配置缺失');
      return '（AI 服务配置缺失，请检查 agent-config.json 文件）';
    }

    const { api_token, bot_id, base_url } = agentConfig;
    const baseUrl = base_url || 'https://api.coze.cn';

    try {
      // 1. 发起对话
      const createRes = await axios.post(
        `${baseUrl}/v3/chat`,
        {
          bot_id: bot_id,
          user_id: userId,
          stream: false,
          auto_save_history: true,
          additional_messages: [
            {
              role: 'user',
              content: prompt,
              content_type: 'text',
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${api_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const chatId = createRes.data.data.id;
      const conversationId = createRes.data.data.conversation_id;

      // 2. 轮询状态
      let status = createRes.data.data.status;
      let retryCount = 0;
      const maxRetries = 60;

      while (status === 'in_progress' && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const retrieveRes = await axios.get(
          `${baseUrl}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${api_token}` },
          }
        );
        
        status = retrieveRes.data.data.status;
        retryCount++;
        
        if (status === 'failed' || status === 'requires_action') {
          return '（AI 处理中断或失败）';
        }
      }

      // 3. 获取结果
      if (status === 'completed') {
        const listRes = await axios.get(
          `${baseUrl}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${api_token}` },
          }
        );

        const messages = listRes.data.data;
        const answerMsg = messages.find((msg: any) => msg.type === 'answer' && msg.role === 'assistant');

        return answerMsg ? answerMsg.content : '（AI 未返回有效内容）';
      }

      return '（AI 响应超时）';
    } catch (error: any) {
      this.logger.error(`调用 Coze API 失败: ${error?.response?.data?.msg || error?.message || error}`);
      return '（AI 服务暂时不可用）';
    }
  }

  // 1. 文本总结 Agent (使用 summary_agent 配置)
  async generateSummary(text: string): Promise<string> {
    const config = this.config.summary_agent;
    if (!config) {
      this.logger.error('❌ 未配置 summary_agent');
      return '（AI 服务配置缺失，请检查 agent-config.json 文件）';
    }
    
    const prompt = `请总结以下课程内容，提取核心知识点和考核重点：\n\n${text.slice(0, 4000)}`;
    return this.callCozeAgent(config, prompt);
  }

  // 2. PPT 分析 Agent (使用 ppt_agent 配置)
  async analyzePPT(fileUrl: string, fileName?: string, fileContent?: string): Promise<string> {
    const config = this.config.ppt_agent;
    if (!config) {
      this.logger.error('❌ 未配置 ppt_agent');
      return '（AI 服务配置缺失，请检查 agent-config.json 文件）';
    }

    // 构建提示词
    let prompt = '请分析这个PPT课件，给出详细的解读，包括：\n';
    prompt += '1. 课件的主要内容和结构\n';
    prompt += '2. 每个章节的核心知识点\n';
    prompt += '3. 重点和难点解析\n';
    prompt += '4. 学习建议和思考题\n\n';

    if (fileName) {
      prompt += `文件名: ${fileName}\n`;
    }

    if (fileContent) {
      // 如果提供了文件内容描述（如提取的文本）
      prompt += `课件内容:\n${fileContent.slice(0, 8000)}\n`;
    } else if (fileUrl) {
      // 如果提供了文件URL，告诉AI文件位置
      prompt += `课件文件URL: ${fileUrl}\n`;
      prompt += '请分析该PPT课件的内容。';
    }

    return this.callCozeAgent(config, prompt);
  }
}