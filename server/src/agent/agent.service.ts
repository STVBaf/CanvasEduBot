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

    } catch (error) {
      this.logger.error(`调用 Coze API 失败: ${error.response?.data?.msg || error.message}`);
      return '（AI 服务暂时不可用）';
    }
  }
}