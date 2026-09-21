import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: (finalTranscript: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: (options?: { lang?: string }) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({
  lang = 'ar-SA',
  continuous = false,
  interimResults = true,
  onResult,
  onEnd,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Speech recognition stop error:', e);
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(
    (customOptions?: { lang?: string }) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('خاصية الإدخال الصوتي غير مدعومة في هذا المتصفح. يمكنك تجربة Chrome أو Edge.');
        return;
      }

      // Stop previous instance if running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      setError(null);
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = customOptions?.lang || lang || 'ar-SA';
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            if (result.isFinal) {
              currentFinal += text;
            } else {
              currentInterim += text;
            }
          }

          if (currentFinal) {
            finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + currentFinal).trim();
            setTranscript(finalTranscriptRef.current);
            onResult?.(finalTranscriptRef.current);
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          let errorMsg = 'حدث خطأ أثناء الاستماع';
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            errorMsg = 'تم رفض الإذن للوصول للميكروفون. يرجى تفعيل الميكروفون من إعدادات المتصفح.';
          } else if (event.error === 'no-speech') {
            errorMsg = 'لم يتم رصد أي صوت. اضغط وتحدث بوضوح.';
          } else if (event.error === 'network') {
            errorMsg = 'مشكلة في اتصال الشبكة لخدمة التعرف على الصوت.';
          }
          setError(errorMsg);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
          const fullResult = finalTranscriptRef.current.trim();
          onEnd?.(fullResult);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Failed to initialize speech recognition:', err);
        setError('تعذر بدء التسجيل الصوتي.');
        setIsListening(false);
      }
    },
    [continuous, interimResults, lang, onEnd, onResult]
  );

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
