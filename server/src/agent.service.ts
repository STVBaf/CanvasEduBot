import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  async generateSummary(text: string): Promise<string> {
    const apiUrl = process.env.AGENT_API_URL;
    const apiKey = process.env.AGENT_API_KEY;

    if (!apiUrl) {
      this.logger.warn('⚠️ 未配置 AGENT_API_URL，跳过 AI 总结');
      return '（未配置 AI 服务，暂无总结）';
    }

    try {
      const safeText = text.slice(0, 3000);
      const response = await axios.post(
        apiUrl,
        {
          prompt: `请为以下课程资料生成一份精简的总结，包含核心知识点和考核重点：\n\n${safeText}`,
          text: safeText, 
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`, 
            'Content-Type': 'application/json',
          },
          timeout: 60000, 
        }
      );
      const summary = response.data.answer || response.data.summary || response.data.data || JSON.stringify(response.data);
      
      return summary;

    } catch (error) {
      this.logger.error(`AI 服务调用失败: ${error.message}`);
      return '（AI 服务暂时不可用，请稍后再试）';
    }
  }
}