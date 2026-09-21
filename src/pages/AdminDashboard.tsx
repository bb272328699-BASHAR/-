import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Layers, 
  Sparkles, 
  Settings, 
  FileText, 
  Scale, 
  Loader2,
  RefreshCw,
  Search,
  Globe,
  DollarSign,
  Calculator
} from 'lucide-react';
import { Tool, Category } from '../types.ts';
import { AdminSEOManager } from '../components/AdminSEOManager.tsx';
import { AdminAdsManager } from '../components/AdminAdsManager.tsx';
import { AdminAnalyticsDashboard } from '../components/AdminAnalyticsDashboard.tsx';
import { AdminRevenueEstimator } from '../components/AdminRevenueEstimator.tsx';
import { AdminRevenueGrowth } from '../components/AdminRevenueGrowth.tsx';
import { AdminKeywordOpportunityManager } from '../components/AdminKeywordOpportunityManager.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { TrendingUp, Split, KeyRound, Zap } from 'lucide-react';
import { purgeServerCache } from '../utils/cacheManager.ts';

interface AdminDashboardProps {
  navigate: (path: string) => void;
  onLogout: () => void;
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, onLogout, token }) => {
  const [stats, setStats] = useState<any>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'keywords' | 'revenue' | 'growth' | 'tools' | 'addTool' | 'seo' | 'ads' | 'categories' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Tool Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    overview: '',
    logo_url: '',
    website_url: '',
    pricing_type: 'Freemium',
    starting_price: '',
    is_trending: false,
    is_popular: false,
    is_featured: false,
    status: 'published',
    category_id: '',
    who_is_it_for: '',
    meta_title: '',
    meta_description: ''
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, toolsRes, catsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/tools', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories')
      ]);

      if (statsRes.status === 401 || toolsRes.status === 401) {
        onLogout();
        return;
      }

      const statsData = await statsRes.json();
      const toolsData = await toolsRes.json();
      const catsData = await catsRes.json();

      setStats(statsData);
      setTools(toolsData || []);
      setCategories(catsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category_ids: formData.category_id ? [formData.category_id] : []
      };

      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'تمت إضافة الأداة بنجاح إلى قاعدة البيانات!', type: 'success' });
        setActiveTab('tools');
        fetchAdminData();
        setFormData({
          name: '',
          slug: '',
          tagline: '',
          description: '',
          overview: '',
          logo_url: '',
          website_url: '',
          pricing_type: 'Freemium',
          starting_price: '',
          is_trending: false,
          is_popular: false,
          is_featured: false,
          status: 'published',
          category_id: '',
          who_is_it_for: '',
          meta_title: '',
          meta_description: ''
        });
      } else {
        setMessage({ text: data.error || 'حدث خطأ أثناء الإضافة', type: 'error' });
      }
    } catch {
      setMessage({ text: 'تعذر الاتصال بالخادم', type: 'error' });
    }
  };

  const handleDeleteTool = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الأداة "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage({ text: `تم حذف الأداة "${name}" بنجاح وتحديث الكاش`, type: 'success' });
        fetchAdminData();
      }
    } catch {
      setMessage({ text: 'حدث خطأ في عملية الحذف', type: 'error' });
    }
  };

  const handlePurgeCache = async (slug?: string) => {
    try {
      setMessage({ text: 'جاري تنظيف الكاش وتحديث البيانات...', type: 'success' });
      const res = await purgeServerCache(token, slug ? 'slug' : 'all', slug);
      if (res.success) {
        setMessage({ text: res.message || 'تم تنظيف الكاش بنجاح وستظهر التعديلات لجميع المستخدمين فوراً', type: 'success' });
        fetchAdminData();
      } else {
        setMessage({ text: res.message || 'فشل تنظيف الكاش', type: 'error' });
      }
    } catch (e: any) {
      setMessage({ text: e.message || 'خطأ أثناء تنظيف الكاش', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">لوحة تحكم وإدارة المنصة (Admin CMS)</h1>
            <p className="text-xs text-slate-400">إدارة محتوى قاعدة بيانات PostgreSQL الحقيقية - صلاحيات كاملة</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => handlePurgeCache()}
            className="text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            title="تنظيف كاش الخادم والمتصفح فوراً لضمان رؤية أحدث التعديلات"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>تنظيف الكاش الشامل</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl"
          >
            معاينة الموقع الحي
          </button>
          <button
            onClick={onLogout}
            className="text-xs font-bold bg-rose-600/90 hover:bg-rose-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          نظرة عامة وإحصائيات
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          إدارة الأدوات ({tools.length})
        </button>

        <button
          onClick={() => setActiveTab('addTool')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'addTool' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أداة جديدة</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>مراقبة الزيارات و Google Analytics</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 text-[10px] font-mono">Live</span>
        </button>

        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'keywords' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>الكلمات المفتاحية واقتراح المقالات</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 text-[10px] font-mono">SEO High-CPC</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'revenue' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>حاسبة وأرباح AdSense المتوقعة</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 text-[10px] font-mono">RPM Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('growth')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'growth' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Split className="w-4 h-4 text-emerald-400" />
          <span>نمو الإيرادات ومحاكاة A/B</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 text-[10px] font-mono">A/B Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'seo' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>إدارة SEO و OpenGraph</span>
          <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-200 text-[10px] font-mono">Dynamic</span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'ads' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>إدارة الإعلانات والمساحات</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 text-[10px] font-mono">AdSense</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">الأدوات المفهرسة</span>
              <span className="text-2xl font-black text-slate-900">{stats.counts?.tools || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">الأقسام الرئيسية</span>
              <span className="text-2xl font-black text-indigo-600">{stats.counts?.categories || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">المقالات المنشورة</span>
              <span className="text-2xl font-black text-slate-900">{stats.counts?.articles || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">المراجعات النقدية</span>
              <span className="text-2xl font-black text-slate-900">{stats.counts?.reviews || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">المقارنات المباشرة</span>
              <span className="text-2xl font-black text-slate-900">{stats.counts?.comparisons || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">الشروحات والأدلة</span>
              <span className="text-2xl font-black text-emerald-600">{stats.counts?.tutorials || 0}</span>
            </div>
          </div>

          {/* Audit Logs History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">سجل النشاط والتدقيق الأخير (Audit Logs)</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {stats.recentLogs?.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-500 mx-2">على {log.entity_type}</span>
                  </div>
                  <span className="text-slate-400">{new Date(log.created_at).toLocaleString('ar-EG')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. TOOLS MANAGEMENT LIST */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800">قائمة الأدوات المنشورة في قاعدة البيانات</h3>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">الأداة</th>
                  <th className="p-3">الرابط الدائم (Slug)</th>
                  <th className="p-3">التسعير</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tools.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      {t.logo_url && <img src={t.logo_url} alt={t.name || ''} className="w-6 h-6 rounded-md object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />}
                      <span>{t.name}</span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{t.slug}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{t.pricing_type}</span>
                    </td>
                    <td className="p-3 text-amber-600 font-bold">{t.rating} ★</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">منشور</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/tools/${t.slug}`)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="معاينة الأداة"
                        >
                          معاينة
                        </button>
                        <button
                          onClick={() => handlePurgeCache(t.slug)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="تحديث وتنظيف كاش هذه الأداة فوراً"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(t.id, t.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                          title="حذف الأداة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. ADD NEW TOOL FORM */}
      {activeTab === 'addTool' && (
        <form onSubmit={handleCreateTool} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
            إضافة أداة ذكاء اصطناعي جديدة إلى الكتالوج
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الأداة *</label>
              <input
                required
                type="text"
                placeholder="مثال: ElevenLabs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعرف الدائم (Slug) *</label>
              <input
                required
                type="text"
                placeholder="مثال: elevenlabs"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الوصف المختصر (Tagline) *</label>
            <input
              required
              type="text"
              placeholder="جملة موجزة تشرح وظيفة الأداة بدقة..."
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الوصف الكامل والمفصل *</label>
            <textarea
              required
              rows={3}
              placeholder="شرح تفصيلي عن الأداة، تقنياتها، وكيفية استخدامها..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرابط الرسمي للأداة *</label>
              <input
                required
                type="url"
                placeholder="https://..."
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار (Logo URL)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القسم / الفئة</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">اختر قسماً رئيسياً</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع التسعير</label>
              <select
                value={formData.pricing_type}
                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Freemium">مجاني جزئياً (Freemium)</option>
                <option value="Free">مجاني تماماً (Free)</option>
                <option value="Free Trial">تجربة مجانية (Trial)</option>
                <option value="Paid">مدفوع بالكامل (Paid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سعر البداية</label>
              <input
                type="text"
                placeholder="مثال: 20$ / شهر"
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_trending}
                onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>أداة رائجة (Trending)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>أداة مميزة وشائعة (Popular)</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md"
          >
            نشر الأداة وحفظها في قاعدة البيانات
          </button>
        </form>
      )}

      {/* TAB CONTENT: 4. ANALYTICS & GOOGLE ANALYTICS REPORT */}
      {activeTab === 'analytics' && (
        <ErrorBoundary isWidget widgetName="تقارير الزيارات و Google Analytics">
          <AdminAnalyticsDashboard token={token} />
        </ErrorBoundary>
      )}

      {/* TAB CONTENT: 4.2 KEYWORD OPPORTUNITIES & ARTICLE SUGGESTIONS */}
      {activeTab === 'keywords' && (
        <ErrorBoundary isWidget widgetName="الكلمات المفتاحية واقتراح المقالات">
          <AdminKeywordOpportunityManager />
        </ErrorBoundary>
      )}

      {/* TAB CONTENT: 4.5 REVENUE & ADSENSE ESTIMATOR */}
      {activeTab === 'revenue' && (
        <ErrorBoundary isWidget widgetName="حاسبة وأرباح AdSense المتوقعة">
          <AdminRevenueEstimator currentMonthlyPageviews={stats?.counts?.tools ? stats.counts.tools * 1200 : 48000} />
        </ErrorBoundary>
      )}

      {/* TAB CONTENT: 4.6 REVENUE GROWTH & A/B TESTING */}
      {activeTab === 'growth' && (
        <ErrorBoundary isWidget widgetName="نمو الإيرادات ومحاكاة A/B">
          <AdminRevenueGrowth initialMonthlyPageviews={stats?.counts?.tools ? stats.counts.tools * 1200 : 50000} />
        </ErrorBoundary>
      )}

      {/* TAB CONTENT: 5. DYNAMIC SEO & OPENGRAPH MANAGER */}
      {activeTab === 'seo' && (
        <ErrorBoundary isWidget widgetName="مدير السيو والميتا تاج">
          <AdminSEOManager token={token} />
        </ErrorBoundary>
      )}

      {/* TAB CONTENT: 5. RESPONSIVE ADS MANAGER */}
      {activeTab === 'ads' && (
        <ErrorBoundary isWidget widgetName="إدارة الإعلانات والمساحات">
          <AdminAdsManager token={token} />
        </ErrorBoundary>
      )}

    </div>
  );
};
