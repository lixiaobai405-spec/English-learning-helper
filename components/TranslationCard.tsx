import React from 'react';

interface TranslationCardProps {
  title: string;
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  isTranslating?: boolean;
  leftActionIcon: React.ReactNode;
  leftActionLabel: string;
  onLeftAction: () => void;
  rightActionIcon: React.ReactNode;
  rightActionLabel: string;
  onRightAction: () => void;
  isActiveLeftAction?: boolean;
}

export default function TranslationCard({
  title, value, onChange, placeholder, readOnly = false,
  isTranslating = false, leftActionIcon, leftActionLabel, onLeftAction,
  rightActionIcon, rightActionLabel, onRightAction, isActiveLeftAction = false
}: TranslationCardProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-medium text-gray-500 dark:text-gray-400">
        {title}
      </div>
      
      <div className="flex-1 p-4 relative">
        {isTranslating && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
            <div className="animate-pulse text-blue-500">Translating...</div>
          </div>
        )}
        {readOnly ? (
          <div className="w-full h-full resize-none outline-none text-xl sm:text-2xl text-gray-800 dark:text-gray-100 bg-transparent overflow-y-auto break-words">
            {value || placeholder}
          </div>
        ) : (
          <textarea
            className="w-full h-full resize-none outline-none text-xl sm:text-2xl text-gray-800 dark:text-gray-100 bg-transparent placeholder-gray-300 dark:placeholder-gray-600"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={onLeftAction}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActiveLeftAction ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
        >
          {leftActionIcon}
          <span className="text-sm font-medium">{leftActionLabel}</span>
        </button>
        
        <button 
          onClick={onRightAction}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          {rightActionIcon}
          <span className="text-sm font-medium">{rightActionLabel}</span>
        </button>
      </div>
    </div>
  );
}