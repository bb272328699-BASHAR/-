import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Store, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Percent, 
  Award, 
  Zap, 
  Share2, 
  ListChecks, 
  Download,
  AlertCircle
} from 'lucide-react';
import { ECOMMERCE_PLATFORMS } from '../data/ecommerceData.ts';
import { EcommercePlatform } from '../types.ts';

interface QuizAnswer {
  productType: string;
  targetMarket: string;
  budget: string;
  priorityFeature: string;
}

interface StoreQuizProps {
  onSelectPlatform?: (platform: EcommercePlatform) => void;
}

export const StoreQuiz: React.FC<StoreQuizProps> = ({ onSelectPlatform }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswer>({
    productType: '',
    targetMarket: '',
    budget: '',
    priorityFeature: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const totalSteps = 4;

  const handleSelectOption = (field: keyof QuizAnswer, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({
      productType: '',
      targetMarket: '',
      budget: '',
      priorityFeature: ''
    });
    setCurrentStep(1);
    setCompletedSteps({});
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const toggleChecklistStep = (key: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Matching algorithm calculation
  const recommendation = useMemo(() => {
    if (currentStep <= totalSteps && (!answers.productType || !answers.targetMarket || !answers.budget || !answers.priorityFeature)) {
      return null;
    }

    const scores: Record<string, { score: number; reasons: string[]; recommendedPlan: string }> = {
      'salla': { score: 10, reasons: [], recommendedPlan: 'باقة سلة بلس (99 ر.س/شهر)' },
      'zid': { score: 10, reasons: [], recommendedPlan: 'باقة النمو السنوية' },
      'shopify': { score: 10, reasons: [], recommendedPlan: 'Shopify Basic ($1 للشهر الأول ثم $39/شهر)' },
      'woocommerce': { score: 10, reasons: [], recommendedPlan: 'استضافة ووردبريس سريعة (Hostinger Business)' },
      'youcan': { score: 10, reasons: [], recommendedPlan: 'باقة يوكان المجانية (0$ شهرياً)' }
    };

    // 1. Evaluate Product Type
    if (answers.productType === 'dropshipping') {
      scores.shopify.score += 45;
      scores.shopify.reasons.push('أفضل منصة عالمية تدعم تطبيقات الدروب شيبينج (DSers, CJ Dropshipping, Zendrop).');
      scores.woocommerce.score += 25;
      scores.woocommerce.reasons.push('دعم إضافات AliDropship ومزامنة الموردين بدون عمولات.');
    } else if (answers.productType === 'physical_local') {
      scores.salla.score += 35;
      scores.salla.reasons.push('ربط فوري بأكثر من 40 شركة شحن وتوصيل محلي في السعودية والخليج.');
      scores.zid.score += 35;
      scores.zid.reasons.push('حلول تخزين وشحن لوجستية ممتازة لمنتجات التجزئة المحلية.');
    } else if (answers.productType === 'digital') {
      scores.salla.score += 30;
      scores.salla.reasons.push('دعم مدمج وذكي للمنتجات الرقمية والاشتراكات وتسليم الأكواد والملفات آلياً.');
      scores.shopify.score += 25;
    } else if (answers.productType === 'cod_single') {
      scores.youcan.score += 45;
      scores.youcan.reasons.push('أسرع نموذج طلب صفحة واحدة (One-Page Checkout) مخصص للبيع بالدفع عند الاستلام.');
    }

    // 2. Evaluate Target Market
    if (answers.targetMarket === 'saudi_gulf') {
      scores.salla.score += 40;
      scores.salla.reasons.push('تفعيل فوري لبوابات الدفع الوطنية (مدى، أبل باي، تابي، وتمارا) دون فتح حسابات بنكية معقدة.');
      scores.zid.score += 35;
      scores.zid.reasons.push('نظام بيئي سعودي متكامل ومعتمد لدى هيئة الزكاة والضريبة والجمارك (ZATCA).');
      scores.shopify.score -= 10; // Extra external payment fees in region
    } else if (answers.targetMarket === 'global') {
      scores.shopify.score += 50;
      scores.shopify.reasons.push('المنصة الأولى عالمياً بدعم كل العملات واللغات وملايين المشترين حول العالم.');
      scores.woocommerce.score += 30;
      scores.salla.score -= 15;
    } else if (answers.targetMarket === 'north_africa_cod') {
      scores.youcan.score += 45;
      scores.youcan.reasons.push('المنصة الأولى والأقوى المخصصة لتجارة الدفع عند الاستلام في المغرب وشمال إفريقيا.');
    }

    // 3. Evaluate Budget
    if (answers.budget === 'free_minimal') {
      scores.youcan.score += 30;
      scores.youcan.reasons.push('0$ اشتراك شهري تدفع فقط 0.5% عند نجاح الطلبات الفعلية.');
      scores.salla.score += 25;
      scores.salla.reasons.push('باقة سلة بيسك مجانية مدى الحياة لتجربة السوق.');
      scores.woocommerce.score += 20;
    } else if (answers.budget === 'medium') {
      scores.salla.score += 30;
      scores.shopify.score += 25;
    } else if (answers.budget === 'corporate') {
      scores.zid.score += 35;
      scores.zid.reasons.push('حلول احترافية مصممة للشركات والمؤسسات الكبيرة وفريق دعم مخصص.');
      scores.salla.score += 30;
      scores.shopify.score += 30;
    } else if (answers.budget === 'developer') {
      scores.woocommerce.score += 50;
      scores.woocommerce.reasons.push('برمجية مفتوحة المصدر 100% بدون أي رسوم للمنصات السحابية وتحكم كامل بالقاعدة والبرمجة.');
    }

    // 4. Priority Feature
    if (answers.priorityFeature === 'instant_payment') {
      scores.salla.score += 35;
      scores.salla.reasons.push('تفعيل تابي وتمارا وأبل باي ومدى بنقرة زر واحدة.');
      scores.zid.score += 30;
    } else if (answers.priorityFeature === 'pos_branches') {
      scores.zid.score += 45;
      scores.zid.reasons.push('نظام زد كاشير ونقاط البيع الموحد لربط المعارض الواقعية والمخازن مع المتجر الإلكتروني.');
    } else if (answers.priorityFeature === 'app_store') {
      scores.shopify.score += 40;
      scores.shopify.reasons.push('متجر تطبيقات ضخم يضم أكثر من 8,000 تطبيق وقوالب تصميم احترافية.');
    } else if (answers.priorityFeature === 'fast_funnel') {
      scores.youcan.score += 40;
      scores.youcan.reasons.push('صفحات هبوط عالية التحويل ومصممة لتقليل سلات الشراء المتروكة.');
    } else if (answers.priorityFeature === 'total_freedom') {
      scores.woocommerce.score += 45;
      scores.woocommerce.reasons.push('لا توجد شروط أو تقييد لحسابك؛ متجرك ملكك بالكامل للأبد.');
    }

    // Sort platforms by score
    const sorted = Object.entries(scores)
      .map(([slug, data]) => {
        const plat = ECOMMERCE_PLATFORMS.find(p => p.slug === slug);
        return {
          slug,
          platform: plat!,
          score: data.score,
          reasons: data.reasons,
          recommendedPlan: data.recommendedPlan
        };
      })
      .filter(item => item.platform !== undefined)
      .sort((a, b) => b.score - a.score);

    const maxScore = sorted[0].score;
    const top = sorted[0];
    const runnerUp = sorted[1];

    // Normalize match percentages
    const topMatchPct = Math.min(99, Math.max(82, Math.round((top.score / (maxScore + 10)) * 100)));
    const runnerUpMatchPct = Math.min(topMatchPct - 6, Math.max(68, Math.round((runnerUp.score / (maxScore + 10)) * 100)));

    // Generate tailored 7-step launch roadmap
    let roadmap = [
      { id: 'step1', title: 'تحديد الهوية والاسم التجاري', desc: 'اختر اسماً سهلاً للحفظ وسجل اسم النطاق (Domain) أو احصل عليه مجاناً مع المنصة.' },
      { id: 'step2', title: 'التسجيل وتفعيل الحساب الرسمي', desc: `سجل في ${top.platform.name_ar} عبر الباقة المقترحة واستفد من الخصم المتاح.` },
      { id: 'step3', title: 'إعداد بوابات الدفع الإلكتروني', desc: top.slug === 'salla' || top.slug === 'zid' ? 'ارفع وثيقة العمل الحر أو السجل التجاري لتفعيل مدى وأبل باي فوراً.' : 'اربط حساب PayPal أو بوابة الدفع المعتمدة لدى جمهورك.' },
      { id: 'step4', title: 'رفع المنتجات والصور الاحترافية', desc: 'استخدم أداة الذكاء الاصطناعي Pebblely لتوليد خلفيات استوديو إعلانية فخمة لمنتجاتك مجاناً.' },
      { id: 'step5', title: 'كتابة أوصاف المنتجات التسويقية', desc: 'استعن بأداة Copy.ai أو ChatGPT لكتابة نصوص بيع مقنعة متوافقة مع محركات البحث.' },
      { id: 'step6', title: 'تفعيل شركات الشحن وتتبع الطلبات', desc: 'اختر شركاء التوصيل المناسبين لجمهورك وحدد أسعار شحن ثابتة أو شحن مجاني للطلبات فوق حد معين.' },
      { id: 'step7', title: 'إطلاق أول حملة تسويقية ممولة', desc: 'أطلق إعلانات تيك توك وسناب شات أو إنستغرام مع كود خصم ترحيبي لأول 50 مشتري.' }
    ];

    return {
      top,
      runnerUp,
      topMatchPct,
      runnerUpMatchPct,
      roadmap
    };
  }, [answers, currentStep]);

  // Questions definitions
  const questions = [
    {
      id: 1,
      title: 'ما هو نوع المنتجات التي تخطط لبيعها في متجرك؟',
      subtitle: 'اختر النموذج الأساسي الذي يصف بضاعتك ونشاطك',
      field: 'productType' as keyof QuizAnswer,
      options: [
        {
          id: 'physical_local',
          label: 'منتجات ملموسة بمخزون خاص وشحن محلي',
          desc: 'مثل: الأزياء، العطور، الإلكترونيات، المستلزمات المنزلية والقهوة',
          icon: '📦'
        },
        {
          id: 'dropshipping',
          label: 'دروب شيبينج (Dropshipping) وموردين دوليين',
          desc: 'بيع منتجات من علي إكسبريس وموردين خارجيين دون تخزين مسبق',
          icon: '🌍'
        },
        {
          id: 'digital',
          label: 'منتجات رقمية، خدمات، أو دورات تدريبية',
          desc: 'مثل: كتب إلكترونية، اشتراكات، تصاميم، ملفات واستشارات فورية',
          icon: '💻'
        },
        {
          id: 'cod_single',
          label: 'منتج واحد رابح بنظام الدفع عند الاستلام (COD)',
          desc: 'صفحات هبوط إعلانية سريعة لبيع منتج ترند بطلب مباشر',
          icon: '🎯'
        }
      ]
    },
    {
      id: 2,
      title: 'أين يتواجد عملاؤك المستهدفون جغرافياً؟',
      subtitle: 'مكان تواجد الجمهور يحدد بوابات الدفع وشركات الشحن المطلوبة',
      field: 'targetMarket' as keyof QuizAnswer,
      options: [
        {
          id: 'saudi_gulf',
          label: 'المملكة العربية السعودية ودول الخليج العربي',
          desc: 'تركيز فائق على مدى، أبل باي، والتقسيط عبر تابي وتمارا والشحن السريع',
          icon: '🇸🇦'
        },
        {
          id: 'global',
          label: 'عالمي ودولي (أمريكا، أوروبا، وحول العالم)',
          desc: 'شحن دولي، تحويل عملات متعدد، وتكامل مع بوابات دفع عالمية مثل Stripe',
          icon: '🌐'
        },
        {
          id: 'north_africa_cod',
          label: 'شمال إفريقيا ومحلي (المغرب، مصر، تونس، الجزائر)',
          desc: 'اعتماد شبه كامل على نموذج الدفع عند استلام الطرد نقداً',
          icon: '🚚'
        }
      ]
    },
    {
      id: 3,
      title: 'ما هي ميزانيتك وخبرتك التقنية لإدارة المتجر؟',
      subtitle: 'اختر الوضع الأقرب لظروفك الاستثمارية الحالية',
      field: 'budget' as keyof QuizAnswer,
      options: [
        {
          id: 'free_minimal',
          label: 'مبتدئ بأقل ميزانية ممكنة (أو باقة مجانية)',
          desc: 'أريد تجربة فكرة المتجر أولاً بدون مخاطرة أو اشتراكات شهرية مكلفة',
          icon: '🌱'
        },
        {
          id: 'medium',
          label: 'ميزانية نمو معقولة (100 - 300 ريال شهرياً)',
          desc: 'جاهز للاستثمار في منصة موثوقة بدون عمولات وتدعم علامتي التجارية الخاصة',
          icon: '🚀'
        },
        {
          id: 'corporate',
          label: 'ميزانية مؤسسة أو علامة تجارية قائمة (+500 ريال)',
          desc: 'أحتاج نظاماً متقدماً وفريق دعم مخصص وميزات قوية للتوسع السريع',
          icon: '🏢'
        },
        {
          id: 'developer',
          label: 'لدي خبرة برمجية وأريد تحكماً كاملاً بدون قيود سحابية',
          desc: 'أفضل استضافة خاصة ووردبريس وملكية كاملة لقاعدة البيانات والكود',
          icon: '⚙️'
        }
      ]
    },
    {
      id: 4,
      title: 'ما هي الميزة الأهم التي لا يمكنك الاستغناء عنها؟',
      subtitle: 'العامل الحاسم الذي يحدد نجاح متجرك في مرحلته الحالية',
      field: 'priorityFeature' as keyof QuizAnswer,
      options: [
        {
          id: 'instant_payment',
          label: 'تفعيل فوري لبوابات الدفع والتقسيط (مدى، تابي، تمارا)',
          desc: 'بدون تعقيدات تقنية أو انتظار أيام لفتح حسابات تجارية خارجية',
          icon: '💳'
        },
        {
          id: 'pos_branches',
          label: 'ربط الفروع الواقعية ونقاط البيع (POS) والفواتير',
          desc: 'إدارة المخزون المشترك بين المعرض على الأرض والمتجر الرقمي',
          icon: '🏬'
        },
        {
          id: 'app_store',
          label: 'متجر تطبيقات عملاق وقوالب احترافية للدروب شيبينج',
          desc: 'أدوات تحليل متقدمة وتطبيقات مبيعات تلقائية لا حصر لها',
          icon: '🧩'
        },
        {
          id: 'fast_funnel',
          label: 'صفحة شراء فائقة السرعة بنقرة واحدة (One-Click Checkout)',
          desc: 'أعلى معدل تحويل إعلانات لتقليل السلات المتروكة في الدفع عند الاستلام',
          icon: '⚡'
        },
        {
          id: 'total_freedom',
          label: 'حرية كاملة بدون أي عمولة للمنصة وبدون اشتراك متكرر',
          desc: 'التحكم الذاتي في استضافة المتجر وتخصيص كل سطر برمجي',
          icon: '🔓'
        }
      ]
    }
  ];

  const currentQ = questions[currentStep - 1];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 relative">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مستشار التجارة الذكي (AI Store Matcher)</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            اختبار تحديد المنصة الأنسب لمتجرك الإلكتروني
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            أجب عن 4 أسئلة سريعة لتشخيص متطلبات مشروعك، وسيقوم النظام الذكي باحتساب التوافق الدقيق وترشيح المنصة المثالية مع خطة الإطلاق وأكواد الخصم.
          </p>
        </div>

        {/* Progress bar */}
        {currentStep <= totalSteps && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex-1 bg-white/15 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-300 font-bold font-mono">
              خطوة {currentStep} من {totalSteps}
            </span>
          </div>
        )}
      </div>

      {/* Quiz Body */}
      <div className="p-6 sm:p-10">
        {/* Active Question View */}
        {currentStep <= totalSteps && currentQ && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 block">السؤال {currentQ.id}:</span>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">{currentQ.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500">{currentQ.subtitle}</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.field] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.field, opt.id)}
                    className={`p-5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                        {opt.icon}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-1">{opt.label}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!answers[currentQ.field]}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <span>{currentStep === totalSteps ? 'عرض نتيجة التشخيص الذكي' : 'المتابعة'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* COMPLETED QUIZ: RESULT SCREEN */}
        {/* ============================================================ */}
        {currentStep > totalSteps && recommendation && (
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Celebration & Match Score Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-500/30">
                      <Award className="w-3.5 h-3.5" />
                      <span>تم التحليل بنجاح بناءً على إجاباتك</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black">
                      المنصة الفائزة بالترشيح لمتجرك هي:
                    </h3>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
                    <span className="text-[11px] text-slate-300 block font-bold">نسبة التوافق المقدرة</span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                      %{recommendation.topMatchPct}
                    </span>
                  </div>
                </div>

                {/* Winner Card Inner */}
                <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={recommendation.top.platform.logo_url} 
                      alt={recommendation.top.platform.name_ar} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                          {recommendation.top.platform.name_ar}
                        </h4>
                        <span className="text-xs text-slate-400 font-bold">({recommendation.top.platform.name})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {recommendation.top.platform.tagline}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mt-1">
                        <span>الباقة المقترحة:</span>
                        <span className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {recommendation.top.recommendedPlan}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={recommendation.top.platform.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>تفعيل العرض والتسجيل الآن</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Fits You (Dynamic Diagnostics) */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>لماذا تم اختيار هذه المنصة تحديداً لمتجرك؟</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendation.top.reasons.map((reason, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Callout if available */}
            {recommendation.top.platform.coupon_code && (
              <div className="bg-amber-50 border border-dashed border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-amber-900 block flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>كوبون خصم حصري لتوفير تكلفة الاشتراك:</span>
                  </span>
                  <p className="text-xs text-amber-800">
                    استخدم كود <strong className="font-mono font-bold text-amber-950 px-1.5 py-0.5 bg-amber-100 rounded">{recommendation.top.platform.coupon_code}</strong> للحصول على {recommendation.top.platform.coupon_discount}.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyCode(recommendation.top.platform.coupon_code!)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  {copiedCode === recommendation.top.platform.coupon_code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم نسخ الكود!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ كود الخصم</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Runner-Up Platform */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 block uppercase">الخيار البديل الأقوى:</span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {recommendation.runnerUp.platform.name_ar} ({recommendation.runnerUp.platform.name})
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">توافق بنسبة:</span>
                  <span className="bg-slate-200 text-slate-800 text-xs font-black px-2 py-0.5 rounded-full font-mono">
                    %{recommendation.runnerUpMatchPct}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                إذا كنت ترغب في بديل آخر، فإن {recommendation.runnerUp.platform.name_ar} يعتبر خياراً ممتازاً جداً ويوفر إمكانيات موازية بتكلفة وتجربة استخدام مرنة.
              </p>

              <div className="pt-2 flex items-center justify-end">
                <a
                  href={recommendation.runnerUp.platform.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>استكشاف {recommendation.runnerUp.platform.name_ar}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Personalized 7-Step Launch Checklist */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-indigo-600" />
                    <span>خطة إطلاق متجرك المخصصة (7 خطوات عملية)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    خطوات مرتبة يمكنك تأشيرها أثناء تنفيذك لإطلاق المتجر بنجاح
                  </p>
                </div>

                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  مكتمل: {Object.values(completedSteps).filter(Boolean).length} من 7
                </span>
              </div>

              <div className="space-y-3">
                {recommendation.roadmap.map((step, idx) => {
                  const isDone = !!completedSteps[step.id];
                  return (
                    <div
                      key={step.id}
                      onClick={() => toggleChecklistStep(step.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${
                        isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            خطوة {idx + 1}
                          </span>
                          <h5 className={`text-xs font-bold ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                            {step.title}
                          </h5>
                        </div>
                        <p className={`text-xs ${isDone ? 'text-emerald-700' : 'text-slate-500'} leading-relaxed`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Reset or Explore All */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار بإجابات أخرى</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectPlatform) {
                    onSelectPlatform(recommendation.top.platform);
                  }
                }}
                className="w-full sm:w-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>مقارنة {recommendation.top.platform.name_ar} مع باقي المنصات بالجدول</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
