import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('admin@daleel.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || 'فشل تسجيل الدخول: تحقق من بيانات الاعتماد');
      }
    } catch {
      setError('تعذر الاتصال بخادم الإدارة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">تسجيل دخول الإدارة</h1>
          <p className="text-xs text-slate-500">منطقة مخصصة لمديري ومحرري منصة دليل AI</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 text-slate-800 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
            <span className="font-bold">بيانات الحساب الافتراضي للتجربة:</span>
            <br />
            البريد: <code className="font-bold font-mono">admin@daleel.ai</code> | كلمة المرور: <code className="font-bold font-mono">admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>دخول لوحة التحكم</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button onClick={() => navigate('/')} className="text-xs text-slate-500 hover:text-slate-800 font-semibold">
            ← العودة للصفحة الرئيسية للمنصة
          </button>
        </div>
      </div>
    </div>
  );
};
