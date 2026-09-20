import React, { useState, useEffect, useRef } from 'react';
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
  Compass
} from 'lucide-react';
import { OptimizedImage } from './OptimizedImage.tsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

interface SuggestionData {
  query: string;
  suggestions: string[];
  tools: any[];
  articles: any[];
  categories: any[];
  comparisons?: any[];
  tutorials?: any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tools' | 'categories' | 'articles' | 'comparisons'>('all');
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
    tutorials: []
  });

  const inputRef = useRef<HTMLInputElement>(null);

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

  // Load initial suggestions or trending items on modal open
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIndex(-1);
      setActiveFilter('all');
      return;
    }

    // Auto-focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // Fetch initial trending data
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/search/suggestions');
        if (res.ok) {
          const data = await res.json();
          setSuggestionsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch initial search suggestions', err);
      }
    };

    fetchInitialData();
  }, [isOpen]);

  // Real-time fetching as user types
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const queryParam = encodeURIComponent(searchTerm.trim());
        const res = await fetch(`/api/search/suggestions?q=${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestionsData(data);
          setSelectedIndex(-1);
        }
      } catch (e) {
        console.error('Search auto-suggestion error', e);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

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
            part
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  const hasResults = 
    suggestionsData.tools.length > 0 || 
    suggestionsData.categories.length > 0 || 
    suggestionsData.articles.length > 0 ||
    (suggestionsData.comparisons && suggestionsData.comparisons.length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث في أكبر محرك لأدوات الذكاء الاصطناعي، المقالات، والمقارنات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-base sm:text-lg font-medium"
          />

          {loading ? (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
          ) : searchTerm ? (
            <button 
              onClick={() => {
                setSearchTerm('');
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
                <p className="text-sm font-bold text-slate-700">ابدأ الكتابة للبحث المباشر</p>
                <p className="text-xs text-slate-400 mt-1">ابحث عن اسم الأداة، مجالات الاستخدام، أو مواضيع المقالات</p>
              </div>
            </div>
          ) : !hasResults && !loading ? (
            <div className="py-10 text-center text-slate-500 space-y-3">
              <p className="text-base font-bold text-slate-800">لم نعثر على نتائج مطابقة لـ "{searchTerm}"</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يمكنك الضغط أدناه لتصفح الدليل الشامل أو البحث عن "{searchTerm}" مباشرة في Google.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(searchTerm.trim() + ' ذكاء اصطناعي')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>ابحث في قوقل (Google)</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </a>
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

                  <div className="grid grid-cols-1 gap-1.5">
                    {suggestionsData.tools.map((tool) => {
                      const itemPath = `/tools/${tool.slug}`;
                      const isSelected = selectedIndex >= 0 && navigableItems[selectedIndex]?.path === itemPath;

                      return (
                        <div
                          key={tool.id || tool.slug}
                          onClick={() => {
                            recordSearch(tool.name);
                            navigate(itemPath);
                            onClose();
                          }}
                          className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-indigo-50/80 border-indigo-300 shadow-xs' 
                              : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                          }`}
                        >
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
            <Sparkles className="w-3 h-3" />
            <span>محرك بحث ذكي فائق السرعة • دليل الذكاء الاصطناعي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
