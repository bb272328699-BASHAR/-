import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  SlidersHorizontal, 
  Wand2, 
  Loader2, 
  Tag, 
  ThumbsUp, 
  BookOpen, 
  Cpu, 
  ArrowRight,
  Filter,
  Edit3,
  ExternalLink,
  FileDown,
  X
} from 'lucide-react';

interface PromptsHubPageProps {
  navigate: (path: string) => void;
}

interface PromptItem {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  targetTool: string;
  description: string;
  promptTemplate: string;
  tags: string[];
  likes: number;
  isPopular?: boolean;
}

export const PromptsHubPage: React.FC<PromptsHubPageProps> = ({ navigate }) => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Prompt Generator State
  const [generatorTask, setGeneratorTask] = useState('');
  const [targetModel, setTargetModel] = useState('ChatGPT (GPT-4o)');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    prompt: string;
    tips: string[];
    variables: string[];
  } | null>(null);

  // Interactive Prompt Customizer State
  const [customizingPrompt, setCustomizingPrompt] = useState<PromptItem | null>(null);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [customCopied, setCustomCopied] = useState(false);

  const extractVariables = (template: string) => {
    const matches = template.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
  };

  const handleOpenCustomizer = (p: PromptItem) => {
    setCustomizingPrompt(p);
    const vars = extractVariables(p.promptTemplate);
    const initialVars: Record<string, string> = {};
    vars.forEach((v) => {
      initialVars[v] = '';
    });
    setCustomVariables(initialVars);
    setCustomCopied(false);
  };

  const getFilledPrompt = () => {
    if (!customizingPrompt) return '';
    let text = customizingPrompt.promptTemplate;
    Object.entries(customVariables).forEach(([key, val]) => {
      if (val.trim()) {
        text = text.replaceAll(`[${key}]`, val.trim());
      }
    });
    return text;
  };

  useEffect(() => {
    fetchPrompts();
  }, [selectedCategory]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const url = `/api/prompts?category=${selectedCategory}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (e) {
      console.error('Error fetching prompts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrompts();
  };

  const handleGeneratePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorTask.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: generatorTask.trim(),
          targetModel
        })
      });
      const data = await res.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error('Error generating prompt:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'writing', name: 'كتابة المحتوى والـ SEO' },
    { id: 'coding', name: 'البرمجة والأكواد' },
    { id: 'design', name: 'التصميم وتوليد الصور' },
    { id: 'marketing', name: 'التسويق والأعمال' },
    { id: 'research', name: 'البحث والبيانات' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-purple-700 shadow-2xs">
          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
          <span>مكتبة ومولد الأوامر الذكية (AI Prompts Hub)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          أفضل أوامر الذكاء الاصطناعي الجاهزة والمولدة بالذكاء الاصطناعي
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          تصفح مكتبة من الأوامر الاحترافية المجربة لنماذج ChatGPT، Claude، Midjourney، أو استخدم المولد الذكي لصياغة أمر مخصص لمشروعك فوراً.
        </p>
      </div>

      {/* 1. Custom AI Prompt Generator Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">مولد الأوامر والبرومبتات التفاعلي المخصص</h2>
              <p className="text-xs text-slate-400 mt-0.5">اكتب فكرتك وسيقوم الذكاء الاصطناعي بهندسة برومبت احترافي جاهز للنسخ والتنفيذ</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl w-fit">
            هندسة أوامر احترافية (Prompt Engineering)
          </span>
        </div>

        <form onSubmit={handleGeneratePrompt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ما الذي تريد من الذكاء الاصطناعي إنجازه؟ (المهمة أو الهدف)
              </label>
              <input
                type="text"
                value={generatorTask}
                onChange={(e) => setGeneratorTask(e.target.value)}
                placeholder="مثال: تحليل ميزانية تسويقية لشركة تجارة إلكترونية، أو كتابة قصة إعلانية قصيرة..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                النموذج أو الأداة المستهدفة:
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                <option value="Cursor AI">Cursor AI</option>
                <option value="Midjourney v6">Midjourney v6</option>
                <option value="Gemini Pro">Google Gemini</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating || !generatorTask.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري هندسة وصياغة البرومبت...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>توليد البرومبت بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result of Generated Prompt */}
        {generatedResult && (
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                البرومبت الاحترافي المصاغ:
              </span>
              <button
                onClick={() => copyToClipboard(generatedResult.prompt, 'generated-prompt')}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-white"
              >
                {copiedId === 'generated-prompt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ البرومبت</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-line leading-relaxed select-all">
              {generatedResult.prompt}
            </div>

            {generatedResult.tips && generatedResult.tips.length > 0 && (
              <div className="space-y-1.5 text-xs text-slate-400">
                <span className="font-bold text-slate-300 block">نصائح إضافية لتحقيق أفضل نتيجة:</span>
                <ul className="list-disc list-inside space-y-1">
                  {generatedResult.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Curated Prompts Catalog */}
      <div className="space-y-6">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأوامر والكلمات..."
              className="w-full pr-10 pl-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </form>

        </div>

        {/* Prompts Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">جاري تحميل الأوامر الجاهزة...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-600">لا توجد أوامر مطابقة لهذا البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prompts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {p.categoryName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                      مناسب لـ: {p.targetTool}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>

                  <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {p.promptTemplate}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenCustomizer(p)}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-200/60"
                      title="تخصيص المتغيرات والأهداف"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تخصيص</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(p.promptTemplate, p.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Interactive Variable Customizer Modal */}
      {customizingPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {customizingPrompt.categoryName}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{customizingPrompt.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{customizingPrompt.description}</p>
              </div>
              <button
                onClick={() => setCustomizingPrompt(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Variable Inputs */}
            {Object.keys(customVariables).length > 0 ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>عوامل التخصيص التفاعلية (املأ المتغيرات ليتم تطبيقها فوراً):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {Object.keys(customVariables).map((key) => (
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        [{key}]
                      </label>
                      <input
                        type="text"
                        value={customVariables[key]}
                        onChange={(e) =>
                          setCustomVariables((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={`أدخل قيمة ${key}...`}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                هذا الأمر لا يحتوي على متغيرات محصورة بين أقواس، يمكنك تعديله أو نسخه مباشرة.
              </div>
            )}

            {/* Live Prompt Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">الأمر بعد التخصيص:</span>
                <span className="text-[10px] text-emerald-600 font-bold">جاهز للتنفيذ والنسخ المباشر</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto border border-slate-800 selection:bg-indigo-500">
                {getFilledPrompt()}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <a
                  href={`https://chatgpt.com/?q=${encodeURIComponent(getFilledPrompt())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl transition-colors border border-emerald-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في ChatGPT</span>
                </a>
                <a
                  href="https://claude.ai/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-2 rounded-xl transition-colors border border-amber-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في Claude</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([getFilledPrompt()], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `prompt_${customizingPrompt.id}.txt`;
                    a.click();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  title="تحميل كملف نصي"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>تحميل .txt</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getFilledPrompt());
                    setCustomCopied(true);
                    setTimeout(() => setCustomCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {customCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الأمر المخصص</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
