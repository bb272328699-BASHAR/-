import React, { useState } from 'react';
import { Tag, Bell, Check, X, Sparkles, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { createPriceDropAlert } from '../lib/firestoreService.ts';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolSlug: string;
  toolName: string;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  toolSlug,
  toolName,
}) => {
  const [email, setEmail] = useState('');
  const [discountPref, setDiscountPref] = useState('أي تخفيض رسمي أو كود خصم');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    setError('');

    const res = await createPriceDropAlert({
      toolSlug,
      toolName,
      email,
      discountPreference: discountPref,
      targetPriceType: 'All',
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError('حدث خطأ أثناء حفظ التنبيه، يرجى المحاولة لاحقاً');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تم تفعيل التنبيه بنجاح! 🔔</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                سنقوم بمراسلتك على <strong className="text-slate-900 font-bold">{email}</strong> فور توفر أي كود خصم، تخفيض سنوي، أو خطة تجريبية مجانية لـ <span className="text-indigo-600 font-bold">{toolName}</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">تنبيهات العروض وهبوط الأسعار</h3>
                <p className="text-xs text-slate-500">أداة {toolName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              احصل على إشعار فوري عند صدور خصومات Black Friday، أكواد خصم ترويجية، أو باقات مجانية لهذه الأداة دون إرسال أي رسائل ترويجية مزعجة.
            </p>

            {error && (
              <div className="p-3 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني لاستلام العرض:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الخصم المفضل:
              </label>
              <select
                value={discountPref}
                onChange={(e) => setDiscountPref(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="أي تخفيض رسمي أو كود خصم">أي تخفيض رسمي أو كود خصم</option>
                <option value="خصم سنوي أكبر من 30%">خصم سنوي لا يقل عن 30%</option>
                <option value="باقة مجانية أو فترات تجربة Free Trial">إطلاق باقة مجانية أو Free Trial</option>
                <option value="خصومات الطلاب والباحثين">خصومات مخصصة للطلاب والباحثين</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>خصوصيتك محمية 100%، يمكنك إلغاء الاشتراك بنقرة واحدة.</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>{loading ? 'جاري تفعيل التنبيه...' : 'تفعيل التنبيه الفوري'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
