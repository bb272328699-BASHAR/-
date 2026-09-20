import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Scale, 
  ArrowLeftRight, 
  Check, 
  X, 
  Star, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Search, 
  Share2, 
  DollarSign, 
  Award, 
  Globe, 
  Users, 
  ChevronDown,
  Layers,
  Zap,
  Cpu,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Info,
  SlidersHorizontal,
  Bookmark,
  TrendingUp,
  Copy,
  CheckCheck,
  FileDown,
  Printer
} from 'lucide-react';
import { Tool } from '../types.ts';
import { OptimizedImage } from './OptimizedImage.tsx';

interface InteractiveComparisonToolProps {
  navigate: (path: string) => void;
  initialToolSlugA?: string;
  initialToolSlugB?: string;
  initialToolSlugC?: string;
}

export const InteractiveComparisonTool: React.FC<InteractiveComparisonToolProps> = ({ 
  navigate,
  initialToolSlugA,
  initialToolSlugB,
  initialToolSlugC
}) => {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  // Selected tool slugs (Slot A, Slot B, and optional Slot C)
  const [selectedSlugA, setSelectedSlugA] = useState<string>(initialToolSlugA || '');
  const [selectedSlugB, setSelectedSlugB] = useState<string>(initialToolSlugB || '');
  const [selectedSlugC, setSelectedSlugC] = useState<string>(initialToolSlugC || '');
  const [showThirdSlot, setShowThirdSlot] = useState<boolean>(Boolean(initialToolSlugC));

  // Full detailed tools state
  const [toolA, setToolA] = useState<Tool | null>(null);
  const [toolB, setToolB] = useState<Tool | null>(null);
  const [toolC, setToolC] = useState<Tool | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Search filter inside dropdowns
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [searchC, setSearchC] = useState('');
  const [dropdownOpenA, setDropdownOpenA] = useState(false);
  const [dropdownOpenB, setDropdownOpenB] = useState(false);
  const [dropdownOpenC, setDropdownOpenC] = useState(false);
  
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'proscons' | 'features' | 'pricing' | 'verdict'>('all');
  const [copied, setCopied] = useState(false);

  const dropdownRefA = useRef<HTMLDivElement>(null);
  const dropdownRefB = useRef<HTMLDivElement>(null);
  const dropdownRefC = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRefA.current && !dropdownRefA.current.contains(e.target as Node)) {
        setDropdownOpenA(false);
      }
      if (dropdownRefB.current && !dropdownRefB.current.contains(e.target as Node)) {
        setDropdownOpenB(false);
      }
      if (dropdownRefC.current && !dropdownRefC.current.contains(e.target as Node)) {
        setDropdownOpenC(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch all tools for dropdown options
  useEffect(() => {
    fetch('/api/tools?limit=120')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.tools) ? data.tools : [];
        setAllTools(list);

        // Auto-select defaults if not passed
        if (!selectedSlugA && list.length > 0) {
          const defaultA = list.find((t: Tool) => t.slug === 'chatgpt') || list[0];
          setSelectedSlugA(defaultA.slug);
        }
        if (!selectedSlugB && list.length > 1) {
          const defaultB = list.find((t: Tool) => t.slug === 'claude-3-5-sonnet') || (list[1] ? list[1].slug : list[0].slug);
          setSelectedSlugB(defaultB.slug);
        }
      })
      .catch((err) => console.error('Error fetching tools for comparison:', err))
      .finally(() => setLoadingTools(false));
  }, []);

  // Fetch detailed tool data whenever selected slugs change
  useEffect(() => {
    if (!selectedSlugA && !selectedSlugB && !selectedSlugC) return;

    setLoadingDetails(true);

    const fetchDetails = async () => {
      try {
        const promises = [];
        if (selectedSlugA) {
          promises.push(fetch(`/api/tools/${selectedSlugA}`).then((r) => r.json()));
        } else {
          promises.push(Promise.resolve(null));
        }

        if (selectedSlugB) {
          promises.push(fetch(`/api/tools/${selectedSlugB}`).then((r) => r.json()));
        } else {
          promises.push(Promise.resolve(null));
        }

        if (showThirdSlot && selectedSlugC) {
          promises.push(fetch(`/api/tools/${selectedSlugC}`).then((r) => r.json()));
        } else {
          promises.push(Promise.resolve(null));
        }

        const [dataA, dataB, dataC] = await Promise.all(promises);
        setToolA(dataA && !dataA.error ? dataA : null);
        setToolB(dataB && !dataB.error ? dataB : null);
        setToolC(dataC && !dataC.error ? dataC : null);

        // Update URL query parameters
        const searchParams = new URLSearchParams();
        if (selectedSlugA) searchParams.set('tool1', selectedSlugA);
        if (selectedSlugB) searchParams.set('tool2', selectedSlugB);
        if (showThirdSlot && selectedSlugC) searchParams.set('tool3', selectedSlugC);
        
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      } catch (err) {
        console.error('Error fetching comparison tools details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedSlugA, selectedSlugB, selectedSlugC, showThirdSlot]);

  // Swap Tools A & B
  const handleSwapAB = () => {
    const tempSlug = selectedSlugA;
    setSelectedSlugA(selectedSlugB);
    setSelectedSlugB(tempSlug);
  };

  // Quick Preset comparisons (2-way and 3-way)
  const presets = [
    { 
      title: 'ChatGPT vs Claude 3.5 vs Gemini', 
      slugA: 'chatgpt', 
      slugB: 'claude-3-5-sonnet', 
      slugC: 'gemini-1-5-pro',
      is3Way: true 
    },
    { 
      title: 'Cursor vs Copilot vs Windsurf', 
      slugA: 'cursor-ai', 
      slugB: 'github-copilot', 
      slugC: 'windsurf-code',
      is3Way: true 
    },
    { 
      title: 'Midjourney vs DALL-E 3 vs Stable Diffusion', 
      slugA: 'midjourney', 
      slugB: 'dall-e-3', 
      slugC: 'stable-diffusion-xl',
      is3Way: true 
    },
    { 
      title: 'v0 by Vercel vs Lovable vs Bolt', 
      slugA: 'v0-dev', 
      slugB: 'lovable-dev', 
      slugC: 'bolt-new',
      is3Way: true 
    },
    { 
      title: 'ChatGPT ضد Claude 3.5', 
      slugA: 'chatgpt', 
      slugB: 'claude-3-5-sonnet', 
      slugC: '',
      is3Way: false 
    },
    { 
      title: 'Cursor AI ضد GitHub Copilot', 
      slugA: 'cursor-ai', 
      slugB: 'github-copilot', 
      slugC: '',
      is3Way: false 
    },
  ];

  const handleShare = () => {
    const searchParams = new URLSearchParams();
    if (selectedSlugA) searchParams.set('tool1', selectedSlugA);
    if (selectedSlugB) searchParams.set('tool2', selectedSlugB);
    if (showThirdSlot && selectedSlugC) searchParams.set('tool3', selectedSlugC);
    
    const url = `${window.location.origin}/comparisons?${searchParams.toString()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportPdf = () => {
    // Open print dialog which provides native "Save as PDF" option across Chrome, Edge, Safari, Firefox
    window.print();
  };

  const handleAddThirdSlot = () => {
    setShowThirdSlot(true);
    if (!selectedSlugC && allTools.length > 2) {
      const toolOption = allTools.find((t) => t.slug !== selectedSlugA && t.slug !== selectedSlugB);
      if (toolOption) setSelectedSlugC(toolOption.slug);
    }
  };

  const handleRemoveThirdSlot = () => {
    setShowThirdSlot(false);
    setSelectedSlugC('');
    setToolC(null);
  };

  // Filtered dropdown tools
  const filteredToolsA = useMemo(() => {
    return allTools.filter((t) => 
      t.name.toLowerCase().includes(searchA.toLowerCase()) || 
      t.tagline?.toLowerCase().includes(searchA.toLowerCase()) ||
      t.pricing_type?.toLowerCase().includes(searchA.toLowerCase())
    );
  }, [allTools, searchA]);

  const filteredToolsB = useMemo(() => {
    return allTools.filter((t) => 
      t.name.toLowerCase().includes(searchB.toLowerCase()) || 
      t.tagline?.toLowerCase().includes(searchB.toLowerCase()) ||
      t.pricing_type?.toLowerCase().includes(searchB.toLowerCase())
    );
  }, [allTools, searchB]);

  const filteredToolsC = useMemo(() => {
    return allTools.filter((t) => 
      t.name.toLowerCase().includes(searchC.toLowerCase()) || 
      t.tagline?.toLowerCase().includes(searchC.toLowerCase()) ||
      t.pricing_type?.toLowerCase().includes(searchC.toLowerCase())
    );
  }, [allTools, searchC]);

  // Active comparison tools list (2 or 3 items)
  const activeTools = useMemo(() => {
    const list: { tool: Tool; theme: 'indigo' | 'emerald' | 'purple'; label: string; index: number }[] = [];
    if (toolA) list.push({ tool: toolA, theme: 'indigo', label: 'الأداة الأولى (أ)', index: 0 });
    if (toolB) list.push({ tool: toolB, theme: 'emerald', label: 'الأداة الثانية (ب)', index: 1 });
    if (showThirdSlot && toolC) list.push({ tool: toolC, theme: 'purple', label: 'الأداة الثالثة (ج)', index: 2 });
    return list;
  }, [toolA, toolB, toolC, showThirdSlot]);

  const activeCount = activeTools.length;

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. Selector Bar & Dropdowns Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 mb-2">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>مقارنة تفاعلية مرنة (تصل إلى 3 أدوات في وقت واحد)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              اختر حتى 3 أدوات ذكاء اصطناعي للمقارنة الفورية في نقاط القوة والضعف والأسعار
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              حدد المتنافسين من القوائم المنسدلة لعرض جدول مقارنة شامل وديناميكي يبرز الإيجابيات والسلبيات، المميزات، والخطط.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap no-print">
            {!showThirdSlot ? (
              <button
                onClick={handleAddThirdSlot}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أداة ثالثة</span>
              </button>
            ) : (
              <button
                onClick={handleRemoveThirdSlot}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إلغاء الأداة الثالثة</span>
              </button>
            )}

            {/* Export to PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={activeTools.length < 2}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="تصدير جدول المقارنة إلى ملف PDF أو طباعته"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير PDF / طباعة</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="مشاركة رابط المقارنة"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Buttons */}
        <div className="space-y-2 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">مقارنات شائعة وثلاثية جاهزة:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSlugA(preset.slugA);
                  setSelectedSlugB(preset.slugB);
                  if (preset.is3Way && preset.slugC) {
                    setShowThirdSlot(true);
                    setSelectedSlugC(preset.slugC);
                  } else {
                    setShowThirdSlot(false);
                    setSelectedSlugC('');
                  }
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${
                  preset.is3Way
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200/80 shadow-2xs'
                    : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border-slate-200'
                }`}
              >
                {preset.is3Way && <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />}
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Dropdown Selectors: 2 or 3 Columns */}
        <div className={`grid grid-cols-1 ${showThirdSlot ? 'md:grid-cols-3' : 'md:grid-cols-11'} gap-4 items-center pt-2 no-print`}>
          
          {/* Selector A */}
          <div className={`${showThirdSlot ? 'md:col-span-1' : 'md:col-span-5'} relative`} ref={dropdownRefA}>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                الأداة الأولى (المتنافس أ):
              </span>
              {toolA && (
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                  {toolA.pricing_type}
                </span>
              )}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpenA(!dropdownOpenA);
                  setDropdownOpenB(false);
                  setDropdownOpenC(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  dropdownOpenA 
                    ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                    {toolA?.logo_url ? (
                      <OptimizedImage
                        src={toolA.logo_url}
                        alt={toolA.name}
                        width={32}
                        height={32}
                        fallbackText={toolA.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {toolA?.name?.charAt(0) || 'أ'}
                      </div>
                    )}
                  </div>
                  <div className="text-right overflow-hidden">
                    <span className="font-bold text-slate-900 text-sm block truncate">
                      {toolA?.name || 'اختر الأداة الأولى...'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {toolA?.tagline || 'انقر للاختيار'}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mr-2 transition-transform duration-200 ${dropdownOpenA ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {/* Dropdown Menu A */}
              {dropdownOpenA && (
                <div className="absolute z-40 top-full mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2 max-h-80 overflow-y-auto">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchA}
                      onChange={(e) => setSearchA(e.target.value)}
                      placeholder="ابحث بالاسم أو التصنيف..."
                      autoFocus
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1 pt-1">
                    {filteredToolsA.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد أدوات مطابقة</p>
                    ) : (
                      filteredToolsA.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlugA(t.slug);
                            setDropdownOpenA(false);
                            setSearchA('');
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-all cursor-pointer ${
                            selectedSlugA === t.slug 
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' 
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {t.logo_url ? (
                                <img src={t.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-[10px] text-indigo-600">{t.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="truncate">{t.name}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {t.pricing_type}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Swap Button (Visible in 2-column mode) */}
          {!showThirdSlot && (
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <button
                onClick={handleSwapAB}
                className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-all shadow-xs cursor-pointer hover:rotate-180 duration-300"
                title="تبديل الأداتين"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Selector B */}
          <div className={`${showThirdSlot ? 'md:col-span-1' : 'md:col-span-5'} relative`} ref={dropdownRefB}>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                الأداة الثانية (المتنافس ب):
              </span>
              {toolB && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  {toolB.pricing_type}
                </span>
              )}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpenB(!dropdownOpenB);
                  setDropdownOpenA(false);
                  setDropdownOpenC(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  dropdownOpenB 
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                    {toolB?.logo_url ? (
                      <OptimizedImage
                        src={toolB.logo_url}
                        alt={toolB.name}
                        width={32}
                        height={32}
                        fallbackText={toolB.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {toolB?.name?.charAt(0) || 'ب'}
                      </div>
                    )}
                  </div>
                  <div className="text-right overflow-hidden">
                    <span className="font-bold text-slate-900 text-sm block truncate">
                      {toolB?.name || 'اختر الأداة الثانية...'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {toolB?.tagline || 'انقر للاختيار'}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mr-2 transition-transform duration-200 ${dropdownOpenB ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Dropdown Menu B */}
              {dropdownOpenB && (
                <div className="absolute z-40 top-full mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2 max-h-80 overflow-y-auto">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchB}
                      onChange={(e) => setSearchB(e.target.value)}
                      placeholder="ابحث بالاسم أو التصنيف..."
                      autoFocus
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1 pt-1">
                    {filteredToolsB.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد أدوات مطابقة</p>
                    ) : (
                      filteredToolsB.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlugB(t.slug);
                            setDropdownOpenB(false);
                            setSearchB('');
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-all cursor-pointer ${
                            selectedSlugB === t.slug 
                              ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' 
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {t.logo_url ? (
                                <img src={t.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-[10px] text-emerald-600">{t.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="truncate">{t.name}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {t.pricing_type}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selector C (Third Tool Slot) */}
          {showThirdSlot && (
            <div className="md:col-span-1 relative" ref={dropdownRefC}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  الأداة الثالثة (المتنافس ج):
                </span>
                {toolC && (
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                    {toolC.pricing_type}
                  </span>
                )}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpenC(!dropdownOpenC);
                    setDropdownOpenA(false);
                    setDropdownOpenB(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    dropdownOpenC 
                      ? 'bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20 shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                      {toolC?.logo_url ? (
                        <OptimizedImage
                          src={toolC.logo_url}
                          alt={toolC.name}
                          width={32}
                          height={32}
                          fallbackText={toolC.name}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                          {toolC?.name?.charAt(0) || 'ج'}
                        </div>
                      )}
                    </div>
                    <div className="text-right overflow-hidden">
                      <span className="font-bold text-slate-900 text-sm block truncate">
                        {toolC?.name || 'اختر الأداة الثالثة...'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {toolC?.tagline || 'انقر للاختيار'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mr-2 transition-transform duration-200 ${dropdownOpenC ? 'rotate-180 text-purple-600' : ''}`} />
                </button>

                {/* Dropdown Menu C */}
                {dropdownOpenC && (
                  <div className="absolute z-40 top-full mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2 max-h-80 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchC}
                        onChange={(e) => setSearchC(e.target.value)}
                        placeholder="ابحث بالاسم أو التصنيف..."
                        autoFocus
                        className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1 pt-1">
                      {filteredToolsC.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">لا توجد أدوات مطابقة</p>
                      ) : (
                        filteredToolsC.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedSlugC(t.slug);
                              setDropdownOpenC(false);
                              setSearchC('');
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-all cursor-pointer ${
                              selectedSlugC === t.slug 
                                ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200' 
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {t.logo_url ? (
                                  <img src={t.logo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-[10px] text-purple-600">{t.name.charAt(0)}</span>
                                )}
                              </div>
                              <span className="truncate">{t.name}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {t.pricing_type}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Loading Details State */}
      {loadingDetails && (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            جاري معالجة بيانات الميزات والأسعار ونقاط القوة والضعف للأدوات المحددة...
          </p>
        </div>
      )}

      {/* Main Detailed Comparison Section */}
      {!loadingDetails && activeTools.length >= 2 && (
        <div className="space-y-8">
          
          {/* 1. Header Overview Cards (2 or 3 Columns) */}
          <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
            {activeTools.map(({ tool, theme, label }) => {
              const borderClass = theme === 'indigo' 
                ? 'border-indigo-500/30' 
                : theme === 'emerald' 
                ? 'border-emerald-500/30' 
                : 'border-purple-500/30';
              const gradientBar = theme === 'indigo'
                ? 'from-indigo-500 to-indigo-600'
                : theme === 'emerald'
                ? 'from-emerald-500 to-emerald-600'
                : 'from-purple-500 to-purple-600';
              const btnClass = theme === 'indigo'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : theme === 'emerald'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-purple-600 hover:bg-purple-700';

              return (
                <div 
                  key={tool.id} 
                  className={`bg-white rounded-3xl p-6 border-2 ${borderClass} shadow-sm space-y-5 relative overflow-hidden flex flex-col justify-between`}
                >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${gradientBar}`} />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                        {tool.logo_url ? (
                          <OptimizedImage
                            src={tool.logo_url}
                            alt={tool.name}
                            width={56}
                            height={56}
                            fallbackText={tool.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <span className="text-xl font-black text-slate-800">{tool.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-lg font-black text-slate-900 truncate">{tool.name}</h3>
                          {tool.is_verified && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              موثق
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{tool.tagline}</p>
                      </div>
                    </div>

                    {/* Quick Metrics Bar */}
                    <div className="grid grid-cols-3 gap-1.5 py-2.5 px-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">التقييم</span>
                        <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-xs">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{tool.rating ? Number(tool.rating).toFixed(1) : '4.9'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">نوع التسعير</span>
                        <span className="text-xs font-extrabold text-slate-800 truncate block">{tool.pricing_type}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">دعم العربية</span>
                        <span className="text-xs font-extrabold text-emerald-700 truncate block">
                          {tool.arabic_support || 'ممتاز'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 ${btnClass} text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer`}
                    >
                      <span>الموقع الرسمي</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => navigate(`/tools/${tool.slug}`)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      المراجعة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Printable Header - Visible ONLY in Print/PDF Mode */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-950">دليل الذكاء الاصطناعي | Daleel.ai</h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  تقرير مقارنة معتمد وشامل للأدوات: {activeTools.map(t => t.tool.name).join(' ضد ')}
                </p>
              </div>
              <div className="text-left text-[11px] text-slate-500">
                <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-SA')}</p>
                <p className="font-mono text-[10px]">daleel.ai/comparisons</p>
              </div>
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 no-print">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFilterTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'all'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جميع الأقسام
              </button>

              <button
                onClick={() => setActiveFilterTab('proscons')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'proscons'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>نقاط القوة والضعف (المميزات والعيوب)</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('features')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'features'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>جدول القدرات والمواصفات</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('pricing')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'pricing'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>الأسعار والباقات</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('verdict')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilterTab === 'verdict'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>الخلاصة والتوصية</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                title="تصدير هذه المقارنة إلى PDF"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>تصدير PDF</span>
              </button>

              <div className="text-[11px] text-slate-500 font-bold px-2 hidden sm:block">
                مقارنة {activeCount} أدوات
              </div>
            </div>
          </div>

          {/* 2. CORE FEATURE: DEDICATED STRENGTHS & WEAKNESSES TABLE (نقاط القوة والضعف لكل أداة) */}
          {(activeFilterTab === 'all' || activeFilterTab === 'proscons') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">
                      جدول مقارنة نقاط القوة والضعف (Strengths & Weaknesses Matrix)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تحليل موضوعي ومحايد يبرز ما تتميز به كل أداة وأبرز القيود والتحديات الشفافة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                    <ThumbsUp className="w-3 h-3" />
                    نقاط القوة
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-lg">
                    <ThumbsDown className="w-3 h-3" />
                    نقاط الضعف
                  </span>
                </div>
              </div>

              {/* Strengths & Weaknesses Columns */}
              <div className="p-6">
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                  {activeTools.map(({ tool, theme, label }) => {
                    const badgeBg = theme === 'indigo'
                      ? 'bg-indigo-600 text-white'
                      : theme === 'emerald'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 text-white';

                    return (
                      <div 
                        key={tool.id} 
                        className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-5 flex flex-col justify-between"
                      >
                        {/* Tool Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-7 h-7 rounded-lg ${badgeBg} flex items-center justify-center text-xs font-black shrink-0`}>
                              {tool.name.charAt(0)}
                            </div>
                            <span className="font-black text-sm text-slate-900 truncate">{tool.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {tool.pricing_type}
                          </span>
                        </div>

                        {/* Strengths (نقاط القوة) */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg w-fit">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>نقاط القوة والمميزات الحاسمة:</span>
                          </div>

                          <div className="space-y-2">
                            {Array.isArray(tool.pros) && tool.pros.length > 0 ? (
                              tool.pros.map((pro, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-emerald-200/70 shadow-2xs text-xs text-slate-800"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{pro}</span>
                                </div>
                              ))
                            ) : (
                              <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70 text-xs text-slate-700">
                                <p className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>أداء فائق وسرعة استجابة واستقرار عالي</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Weaknesses (نقاط الضعف والقيود) */}
                        <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-lg w-fit">
                            <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                            <span>نقاط الضعف والقيود التشغيلية:</span>
                          </div>

                          <div className="space-y-2">
                            {Array.isArray(tool.cons) && tool.cons.length > 0 ? (
                              tool.cons.map((con, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-rose-200/70 shadow-2xs text-xs text-slate-800"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{con}</span>
                                </div>
                              ))
                            ) : (
                              <div className="bg-white p-2.5 rounded-xl border border-rose-200/70 text-xs text-slate-700">
                                <p className="flex items-center gap-1.5">
                                  <X className="w-3 h-3 text-rose-600" />
                                  <span>تتطلب اشتراكاً مدفوعاً للوصول إلى أعلى حدود وسرعات المعالجة</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Who is it best for summary */}
                        <div className="pt-3 border-t border-slate-200/60 bg-white/80 p-3 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold mb-1">الاستخدام الأمثل:</span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {tool.who_is_it_for || 'يناسب المحترفين والمطورين وصناع المحتوى الباحثين عن جودة عالية.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. TECHNICAL SPECIFICATIONS & CAPABILITIES TABLE */}
          {(activeFilterTab === 'all' || activeFilterTab === 'features') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-sm sm:text-base">
                    جدول المقارنة التفصيلي للمواصفات والقدرات التقنية
                  </h3>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  مقارنة معيارية شاملة
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                
                {/* Metric 1: Arabic NLP */}
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-4' : 'md:grid-cols-12'} p-4 items-center gap-3 hover:bg-slate-50/70 transition-colors`}>
                  <div className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} font-bold text-slate-900 flex items-center gap-2`}>
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>دعم اللغة العربية واللهجات</span>
                  </div>

                  {activeTools.map(({ tool, theme }) => (
                    <div 
                      key={tool.id}
                      className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} text-slate-700 font-semibold p-3 rounded-xl border ${
                        theme === 'indigo' 
                          ? 'bg-indigo-50/40 border-indigo-100/70' 
                          : theme === 'emerald'
                          ? 'bg-emerald-50/40 border-emerald-100/70'
                          : 'bg-purple-50/40 border-purple-100/70'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 block font-bold mb-0.5">{tool.name}:</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{tool.arabic_support || 'دعم متقدم ومتقن مع فهم السياق العربي'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric 2: Target Audience */}
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-4' : 'md:grid-cols-12'} p-4 items-center gap-3 hover:bg-slate-50/70 transition-colors`}>
                  <div className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} font-bold text-slate-900 flex items-center gap-2`}>
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>الفئة المستهدفة ومجال الاستخدام</span>
                  </div>

                  {activeTools.map(({ tool }) => (
                    <div 
                      key={tool.id}
                      className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl`}
                    >
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{tool.name}:</span>
                      <span>{tool.who_is_it_for || 'المحترفون، المبرمجون، ورواد الأعمال وصناع المحتوى'}</span>
                    </div>
                  ))}
                </div>

                {/* Metric 3: Core Features */}
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-4' : 'md:grid-cols-12'} p-4 items-start gap-3 hover:bg-slate-50/70 transition-colors`}>
                  <div className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} font-bold text-slate-900 flex items-center gap-2 pt-2`}>
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>أبرز المميزات والقدرات</span>
                  </div>

                  {activeTools.map(({ tool, theme }) => (
                    <div 
                      key={tool.id}
                      className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} space-y-1.5`}
                    >
                      <span className="text-[10px] text-slate-500 block font-bold">{tool.name}:</span>
                      {Array.isArray(tool.features) && tool.features.length > 0 ? (
                        tool.features.slice(0, 3).map((f, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2 rounded-lg border text-xs ${
                              theme === 'indigo'
                                ? 'bg-indigo-50/30 border-indigo-100/60'
                                : theme === 'emerald'
                                ? 'bg-emerald-50/30 border-emerald-100/60'
                                : 'bg-purple-50/30 border-purple-100/60'
                            }`}
                          >
                            <span className="font-bold text-slate-800">{f.title}</span>
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{f.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">ميزات أداء متقدمة ومعالجة ذكية</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Metric 4: API & Integrations */}
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-4' : 'md:grid-cols-12'} p-4 items-center gap-3 hover:bg-slate-50/70 transition-colors`}>
                  <div className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} font-bold text-slate-900 flex items-center gap-2`}>
                    <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>التكاملات والواجهة البرمجية (API)</span>
                  </div>

                  {activeTools.map(({ tool }) => (
                    <div 
                      key={tool.id}
                      className={`${activeCount === 3 ? 'md:col-span-1' : 'md:col-span-4'} text-slate-700 bg-slate-50 p-2.5 rounded-xl font-medium`}
                    >
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{tool.name}:</span>
                      <span>واجهة برمجية REST API وتكاملات سحابية مباشرة</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* 4. PRICING & SUBSCRIPTION PLANS TABLE */}
          {(activeFilterTab === 'all' || activeFilterTab === 'pricing') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-sm sm:text-base">
                    جدول مقارنة الأسعار والخطط وباقات الاشتراك
                  </h3>
                </div>
                <span className="text-xs text-slate-400">محدثة ومحققة</span>
              </div>

              <div className="p-6">
                <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                  {activeTools.map(({ tool, theme }) => {
                    const cardBg = theme === 'indigo'
                      ? 'bg-indigo-50/40 border-indigo-100'
                      : theme === 'emerald'
                      ? 'bg-emerald-50/40 border-emerald-100'
                      : 'bg-purple-50/40 border-purple-100';

                    const badgeColor = theme === 'indigo'
                      ? 'text-indigo-700 bg-indigo-100/80'
                      : theme === 'emerald'
                      ? 'text-emerald-700 bg-emerald-100/80'
                      : 'text-purple-700 bg-purple-100/80';

                    const badgeAvatar = theme === 'indigo'
                      ? 'bg-indigo-600 text-white'
                      : theme === 'emerald'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 text-white';

                    return (
                      <div key={tool.id} className={`p-5 rounded-2xl ${cardBg} border space-y-4`}>
                        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${badgeAvatar} flex items-center justify-center text-xs font-bold`}>
                              {tool.name.charAt(0)}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">تسعير {tool.name}</h4>
                          </div>
                          <span className={`text-xs font-black ${badgeColor} px-2.5 py-1 rounded-lg`}>
                            {tool.pricing_type}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="text-slate-400 block text-[11px]">سعر البداية / التجربة:</span>
                          <span className="text-sm font-bold text-slate-900">{tool.starting_price || 'خطة مجانية متاحة'}</span>
                        </div>

                        {/* Detailed Plans list */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 block">الباقات والخطط المسجلة:</span>
                          {tool.pricingPlans && tool.pricingPlans.length > 0 ? (
                            tool.pricingPlans.map((plan, i) => (
                              <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-slate-900">{plan.plan_name}</span>
                                  <span className="font-extrabold text-xs text-slate-900">
                                    {plan.price} {plan.period ? `/ ${plan.period}` : ''}
                                  </span>
                                </div>
                                {Array.isArray(plan.features) && (
                                  <ul className="space-y-0.5 text-[11px] text-slate-500 pt-1">
                                    {plan.features.slice(0, 3).map((feat, idx) => (
                                      <li key={idx} className="flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>{feat}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                              تبدأ من {tool.starting_price || tool.pricing_type} مع باقة استخدام قياسية.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. FINAL RECOMMENDATION & VERDICT (الخلاصة والقرار النهائي) */}
          {(activeFilterTab === 'all' || activeFilterTab === 'verdict') && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Award className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold">الخلاصة والقرار النهائي: أيهما الأنسب لك؟</h3>
              </div>

              <div className={`grid grid-cols-1 ${activeCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 text-xs sm:text-sm text-slate-300`}>
                {activeTools.map(({ tool }) => (
                  <div key={tool.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <span className="font-bold text-white block text-sm">اختر {tool.name} إذا كنت:</span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      ترغب في حل متخصص يلائم {tool.who_is_it_for || 'احتياجاتك اليومية'} مع الاستفادة من نموذج تسعير {tool.pricing_type}.
                    </p>
                    <div className="pt-2">
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold text-xs"
                      >
                        <span>تجربة {tool.name} الآن</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
