import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  async generateSummary(text: string): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const botId = process.env.COZE_BOT_ID;
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    if (!cozeToken || !botId) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN 或 COZE_BOT_ID');
      return '（AI 服务配置缺失，请检查 .env 文件）';
    }

    try {
      // 1. 发起对话 (Create Chat)
      const createRes = await axios.post(
        `${baseUrl}/v3/chat`,
        {
          bot_id: botId,
          user_id: 'canvas_student_user',
          stream: false,
          auto_save_history: true,
          additional_messages: [
            {
              role: 'user',
              content: `请总结以下课程内容，提取核心知识点和考核重点：\n\n${text.slice(0, 4000)}`,
              content_type: 'text',
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${cozeToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const chatId = createRes.data.data.id;
      const conversationId = createRes.data.data.conversation_id;

      // 2. 轮询等待 AI 思考完成
      let status = createRes.data.data.status;
      let retryCount = 0;

      while (status === 'in_progress' && retryCount < 40) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const retrieveRes = await axios.get(
          `${baseUrl}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          },
        );
        
        status = retrieveRes.data.data.status;
        retryCount++;
        
        if (status === 'failed' || status === 'requires_action') {
          return '（AI 处理中断或失败）';
        }
      }

      // 3. 获取回复消息
      if (status === 'completed') {
        const listRes = await axios.get(
          `${baseUrl}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          },
        );

        // 找到 AI 回复的那条消息
        const messages = listRes.data.data;
        const answerMsg = messages.find((msg: any) => msg.type === 'answer' && msg.role === 'assistant');

        return answerMsg ? answerMsg.content : '（AI 未返回有效总结）';
      }

      return '（AI 响应超时）';

    } catch (error: any) {
      this.logger.error(`调用 Coze API 失败: ${error?.response?.data?.msg || error?.message || error}`);
      return '（AI 服务暂时不可用）';
    }
  }

  /**
   * 分析PPT课件
   * @param fileUrl PPT文件的URL或文件内容描述
   * @param fileName 文件名（可选）
   * @param fileContent 文件内容描述（如果无法直接传文件，可以传文本描述）
   */
  async analyzePPT(fileUrl: string, fileName?: string, fileContent?: string): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const pptBotId = process.env.COZE_PPT_BOT_ID; // 新的PPT分析bot ID
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    if (!cozeToken || !pptBotId) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN 或 COZE_PPT_BOT_ID');
      return '（AI 服务配置缺失，请检查 .env 文件）';
    }

    try {
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

      // 1. 发起对话
      const createRes = await axios.post(
        `${baseUrl}/v3/chat`,
        {
          bot_id: pptBotId,
          user_id: 'canvas_student_user',
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
            Authorization: `Bearer ${cozeToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const chatId = createRes.data.data.id;
      const conversationId = createRes.data.data.conversation_id;

      // 2. 轮询等待 AI 思考完成
      let status = createRes.data.data.status;
      let retryCount = 0;
      const maxRetries = 60; // PPT分析可能需要更长时间

      while (status === 'in_progress' && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2秒轮询一次
        
        const retrieveRes = await axios.get(
          `${baseUrl}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          },
        );
        
        status = retrieveRes.data.data.status;
        retryCount++;
        
        if (status === 'failed' || status === 'requires_action') {
          return '（AI 处理中断或失败）';
        }
      }

      // 3. 获取回复消息
      if (status === 'completed') {
        const listRes = await axios.get(
          `${baseUrl}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          },
        );

        const messages = listRes.data.data;
        const answerMsg = messages.find((msg: any) => msg.type === 'answer' && msg.role === 'assistant');

        return answerMsg ? answerMsg.content : '（AI 未返回有效分析）';
      }

      return '（AI 响应超时，PPT分析可能需要更长时间）';

    } catch (error: any) {
      this.logger.error(`调用 Coze PPT分析 API 失败: ${error?.response?.data?.msg || error?.message || error}`);
      return '（AI 服务暂时不可用）';
    }
  }
}