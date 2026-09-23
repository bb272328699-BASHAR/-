import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Play, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Film, 
  Monitor, 
  Smartphone, 
  RefreshCw, 
  Clock, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { updateDocumentSEO } from '../utils/seo.ts';

interface AIVideoGeneratorPageProps {
  navigate: (path: string) => void;
}

export const AIVideoGeneratorPage: React.FC<AIVideoGeneratorPageProps> = ({ navigate }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<any>(null);

  const samplePrompts = [
    'Cinematic drone shot soaring above futuristic neon-lit Dubai skyscrapers at sunset, 4k ultra realistic',
    'A majestic white robotic tiger pacing through a glowing bioluminescent forest, highly detailed VFX',
    'Cozy cyberpunk coffee shop interior with rain pouring on glass windows, warm amber lighting',
    'A futuristic sports car accelerating through a hyper-speed neon tunnel, dramatic motion blur',
  ];

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    updateDocumentSEO({
      title: 'مولد الفيديو بالذكاء الاصطناعي Veo 3 | دليل الذكاء الاصطناعي',
      description: 'قم بتوليد فيديوهات سينمائية مذهلة من النصوص باستخدام نموذج Veo 3 المتطور (veo-3.1-fast-generate-preview) بدقة عالية وأبعاد 16:9 أو 9:16.',
      canonicalUrl: `${origin}/ai-video-generator`,
      ogType: 'website',
    });
    window.scrollTo(0, 0);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading || polling) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setOperationName(null);
    setStatusMessage('جاري إرسال طلب التوليد إلى نموذج Veo 3 المتطور...');

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, resolution }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل بدء عملية توليد الفيديو');

      setOperationName(data.operationName);
      setLoading(false);
      setPolling(true);
      setStatusMessage('جاري معالجة الفيديو وتوليد الإطارات عبر Veo 3 (قد يستغرق بضع دقائق)...');

      // Start polling
      startPolling(data.operationName);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setLoading(false);
      setPolling(false);
    }
  };

  const startPolling = (opName: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/ai/poll-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });
        const data = await res.json();

        if (res.ok && data.done) {
          clearInterval(pollTimerRef.current);
          setPolling(false);
          if (data.videoUri) {
            setVideoUrl(data.videoUri);
            setStatusMessage('تم توليد الفيديو بنجاح وجاهز للمشاهدة والتحميل!');
          } else {
            setError('اكتملت العملية ولكن تعذر استرداد رابط الفيديو.');
          }
        } else if (!res.ok) {
          clearInterval(pollTimerRef.current);
          setPolling(false);
          setError(data.error || 'فشل التحقق من حالة الفيديو');
        }
      } catch (e: any) {
        // Continue polling on transient network hiccups
      }
    }, 8000); // Poll every 8 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30 transition-all cursor-pointer mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى الرئيسية</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black border border-amber-500/30">
            <Video className="w-4 h-4" />
            <span>مدعوم بنموذج Veo 3 المتطور (veo-3.1-fast-generate-preview)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            مولد الفيديو السينمائي بالذكاء الاصطناعي
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            اكتب وصفاً تخيلياً مفصلاً، واترك لنموذج Veo 3 مهمة تحويل كلماتك إلى مقطع فيديو سينمائي مذهل بدقة عالية وأبعاد مخصصة.
          </p>
        </div>

        {/* Generator Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-200">
                وصف الفيديو المطلوب (Prompt):
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="مثال: لقطة سينمائية طائرة فوق أبراج دبي المستقبلية المضاءة بأضواء النيون عند غروب الشمس..."
                className="w-full rounded-2xl border border-indigo-900/60 bg-slate-950/80 p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner resize-none"
                required
              />

              {/* Sample prompts */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-2 font-medium">أمثلة مقترحة للاختبار السريع:</span>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      className="text-xs bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 px-3 py-1.5 rounded-xl border border-indigo-800/50 transition-all text-right truncate max-w-full cursor-pointer"
                    >
                      {sample.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-900/40">
              
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">أبعاد الفيديو (Aspect Ratio):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950/60 border-indigo-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>16:9 (أفقي / سينمائي)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950/60 border-indigo-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>9:16 (عمودي / ستوري)</span>
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">الدقة المطلوبة (Resolution):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      resolution === '720p'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950/60 border-indigo-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span>720p HD (سريع)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      resolution === '1080p'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950/60 border-indigo-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span>1080p Full HD</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || polling || !prompt.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {loading || polling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-200" />
                    <span>{loading ? 'جاري بدء التوليد...' : 'جاري معالجة الفيديو عبر Veo 3...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>توليد الفيديو السينمائي الآن (Veo 3)</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Status / Loading Notification */}
          {(loading || polling || statusMessage) && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-3 text-xs text-indigo-200">
              <Clock className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-3 text-xs text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Result View */}
          {videoUrl && (
            <div className="space-y-4 pt-6 border-t border-indigo-900/50 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم توليد الفيديو بنجاح بواسطة Veo 3!</span>
                </div>

                <a
                  href={videoUrl}
                  download="veo3-ai-generated-video.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الفيديو (MP4)</span>
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black border border-indigo-900/80 shadow-2xl flex items-center justify-center">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full max-h-[500px] object-contain rounded-2xl"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
