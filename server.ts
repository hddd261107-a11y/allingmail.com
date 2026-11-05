import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large screenshot base64 images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint to extract emails from screenshot image
app.post('/api/extract-emails', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Vui lòng cung cấp dữ liệu hình ảnh' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Bạn là trợ lý trích xuất văn bản từ hình ảnh chụp màn hình. 
Hãy đọc toàn bộ hình ảnh và tìm TẤT CẢ các địa chỉ email / Gmail (đặc biệt là các tài khoản @gmail.com hoặc email đăng nhập) xuất hiện trong ảnh chụp màn hình này.
Lưu ý:
1. Trích xuất chính xác từng địa chỉ email đầy đủ, loại bỏ khoảng trắng hoặc ký tự thừa xung quanh.
2. Nếu có nhiều email, trả về tất cả không bỏ sót bất kỳ tài khoản nào.
3. Trả về dưới dạng một mảng JSON các chuỗi email: ["email1@gmail.com", "email2@gmail.com"]`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const responseText = response.text || '[]';
    let emails: string[] = [];
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        emails = parsed
          .map((e: string) => e.trim().toLowerCase())
          .filter((e: string) => e.includes('@'));
      }
    } catch {
      const matches = responseText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (matches) {
        emails = Array.from(new Set(matches.map((e) => e.toLowerCase())));
      }
    }

    // Deduplicate emails
    const uniqueEmails = Array.from(new Set(emails));

    return res.json({
      success: true,
      count: uniqueEmails.length,
      emails: uniqueEmails,
    });
  } catch (error: any) {
    console.error('Error extracting emails from image:', error);
    return res.status(500).json({
      error: error.message || 'Không thể quét hình ảnh. Vui lòng thử lại.',
    });
  }
});

// Vite middleware in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
