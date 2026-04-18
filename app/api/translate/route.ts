import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, sourceLang = 'zh', targetLang = 'en' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Using MyMemory Free API for demonstration. 
    // In production, replace with OpenAI / DeepL / Baidu Translate API.
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return NextResponse.json({ translatedText: data.responseData.translatedText });
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}