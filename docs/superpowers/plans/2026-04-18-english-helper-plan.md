# English Learning Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, PWA-enabled Next.js web application for English-Chinese two-way translation with Voice-to-Text (STT) and Text-to-Speech (TTS) capabilities.

**Architecture:** A Next.js (App Router) application. The frontend uses a dual-card layout (vertical on mobile, horizontal on desktop) built with TailwindCSS. The backend consists of Next.js API Routes to securely call third-party AI/translation APIs. State management is handled locally in React components.

**Tech Stack:** Next.js (App Router), React, TailwindCSS, next-pwa, Lucide React (Icons), Web Speech API (fallback/native) or Third-party API integration for TTS/STT.

---

## Phase 1: Project Setup and Base Configuration

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, etc.
- Create: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Scaffold Next.js project**
Run the following command to create a new Next.js project with TailwindCSS and TypeScript in the current directory (force clean if needed, or create in a temp dir and move):
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Install dependencies**
```bash
npm install next-pwa lucide-react
npm install -D @types/negotiator
```

- [ ] **Step 3: Configure PWA**
Modify `next.config.mjs`:
```javascript
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
```

- [ ] **Step 4: Create PWA Manifest and Icons**
Create `public/manifest.json`:
```json
{
  "name": "English Helper",
  "short_name": "EngHelper",
  "description": "A smart translation and voice assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
*(Note: Create placeholder 192x192 and 512x512 PNGs in `public/` directory during execution).*

- [ ] **Step 5: Link Manifest in Layout**
Modify `app/layout.tsx` to include the manifest:
```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Helper",
  description: "A smart translation and voice assistant",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "chore: initialize Next.js project with Tailwind and PWA"
```

---

## Phase 2: UI Component Development

### Task 2: Build the Main Layout and Cards

**Files:**
- Modify: `app/page.tsx`
- Create: `components/TranslationCard.tsx`

- [ ] **Step 1: Create TranslationCard component**
Create `components/TranslationCard.tsx`:
```tsx
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
```

- [ ] **Step 2: Implement Responsive Main Page**
Modify `app/page.tsx`:
```tsx
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
```

- [ ] **Step 3: Test Layout**
Run `npm run dev` and ensure the cards stack vertically on mobile screens and side-by-side horizontally on desktop screens (`md:` breakpoint).

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx components/TranslationCard.tsx
git commit -m "feat: implement responsive dual-card layout"
```

---

## Phase 3: Core API Routes & Services

### Task 3: Translation API Route

**Files:**
- Create: `app/api/translate/route.ts`

- [ ] **Step 1: Implement Translation API Route**
We will implement a simple translation API using the free MyMemory translation API (or a placeholder for OpenAI/DeepSeek if keys are provided). For immediate out-of-the-box working, we use MyMemory.

Create `app/api/translate/route.ts`:
```typescript
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
```

- [ ] **Step 2: Commit**
```bash
git add app/api/translate/route.ts
git commit -m "feat: add translation API route"
```

### Task 4: Web Speech API Integration (Frontend STT & TTS)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add TTS (Text-to-Speech) logic**
Update `app/page.tsx` to handle speaking the target text using native Web Speech API:

```typescript
// Inside Home component:
  const handleSpeak = () => {
    if (!targetText || typeof window === 'undefined') return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };
```
*Update the `onLeftAction` in the target `TranslationCard` to use `handleSpeak`.*

- [ ] **Step 2: Add STT (Speech-to-Text) logic**
Update `app/page.tsx` to handle speech recognition:

```typescript
// Inside Home component, add a ref for recognition:
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize SpeechRecognition on mount
  import { useEffect } from 'react';
  
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
```
*Update the `onLeftAction` in the source `TranslationCard` to use `toggleRecording`.*

- [ ] **Step 3: Connect Translation API with Debounce**
Add a debounce effect to translate when the user stops typing or speaking:

```typescript
// Add to Home component
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
```

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx
git commit -m "feat: integrate STT, TTS, and Translation API"
```

---

## Phase 4: Final Polish and Sync

### Task 5: UI Polish and GitHub Sync

**Files:**
- Create: `public/icon-192x192.png`, `public/icon-512x512.png`
- Run: `git push`

- [ ] **Step 1: Add placeholder icons for PWA**
Create dummy icons using ImageMagick or standard copy:
```bash
# Example if no icons available, create empty blue squares (requires ImageMagick if available, or just standard base64 generation script)
mkdir -p public
echo '<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#007bff"/></svg>' > public/icon-192x192.svg
echo '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#007bff"/></svg>' > public/icon-512x512.svg
# Note: Manifest should be updated to point to .svg if .png is not easily generated, or user can replace them later.
```

Update `public/manifest.json` to use `.svg` if you skipped `.png` generation:
```json
{
  "name": "English Helper",
  "short_name": "EngHelper",
  "description": "A smart translation and voice assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 2: Sync to GitHub**
Run the push command to deploy changes to the user's repository:
```bash
git add .
git commit -m "chore: add PWA icons and finalize integration"
git push origin main
```

---
