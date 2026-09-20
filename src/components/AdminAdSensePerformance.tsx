import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  MousePointerClick, 
  Eye, 
  RefreshCw, 
  Loader2, 
  Layers, 
  Zap, 
  ArrowUpRight, 
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface AdminAdSensePerformanceProps {
  token: string;
}

export const AdminAdSensePerformance: React.FC<AdminAdSensePerformanceProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'revenue' | 'correlation' | 'rpm'>('revenue');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/adsense/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('فشل في جلب مؤشرات أداء أدسنس');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">جاري تحميل بيانات أداء أدسنس واتجاهات الأرباح الحية...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-800 text-sm font-bold space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{error || 'فشل جلب المؤشرات'}</span>
        </div>
        <button 
          onClick={fetchMetrics}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { realtimeKPIs, weeklyRevenueTrends, topAdUnits, publisherId } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30">
              Live Connected
            </span>
            <span className="text-xs text-slate-400 font-mono">Publisher ID: {publisherId}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">تحليلات الأرباح واتجاهات الزيارات الأسبوعية</h2>
          <p className="text-xs text-slate-400">مراقبة الارتباط الفعلي بين ارتفاع حركة الزوار (Pageviews) وأرباح الإعلانات (Ad Revenue & RPM)</p>
        </div>

        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث المتركس المباشر</span>
        </button>
      </div>

      {/* Realtime KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Estimated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>أرباح اليوم المقدرة</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${realtimeKPIs.todayEstimated?.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>أمس: <strong className="text-slate-700 font-mono">${realtimeKPIs.yesterdayEstimated?.toFixed(2)}</strong></span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12.1%
            </span>
          </div>
        </div>

        {/* This Month Estimated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>أرباح هذا الشهر المقدرة</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${realtimeKPIs.thisMonthEstimated?.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>آخر 7 أيام: <strong className="text-slate-700 font-mono">${realtimeKPIs.last7DaysEstimated?.toFixed(2)}</strong></span>
            <span className="text-indigo-600 font-bold">MoM Growth</span>
          </div>
        </div>

        {/* Page RPM */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>العائد لكل ألف ظهور (Page RPM)</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${realtimeKPIs.pageRpm?.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Impression RPM: <strong className="text-slate-700 font-mono">${realtimeKPIs.impressionRpm?.toFixed(2)}</strong></span>
            <span className="text-amber-600 font-bold">High RPM Zone</span>
          </div>
        </div>

        {/* Clicks & CTR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>نسبة النقر (CTR) / اليوم</span>
            <MousePointerClick className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {realtimeKPIs.ctrToday}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>النقرات: <strong className="text-slate-700 font-mono">{realtimeKPIs.clicksToday}</strong></span>
            <span>متوسط CPC: <strong className="text-slate-700 font-mono">{realtimeKPIs.cpcToday}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Component */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>مخطط اتجاهات العائدات والربط بحجم الترافيك (Recharts Revenue Trends)</span>
            </h3>
            <p className="text-xs text-slate-500">تحليل تراكمي أسبوعي لبيانات الزيارات والأرباح ومتوسط العائد لكل 1000 زيارة</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setChartViewMode('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'revenue' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأرباح الأسبوعية ($)
            </button>
            <button
              onClick={() => setChartViewMode('correlation')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'correlation' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ارتباط الزيارات والأرباح
            </button>
            <button
              onClick={() => setChartViewMode('rpm')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'rpm' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مؤشر RPM ونسبة النقر CTR
            </button>
          </div>
        </div>

        {/* Interactive Chart Area */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyRevenueTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '12px', 
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'الأرباح الأسبوعية ($)' || name === 'earnings') return [`$${value}`, 'الأرباح المقدرة'];
                  if (name === 'Pageviews (المشاهدات)' || name === 'pageviews') return [value.toLocaleString(), 'مشاهدات الصفحات'];
                  if (name === 'Impressions (الظهور)' || name === 'impressions') return [value.toLocaleString(), 'ظهور الإعلانات'];
                  if (name === 'Page RPM ($)' || name === 'rpm') return [`$${value}`, 'العائد لكل 1000 زيارة'];
                  if (name === 'CTR (%)' || name === 'ctr') return [`${value}%`, 'نسبة النقرات'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

              {chartViewMode === 'revenue' && (
                <>
                  <Bar yAxisId="left" dataKey="pageviews" name="Pageviews (المشاهدات)" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={28} />
                  <Area yAxisId="right" type="monotone" dataKey="earnings" name="الأرباح الأسبوعية ($)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#earningsGradient)" />
                </>
              )}

              {chartViewMode === 'correlation' && (
                <>
                  <Area yAxisId="left" type="monotone" dataKey="pageviews" name="Pageviews (المشاهدات)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#pageviewsGradient)" />
                  <Line yAxisId="right" type="monotone" dataKey="earnings" name="الأرباح الأسبوعية ($)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                </>
              )}

              {chartViewMode === 'rpm' && (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="rpm" name="Page RPM ($)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Ad Units Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>أعلى الوحدات الإعلانية أداءً ومساهمة في الأرباح (Top Performing Ad Units)</span>
            </h3>
            <p className="text-xs text-slate-500">تفاصيل أداء الوحدات الموزعة في القوالب حسب معرف Slot ID والإيرادات المباشرة</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            {topAdUnits.length} وحدات نشطة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/60">
              <tr>
                <th className="p-3.5">اسم الموضع والوحدة</th>
                <th className="p-3.5">معرف Ad Slot ID</th>
                <th className="p-3.5">نوع الإعلان</th>
                <th className="p-3.5">الظهور (Impressions)</th>
                <th className="p-3.5">النقرات (Clicks)</th>
                <th className="p-3.5">نسبة النقر (CTR)</th>
                <th className="p-3.5">الأرباح المقدرة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {topAdUnits.map((unit: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{unit.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-indigo-600 font-bold">{unit.slotId}</td>
                  <td className="p-3.5 text-slate-500">{unit.type}</td>
                  <td className="p-3.5 font-mono">{unit.impressions.toLocaleString()}</td>
                  <td className="p-3.5 font-mono">{unit.clicks.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-blue-600 font-bold">{unit.ctr}</td>
                  <td className="p-3.5 font-mono font-black text-emerald-600">${unit.earnings.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
