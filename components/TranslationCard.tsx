import React from 'react';

interface TranslationCardProps {
  title: string;
  text: string;
  placeholder?: string;
  isReadOnly?: boolean;
  voice?: string;
  // 新增：音频状态，用来控制图标变成“转圈圈”、“停止”还是“播放”
  audioStatus?: 'idle' | 'loading' | 'playing';
  onTextChange?: (text: string) => void;
  onVoiceChange?: (voice: string) => void;
  onPlay?: () => void;
  onDownload?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
  onReplay?: () => void;
}

export default function TranslationCard({
  title, text, placeholder, isReadOnly = false, voice = 'zhiwei', audioStatus = 'idle',
  onTextChange, onVoiceChange, onPlay, onDownload, onClear, onCopy,onReplay
}: TranslationCardProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
      </div>

      <div className="flex-grow p-4 relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange?.(e.target.value)}
          readOnly={isReadOnly && !onTextChange}
          placeholder={placeholder}
          className="w-full h-full min-h-[200px] resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200 text-lg leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600"
        />
      </div>

      <div className="px-4 py-3 flex justify-between items-center border-t border-gray-50 dark:border-gray-700/50">
        {/* 音色选择框：增加了纯中文音色 */}
        <div className="flex items-center">
          {onVoiceChange && (
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-2 py-1 outline-none cursor-pointer border-r-8 border-transparent"
            >
              <option value="zhiyuan">🇨🇳 标准中文女声 (知媛)</option>
              <option value="zhida">🇨🇳 标准中文男声 (知达)</option>
              <option value="zhiwei">👧 优质双语女童 (知微)</option>
              <option value="zhina">👩 纯正美音女声 (知娜)</option>
              <option value="abby">🇺🇸 地道美式电台 (Abby)</option>
              <option value="andy">🇺🇸 磁性美音男声 (Andy)</option>
            </select>
          )}
        </div>

        <div className="flex gap-2">
          {onPlay && (
            <button 
              onClick={onPlay} 
              className={`p-2 rounded-full transition-colors ${audioStatus === 'playing' ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
              title={audioStatus === 'playing' ? '停止朗读' : '朗读全部'}
            >
              {audioStatus === 'loading' ? (
                <svg className="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : audioStatus === 'playing' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors" title="导出全部 MP3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          )}
          {/* 1. 新增：重播/从头开始读 图标 */}
          {onReplay && (
            <button onClick={onReplay} title="从头重播" className="p-1 hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="复制">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          )}
          {onClear && (
            <button onClick={onClear} title="清空内容" className="p-1 hover:text-red-500 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
            </button>
           )}
        </div>
      </div>
    </div>
  );
}