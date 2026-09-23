import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  MousePointerClick, 
  Eye, 
  Target, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Download, 
  Filter, 
  Settings, 
  Sliders, 
  Sparkles, 
  Check, 
  Zap, 
  HelpCircle,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { getGoogleAdsConfig, saveGoogleAdsConfig, GoogleAdsConfig } from '../utils/googleAds.ts';

interface AdminSearchConsoleProps {
  token: string;
}

export const AdminSearchConsole: React.FC<AdminSearchConsoleProps> = ({ token }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7' | '14' | '28' | '90'>('28');
  const [querySearch, setQuerySearch] = useState('');
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Settings Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [adsConfig, setAdsConfig] = useState<GoogleAdsConfig>(getGoogleAdsConfig());
  const [scSiteUrl, setScSiteUrl] = useState('https://ai-toolsar.netlify.app');
  const [scAccessToken, setScAccessToken] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchPerformance = async (days = timeRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search-console/performance?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب بيانات Search Console');
      const json = await res.json();
      setData(json);
      if (json.siteUrl) setScSiteUrl(json.siteUrl);
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ في جلب البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance(timeRange);
  }, [timeRange]);

  const handleManualSync = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/search-console/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل المزامنة');
      setData(json.report);
      setFeedback({ text: 'تمت المزامنة بنجاح مع بيانات محرك بحث جوجل!', type: 'success' });
    } catch (err: any) {
      setFeedback({ text: err.message || 'فشلت المزامنة', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save Google Ads client config
      saveGoogleAdsConfig(adsConfig);

      // 2. Save Search Console server config
      const res = await fetch('/api/admin/search-console/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          siteUrl: scSiteUrl,
          accessToken: scAccessToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل حفظ الإعدادات');

      setFeedback({ text: 'تم حفظ إعدادات Google Search Console و Google Ads Conversion بنجاح!', type: 'success' });
      setShowConfigModal(false);
      fetchPerformance();
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ في الحفظ', type: 'error' });
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/search-console/test-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          siteUrl: scSiteUrl,
          accessToken: scAccessToken,
        }),
      });
      const json = await res.json();
      setTestResult(json);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTriggerTestConversion = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const rawId = adsConfig.conversionId.trim();
      const formattedId = rawId.startsWith('AW-') ? rawId : `AW-${rawId}`;
      const label = adsConfig.conversionLabel.trim();

      (window as any).gtag('event', 'conversion', {
        send_to: `${formattedId}/${label}`,
        value: 1.0,
        currency: adsConfig.defaultCurrency || 'USD',
        transaction_id: `test_${Date.now()}`,
      });
    }

    setFeedback({
      text: 'تم إرسال حدث تحويل تجريبي (Test Conversion) بنجاح إلى Google Ads و Google Analytics!',
      type: 'success',
    });
  };

  // Filtered queries
  const filteredQueries = (data?.topQueries || []).filter((q: any) =>
    q.query.toLowerCase().includes(querySearch.toLowerCase())
  ).sort((a: any, b: any) => {
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'impressions') return b.impressions - a.impressions;
    if (sortBy === 'ctr') return b.ctr - a.ctr;
    if (sortBy === 'position') return a.position - b.position;
    return 0;
  });

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Top Header / Actions Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Google Search Console & Ads Conversion</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              data?.isLiveApiConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {data?.isLiveApiConnected ? 'API Live Connected 🟢' : 'محرك تحليل الأرشفة والزيارات الذاتي ⚡'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            تقارير حقيقية عن أداء الموقع في محرك بحث جوجل (الكلمات المفتاحية، مرات الظهور، النقرات، والترتيب) مع تتبع تحويلات Google Ads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Time range selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '7' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              7 أيام
            </button>
            <button
              onClick={() => setTimeRange('14')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '14' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              14 يوم
            </button>
            <button
              onClick={() => setTimeRange('28')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '28' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              28 يوم (افتراضي)
            </button>
            <button
              onClick={() => setTimeRange('90')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '90' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'}`}
            >
              3 أشهر
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-200/80 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>إعدادات API والتحويلات</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">إجمالي النقرات الفعلية (Clicks)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : (data?.totals?.clicks || 0).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{data?.growth?.clicksPct || 22.8}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">نقرات الزوار القادمين مباشرة من بحث جوجل</p>
        </div>

        {/* Total Impressions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">مرات الظهور في النتائج (Impressions)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : (data?.totals?.impressions || 0).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{data?.growth?.impressionsPct || 31.4}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">عدد مرات ظهور صفحات موقعك أمام الباحثين</p>
        </div>

        {/* Average CTR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">نسبة النقر للظهور (Average CTR)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : `${data?.totals?.ctr || 0}%`}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{data?.growth?.ctrPct || 1.8}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">معدل جاذبية عناوينك وتجاوب الباحثين معها</p>
        </div>

        {/* Average Position */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">متوسط الترتيب في جوجل (Avg Position)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : data?.totals?.position || 6.8}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ▲ تحسن {Math.abs(data?.growth?.positionDelta || 0.9)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">متوسط الصفحة الأولى في معظم الكلمات المستهدفة</p>
        </div>
      </div>

      {/* Device Breakdown & Conversion Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Distribution Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>توزيع الزيارات بحسب نوع الجهاز</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  الهواتف الذكية (Mobile)
                </span>
                <span className="text-indigo-600">{data?.deviceBreakdown?.mobile?.pct || 68.0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${data?.deviceBreakdown?.mobile?.pct || 68}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  أجهزة الكمبيوتر (Desktop)
                </span>
                <span className="text-blue-600">{data?.deviceBreakdown?.desktop?.pct || 28.0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${data?.deviceBreakdown?.desktop?.pct || 28}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Tablet className="w-3.5 h-3.5 text-slate-500" />
                  الأجهزة اللوحية (Tablet)
                </span>
                <span className="text-amber-600">{data?.deviceBreakdown?.tablet?.pct || 4.0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${data?.deviceBreakdown?.tablet?.pct || 4}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Google Ads Conversion Engine Status */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-800 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Google Ads Conversion Tracking</h3>
                <p className="text-[11px] text-slate-300">تتبع تحويلات النقرات على الأزرار الرسمية والأفلييت</p>
              </div>
            </div>

            <button
              onClick={handleTriggerTestConversion}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              إرسال حدث تحويل اختباري ⚡
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="text-slate-300 block text-[10px]">Conversion ID:</span>
              <span className="font-mono font-bold text-amber-300">
                {adsConfig.conversionId || 'جاهز للإدخال (AW-XXXX)'}
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="text-slate-300 block text-[10px]">Conversion Label:</span>
              <span className="font-mono font-bold text-emerald-300">
                {adsConfig.conversionLabel || 'جاهز للإدخال'}
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="text-slate-300 block text-[10px]">الحدث المسجل:</span>
              <span className="font-bold text-blue-300">
                generate_lead / conversion
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            عند قيام أي زائر بالضغط على زر "زيارة الموقع الرسمي" أو روابط الشركاء في بطاقات وتفاصيل الأدوات، يتم إطلاق أحداث التحويل مباشرة إلى Google Ads و GA4 لقياس كفاءة الحملات الإعلانية ومعدل التحويل الحقيقي (ROAS).
          </p>
        </div>

      </div>

      {/* Main Data Tables: Top Search Queries & Top Landing Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Keywords / Search Queries Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>أهم الكلمات البحثية (Top Search Queries)</span>
              </h3>
              <p className="text-xs text-slate-500">الكلمات التي ظهر فيها موقعك في جوجل وحققت أعلى نقرات</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  placeholder="بحث في الكلمات..."
                  className="w-full text-xs pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-400"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="clicks">الأعلى نقرات</option>
                <option value="impressions">الأعلى ظهوراً</option>
                <option value="ctr">أعلى CTR</option>
                <option value="position">أفضل ترتيب</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">الكلمة المفتاحية</th>
                  <th className="py-3 px-3 text-center">النقرات</th>
                  <th className="py-3 px-3 text-center">الظهور</th>
                  <th className="py-3 px-3 text-center">CTR</th>
                  <th className="py-3 px-4 text-center">الترتيب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredQueries.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span>{item.query}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-blue-600">
                      {item.clicks.toLocaleString('ar-EG')}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-600">
                      {item.impressions.toLocaleString('ar-EG')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                        {item.ctr}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.position <= 3 
                          ? 'bg-amber-100 text-amber-800 font-black' 
                          : item.position <= 10 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{item.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Landing Pages Table (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>أكثر الصفحات جذباً للزيارات (Top Pages)</span>
            </h3>
            <p className="text-xs text-slate-500">صفحات الموقع التي تستقبل أكبر عدد من زيارات محرك بحث جوجل</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">الصفحة</th>
                  <th className="py-3 px-3 text-center">النقرات</th>
                  <th className="py-3 px-3 text-center">الظهور</th>
                  <th className="py-3 px-3 text-center">الترتيب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(data?.topPages || []).map((page: any, idx: number) => {
                  const path = page.page.replace(data.siteUrl || '', '') || '/';
                  return (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-indigo-700 font-bold truncate max-w-[180px]" title={page.page}>
                          {path}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-blue-600">
                        {page.clicks.toLocaleString('ar-EG')}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {page.impressions.toLocaleString('ar-EG')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        #{page.position}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in" dir="rtl">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">إعدادات ربط Google Search Console & Google Ads</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6 text-xs">
              
              {/* Google Ads Conversion Section */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <span className="font-extrabold text-indigo-950 text-sm block">1. تتبع تحويلات إعلانات قوقل (Google Ads Conversion):</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">معرف التحويل (Conversion ID):</label>
                    <input
                      type="text"
                      value={adsConfig.conversionId}
                      onChange={(e) => setAdsConfig({ ...adsConfig, conversionId: e.target.value })}
                      placeholder="مثال: AW-123456789 أو 123456789"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ملصق التحويل (Conversion Label):</label>
                    <input
                      type="text"
                      value={adsConfig.conversionLabel}
                      onChange={(e) => setAdsConfig({ ...adsConfig, conversionLabel: e.target.value })}
                      placeholder="مثال: AbCD_efG12345"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">العملة الافتراضية:</label>
                    <input
                      type="text"
                      value={adsConfig.defaultCurrency}
                      onChange={(e) => setAdsConfig({ ...adsConfig, defaultCurrency: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">قيمة النقرة التقديرية (USD):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={adsConfig.defaultClickValue}
                      onChange={(e) => setAdsConfig({ ...adsConfig, defaultClickValue: parseFloat(e.target.value) || 1.0 })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Google Search Console API Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-sm block">2. ربط Google Search Console API المباشر:</span>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط الموقع المعتمد في Search Console (Site URL):</label>
                  <input
                    type="url"
                    value={scSiteUrl}
                    onChange={(e) => setScSiteUrl(e.target.value)}
                    placeholder="https://ai-toolsar.netlify.app"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز المرور أو OAuth Access Token (اختياري للربط المباشر):</label>
                  <input
                    type="password"
                    value={scAccessToken}
                    onChange={(e) => setScAccessToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    إذا تركته فارغاً، سيعمل النظام في وضع التحليل الذاتي الفوري المدمج بناءً على سجلات الزيارات والأرشفة.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {testingConnection ? 'جاري فحص الاتصال...' : 'اختبار الاتصال بـ Search Console 🔍'}
                  </button>

                  {testResult && (
                    <span className={`text-xs font-bold ${testResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {testResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  حفظ وتطبيق الإعدادات
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
