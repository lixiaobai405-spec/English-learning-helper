'use client';

import { useState } from 'react';
import { Mic, X, Volume2, Copy } from 'lucide-react';
import TranslationCard from '@/components/TranslationCard';

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleClear = () => {
    setSourceText('');
    setTargetText('');
  };

  const handleCopy = async () => {
    if (targetText) {
      await navigator.clipboard.writeText(targetText);
      // Optional: Add toast notification here
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
          onLeftAction={() => setIsRecording(!isRecording)}
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
          onLeftAction={() => console.log('Speak target text')}
          rightActionIcon={<Copy size={20} />}
          rightActionLabel="复制"
          onRightAction={handleCopy}
        />
      </div>
    </main>
  );
}