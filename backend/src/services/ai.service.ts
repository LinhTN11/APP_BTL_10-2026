import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';

export interface UserProfileContext {
  name: string;
  gender: string;
  mbti?: string | null;
  interests: string[];
  dailyMood?: string | null;
  bio?: string | null;
}

export interface IcebreakerResponse {
  success: boolean;
  commonGround: string;
  icebreakers: Array<{
    style: 'Hài hước' | 'Tinh tế' | 'Trực diện';
    text: string;
  }>;
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
  }

  async generateIcebreakers(
    sender: UserProfileContext,
    receiver: UserProfileContext
  ): Promise<IcebreakerResponse> {
    const startTime = Date.now();

    // 1. Check if Gemini API client is configured
    if (!this.genAI || !ENV.GEMINI_API_KEY) {
      console.log('[AIService] GEMINI_API_KEY not set. Using Rule-based Fallback Engine.');
      return this.generateFallbackIcebreakers(sender, receiver);
    }

    // 2. Build system and user prompt
    const prompt = `
Bạn là Cupid AI - Chuyên gia tâm lý tình yêu và cố vấn giao tiếp trên ứng dụng hẹn hò di động.
Nhiệm vụ: Phân tích thông tin 2 hồ sơ dưới đây để tạo ra đúng 3 câu mở lời (Icebreaker) bằng Tiếng Việt cho Người gửi (${sender.name}) nhắn cho Người nhận (${receiver.name}).

Thông tin Người gửi:
- Tên: ${sender.name}
- Giới tính: ${sender.gender}
- MBTI: ${sender.mbti || 'Chưa rõ'}
- Sở thích: ${sender.interests.join(', ') || 'Chưa có'}
- Tâm trạng trong ngày: ${sender.dailyMood || 'Bình thường'}

Thông tin Người nhận:
- Tên: ${receiver.name}
- Giới tính: ${receiver.gender}
- MBTI: ${receiver.mbti || 'Chưa rõ'}
- Sở thích: ${receiver.interests.join(', ') || 'Chưa có'}
- Tâm trạng trong ngày: ${receiver.dailyMood || 'Bình thường'}
- Bio: ${receiver.bio || 'Chưa cập nhật'}

YÊU CẦU BẮT BUỘC:
1. Ngôn từ trẻ trung, tự nhiên, duyên dáng, không sến súa, tuyệt đối KHÔNG dùng các câu chào rập khuôn như "Chào em", "Hi", "Làm quen nha".
2. Khai thác điểm chung về sở thích, tính cách MBTI hoặc câu đùa dí dỏm về nhãn tâm trạng của người nhận.
3. Xuất kết quả DUY NHẤT dưới định dạng JSON với schema sau (không thêm văn bản ngoài JSON):
{
  "commonGround": "Mô tả ngắn điểm chung giữa 2 người",
  "icebreakers": [
    { "style": "Hài hước", "text": "Nội dung câu nói dí dỏm" },
    { "style": "Tinh tế", "text": "Nội dung câu nói lịch thiệp, sâu sắc" },
    { "style": "Trực diện", "text": "Nội dung câu nói tự tin, cởi mở" }
  ]
}
`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const response = await model.generateContent(prompt);
      const rawText = response.response.text()?.trim() || '';

      // Strip potential Markdown JSON codeblock fences: ```json ... ``` or ``` ... ```
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const latencyMs = Date.now() - startTime;
      console.log(`[AIService] Gemini AI generated icebreakers successfully in ${latencyMs}ms`);

      return {
        success: true,
        commonGround: parsed.commonGround || 'Có điểm chung về tính cách và sở thích',
        icebreakers: parsed.icebreakers || [],
      };
    } catch (error) {
      console.error('[AIService] Gemini API call error:', error);
      console.log('[AIService] Switching to Rule-based Fallback Templates.');
      return this.generateFallbackIcebreakers(sender, receiver);
    }
  }

  /**
   * Rule-based Fallback generator when AI API is unavailable, timed out, or unconfigured.
   */
  private generateFallbackIcebreakers(
    sender: UserProfileContext,
    receiver: UserProfileContext
  ): IcebreakerResponse {
    const commonInterests = sender.interests.filter((i) =>
      receiver.interests.includes(i)
    );

    const firstInterest = commonInterests[0] || receiver.interests[0] || 'cuộc sống';
    const receiverMood = receiver.dailyMood;

    return {
      success: true,
      commonGround:
        commonInterests.length > 0
          ? `Cả hai đều yêu thích "${commonInterests.join(', ')}"`
          : `Cùng tìm kiếm những kết nối chân thành trên Cupid AI`,
      icebreakers: [
        {
          style: 'Hài hước',
          text: receiverMood
            ? `Thấy ${receiver.name} để tâm trạng "${receiverMood}", mình đoán người đối diện chắc cũng đang cần một ly tương tự đúng không? Chào bạn nha!`
            : `Hồ sơ bảo ${receiver.name} thích ${firstInterest}, liệu đây có phải là dấu hiệu của vũ trụ cho một buổi hẹn cuối tuần không nhỉ? Chào bạn!`,
        },
        {
          style: 'Tinh tế',
          text: `Chào ${receiver.name}, mình thấy bạn cũng quan tâm đến ${firstInterest}. Bạn có địa điểm nào quen thuộc hay lui tới không?`,
        },
        {
          style: 'Trực diện',
          text: `Chào ${receiver.name}! Mình rất ấn tượng với hồ sơ của bạn, rất vui vì hôm nay hai đứa mình đã match với nhau!`,
        },
      ],
    };
  }
}

export const aiService = new AIService();
