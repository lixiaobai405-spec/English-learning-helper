'use client';

import { useState, useRef } from 'react';
import TranslationCard from '@/components/TranslationCard';

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // 左右两边的音色独立分开
  const [sourceVoice, setSourceVoice] = useState('zhiyuan'); // 左侧默认：中文女声
  const [targetVoice, setTargetVoice] = useState('abby');    // 右侧默认：美式女声
  
  // 音频播放状态管理
  const [audioState, setAudioState] = useState<{ card: 'source' | 'target' | null, status: 'idle' | 'loading' | 'playing' }>({ card: null, status: 'idle' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeInputRef = useRef<'source' | 'target' | 'none'>('none');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTranslate = async (text: string, direction: 'forward' | 'backward') => {
    if (!text.trim()) {
      if (direction === 'forward') setTargetText('');
      else setSourceText('');
      return;
    }
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const data = await response.json();
        if (direction === 'forward') setTargetText(data.translatedText);
        else setSourceText(data.translatedText);
      }
    } catch (error) {
      console.error('翻译出错:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const onSourceChange = (text: string) => {
    setSourceText(text);
    activeInputRef.current = 'source';
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (activeInputRef.current === 'source') {
        handleTranslate(text, 'forward');
        activeInputRef.current = 'none';
      }
    }, 800);
  };

  const onTargetChange = (text: string) => {
    setTargetText(text);
    activeInputRef.current = 'target';
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (activeInputRef.current === 'target') {
        handleTranslate(text, 'backward');
        activeInputRef.current = 'none';
      }
    }, 800);
  };

  // 停止当前正在播放的音频
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudioState({ card: null, status: 'idle' });
  };

  // 从头重播当前卡片的音频
  const handleReplay = (card: 'source' | 'target') => {
    // 只有当当前卡片正在播放或暂停时，且 audio 对象存在时，才可以重播
    if (audioRef.current && audioState.card === card) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setAudioState({ card, status: 'playing' });
    } else {
      // 如果当前没有音频对象，或者正在播放另一个卡片，则相当于重新发起一次朗读请求
      const text = card === 'source' ? sourceText : targetText;
      const voice = card === 'source' ? sourceVoice : targetVoice;
      handlePlay(text, card, voice);
    }
  };

  // 调用阿里云 TTS 接口朗读
  const handlePlay = async (text: string, card: 'source' | 'target', currentVoice: string) => {
    if (!text) return;

    // 如果点的就是当前正在播放的卡片，那就是“暂停/停止”操作
    if (audioState.card === card && audioState.status === 'playing') {
      stopAudio();
      return;
    }

    // 开始播放前，先停掉其他的
    stopAudio();
    setAudioState({ card, status: 'loading' });

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: currentVoice })
      });
      if (!res.ok) throw new Error('语音合成失败');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setAudioState({ card: null, status: 'idle' });
        URL.revokeObjectURL(url); // 释放内存
      };
      
      audioRef.current = audio;
      await audio.play();
      setAudioState({ card, status: 'playing' });
    } catch (error) {
      console.error(error);
      alert('播放失败，请检查网络或配置');
      setAudioState({ card: null, status: 'idle' });
    }
  };

  // 导出 MP3
  const handleDownload = async (text: string, currentVoice: string) => {
    if (!text) return;
    try {
      alert('正在合成音频，长文本可能需要几秒钟，请稍候...');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: currentVoice })
      });
      if (!res.ok) throw new Error('语音合成失败');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `English-Helper-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('下载失败');
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PWA English Helper
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            支持双向翻译的智能英语助手 {isTranslating && <span className="text-blue-500 text-sm ml-2">(翻译中...)</span>}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[350px] md:auto-rows-auto md:h-[65vh] min-h-[400px]">
          <TranslationCard
            title="输入文本 (中文/英文)"
            text={sourceText}
            placeholder="在此输入需要翻译的内容，中英皆可..."
            voice={sourceVoice}
            audioStatus={audioState.card === 'source' ? audioState.status : 'idle'}
            onTextChange={onSourceChange}
            onVoiceChange={setSourceVoice}
            onPlay={() => handlePlay(sourceText, 'source', sourceVoice)}
            onReplay={() => handleReplay('source')}
            onDownload={() => handleDownload(sourceText, sourceVoice)}
            onClear={() => {
              setSourceText('');
              stopAudio();
            }}
            onCopy={() => handleCopy(sourceText)}
          />

          <TranslationCard
            title="译文结果 (也可直接修改并反向翻译)"
            text={targetText}
            placeholder="翻译结果会显示在这里，您也可以直接修改这里的内容..."
            voice={targetVoice}
            audioStatus={audioState.card === 'target' ? audioState.status : 'idle'}
            onTextChange={onTargetChange}
            onVoiceChange={setTargetVoice}
            onPlay={() => handlePlay(targetText, 'target', targetVoice)}
            onReplay={() => handleReplay('target')}
            onDownload={() => handleDownload(targetText, targetVoice)}
            onClear={() => {
              setTargetText('');
              stopAudio();
            }}
            onCopy={() => handleCopy(targetText)}
          />
        </div>
      </div>
    </main>
  );
}