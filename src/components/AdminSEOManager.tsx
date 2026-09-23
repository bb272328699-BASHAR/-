import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Check, 
  Globe, 
  Share2, 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  Layers, 
  AlertCircle,
  Eye,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Copy,
  ChevronRight,
  Code2,
  Smartphone,
  Monitor,
  MapPin,
  Compass,
  FileCode,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  Radio,
  Send
} from 'lucide-react';
import { PageSEO, SEOAuditIssue, SEOAuditSummary } from '../types.ts';
import { OptimizedImage } from './OptimizedImage.tsx';
import { getCanonicalDomain } from '../utils/seo.ts';

interface AdminSEOManagerProps {
  token: string;
}

interface SitemapStats {
  totalUrls: number;
  breakdown: {
    staticPages: number;
    tools: number;
    categories: number;
    articles: number;
    comparisons: number;
    tutorials: number;
    reviews: number;
  };
  generatedAt: string;
  sitemapUrl: string;
}

export const AdminSEOManager: React.FC<AdminSEOManagerProps> = ({ token }) => {
  const [items, setItems] = useState<PageSEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tool' | 'article' | 'category' | 'comparison' | 'tutorial' | 'review'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_opt' | 'optimized'>('all');
  const [selectedItem, setSelectedItem] = useState<PageSEO | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<'google' | 'social' | 'schema'>('google');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

// Automated Meta Tags Audit State
  const [auditSummary, setAuditSummary] = useState<SEOAuditSummary | null>(null);
  const [auditIssues, setAuditIssues] = useState<SEOAuditIssue[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');

  // Sitemap state
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [showSitemapModal, setShowSitemapModal] = useState(false);
  const [rawXml, setRawXml] = useState<string>('');
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [sitemapEngineStatus, setSitemapEngineStatus] = useState<{
    version?: number;
    isCached?: boolean;
    lastGenerated?: string | null;
    latestLastMod?: string | null;
    totalUrls?: number;
    breakdown?: any;
    lastPingTime?: string | null;
    lastPingResult?: any;
    indexNowKey?: string;
  } | null>(null);
  const [regeneratingSitemap, setRegeneratingSitemap] = useState(false);
  const [pingingIndexNow, setPingingIndexNow] = useState(false);

  // Batch Dynamic Generator State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTarget, setBatchTarget] = useState<'all' | 'tools' | 'articles' | 'categories' | 'missing_only'>('all');
  const [batchOverwrite, setBatchOverwrite] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<{ message: string; details?: any } | null>(null);
  const [dynamicGenLoading, setDynamicGenLoading] = useState(false);

  // Instant Indexing API State
  const [showInstantIndexModal, setShowInstantIndexModal] = useState(false);
  const [instantIndexUrl, setInstantIndexUrl] = useState('');
  const [instantIndexLoading, setInstantIndexLoading] = useState(false);
  const [instantIndexResults, setInstantIndexResults] = useState<any[]>([]);
  const [indexingLogs, setIndexingLogs] = useState<any[]>([]);

  const fetchIndexingLogs = async () => {
    try {
      const res = await fetch('/api/admin/instant-index/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIndexingLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load indexing logs:', e);
    }
  };

  const handleInstantIndexSubmit = async (urlOverride?: string) => {
    const targetUrl = urlOverride || instantIndexUrl || (selectedItem ? getPagePath(selectedItem) : '');
    if (!targetUrl) return;

    setInstantIndexLoading(true);
    try {
      const res = await fetch('/api/admin/instant-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setInstantIndexResults(data.results || []);
        setFeedback({ text: data.message || 'تم إرسال طلب الأرشفة الفورية بنجاح', type: 'success' });
        await fetchIndexingLogs();
      } else {
        throw new Error(data.error || 'فشل إرسال طلب الأرشفة');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ أثناء طلب الأرشفة الفورية', type: 'error' });
    } finally {
      setInstantIndexLoading(false);
    }
  };

  // Form State for editing selected item
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image_url: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    robots_directive: 'index, follow',
  });

  const fetchAuditReport = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/admin/seo/audit', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditSummary(data.summary);
        setAuditIssues(data.issues || []);
      }
    } catch (e) {
      console.error('Failed to load SEO audit report:', e);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchSitemapStats = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch('/api/sitemap');
      if (res.ok) {
        const data = await res.json();
        setSitemapStats(data);
      }
    } catch (e) {
      console.error('Failed to load sitemap stats:', e);
    } finally {
      setSitemapLoading(false);
    }
  };

  const fetchSitemapEngineStatus = async () => {
    try {
      const res = await fetch('/api/admin/seo/sitemap/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSitemapEngineStatus(data);
      }
    } catch (e) {
      console.error('Failed to load sitemap engine status:', e);
    }
  };

  const handleRegenerateSitemap = async () => {
    setRegeneratingSitemap(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap/regenerate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ text: data.message || 'تم تحديث ومزامنة خريطة الموقع فورياً مع قاعدة البيانات', type: 'success' });
        await fetchSitemapStats();
        await fetchSitemapEngineStatus();
      } else {
        throw new Error(data.error || 'فشل التحديث');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ أثناء تحديث خريطة الموقع', type: 'error' });
    } finally {
      setRegeneratingSitemap(false);
    }
  };

  const handlePingIndexNow = async () => {
    setPingingIndexNow(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ urls: [] })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ text: data.message || 'تم إرسال إشعار IndexNow لمحركات البحث بنجاح', type: 'success' });
        await fetchSitemapEngineStatus();
      } else {
        throw new Error(data.error || 'فشل إرسال الإشعار');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'فشل إرسال إشعار الفهرسة', type: 'error' });
    } finally {
      setPingingIndexNow(false);
    }
  };

  const fetchRawXml = async () => {
    try {
      const res = await fetch('/sitemap.xml');
      if (res.ok) {
        const text = await res.text();
        setRawXml(text);
        setShowSitemapModal(true);
      }
    } catch (e) {
      console.error('Failed to load raw sitemap xml:', e);
    }
  };

  const getPagePath = (item: PageSEO) => {
    switch (item.type) {
      case 'tool': return `/tools/${item.slug}`;
      case 'article': return `/articles/${item.slug}`;
      case 'category': return `/categories/${item.slug}`;
      case 'comparison': return `/comparisons/${item.slug}`;
      case 'tutorial': return `/tutorials/${item.slug}`;
      case 'review': return `/reviews/${item.slug}`;
      default: return `/${item.slug}`;
    }
  };

  const fetchSEOItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const combined: PageSEO[] = data.items || [
          ...(data.tools || []),
          ...(data.articles || []),
          ...(data.categories || []),
          ...(data.comparisons || []),
          ...(data.tutorials || []),
          ...(data.reviews || []),
        ];
        setItems(combined);
        if (combined.length > 0 && !selectedItem) {
          selectItem(combined[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load SEO items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOItems();
    fetchAuditReport();
    fetchSitemapStats();
    fetchSitemapEngineStatus();
    fetchIndexingLogs();
  }, []);

  const selectItem = (item: PageSEO) => {
    setSelectedItem(item);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const defaultCanonical = `${origin}${getPagePath(item)}`;
    const defaultOgImage = item.cover_image_url || item.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';

    setFormData({
      meta_title: item.meta_title || `${item.name} - مراجعة وتحليل شامل | دليل الذكاء الاصطناعي`,
      meta_description: item.meta_description || item.tagline || item.excerpt || `تعرف على ${item.name}، أهم الميزات والأسعار والبدائل المتاحة في دليل الذكاء الاصطناعي.`,
      meta_keywords: item.meta_keywords || `${item.name}, ذكاء اصطناعي, أدوات الذكاء الاصطناعي, دليل الذكاء الاصطناعي`,
      og_image_url: item.og_image_url || defaultOgImage,
      canonical_url: item.canonical_url || defaultCanonical,
      og_title: item.og_title || item.meta_title || `${item.name} | دليل الذكاء الاصطناعي`,
      og_description: item.og_description || item.meta_description || item.tagline || item.excerpt || '',
      robots_directive: item.robots_directive || 'index, follow',
    });
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    setFeedback(null);

    const endpoint = `/api/admin/seo/${selectedItem.type}/${selectedItem.id}`;

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFeedback({ text: 'تم حفظ وتحديث وسوم SEO ومعلومات OpenGraph بنجاح!', type: 'success' });
        
        // Update local items state
        setItems(prev => prev.map(item => {
          if (item.id === selectedItem.id && item.type === selectedItem.type) {
            return { ...item, ...formData };
          }
          return item;
        }));

        // Refresh audit report in background
        fetchAuditReport();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'فشل الحفظ');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ أثناء حفظ الإعدادات', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Server-Side Dynamic Generator from Database Content
  const handleServerDynamicGenerate = async () => {
    if (!selectedItem) return;
    setDynamicGenLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/seo/generate-dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: selectedItem.type, id: selectedItem.id })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setFormData({
            meta_title: json.data.meta_title || formData.meta_title,
            meta_description: json.data.meta_description || formData.meta_description,
            meta_keywords: json.data.meta_keywords || formData.meta_keywords,
            og_image_url: json.data.og_image_url || formData.og_image_url,
            canonical_url: json.data.canonical_url || formData.canonical_url,
            og_title: json.data.og_title || formData.og_title,
            og_description: json.data.og_description || formData.og_description,
            robots_directive: json.data.robots_directive || formData.robots_directive,
          });
          setFeedback({ text: 'تم توليد وسوم SEO ديناميكياً من بيانات قاعدة البيانات بنجاح!', type: 'success' });
        }
      } else {
        // Fallback to client-side smart auto generator
        handleAutoGenerateSEO();
      }
    } catch (e) {
      handleAutoGenerateSEO();
    } finally {
      setDynamicGenLoading(false);
    }
  };

  // Batch Dynamic SEO Generator for Whole Database
  const handleRunBatchGenerator = async () => {
    setBatchRunning(true);
    setBatchResult(null);
    try {
      const res = await fetch('/api/admin/seo/batch-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target: batchTarget,
          overwrite: batchOverwrite
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBatchResult({ message: data.message, details: data.details });
        // Refresh items and audit report
        await fetchSEOItems();
        await fetchAuditReport();
        await fetchSitemapStats();
      } else {
        throw new Error(data.error || 'فشل تشغيل التوليد الجماعي');
      }
    } catch (err: any) {
      setBatchResult({ message: err.message || 'حدث خطأ أثناء التوليد' });
    } finally {
      setBatchRunning(false);
    }
  };

  // SEO Ranking Potential Score Calculator (0-100)
  const calculateRankingPotential = () => {
    let score = 0;
    const checks: { title: string; passed: boolean; tip: string; points: number }[] = [];

    // 1. Title Check (30 pts)
    const titleLen = formData.meta_title.trim().length;
    const isTitleOptimal = titleLen >= 40 && titleLen <= 65;
    const hasBrandSuffix = formData.meta_title.includes('دليل الذكاء الاصطناعي') || formData.meta_title.includes('Daleel');
    let titlePts = 0;
    if (isTitleOptimal) titlePts += 20;
    else if (titleLen > 15 && titleLen < 80) titlePts += 10;
    if (hasBrandSuffix) titlePts += 10;
    checks.push({
      title: 'عنوان الصفحة (Meta Title)',
      passed: isTitleOptimal && hasBrandSuffix,
      tip: isTitleOptimal ? 'الطول مثالي لنتائج بحث جوجل' : 'الطول المثالي بين 40 و 60 حرفاً',
      points: titlePts
    });
    score += titlePts;

    // 2. Description Check (30 pts)
    const descLen = formData.meta_description.trim().length;
    const isDescOptimal = descLen >= 120 && descLen <= 165;
    let descPts = 0;
    if (isDescOptimal) descPts += 30;
    else if (descLen >= 80 && descLen <= 200) descPts += 18;
    else if (descLen > 0) descPts += 10;
    checks.push({
      title: 'وصف الصفحة (Meta Description)',
      passed: isDescOptimal,
      tip: isDescOptimal ? 'الوصف متوافق مع طول مقتطف Google SERP' : 'اجعل الوصف بين 120 و 160 حرفاً لجذب النقرات',
      points: descPts
    });
    score += descPts;

    // 3. OpenGraph Social Image (15 pts)
    const hasOgImg = Boolean(formData.og_image_url && formData.og_image_url.startsWith('http'));
    const ogPts = hasOgImg ? 15 : 0;
    checks.push({
      title: 'صورة المشاركة (OpenGraph Image)',
      passed: hasOgImg,
      tip: hasOgImg ? 'صورة OpenGraph معرفة وجاهزة للمشاركة' : 'أضف رابط صورة بدقة 1200×630 للمشاركة في تويتر وواتساب',
      points: ogPts
    });
    score += ogPts;

    // 4. Canonical URL (15 pts)
    const hasCanonical = Boolean(formData.canonical_url && formData.canonical_url.startsWith('http'));
    const canPts = hasCanonical ? 15 : 0;
    checks.push({
      title: 'الرابط الأساسي (Canonical URL)',
      passed: hasCanonical,
      tip: hasCanonical ? 'يمنع مشاكل المحتوى المكرر' : 'حدد الرابط الأساسي لحماية تصنيف الصفحة',
      points: canPts
    });
    score += canPts;

    // 5. Meta Keywords (10 pts)
    const keywordsCount = formData.meta_keywords ? formData.meta_keywords.split(',').filter(k => k.trim().length > 0).length : 0;
    const kwPts = keywordsCount >= 3 ? 10 : keywordsCount > 0 ? 5 : 0;
    checks.push({
      title: 'الكلمات المفتاحية (Meta Keywords)',
      passed: keywordsCount >= 3,
      tip: keywordsCount >= 3 ? `${keywordsCount} كلمات دلالية مستهدفة` : 'أضف على الأقل 3 كلمات مفتاحية دلالية',
      points: kwPts
    });
    score += kwPts;

    return { score, checks };
  };

  // AI & Algorithmic Auto-Optimizer
  const handleAutoGenerateSEO = () => {
    if (!selectedItem) return;

    const itemName = selectedItem.name;
    const itemTagline = selectedItem.tagline || selectedItem.excerpt || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const canonical = `${origin}${getPagePath(selectedItem)}`;
    const bestOgImg = selectedItem.cover_image_url || selectedItem.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';

    if (selectedItem.type === 'tool') {
      setFormData({
        meta_title: `${itemName} - المراجعة الشاملة، الأسعار وأفضل البدائل | دليل الذكاء الاصطناعي`,
        meta_description: `دليل شامل لأداة ${itemName}: ${itemTagline}. اكتشف المميزات، خطط الأسعار، مدى دعم اللغة العربية وتقييمات المستخدمين الفعليين.`,
        meta_keywords: `${itemName}, أداة ${itemName}, مراجعة ${itemName}, أسعار ${itemName}, بدائل ${itemName}, أدوات الذكاء الاصطناعي 2026, الذكاء الاصطناعي العربي`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `${itemName} - تفاصيل وتقييم الأداة | دليل الذكاء الاصطناعي`,
        og_description: `${itemTagline} - مراجعة تفصيلية وتحليل لأهم الميزات والأسعار.`,
        robots_directive: 'index, follow',
      });
    } else if (selectedItem.type === 'category') {
      setFormData({
        meta_title: `أفضل أدوات ${itemName} بالذكاء الاصطناعي (2026) | دليل الذكاء الاصطناعي`,
        meta_description: `اكتشف قائمة متجددة ومحدثة تضم أفضل أدوات ومواقع ${itemName} المعتمدة على الذكاء الاصطناعي مع المقارنات والأسعار.`,
        meta_keywords: `${itemName}, أدوات ${itemName}, ذكاء اصطناعي ${itemName}, تصنيف ${itemName}, برامج الذكاء الاصطناعي`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `قسم ${itemName} | دليل الذكاء الاصطناعي`,
        og_description: `أحدث وأقوى أدوات ${itemName} المعززة بالذكاء الاصطناعي.`,
        robots_directive: 'index, follow',
      });
    } else if (selectedItem.type === 'comparison') {
      setFormData({
        meta_title: `${itemName} - مقارنة شاملة وأيهما تختار؟ | دليل الذكاء الاصطناعي`,
        meta_description: `مقارنة تفصيلية متعمقة بين ${itemName}: الميزات، جودة النتائج، الأسعار، ودعم اللغة العربية لاختيار الأداة الأنسب لعملك.`,
        meta_keywords: `مقارنة ${itemName}, أيهما أفضل ${itemName}, بدائل ذكاء اصطناعي`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `مقارنة: ${itemName} | دليل الذكاء الاصطناعي`,
        og_description: `تحليل تفصيلي مقارن لأفضل الأدوات والخدمات.`,
        robots_directive: 'index, follow',
      });
    } else if (selectedItem.type === 'tutorial') {
      setFormData({
        meta_title: `شرح خطوة بخطوة: ${itemName} | دليل الذكاء الاصطناعي`,
        meta_description: `دليل إرشادي عملي وسهل: ${itemTagline}. تعلم كيفية الاستفادة القصوى من أحدث أدوات الذكاء الاصطناعي باحترافية.`,
        meta_keywords: `شرح ${itemName}, دليل ${itemName}, كيفية استخدام, تعليم ذكاء اصطناعي`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `شرح تعليمي: ${itemName} | دليل الذكاء الاصطناعي`,
        og_description: itemTagline || `شرح عملي مفصل خطوة بخطوة.`,
        robots_directive: 'index, follow',
      });
    } else if (selectedItem.type === 'review') {
      setFormData({
        meta_title: `مراجعة صادقة وتقييم شامل: ${itemName} | دليل الذكاء الاصطناعي`,
        meta_description: `تقييم موضوعي ومفصل لأداة ${itemName}: الإيجابيات، السلبيات، القيمة مقابل السعر، والحكم النهائي بعد التجربة العملية.`,
        meta_keywords: `مراجعة ${itemName}, تقييم ${itemName}, عيوب ومميزات, تجربة`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `مراجعة ${itemName} | دليل الذكاء الاصطناعي`,
        og_description: itemTagline || `مراجعة وتقييم تفصيلي بعد تجربة الاستخدام الفعلي.`,
        robots_directive: 'index, follow',
      });
    } else {
      setFormData({
        meta_title: `${itemName} | مقال تحليلي في دليل الذكاء الاصطناعي`,
        meta_description: `${itemTagline} - قراءة معمقة وتحليل متخصص حول أحدث تطورات الذكاء الاصطناعي وتطبيقاته العملية.`,
        meta_keywords: `${itemName}, مقالات ذكاء اصطناعي, دراسات الذكاء الاصطناعي, شروحات الذكاء الاصطناعي, تقنية المعلومات`,
        og_image_url: bestOgImg,
        canonical_url: canonical,
        og_title: `${itemName} | دليل الذكاء الاصطناعي`,
        og_description: `${itemTagline}`,
        robots_directive: 'index, follow',
      });
    }

    setFeedback({ text: 'تم توليد بيانات SEO محسنة تلقائياً وفق أفضل ممارسات محركات البحث!', type: 'success' });
  };

  // Filtered List
  const filteredItems = items.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    
    if (statusFilter === 'needs_opt') {
      const isMissingMeta = !item.meta_description || !item.og_image_url || !item.canonical_url;
      if (!isMissingMeta) return false;
    } else if (statusFilter === 'optimized') {
      const isComplete = Boolean(item.meta_title && item.meta_description && item.og_image_url && item.canonical_url);
      if (!isComplete) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate Health Metrics
  const totalCount = items.length;
  const withCustomTitle = items.filter(i => Boolean(i.meta_title)).length;
  const withOgImage = items.filter(i => Boolean(i.og_image_url)).length;
  const withCanonical = items.filter(i => Boolean(i.canonical_url)).length;
  const healthScore = totalCount > 0 ? Math.round(((withCustomTitle + withOgImage + withCanonical) / (totalCount * 3)) * 100) : 100;

  // Schema JSON-LD Generator for Live Preview
  const generateSchemaJson = () => {
    if (!selectedItem) return {};
    const origin = getCanonicalDomain();
    const fullUrl = formData.canonical_url || `${origin}/${selectedItem.type === 'tool' ? 'tool' : 'articles'}/${selectedItem.slug}`;

    if (selectedItem.type === 'tool') {
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': selectedItem.name,
        'url': fullUrl,
        'image': formData.og_image_url,
        'applicationCategory': 'BusinessApplication / AI Tool',
        'description': formData.meta_description,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.8',
          'reviewCount': '124'
        }
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': formData.meta_title,
      'description': formData.meta_description,
      'image': formData.og_image_url,
      'url': fullUrl,
      'author': {
        '@type': 'Organization',
        'name': 'فريق تحرير دليل الذكاء الاصطناعي'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'دليل الذكاء الاصطناعي'
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/40 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>إدارة محركات البحث الديناميكية (Dynamic SEO & OpenGraph)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              تحسين ظهور الأدوات والمقالات في Google
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              تحكم ديناميكياً في وسوم Meta Title، Meta Description، بطاقات OpenGraph، والروابط الأساسية (Canonical URLs) وخريطة الموقع XML المحدثة آلياً لكل عناصر المنصة.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowBatchModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>المولد الديناميكي الشامل لوسوم Meta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedItem) setInstantIndexUrl(getPagePath(selectedItem));
                  setShowInstantIndexModal(true);
                  fetchIndexingLogs();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>⚡ الأرشفة الفورية (Instant Indexing)</span>
              </button>

              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sitemap XML</span>
              </a>

              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>RSS 2.0 Feed</span>
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>robots.txt</span>
              </a>

              <a
                href="/api/seo/audit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>تقرير فحص SEO</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-xs text-slate-300 block font-medium">مؤشر الجاهزية</span>
              <span className="text-2xl font-black text-emerald-400">{healthScore}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-xs text-slate-300 block font-medium">وسوم مخصصة</span>
              <span className="text-2xl font-black text-indigo-300">{withCustomTitle} / {totalCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-300 block font-medium">صور OpenGraph</span>
              <span className="text-2xl font-black text-amber-300">{withOgImage} / {totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Dynamic SEO Generator Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    مولد وسوم Meta التلقائي الشامل لقاعدة البيانات
                  </h3>
                  <p className="text-xs text-slate-500">
                    توليد وسوم احترافية (Title, Description, Keywords, OG, Canonical) من بيانات كل صفحة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBatchModal(false);
                  setBatchResult(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {batchResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">{batchResult.message}</span>
                  </div>
                  {batchResult.details && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px]">
                      <div className="bg-white/80 p-2 rounded-xl text-center">
                        <span className="text-slate-500 block text-[10px]">الأدوات</span>
                        <span className="text-emerald-700 font-bold">{batchResult.details.updatedToolsCount || 0}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl text-center">
                        <span className="text-slate-500 block text-[10px]">المقالات</span>
                        <span className="text-emerald-700 font-bold">{batchResult.details.updatedArticlesCount || 0}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl text-center">
                        <span className="text-slate-500 block text-[10px]">التصنيفات</span>
                        <span className="text-emerald-700 font-bold">{batchResult.details.updatedCategoriesCount || 0}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBatchModal(false);
                      setBatchResult(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    تم، إغلاق النافذة
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block">نطاق التوليد المطلوب:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchTarget('all')}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        batchTarget === 'all'
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">كل المحتوى في المنصة</span>
                      <span className="text-[10px] text-slate-400">أدوات، مقالات، تصنيفات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchTarget('missing_only')}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        batchTarget === 'missing_only'
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">الصفحات الناقصة فقط</span>
                      <span className="text-[10px] text-slate-400">التي تفتقر لوسوم أو صور OG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchTarget('tools')}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        batchTarget === 'tools'
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">الأدوات فقط (Tools)</span>
                      <span className="text-[10px] text-slate-400">توليد من الميزات والأسعار</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchTarget('articles')}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        batchTarget === 'articles'
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">المقالات فقط (Articles)</span>
                      <span className="text-[10px] text-slate-400">توليد من الملخص والمحتوى</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">إعادة الكتابة فوق الوسوم الحالية</span>
                    <span className="text-[11px] text-slate-500">إذا كانت مفعلة، سيتم استبدال الوسوم المكتوبة مسبقاً بأخرى مولدة ديناميكياً حديثاً.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={batchOverwrite}
                    onChange={(e) => setBatchOverwrite(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={batchRunning}
                    onClick={handleRunBatchGenerator}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {batchRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{batchRunning ? 'جاري التوليد والحفظ في قاعدة البيانات...' : 'بدء التوليد الشامل الآن'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instant Indexing API Modal */}
      {showInstantIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    أداة الأرشفة الفورية (Instant Indexing API & Search Console)
                  </h3>
                  <p className="text-xs text-slate-500">
                    إخطار محركات البحث فوراً بأي أداة أو مقال جديد لضمان الظهور خلال دقائق.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInstantIndexModal(false);
                  setInstantIndexResults([]);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">رابط الصفحة أو الأداة المراد أرشفته فورياً:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={instantIndexUrl}
                    onChange={(e) => setInstantIndexUrl(e.target.value)}
                    placeholder="/tools/my-ai-tool أو /articles/new-post"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleInstantIndexSubmit()}
                    disabled={instantIndexLoading || !instantIndexUrl}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {instantIndexLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{instantIndexLoading ? 'جاري الإرسال...' : 'إرسال الفهرسة'}</span>
                  </button>
                </div>
                {selectedItem && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span>مختصر:</span>
                    <button
                      type="button"
                      onClick={() => setInstantIndexUrl(getPagePath(selectedItem))}
                      className="text-indigo-600 hover:underline font-mono"
                    >
                      {getPagePath(selectedItem)} (العنصر المحدد حالياً)
                    </button>
                  </div>
                )}
              </div>

              {instantIndexResults.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-900 block">نتائج الإرسال الفوري:</span>
                  <div className="space-y-1.5">
                    {instantIndexResults.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60 text-[11px]">
                        <span className="font-bold uppercase font-mono text-indigo-700">{res.engine}</span>
                        <span className={res.success ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {res.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Indexing Logs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">سجل عمليات الأرشفة الفورية الأخيرة:</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {indexingLogs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl">
                      لا توجد سجلات أرشفة فورية مسجلة بعد في الجلسة الحالية.
                    </div>
                  ) : (
                    indexingLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-mono">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-slate-700 truncate">{log.url}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-indigo-600 font-bold uppercase text-[10px]">{log.engine}</span>
                          <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInstantIndexModal(false);
                  setInstantIndexResults([]);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Meta Tags Audit Hub */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              (auditSummary?.criticalIssuesCount || 0) > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : (auditSummary?.warningIssuesCount || 0) > 0 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              {(auditSummary?.criticalIssuesCount || 0) > 0 ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  نظام الفحص التلقائي للوسوم (Meta Tags Audit & Health Check)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  (auditSummary?.criticalIssuesCount || 0) > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {(auditSummary?.criticalIssuesCount || 0) > 0 ? `${auditSummary?.criticalIssuesCount} صفحات حرجة بحاجة لمعالجة` : 'جميع الصفحات محسنة'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                فحص فوري ودوري لعناوين Meta وأوصاف محركات البحث وبطاقات OpenGraph، وتنبيه فوري عند وجود صفحات تفتقر إلى وسوم محسنة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditReport}
              disabled={auditLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{auditLoading ? 'جاري الفحص...' : 'إعادة الفحص الآن'}</span>
            </button>
          </div>
        </div>

        {/* Audit Stats Grid */}
        {auditSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">الصفحات المفحوصة</span>
              <span className="text-base font-black text-slate-900">{auditSummary.totalPages}</span>
            </div>
            <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-600 block font-bold">صفحات سليمة</span>
              <span className="text-base font-black text-emerald-700">
                {Math.max(0, auditSummary.totalPages - auditSummary.pagesWithIssues)}
              </span>
            </div>
            <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100 text-center">
              <span className="text-[10px] text-amber-600 block font-bold">تنبيهات تحسين</span>
              <span className="text-base font-black text-amber-700">{auditSummary.warningIssuesCount}</span>
            </div>
            <div className="bg-rose-50/60 rounded-2xl p-3 border border-rose-100 text-center">
              <span className="text-[10px] text-rose-600 block font-bold">نواقص حرجة</span>
              <span className="text-base font-black text-rose-700">{auditSummary.criticalIssuesCount}</span>
            </div>
          </div>
        )}

        {/* Issues List with Quick Fix Action */}
        {auditIssues.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                قائمة المشاكل المكتشفة ({auditIssues.length})
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAuditSeverityFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${auditSeverityFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setAuditSeverityFilter('critical')}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${auditSeverityFilter === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-rose-600'}`}
                >
                  الحرجة فقط ({auditSummary?.criticalIssuesCount || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditSeverityFilter('warning')}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${auditSeverityFilter === 'warning' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-amber-600'}`}
                >
                  التحذيرات ({auditSummary?.warningIssuesCount || 0})
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {auditIssues
                .filter(issue => auditSeverityFilter === 'all' || issue.highestSeverity === auditSeverityFilter)
                .map(issue => {
                  const matchedItem = items.find(i => i.id === issue.id && i.type === issue.type);
                  return (
                    <div
                      key={`${issue.type}-${issue.id}`}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        issue.highestSeverity === 'critical'
                          ? 'bg-rose-50/50 border-rose-200/80 text-rose-950'
                          : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="mt-0.5">
                          {issue.highestSeverity === 'critical' ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold truncate text-slate-900">{issue.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 font-mono text-slate-600 border border-slate-200" dir="ltr">
                              {issue.path}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {issue.issues.map((iss, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                  iss.severity === 'critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                • {iss.message}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {matchedItem && (
                        <button
                          type="button"
                          onClick={() => {
                            selectItem(matchedItem);
                            window.scrollTo({ top: 750, behavior: 'smooth' });
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer self-end sm:self-center"
                        >
                          <span>معالجة الوسوم</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* XML Sitemap Live Hub Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  خريطة الموقع الديناميكية (Dynamic XML Sitemap)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  محدثة آلياً 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                توليد فوري ومباشر لملف <code className="text-indigo-600 font-mono font-bold">/sitemap.xml</code> متوافق مع معايير Google & Bing بما يشمل كافة الأدوات، المقالات، التصنيفات، والمراجعات.
              </p>
            </div>
          </div>

          {/* Sitemap Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={regeneratingSitemap}
              onClick={handleRegenerateSitemap}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
              title="إعادة بناء خريطة الموقع فورياً ومزامنتها مع قاعدة البيانات"
            >
              {regeneratingSitemap ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{regeneratingSitemap ? 'جارِ التحديث...' : 'تحديث ومزامنة فورية'}</span>
            </button>

            <button
              type="button"
              disabled={pingingIndexNow}
              onClick={handlePingIndexNow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
              title="إرسال إشعار فوري لمحركات البحث (IndexNow / Bing / Yandex)"
            >
              {pingingIndexNow ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{pingingIndexNow ? 'جارِ الإشعار...' : 'إرسال لـ IndexNow'}</span>
            </button>

            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
                navigator.clipboard.writeText(`${origin}/sitemap.xml`);
                setCopiedSitemap(true);
                setTimeout(() => setCopiedSitemap(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="نسخ رابط sitemap.xml"
            >
              {copiedSitemap ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSitemap ? 'تم النسخ!' : 'نسخ رابط Sitemap'}</span>
            </button>

            <button
              onClick={fetchRawXml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/60 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>معاينة كود XML</span>
            </button>

            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح sitemap.xml</span>
            </a>
          </div>
        </div>

        {/* Engine Status Line */}
        {sitemapEngineStatus && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong className="text-slate-800 font-bold">محرك الخرائط:</strong>{' '}
                {sitemapEngineStatus.isCached ? 'كاش فوري نشط (In-Memory Cache)' : 'توليد ديناميكي مباشر'}
              </span>
              {sitemapEngineStatus.latestLastMod && (
                <span className="text-slate-500">
                  آخر تعديل بالمحتوى: <strong className="font-mono text-slate-700">{new Date(sitemapEngineStatus.latestLastMod).toLocaleDateString('ar-SA')}</strong>
                </span>
              )}
            </div>

            {sitemapEngineStatus.lastPingTime && (
              <span className="text-emerald-700 font-medium">
                آخر إشعار IndexNow: {new Date(sitemapEngineStatus.lastPingTime).toLocaleTimeString('ar-SA')}
              </span>
            )}
          </div>
        )}

        {/* Sitemap Breakdown Badges */}
        {sitemapStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الروابط</span>
              <span className="text-sm font-black text-indigo-600">{sitemapStats.totalUrls}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">الأدوات المفهرسة</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.tools || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">المقالات والأخبار</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.articles || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">التصنيفات</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.categories || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">المقارنات</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.comparisons || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">الشروحات</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.tutorials || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-bold">المراجعات</span>
              <span className="text-sm font-black text-slate-900">{sitemapStats.breakdown?.reviews || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Raw XML Modal Preview */}
      {showSitemapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">معاينة ملف sitemap.xml الفعلي</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawXml);
                    setCopiedSitemap(true);
                    setTimeout(() => setCopiedSitemap(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSitemap ? 'تم النسخ!' : 'نسخ المحتوى'}</span>
                </button>
                <button
                  onClick={() => setShowSitemapModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed select-text" dir="ltr">
              <pre>{rawXml}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Items List & Filters (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>الصفحات القابلة للإدارة ({filteredItems.length})</span>
            </h3>
            <button
              onClick={fetchSEOItems}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الرابط..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter('tool')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'tool'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              الأدوات
            </button>
            <button
              onClick={() => setTypeFilter('article')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'article'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              المقالات
            </button>
            <button
              onClick={() => setTypeFilter('category')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'category'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              التصنيفات
            </button>
            <button
              onClick={() => setTypeFilter('comparison')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'comparison'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              المقارنات
            </button>
            <button
              onClick={() => setTypeFilter('tutorial')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'tutorial'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              الشروحات
            </button>
            <button
              onClick={() => setTypeFilter('review')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'review'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              المراجعات
            </button>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${statusFilter === 'all' ? 'text-slate-900 font-bold bg-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              كافة الحالات
            </button>
            <button
              onClick={() => setStatusFilter('needs_opt')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${statusFilter === 'needs_opt' ? 'text-amber-700 font-bold bg-amber-100' : 'text-slate-500 hover:text-amber-700'}`}
            >
              بحاجة لتحسين
            </button>
            <button
              onClick={() => setStatusFilter('optimized')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${statusFilter === 'optimized' ? 'text-emerald-700 font-bold bg-emerald-100' : 'text-slate-500 hover:text-emerald-700'}`}
            >
              مكتملة
            </button>
          </div>

          {/* Items Scrollable List */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-indigo-600" />
                <p>جاري تحميل قائمة الصفحات...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                لا توجد نتائج تطابق البحث
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id && selectedItem?.type === item.type;
                const isOptimized = Boolean(item.meta_title && item.meta_description && item.og_image_url && item.canonical_url);

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => selectItem(item)}
                    className={`w-full text-right p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/10 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.type === 'tool' ? 'bg-indigo-100 text-indigo-700' :
                          item.type === 'article' ? 'bg-purple-100 text-purple-700' :
                          item.type === 'category' ? 'bg-amber-100 text-amber-700' :
                          item.type === 'comparison' ? 'bg-blue-100 text-blue-700' :
                          item.type === 'tutorial' ? 'bg-emerald-100 text-emerald-700' :
                          item.type === 'review' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.type === 'tool' ? 'أداة' :
                           item.type === 'article' ? 'مقال' :
                           item.type === 'category' ? 'تصنيف' :
                           item.type === 'comparison' ? 'مقارنة' :
                           item.type === 'tutorial' ? 'شرح' :
                           item.type === 'review' ? 'مراجعة' : item.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                        {getPagePath(item)}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isOptimized ? (
                        <span title="مكتمل ومعرف SEO"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></span>
                      ) : (
                        <span title="بحاجة لإكمال بيانات SEO"><AlertCircle className="w-4 h-4 text-amber-500" /></span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: SEO Form & Live Previews (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedItem ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              
              {/* Active Selection Banner & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                      selectedItem.type === 'tool' ? 'bg-indigo-100 text-indigo-700' :
                      selectedItem.type === 'article' ? 'bg-purple-100 text-purple-700' :
                      selectedItem.type === 'category' ? 'bg-amber-100 text-amber-700' :
                      selectedItem.type === 'comparison' ? 'bg-blue-100 text-blue-700' :
                      selectedItem.type === 'tutorial' ? 'bg-emerald-100 text-emerald-700' :
                      selectedItem.type === 'review' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      إعدادات SEO: {
                        selectedItem.type === 'tool' ? 'أداة' :
                        selectedItem.type === 'article' ? 'مقال' :
                        selectedItem.type === 'category' ? 'تصنيف' :
                        selectedItem.type === 'comparison' ? 'مقارنة' :
                        selectedItem.type === 'tutorial' ? 'شرح تعليمي' :
                        selectedItem.type === 'review' ? 'مراجعة' : selectedItem.type
                      }
                    </span>
                    <a
                      href={getPagePath(selectedItem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>معاينة الصفحة الحية</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedItem.name}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={dynamicGenLoading}
                    onClick={handleServerDynamicGenerate}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                    title="توليد وسوم Meta ديناميكياً من بيانات هذه الأداة/المقال في قاعدة البيانات"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-indigo-200 ${dynamicGenLoading ? 'animate-spin' : ''}`} />
                    <span>{dynamicGenLoading ? 'جاري التوليد من DB...' : 'توليد ديناميكي من قاعدة البيانات'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    title="توليد ذكي سريع محلياً"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>توليد خوارزمي</span>
                  </button>
                </div>
              </div>

              {/* Live Search Engine Ranking Potential Score Meter */}
              {(() => {
                const { score, checks } = calculateRankingPotential();
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {score}%
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            مؤشر قوة التصدر في نتائج البحث (Ranking Potential)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {score >= 80 ? 'ممتاز! الوسوم مستوفية لأعلى معايير تصدر نتائج Google وBing.' : score >= 50 ? 'جيد، ولكن هناك عناصر وسوم بحاجة إلى ضبط.' : 'تنبيه: الصفحة بحاجة لإكمال بيانات الـ SEO الأساسية.'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {score >= 80 ? 'جاهز للمنافسة' : score >= 50 ? 'تحسين متوسط' : 'غير مكتمل'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Checks list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {checks.map((check, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          {check.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block">{check.title}</span>
                            <span className="text-slate-500 text-[10px]">{check.tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Feedback alert */}
              {feedback && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                  feedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleSaveSEO} className="space-y-5">
                
                {/* 1. Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>عنوان الصفحة (Meta Title)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[11px] font-bold ${
                      formData.meta_title.length >= 40 && formData.meta_title.length <= 60
                        ? 'text-emerald-600'
                        : formData.meta_title.length > 60
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}>
                      {formData.meta_title.length} / 60 حرف (المثالي: 40-60)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    placeholder="مثال: ChatGPT - المراجعة الشاملة، المميزات والأسعار | دليل الذكاء الاصطناعي"
                  />
                </div>

                {/* 2. Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>وصف الصفحة لمحركات البحث (Meta Description)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[11px] font-bold ${
                      formData.meta_description.length >= 120 && formData.meta_description.length <= 160
                        ? 'text-emerald-600'
                        : formData.meta_description.length > 160
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}>
                      {formData.meta_description.length} / 160 حرف (المثالي: 120-160)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 leading-relaxed"
                    placeholder="ملخص جذاب وموجز يظهر للمستخدم في نتائج بحث جوجل لجذب النقرات..."
                  />
                </div>

                {/* 3. Canonical URL & Robots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>الرابط الأساسي (Canonical URL)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                      dir="ltr"
                      placeholder="https://daleel.ai/tools/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>توجيه العناكب (Robots Directive)</span>
                    </label>
                    <select
                      value={formData.robots_directive}
                      onChange={(e) => setFormData({ ...formData, robots_directive: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="index, follow">Index, Follow (مفهرس ومتبوع - الموصى به)</option>
                      <option value="noindex, follow">NoIndex, Follow (عدم الظهور في البحث، تتبع الروابط)</option>
                      <option value="index, nofollow">Index, NoFollow (مفهرس، عدم تتبع الروابط)</option>
                      <option value="noindex, nofollow">NoIndex, NoFollow (حجب كلي عن محركات البحث)</option>
                    </select>
                  </div>
                </div>

                {/* 4. OpenGraph Image & Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>صورة المشاركة (OpenGraph / Twitter Image URL)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.og_image_url}
                      onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                      dir="ltr"
                      placeholder="https://.../og-banner.jpg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>الكلمات المفتاحية (Meta Keywords)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                      placeholder="مفصولة بفاصلة: أداة ذكاء اصطناعي, مراجعة, أسعار"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات SEO فورياً'}</span>
                  </button>
                </div>
              </form>

              {/* ---------------- LIVE PREVIEWS TABS ---------------- */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      المعاينة الحية التفاعلية
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('google')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'google' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      نتائج بحث Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('social')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'social' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      بطاقة التواصل (OpenGraph)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('schema')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'schema' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Schema.org (JSON-LD)
                    </button>
                  </div>
                </div>

                {/* Preview 1: Google SERP */}
                {previewTab === 'google' && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Google SERP Snippet Preview</span>
                      <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-slate-600">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1 rounded cursor-pointer ${previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : ''}`}
                          title="معاينة سطح المكتب"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1 rounded cursor-pointer ${previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : ''}`}
                          title="معاينة الجوال"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* The Google Card */}
                    <div className={`bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-1.5 ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''}`} dir="rtl">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-sans" dir="ltr">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border">
                          D
                        </div>
                        <div className="leading-tight">
                          <span className="font-bold text-slate-900 block text-[11px]">دليل الذكاء الاصطناعي</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formData.canonical_url || `https://daleel.ai${getPagePath(selectedItem)}`}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                        {formData.meta_title || selectedItem.name}
                      </h4>

                      <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                        {formData.meta_description || 'الوصف يظهر هنا كما سيعرضه محرك بحث جوجل للزوار...'}
                      </p>

                      {/* Rich snippet stars */}
                      {selectedItem.type === 'tool' && (
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-amber-500 font-bold">★★★★★</span>
                          <span>التقييم: 4.8 · 124 مراجعة موثوقة · مجاني/مدفوع</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview 2: Social OpenGraph Card */}
                {previewTab === 'social' && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 block">OpenGraph / Twitter / WhatsApp Social Card</span>
                    
                    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                      {/* Image */}
                      <div className="aspect-[1.91/1] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                        {formData.og_image_url ? (
                          <OptimizedImage 
                            src={formData.og_image_url} 
                            alt={formData.meta_title} 
                            aspectRatio="1.91/1"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <div className="text-center text-slate-500 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                            <span>لا توجد صورة OpenGraph مخصصة</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold z-10">
                          daleel.ai
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-1 text-right" dir="rtl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono" dir="ltr">
                          DALEEL.AI
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                          {formData.og_title || formData.meta_title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {formData.og_description || formData.meta_description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview 3: Schema JSON-LD */}
                {previewTab === 'schema' && (
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                      <span className="font-mono flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Google Rich Results Schema (JSON-LD)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(generateSchemaJson(), null, 2))}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ الشفرة</span>
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto p-2 text-emerald-400 max-h-56" dir="ltr">
                      {JSON.stringify(generateSchemaJson(), null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">اختر أداة أو مقالاً من القائمة الجانبية لتعديل إعدادات الـ SEO الخاصة به.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
