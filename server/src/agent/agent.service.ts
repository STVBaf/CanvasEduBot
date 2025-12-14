import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  /**
   * 生成内容总结
   * @param text 要总结的文本内容
   * @param botId Bot ID（可选，不提供则使用环境变量默认值）
   */
  async generateSummary(text: string, botId?: string): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const defaultBotId = process.env.COZE_BOT_ID;
    const finalBotId = botId || defaultBotId;
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    if (!cozeToken) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN');
      return '（AI 服务配置缺失：缺少 API Token）';
    }

    if (!finalBotId) {
      this.logger.error('❌ 未提供 Bot ID 且环境变量未配置 COZE_BOT_ID');
      return '（AI 服务配置缺失：缺少 Bot ID）';
    }

    try {
      // 1. 发起对话 (Create Chat)
      const createRes = await axios.post(
        `${baseUrl}/v3/chat`,
        {
          bot_id: finalBotId,
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
   * @param botId Bot ID（可选，不提供则使用环境变量默认值）
   */
  async analyzePPT(fileUrl: string, fileName?: string, fileContent?: string, botId?: string): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const defaultPptBotId = process.env.COZE_PPT_BOT_ID;
    const finalBotId = botId || defaultPptBotId;
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    if (!cozeToken) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN');
      return '（AI 服务配置缺失：缺少 API Token）';
    }

    if (!finalBotId) {
      this.logger.error('❌ 未提供 Bot ID 且环境变量未配置 COZE_PPT_BOT_ID');
      return '（AI 服务配置缺失：缺少 Bot ID）';
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
          bot_id: finalBotId,
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

  /**
   * 通用 Agent 对话方法
   * @param botId Bot ID
   * @param message 用户消息
   * @param fileUrl 文件URL（可选）
   * @param fileName 文件名（可选）
   */
  async chatWithBot(botId: string, message: string, fileUrl?: string, fileName?: string): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    if (!cozeToken) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN');
      return '（AI 服务配置缺失：缺少 API Token）';
    }

    if (!botId) {
      this.logger.error('❌ 未提供 Bot ID');
      return '（错误：缺少 Bot ID）';
    }

    try {
      // 构建消息内容
      let content = message;
      if (fileName) {
        content = `文件名: ${fileName}\n${message}`;
      }
      if (fileUrl) {
        content += `\n文件URL: ${fileUrl}`;
      }

      // 1. 发起对话
      this.logger.log(`调用 Coze Bot ${botId}...`);
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
              content: content,
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
      const maxRetries = 60;

      while (status === 'in_progress' && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const retrieveRes = await axios.get(
          `${baseUrl}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          },
        );
        
        status = retrieveRes.data.data.status;
        retryCount++;
        
        if (status === 'failed' || status === 'requires_action') {
          this.logger.error(`Bot 处理失败，状态: ${status}`);
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

        if (answerMsg) {
          this.logger.log(`Bot 响应成功，内容长度: ${answerMsg.content?.length || 0}`);
          return answerMsg.content;
        } else {
          this.logger.warn('未找到 AI 回复消息');
          return '（AI 未返回有效回复）';
        }
      }

      this.logger.warn(`Bot 响应超时，最终状态: ${status}`);
      return '（AI 响应超时）';

    } catch (error: any) {
      this.logger.error(`调用 Coze Bot 失败: ${error?.response?.data?.msg || error?.message || error}`);
      if (error?.response?.data) {
        this.logger.error(`错误详情: ${JSON.stringify(error.response.data)}`);
      }
      return '（AI 服务暂时不可用）';
    }
  }

  /**
   * 分析上传的文件
   * @param fileBuffer 文件二进制数据
   * @param fileName 文件名
   * @param mimeType 文件MIME类型
   * @param botId Bot ID（可选）
   * @param customPrompt 自定义提示词（可选）
   */
  async analyzeFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    botId?: string,
    customPrompt?: string
  ): Promise<string> {
    const cozeToken = process.env.COZE_API_TOKEN;
    const defaultBotId = process.env.COZE_BOT_ID;
    const finalBotId = botId || defaultBotId;
    const baseUrl = process.env.COZE_BASE_URL || 'https://api.coze.cn';

    // 打印 token 的前后几位用于验证（不完整打印保证安全）
    if (cozeToken) {
      this.logger.debug(`COZE_API_TOKEN 已加载: ${cozeToken.substring(0, 10)}...${cozeToken.substring(cozeToken.length - 5)}`);
    }

    if (!cozeToken) {
      this.logger.error('❌ 未配置 COZE_API_TOKEN');
      return '（AI 服务配置缺失：缺少 API Token）';
    }

    if (!finalBotId) {
      this.logger.error('❌ 未提供 Bot ID 且环境变量未配置 COZE_BOT_ID');
      return '（AI 服务配置缺失：缺少 Bot ID）';
    }

    try {
      // 1. 尝试上传文件到 Coze 获取 file_id
      let fileId: string | null = null;
      let uploadSuccess = false;
      
      this.logger.log(`尝试上传文件到 Coze: ${fileName} (${this.formatBytes(fileBuffer.length)}, MIME: ${mimeType})`);
      
      try {
        const FormData = require('form-data');
        const formData = new FormData();
        
        // 根据 Coze 文档，字段名必须是 'file'
        formData.append('file', fileBuffer, {
          filename: fileName,
          contentType: mimeType,
        });
        
        this.logger.debug(`FormData headers: ${JSON.stringify(formData.getHeaders())}`);

        const uploadRes = await axios.post(
          `${baseUrl}/v1/files/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${cozeToken}`,
            },
            timeout: 60000, // 60秒超时
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );

        // 打印完整响应以便调试
        this.logger.debug(`Coze 上传响应: ${JSON.stringify(uploadRes.data)}`);

        // Coze 返回的 file_id（实际字段名是 data.id，不是 data.file_id）
        fileId = uploadRes.data?.data?.id || uploadRes.data?.data?.file_id || uploadRes.data?.file_id;
        
        if (fileId) {
          uploadSuccess = true;
          this.logger.log(`✅ 文件上传成功，file_id: ${fileId}`);
        } else {
          this.logger.warn(`⚠️ 文件上传响应中未找到 file_id: ${JSON.stringify(uploadRes.data)}`);
        }
      } catch (uploadError: any) {
        this.logger.warn(`⚠️ 文件上传失败: ${uploadError?.response?.data?.msg || uploadError?.message}`);
        if (uploadError.response?.data) {
          this.logger.warn(`Coze 上传错误详情: ${JSON.stringify(uploadError.response.data)}`);
        }
        if (uploadError.response?.status) {
          this.logger.warn(`HTTP 状态码: ${uploadError.response.status}`);
        }
        this.logger.warn('将尝试使用文本内容方式...');
      }

      // 2. 构建提示词
      const defaultPrompt = customPrompt || this.getDefaultPromptForFileType(mimeType, fileName);
      
      // 3. 根据 MIME 类型确定 object_string 中的 type
      let fileType = 'file'; // 默认类型
      if (mimeType.startsWith('image/')) {
        fileType = 'image';
      } else if (mimeType.startsWith('audio/')) {
        fileType = 'audio';
      }
      
      // 4. 构建消息内容
      let messageContent: any;
      
      if (uploadSuccess && fileId) {
        // 方式 1: 使用上传成功的 file_id，构建 object_string 类型消息
        // 根据 Coze 文档，object_string 支持的字段：type, text, file_id, file_url
        this.logger.log(`✅ 使用 object_string 方式（类型: ${fileType}）`);
        messageContent = {
          role: 'user',
          content: JSON.stringify([
            {
              type: 'text',
              text: defaultPrompt
            },
            {
              type: fileType,  // 'file', 'image', 'audio'
              file_id: fileId  // 文档要求：type 为 file/image/audio 时，file_id 和 file_url 至少指定一个
            }
          ]),
          content_type: 'object_string'
        };
      } else if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/csv') {
        // 方式 2: 纯文本文件，直接传文本内容
        try {
          const textContent = fileBuffer.toString('utf-8').slice(0, 15000);
          const fullPrompt = `${defaultPrompt}\n\n文件名: ${fileName}\n文件内容:\n\`\`\`\n${textContent}\n\`\`\``;
          
          messageContent = {
            role: 'user',
            content: fullPrompt,
            content_type: 'text',
          };
          this.logger.log('✅ 使用纯文本内容方式');
        } catch (e) {
          this.logger.error('❌ 文本解码失败');
          return '（无法解析文件内容，请确保文件编码正确）';
        }
      } else {
        // 方式 3: 无法上传的二进制文件，返回错误提示
        this.logger.error('❌ 无法处理此类型的二进制文件');
        return `抱歉，暂时无法分析该文件。\n\n原因：\n1. 文件上传到 Coze 失败\n2. 文件类型 ${mimeType} 不支持直接传输\n\n建议：\n- 检查 Coze API Token 权限\n- 确认 Bot 是否支持文件分析\n- 尝试转换为 PDF 或文本格式`;
      }

      // 4. 发起对话 - 使用 additional_messages 传递文件消息
      this.logger.log(`调用 Coze Bot ${finalBotId}，使用 /v3/chat...`);
      this.logger.debug(`请求体: ${JSON.stringify({
        bot_id: finalBotId,
        user_id: 'canvas_student_user',
        stream: false,
        auto_save_history: true,
        additional_messages: [messageContent],
      }, null, 2)}`);
      
      const createRes = await axios.post(
        `${baseUrl}/v3/chat`,
        {
          bot_id: finalBotId,
          user_id: 'canvas_student_user',
          stream: false,
          auto_save_history: true,
          additional_messages: [messageContent], // 使用 additional_messages 传递消息
        },
        {
          headers: {
            Authorization: `Bearer ${cozeToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.debug(`Coze /v3/chat 响应: ${JSON.stringify(createRes.data)}`);

      // 检查 Coze API 错误
      if (createRes.data?.code !== 0) {
        const errorMsg = createRes.data?.msg || '未知错误';
        const errorCode = createRes.data?.code;
        this.logger.error(`❌ Coze API 返回错误 (${errorCode}): ${errorMsg}`);
        
        // 特殊错误码处理
        if (errorCode === 4015) {
          return `Bot 未发布到 API 频道。\n\n请在 Coze 平台执行以下操作：\n1. 打开 Bot 编辑页面\n2. 点击右上角「发布」按钮\n3. 选择「API」频道\n4. 完成发布后重试\n\n详情: ${errorMsg}`;
        }
        
        return `Coze API 错误 (${errorCode}): ${errorMsg}`;
      }

      const chatId = createRes.data?.data?.id;
      const conversationId = createRes.data?.data?.conversation_id;
      
      if (!chatId || !conversationId) {
        this.logger.error(`❌ 对话创建失败，响应: ${JSON.stringify(createRes.data)}`);
        return '对话创建失败，请检查 Bot ID 和 API Token';
      }
      
      this.logger.log(`对话已创建: chat_id=${chatId}, conversation_id=${conversationId}`);

      // 5. 轮询等待 AI 完成
      let status = createRes.data.data.status;
      let retryCount = 0;
      const maxRetries = 60;

      this.logger.log(`开始轮询对话状态，初始状态: ${status}`);

      while (status === 'in_progress' && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const retrieveRes = await axios.get(
          `${baseUrl}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          }
        );
        
        status = retrieveRes.data.data.status;
        retryCount++;
        
        this.logger.log(`轮询 ${retryCount}/${maxRetries}: 状态=${status}`);
        
        if (status === 'failed' || status === 'requires_action') {
          this.logger.error(`Bot 处理失败，状态: ${status}`);
          return '（AI 处理中断或失败）';
        }
      }

      // 6. 获取回复消息
      if (status === 'completed') {
        this.logger.log('对话完成，正在获取消息...');
        const listRes = await axios.get(
          `${baseUrl}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: { Authorization: `Bearer ${cozeToken}` },
          }
        );

        const messages = listRes.data.data;
        const answerMsg = messages.find((msg: any) => msg.type === 'answer' && msg.role === 'assistant');

        if (answerMsg) {
          this.logger.log(`✅ 获取到 AI 回复，长度: ${answerMsg.content?.length || 0} 字符`);
          return answerMsg.content;
        } else {
          this.logger.warn('未找到 AI 回复消息');
          return '（AI 未返回有效分析）';
        }
      }

      this.logger.warn(`对话超时，最终状态: ${status}`);
      return '（AI 响应超时）';

    } catch (error: any) {
      this.logger.error(`调用 Coze 文件分析 API 失败: ${error?.response?.data?.msg || error?.message || error}`);
      if (error.response?.data) {
        this.logger.error(`错误详情: ${JSON.stringify(error.response.data)}`);
      }
      return `分析失败: ${error?.response?.data?.msg || error?.message || '未知错误'}`;
    }
  }

  /**
   * 根据文件类型生成默认提示词
   */
  private getDefaultPromptForFileType(mimeType: string, fileName: string): string {
    if (mimeType.includes('presentation') || fileName.match(/\.(ppt|pptx)$/i)) {
      return '请详细分析这个PPT课件，包括：\n1. 主要内容和章节结构\n2. 核心知识点和重点\n3. 难点解析\n4. 学习建议';
    } else if (mimeType.includes('document') || fileName.match(/\.(doc|docx)$/i)) {
      return '请详细分析这个Word文档，提取核心内容和要点。';
    } else if (mimeType === 'application/pdf') {
      return '请详细分析这个PDF文档，总结主要内容。';
    } else if (mimeType.includes('spreadsheet') || fileName.match(/\.(xls|xlsx)$/i)) {
      return '请分析这个Excel表格的数据和结构。';
    } else {
      return '请分析这个文件，给出详细的解读和总结。';
    }
  }

  /**
   * 格式化字节数为可读形式
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}