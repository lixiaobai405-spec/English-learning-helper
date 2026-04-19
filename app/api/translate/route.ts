import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '没有提供需要翻译的文本' }, { status: 400 });
    }

    // 自动检测语言：如果包含中文字符，就翻译成英文；否则翻译成中文
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    const instruction = hasChinese 
      ? '你是一个专业的英文翻译员。请将以下中文翻译成英文，要求地道、自然。只返回翻译后的结果，不要任何解释。'
      : '你是一个专业的中文翻译员。请将以下英文翻译成中文，要求准确、流畅。只返回翻译后的结果，不要任何解释。';

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '请在 .env.local 中配置 DEEPSEEK_API_KEY' }, { status: 500 });
    }

    // 调用 DeepSeek 官方 API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 使用 DeepSeek 的对话大模型
        messages: [
          { role: 'system', content: instruction },
          { role: 'user', content: text }
        ],
        temperature: 0.3 // 较低的温度，保证翻译结果更准确和稳定
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API 调用失败:', errorData);
      return NextResponse.json({ error: '翻译请求失败，请检查 API Key 或网络状态' }, { status: response.status });
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('翻译服务内部错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}