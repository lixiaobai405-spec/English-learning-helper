import { NextResponse } from 'next/server';
import PopCore from '@alicloud/pop-core';

// 辅助函数：将长文本按标点符号切分成多个短句（每句不超过 250 字符，留点余量）
function splitText(text: string, maxLength = 250): string[] {
  const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]*/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(request: Request) {
  try {
    const { text, voice = 'zhiwei' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '没有提供需要朗读的文本' }, { status: 400 });
    }

    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
    const appKey = process.env.ALIYUN_APP_KEY;

    if (!accessKeyId || !accessKeySecret || !appKey) {
      return NextResponse.json({ error: '配置缺失' }, { status: 500 });
    }

    // 1. 获取 Token
    const client = new PopCore({
      accessKeyId,
      accessKeySecret,
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
      apiVersion: '2019-02-28'
    });
    const tokenResult: any = await client.request('CreateToken', {});
    const token = tokenResult.Token.Id;

    // 2. 切分长文本
    const textChunks = splitText(text);
    const audioBuffers: Buffer[] = [];

    // 3. 循环请求每一段短句的音频
    for (const chunk of textChunks) {
      if (!chunk) continue;
      
      const ttsResponse = await fetch('https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appkey: appKey,
          token: token,
          text: chunk,
          format: 'mp3',
          voice: voice,      // 使用传进来的精品音色
          sample_rate: 16000,
          volume: 50,
          speech_rate: 0,
          pitch_rate: 0
        })
      });

      if (!ttsResponse.ok) {
        console.error('某一段 TTS 失败:', await ttsResponse.text());
        continue; // 如果某一句失败了，跳过它继续读下一句，不要让整个程序崩溃
      }

      const arrayBuffer = await ttsResponse.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: '语音合成全部失败' }, { status: 500 });
    }

    // 4. 将所有短句的 MP3 Buffer 拼接成一个完整的大 MP3 文件！
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    return new NextResponse(finalAudioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="audio.mp3"',
      },
    });

  } catch (error) {
    console.error('TTS API 内部错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}