'use client';

import { useState, useEffect } from 'react';
import { Mic, X, Volume2, Copy } from 'lucide-react';
import TranslationCard from '@/components/TranslationCard';

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'zh-CN';
        
        recog.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setSourceText(prev => prev + finalTranscript);
          }
        };
        
        recog.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        
        recog.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(recog);
      }
    }
  }, []);

  // Debounce translation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceText.trim()) {
        translateText(sourceText);
      } else {
        setTargetText('');
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [sourceText]);

  const translateText = async (text: string) => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: 'zh', targetLang: 'en' }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTargetText(data.translatedText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTargetText('');
  };

  const handleCopy = async () => {
    if (targetText) {
      await navigator.clipboard.writeText(targetText);
    }
  };

  const handleSpeak = () => {
    if (!targetText || typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-gray-100 dark:bg-gray-950 p-4 md:p-6 gap-4 md:gap-6">
      <div className="flex-1 min-h-0 h-[45vh] md:h-full">
        <TranslationCard
          title="中文 (Chinese)"
          value={sourceText}
          onChange={setSourceText}
          placeholder="请输入中文或点击麦克风说话..."
          leftActionIcon={<Mic className={isRecording ? "animate-pulse" : ""} size={20} />}
          leftActionLabel={isRecording ? "正在聆听..." : "语音输入"}
          onLeftAction={toggleRecording}
          isActiveLeftAction={isRecording}
          rightActionIcon={<X size={20} />}
          rightActionLabel="清空"
          onRightAction={handleClear}
        />
      </div>
      
      <div className="flex-1 min-h-0 h-[45vh] md:h-full">
        <TranslationCard
          title="English"
          value={targetText}
          readOnly={true}
          isTranslating={isTranslating}
          placeholder="Translation will appear here..."
          leftActionIcon={<Volume2 size={20} />}
          leftActionLabel="朗读"
          onLeftAction={handleSpeak}
          rightActionIcon={<Copy size={20} />}
          rightActionLabel="复制"
          onRightAction={handleCopy}
        />
      </div>
    </main>
  );
}