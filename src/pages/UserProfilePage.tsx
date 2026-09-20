import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bookmark, 
  Star, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface BookmarkedTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string;
  pricing_type: string;
  rating: number;
  review_count: number;
  arabic_support: string;
  saved_at: string;
}

interface UserProfilePageProps {
  navigate: (path: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate }) => {
  const { user, token, logout, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'settings'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkedTool[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setEditName(user.full_name);
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    if (!token) return;
    setIsLoadingBookmarks(true);
    try {
      const res = await fetch('/api/user/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (toolId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/user/bookmarks/${toolId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== toolId));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editName.trim()) return;
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: editName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateMsg('تم حفظ التعديلات بنجاح!');
        setTimeout(() => setUpdateMsg(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setUpdateMsg(err.message || 'حدث خطأ في التحديث');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">الملف الشخصي والمفضلة</h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          يرجى تسجيل الدخول للوصول إلى أدواتك المحفوظة، تقييماتك الحقيقية، وإعدادات حسابك الموثق.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
        >
          تسجيل الدخول الآن
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/70 via-blue-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-500/20">
              {user.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.full_name}</h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role === 'admin' ? 'مدير النظام' : 'عضو موثق'}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium dir-ltr text-right">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  عضو منذ {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '2026'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-600 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                  {bookmarks.length} أداة محفوظة
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>لوحة التحكم الرئيسية</span>
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>المفضلة والأدوات المحفوظة ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>بيانات الحساب</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div>
          {isLoadingBookmarks ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">جاري تحميل أدواتك المفضلة...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">لا توجد أدوات محفوظة حالياً</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                استكشف دليل الأدوات واحفظ أفضل التطبيقات التي ترغب بالرجوع إليها لاحقاً بالضغط على زر الحفظ.
              </p>
              <button
                onClick={() => navigate('/ai-tools')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                تصفح جميع أدوات الذكاء الاصطناعي
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                        <div>
                          <h4 
                            onClick={() => navigate(`/tools/${tool.slug}`)}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {tool.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-500">{tool.pricing_type}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveBookmark(tool.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {tool.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{tool.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({tool.review_count})</span>
                    </div>

                    <button
                      onClick={() => navigate(`/tools/${tool.slug}`)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>عرض التفاصيل</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">تعديل الملف الشخصي</h3>

          {updateMsg && (
            <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              updateMsg.includes('نجاح') 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{updateMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم المعروض</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المعتمد</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed dir-ltr text-right"
              />
              <p className="text-[10px] text-slate-400 mt-1">البريد الإلكتروني مرتبط برقم عضويتك ولا يمكن تغييره يدوياً لأسباب أمنية.</p>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
