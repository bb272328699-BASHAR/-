import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  ArrowLeft, 
  Layers, 
  FileText, 
  Scale, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star, 
  CheckCircle,
  CornerDownLeft,
  Compass,
  Mic,
  MicOff,
  Bot,
  Zap,
  Tag,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { OptimizedImage } from './OptimizedImage.tsx';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_TOOLS, 
  DEFAULT_COMPARISONS, 
  DEFAULT_TUTORIALS, 
  DEFAULT_ARTICLES 
} from '../data/defaultCatalog.ts';
import { useSpeechRecognition } from '../utils/speechRecognition.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  initialVoiceMode?: boolean;
}

interface SuggestionData {
  query: string;
  suggestions: string[];
  tools: any[];
  articles: any[];
  categories: any[];
  comparisons?: any[];
  tutorials?: any[];
  // Semantic search additions
  interpretedIntent?: string;
  correctedKeywords?: string[];
  suggestedQueries?: string[];
  isAiPowered?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  navigate,
  initialVoiceMode = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tools' | 'categories' | 'articles' | 'comparisons'>('all');
  const [searchMode, setSearchMode] = useState<'smart' | 'instant'>('smart');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar-SA' | 'ar-EG' | 'en-US'>('ar-SA');
  
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daleel_recent_searches');
      return saved ? JSON.parse(saved) : ['ChatGPT', 'Midjourney', 'كتابة المحتوى', 'البرمجة'];
    } catch {
      return ['ChatGPT', 'Midjourney'];
    }
  });

  const [suggestionsData, setSuggestionsData] = useState<SuggestionData>({
    query: '',
    suggestions: ['ChatGPT', 'Midjourney', 'Claude 3.5', 'توليد الصور', 'البرمجة بالأكواد', 'كتابة المحتوى'],
    tools: [],
    articles: [],
    categories: [],
    comparisons: [],
    tutorials: [],
    interpretedIntent: '',
    correctedKeywords: [],
    suggestedQueries: [],
    isAiPowered: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition hook
  const handleVoiceResult = useCallback((recognizedText: string) => {
    if (recognizedText.trim()) {
      setSearchTerm(recognizedText.trim());
    }
  }, []);

  const handleVoiceEnd = useCallback((finalText: string) => {
    if (finalText.trim()) {
      setSearchTerm(finalText.trim());
      // Trigger instant semantic search
      triggerSemanticSearch(finalText.trim());
    }
  }, []);

  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    lang: selectedLanguage,
    onResult: handleVoiceResult,
    onEnd: handleVoiceEnd
  });

  // Save search to recent searches
  const recordSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches(prev => {
      const next = [clean, ...prev.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('daleel_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('daleel_recent_searches');
    } catch {}
  };

  // Perform Gemini AI Semantic Search
  const triggerSemanticSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setLoading(true);
    try {
      const res = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestionsData(prev => ({
          ...prev,
          query: q,
          tools: data.matchedTools || [],
          categories: data.matchedCategories || [],
          articles: data.matchedArticles || [],
          interpretedIntent: data.interpretedIntent || '',
          correctedKeywords: data.correctedKeywords || [],
          suggestedQueries: data.suggestedQueries || [],
          isAiPowered: true,
        }));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Semantic search fetch error:', err);
    }

    // Heuristic fallback if network fails
    performInstantSearch(q);
  };

  // Perform Fast / Instant Keyword Search
  const performInstantSearch = async (q: string) => {
    try {
      const queryParam = encodeURIComponent(q);
      const res = await fetch(`/api/search/suggestions?q=${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestionsData({
          ...data,
          interpretedIntent: '',
          isAiPowered: false,
        });
        setLoading(false);
        return;
      }
    } catch (e) {}

    // In-memory fallback
    const lower = q.toLowerCase();
    const matchedTools = DEFAULT_TOOLS.filter(t => 
      t.name?.toLowerCase().includes(lower) || 
      (t.tagline && t.tagline.toLowerCase().includes(lower)) || 
      (t.description && t.description.toLowerCase().includes(lower))
    );
    const matchedCats = DEFAULT_CATEGORIES.filter(c => 
      c.name?.toLowerCase().includes(lower) || 
      (c.description && c.description.toLowerCase().includes(lower))
    );
    const matchedArts = DEFAULT_ARTICLES.filter(a => 
      a.title?.toLowerCase().includes(lower) || 
      (a.excerpt && a.excerpt.toLowerCase().includes(lower))
    );

    setSuggestionsData({
      query: q,
      suggestions: matchedTools.map(t => t.name).slice(0, 5),
      tools: matchedTools,
      articles: matchedArts,
      categories: matchedCats,
      comparisons: DEFAULT_COMPARISONS.filter(c => c.title.toLowerCase().includes(lower)),
      tutorials: DEFAULT_TUTORIALS.filter(t => t.title.toLowerCase().includes(lower)),
      interpretedIntent: '',
      isAiPowered: false,
    });
    setLoading(false);
  };

  // Load initial suggestions or trending items on modal open
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIndex(-1);
      setActiveFilter('all');
      stopListening();
      resetTranscript();
      return;
    }

    // Auto-focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
      if (initialVoiceMode && isVoiceSupported) {
        startListening({ lang: selectedLanguage });
      }
    }, 150);

    // Fetch initial trending data
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/search/suggestions');
        if (res.ok) {
          const data = await res.json();
          setSuggestionsData({
            ...data,
            interpretedIntent: '',
            isAiPowered: false,
          });
          return;
        }
      } catch (err) {}
      // Fallback
      setSuggestionsData({
        query: '',
        suggestions: ['ChatGPT', 'Midjourney', 'Claude 3.5', 'Cursor AI', 'توليد الصور', 'البرمجة بالأكواد', 'كتابة المحتوى'],
        tools: DEFAULT_TOOLS.slice(0, 6),
        articles: DEFAULT_ARTICLES.slice(0, 3),
        categories: DEFAULT_CATEGORIES.slice(0, 6),
        comparisons: DEFAULT_COMPARISONS,
        tutorials: DEFAULT_TUTORIALS,
        interpretedIntent: '',
        isAiPowered: false,
      });
    };

    fetchInitialData();
  }, [isOpen, initialVoiceMode, isVoiceSupported, selectedLanguage]);

  // Handle Search Input Change
  useEffect(() => {
    if (!isOpen) return;

    const q = searchTerm.trim();
    if (!q) {
      setLoading(false);
      setSuggestionsData(prev => ({
        ...prev,
        interpretedIntent: '',
        isAiPowered: false,
        tools: DEFAULT_TOOLS.slice(0, 6),
        categories: DEFAULT_CATEGORIES.slice(0, 6),
        articles: DEFAULT_ARTICLES.slice(0, 3),
      }));
      return;
    }

    setLoading(true);

    const isLongOrConversational = q.split(' ').length >= 3 || 
      /أبي|احتاج|برنامج|تطبيق|أداة|شلون|كيف|يسوي|تصميم|محرر|بديل|صوت|فيديو|ترجمة/i.test(q);

    const timer = setTimeout(() => {
      if (searchMode === 'smart' || isLongOrConversational) {
        triggerSemanticSearch(q);
      } else {
        performInstantSearch(q);
      }
      setSelectedIndex(-1);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm, searchMode, isOpen]);

  // Flattened navigable items for keyboard navigation
  const navigableItems = React.useMemo(() => {
    const items: { type: string; title: string; path: string }[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'tools') {
      suggestionsData.tools.forEach(t => {
        items.push({ type: 'tool', title: t.name, path: `/tools/${t.slug}` });
      });
    }
    if (activeFilter === 'all' || activeFilter === 'categories') {
      suggestionsData.categories.forEach(c => {
        items.push({ type: 'category', title: c.name, path: `/categories/${c.slug}` });
      });
    }
    if (activeFilter === 'all' || activeFilter === 'articles') {
      suggestionsData.articles.forEach(a => {
        items.push({ type: 'article', title: a.title, path: `/articles/${a.slug}` });
      });
    }
    if (activeFilter === 'all' || activeFilter === 'comparisons') {
      suggestionsData.comparisons?.forEach(cp => {
        items.push({ type: 'comparison', title: cp.title, path: `/comparisons` });
      });
    }

    return items;
  }, [suggestionsData, activeFilter]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < navigableItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : navigableItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
          const selected = navigableItems[selectedIndex];
          recordSearch(selected.title);
          navigate(selected.path);
          onClose();
        } else if (searchTerm.trim()) {
          recordSearch(searchTerm.trim());
          navigate(`/ai-tools?search=${encodeURIComponent(searchTerm.trim())}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, navigableItems, searchTerm, navigate, onClose]);

  // Highlight matched substrings in Arabic or English
  const highlightMatch = (text: string, queryText: string) => {
    if (!queryText.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${queryText.trim()})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === queryText.trim().toLowerCase() ? (
            <mark key={i} className="bg-indigo-100 text-indigo-900 rounded-sm px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening({ lang: selectedLanguage });
    }
  };

  if (!isOpen) return null;

  const hasResults = 
    suggestionsData.tools.length > 0 || 
    suggestionsData.categories.length > 0 || 
    suggestionsData.articles.length > 0 ||
    (suggestionsData.comparisons && suggestionsData.comparisons.length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls (Mode & Voice Language) */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold hidden sm:inline">نمط البحث:</span>
            <button
              onClick={() => setSearchMode('smart')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                searchMode === 'smart'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>بحث دلالي ذكي (Gemini AI)</span>
            </button>
            <button
              onClick={() => setSearchMode('instant')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                searchMode === 'instant'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3 h-3 text-slate-400" />
              <span>بحث سريع</span>
            </button>
          </div>

          {/* Voice Language Selector */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-700 outline-none"
              title="لغة الإدخال الصوتي"
            >
              <option value="ar-SA">العربية (السعودية والخليج)</option>
              <option value="ar-EG">العربية (مصر والشام)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-white relative">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            searchMode === 'smart' 
              ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-indigo-50 text-indigo-600'
          }`}>
            {searchMode === 'smart' ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <Search className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                searchMode === 'smart' 
                  ? 'تحدث أو اكتب ما تحتاجه بالمعنى (مثال: أداة لتعديل الصوت بالذكاء، تصميم صور سينمائية)...'
                  : 'ابحث عن اسم الأداة أو التصنيف...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-base sm:text-lg font-medium"
            />
            {interimTranscript && isListening && (
              <p className="text-xs text-indigo-600 font-medium animate-pulse mt-0.5">
                جاري الاستماع: "{interimTranscript}"
              </p>
            )}
          </div>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`relative p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105 ring-4 ring-rose-200 animate-pulse'
                : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200'
            }`}
            title={isListening ? 'إيقاف الاستماع الصوتي' : 'البحث الصوتي الذكي'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
            )}
          </button>

          {loading ? (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
          ) : searchTerm ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                resetTranscript();
                inputRef.current?.focus();
              }} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="مسح النص"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <div className="hidden sm:flex items-center gap-1.5 pl-1">
            <kbd className="text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Voice Listening Active Waveform Banner */}
        {isListening && (
          <div className="px-5 py-3 bg-gradient-to-r from-rose-50 via-indigo-50 to-rose-50 border-b border-rose-200 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-bounce">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  نحن نستمع إليك الآن... تحدث بطلبك أو استفسارك باللغة العربية
                </p>
                <p className="text-[11px] text-slate-500">
                  {transcript || 'مثال: "أريد أداة مجانية لتلخيص مقاطع اليوتيوب وتفريغها"'}
                </p>
              </div>
            </div>

            <button
              onClick={stopListening}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              تم التحدث
            </button>
          </div>
        )}

        {/* Voice Error Banner */}
        {voiceError && !isListening && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              onClick={() => resetTranscript()}
              className="text-amber-700 hover:underline text-[11px] font-bold cursor-pointer"
            >
              إخفاء
            </button>
          </div>
        )}

        {/* Gemini AI Semantic Intent Understanding Banner */}
        {suggestionsData.interpretedIntent && (
          <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 border-b border-indigo-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1">
                  فهم الذكاء الاصطناعي (Gemini Semantic Comprehension)
                </span>
                <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  AI Grounded
                </span>
              </div>
              <p className="text-xs text-indigo-900 font-medium leading-relaxed mt-0.5">
                {suggestionsData.interpretedIntent}
              </p>

              {suggestionsData.suggestedQueries && suggestionsData.suggestedQueries.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-1.5 border-t border-indigo-200/50">
                  <span className="text-[10px] font-bold text-indigo-800">أسئلة وبدائل مقترحة:</span>
                  {suggestionsData.suggestedQueries.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(sq);
                        triggerSemanticSearch(sq);
                      }}
                      className="text-[11px] bg-white/80 hover:bg-white text-indigo-700 hover:text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200 font-medium transition-colors cursor-pointer"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs Bar */}
        <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveFilter('tools')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'tools'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            الأدوات ({suggestionsData.tools.length})
          </button>
          <button
            onClick={() => setActiveFilter('categories')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'categories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3 h-3" />
            التصنيفات ({suggestionsData.categories.length})
          </button>
          <button
            onClick={() => setActiveFilter('articles')}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'articles'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3 h-3" />
            المقالات ({suggestionsData.articles.length})
          </button>
          {suggestionsData.comparisons && suggestionsData.comparisons.length > 0 && (
            <button
              onClick={() => setActiveFilter('comparisons')}
              className={`text-xs px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'comparisons'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3 h-3" />
              المقارنات ({suggestionsData.comparisons.length})
            </button>
          )}
        </div>

        {/* Recent Searches & Quick Suggestions */}
        {!searchTerm.trim() && (
          <div className="px-4 py-3 bg-white border-b border-slate-100 space-y-2">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    عمليات البحث الأخيرة:
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[10px] text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    مسح السجل
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recentSearches.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchTerm(rec);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all cursor-pointer"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestionsData.suggestions && suggestionsData.suggestions.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1.5">
                  <TrendingUp className="w-3 h-3 text-indigo-500" />
                  الأكثر بحثاً اليوم:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {suggestionsData.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(sug);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 whitespace-nowrap transition-all cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results / Auto-suggestions Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {!searchTerm.trim() && !hasResults ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Compass className="w-10 h-10 mx-auto text-indigo-300 stroke-1" />
              <div>
                <p className="text-sm font-bold text-slate-700">ابدأ الكتابة أو اضغط الميكروفون للتحدث</p>
                <p className="text-xs text-slate-400 mt-1">البحث الدلالي يفهم ما تقصده حتى لو لم تذكر اسم الأداة بدقة</p>
              </div>
            </div>
          ) : !hasResults && !loading ? (
            <div className="py-10 text-center text-slate-500 space-y-3">
              <p className="text-base font-bold text-slate-800">لم نعثر على نتائج مطابقة لـ "{searchTerm}"</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يمكنك الضغط أدناه لتصفح الدليل الشامل أو استشارة المستشار الذكي المتخصص.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    recordSearch(searchTerm.trim());
                    navigate(`/advisor`);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>اسأل المستشار الذكي</span>
                </button>
                <button
                  onClick={() => {
                    recordSearch(searchTerm.trim());
                    navigate(`/ai-tools?search=${encodeURIComponent(searchTerm.trim())}`);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <span>استكشاف كافة أدوات الدليل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: Tools */}
              {(activeFilter === 'all' || activeFilter === 'tools') && suggestionsData.tools.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      أدوات الذكاء الاصطناعي ({suggestionsData.tools.length})
                    </h4>
                    {searchTerm.trim() && (
                      <button
                        onClick={() => {
                          recordSearch(searchTerm.trim());
                          navigate(`/ai-tools?search=${encodeURIComponent(searchTerm.trim())}`);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>عرض الكل في الدليل</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {suggestionsData.tools.map((tool) => {
                      const itemPath = `/tools/${tool.slug}`;
                      const isSelected = selectedIndex >= 0 && navigableItems[selectedIndex]?.path === itemPath;
                      const semantic = tool.semanticMatch;

                      return (
                        <div
                          key={tool.id || tool.slug}
                          onClick={() => {
                            recordSearch(tool.name);
                            navigate(itemPath);
                            onClose();
                          }}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                            isSelected 
                              ? 'bg-indigo-50/80 border-indigo-300 shadow-xs' 
                              : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex-shrink-0 flex items-center justify-center">
                                <OptimizedImage
                                  src={tool.logo_url}
                                  alt={tool.name}
                                  width={40}
                                  height={40}
                                  fallbackText={tool.name}
                                  className="w-full h-full object-cover"
                                  containerClassName="w-full h-full"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-sm truncate">
                                    {highlightMatch(tool.name, searchTerm)}
                                  </span>
                                  {tool.is_verified && (
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  )}
                                  {semantic && semantic.confidence && (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Zap className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                      <span>مطابقة {semantic.confidence}%</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate leading-relaxed">
                                  {tool.tagline}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                              {tool.rating && (
                                <div className="hidden sm:flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{Number(tool.rating).toFixed(1)}</span>
                                </div>
                              )}
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                                {tool.pricing_type || 'Free'}
                              </span>
                              <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                            </div>
                          </div>

                          {/* Semantic Match Reason if present */}
                          {semantic && semantic.reason && (
                            <div className="bg-indigo-50/60 rounded-xl px-2.5 py-1.5 border border-indigo-100/80 text-[11px] text-indigo-900 flex items-center justify-between gap-2">
                              <span className="font-medium truncate">
                                💡 <strong className="font-bold">تفسير الذكاء الاصطناعي:</strong> {semantic.reason}
                              </span>
                              {tool.arabic_support && (
                                <span className="text-[10px] text-indigo-700 bg-white px-1.5 py-0.5 rounded font-bold border border-indigo-200/60 flex-shrink-0">
                                  دعم العربية: {tool.arabic_support}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Categories */}
              {(activeFilter === 'all' || activeFilter === 'categories') && suggestionsData.categories.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    التصنيفات ({suggestionsData.categories.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {suggestionsData.categories.map((cat) => {
                      const itemPath = `/categories/${cat.slug}`;
                      const isSelected = selectedIndex >= 0 && navigableItems[selectedIndex]?.path === itemPath;

                      return (
                        <div
                          key={cat.id || cat.slug}
                          onClick={() => {
                            recordSearch(cat.name);
                            navigate(itemPath);
                            onClose();
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : 'bg-slate-50/70 hover:bg-white border-slate-200/70 hover:border-blue-200 text-slate-800'
                          }`}
                        >
                          <span className="truncate">{highlightMatch(cat.name, searchTerm)}</span>
                          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Comparisons */}
              {(activeFilter === 'all' || activeFilter === 'comparisons') && suggestionsData.comparisons && suggestionsData.comparisons.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                    مقارنات الذكاء الاصطناعي ({suggestionsData.comparisons.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {suggestionsData.comparisons.map((comp) => (
                      <div
                        key={comp.id || comp.slug}
                        onClick={() => {
                          recordSearch(comp.title);
                          navigate(`/comparisons`);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Scale className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">{highlightMatch(comp.title, searchTerm)}</span>
                        </div>
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Articles & Guides */}
              {(activeFilter === 'all' || activeFilter === 'articles') && suggestionsData.articles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    المقالات والأدلة التعليمية ({suggestionsData.articles.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {suggestionsData.articles.map((art) => {
                      const itemPath = `/articles/${art.slug}`;
                      const isSelected = selectedIndex >= 0 && navigableItems[selectedIndex]?.path === itemPath;

                      return (
                        <div
                          key={art.id || art.slug}
                          onClick={() => {
                            recordSearch(art.title);
                            navigate(itemPath);
                            onClose();
                          }}
                          className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-300 shadow-xs' 
                              : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {highlightMatch(art.title, searchTerm)}
                              </h5>
                              {art.excerpt && (
                                <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                                  {art.excerpt}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                            {art.read_time && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {art.read_time}
                              </span>
                            )}
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External Search Option in Google */}
              {searchTerm.trim() && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">هل تبحث في الويب أيضاً؟</span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm.trim() + ' ذكاء اصطناعي')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>بحث Google الموسع عن "{searchTerm}"</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts & helper info */}
        <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 shadow-2xs">↑↓</kbd>
              للتنقل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 shadow-2xs">↵ Enter</kbd>
              للاختيار
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 shadow-2xs">ESC</kbd>
              للإغلاق
            </span>
          </div>

          <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>محرك بحث دلالي ذكي + بحث صوتي • مدعوم بـ Gemini 3.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
