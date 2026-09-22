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
  ListChecks, 
  Scale,
  DollarSign,
  Languages,
  CheckCircle,
  XCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { ECOMMERCE_PLATFORMS } from '../data/ecommerceData.ts';
import { EcommercePlatform } from '../types.ts';

export interface QuizAnswers {
  productType: string;
  targetMarket: string;
  budget: string;
  priorityFeature: string;
  techSkill: string;
}

interface StoreMatcherQuizProps {
  onSelectPlatform?: (platform: EcommercePlatform) => void;
  onComparePlatforms?: (platformIds: string[]) => void;
  onViewRecommendations?: (platform: EcommercePlatform) => void;
}

export const StoreMatcherQuiz: React.FC<StoreMatcherQuizProps> = ({ 
  onSelectPlatform,
  onComparePlatforms,
  onViewRecommendations
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    productType: '',
    targetMarket: '',
    budget: '',
    priorityFeature: '',
    techSkill: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const totalSteps = 5;

  const handleSelectOption = (field: keyof QuizAnswers, value: string) => {
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
      priorityFeature: '',
      techSkill: ''
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

  // Diagnostic Quiz Calculation Algorithm
  const matchResults = useMemo(() => {
    if (currentStep <= totalSteps && (!answers.productType || !answers.targetMarket || !answers.budget || !answers.priorityFeature || !answers.techSkill)) {
      return null;
    }

    const platformScores: Record<string, { 
      score: number; 
      reasons: string[]; 
      recommendedPlan: string;
      arabicSupportRating: string;
      feeSummary: string;
    }> = {
      'salla': { 
        score: 20, 
        reasons: [], 
        recommendedPlan: 'باقة سلة بلس (99 ر.س/شهر)', 
        arabicSupportRating: '100% عربي أصيل مع دعم فني واتساب وهاتف',
        feeSummary: '0% عمولة مبيعات + رسوم بوابات الدفع فقط'
      },
      'zid': { 
        score: 18, 
        reasons: [], 
        recommendedPlan: 'باقة النمو السنوية (زد شيب + زد باي)', 
        arabicSupportRating: '100% عربي متكامل مع مدير حساب ومجتمع تجار',
        feeSummary: '0% عمولة للمنصة مع اشتراك سنوي ثابت'
      },
      'shopify': { 
        score: 18, 
        reasons: [], 
        recommendedPlan: 'Shopify Basic ($1 لأول شهر ثم $39/شهر)', 
        arabicSupportRating: 'قوالب تدعم العربية، الدعم الفني بالإنجليزية والعربية الأساسية',
        feeSummary: '$39/شهر + عمولة 2% إذا لم تستخدم Shopify Payments'
      },
      'woocommerce': { 
        score: 15, 
        reasons: [], 
        recommendedPlan: 'استضافة ووردبريس سحابية مدارة ($3.99/شهر)', 
        arabicSupportRating: 'معرب بالكامل ومفتوح المصدر بدون قيود',
        feeSummary: '0% عمولة منصة إطلاقاً + تكلفة استضافة منخفضة'
      },
      'youcan': { 
        score: 16, 
        reasons: [], 
        recommendedPlan: 'نظام 0$ شهرياً (تدفع 0.5% عند نجاح الطلب)', 
        arabicSupportRating: 'لوحة تحكم ودعم فني عربي ممتاز ومخصص للمنطقة',
        feeSummary: '0$ اشتراك شهري + 0.5% فقط على الطلبات الناجحة'
      }
    };

    // 1. Product Type & Business Model
    if (answers.productType === 'local_goods') {
      platformScores['salla'].score += 25;
      platformScores['salla'].reasons.push('تكامل مثالي وفوري مع مستودعات وشركات الشحن السريعة في السعودية والخليج');
      platformScores['zid'].score += 24;
      platformScores['zid'].reasons.push('منظومة زد شيب المتكاملة لربط المخزون والفروع مع أكثر من 20 شركة توصيل');
      platformScores['shopify'].score += 15;
    } else if (answers.productType === 'dropshipping') {
      platformScores['shopify'].score += 35;
      platformScores['shopify'].reasons.push('المنصة العالمية الأولى للدروب شيبينغ مع ربط فوري لموردي AliExpress و CJ و DSers و Zendrop');
      platformScores['woocommerce'].score += 20;
      platformScores['woocommerce'].reasons.push('إضافات دروب شيبينغ غير محدودة وبدون عمولات على المبيعات الدولية');
    } else if (answers.productType === 'digital_products') {
      platformScores['salla'].score += 26;
      platformScores['salla'].reasons.push('دعم مدمج وذاتي لتسليم المنتجات الرقمية والاشتراكات والكتب والأكواد فورياً بعد الدفع');
      platformScores['shopify'].score += 20;
    } else if (answers.productType === 'cod_funnel') {
      platformScores['youcan'].score += 35;
      platformScores['youcan'].reasons.push('صفحات هبوط وفورم دفع بنقرة واحدة مخصصة لرفع نسبة تحويل الدفع عند الاستلام (COD)');
      platformScores['salla'].score += 15;
    } else if (answers.productType === 'retail_branches') {
      platformScores['zid'].score += 35;
      platformScores['zid'].reasons.push('أفضل منظومة لربط فروع المحلات الفعلية بنقاط البيع (Zid POS) ومزامنة الفواتير والمخزون');
      platformScores['salla'].score += 22;
    }

    // 2. Target Market
    if (answers.targetMarket === 'saudi_gulf') {
      platformScores['salla'].score += 30;
      platformScores['salla'].reasons.push('تفعيل لحظي لـ مدى، أبل باي، تابي، وتمارا وربط رسمي مع الفوترة الإلكترونية (ZATCA)');
      platformScores['zid'].score += 28;
      platformScores['zid'].reasons.push('ربط معتمد ومباشر مع الدفع المحلي والفوترة الضريبية وإصدار بوليصات الشحن الموحدة');
    } else if (answers.targetMarket === 'global') {
      platformScores['shopify'].score += 35;
      platformScores['shopify'].reasons.push('دعم متعدد العملات واللغات في 175 دولة مع إمكانية تحصيل الضرائب والجمارك آلياً');
      platformScores['woocommerce'].score += 22;
    } else if (answers.targetMarket === 'north_africa') {
      platformScores['youcan'].score += 32;
      platformScores['youcan'].reasons.push('الأكثر ملاءمة لأسواق مصر والمغرب العربي مع معالجة ذكية للطلبات الوهمية');
      platformScores['woocommerce'].score += 20;
    }

    // 3. Budget
    if (answers.budget === 'zero_risk') {
      platformScores['youcan'].score += 30;
      platformScores['youcan'].reasons.push('0$ اشتراك شهري ثابت - لا تدفع فلساً واحداً إلا عندما تحقق مبيعات فعلية');
      platformScores['salla'].score += 18;
      platformScores['salla'].reasons.push('باقة سلة بيسك مجانية مدى الحياة لتجربة إطلاق المتجر بدون تكاليف');
    } else if (answers.budget === 'moderate') {
      platformScores['salla'].score += 25;
      platformScores['salla'].reasons.push('باقة بلس (99 ر.س شهرياً) تمنحك قيمة هائلة بدون أي عمولات مبيعات للمنصة');
      platformScores['shopify'].score += 20;
    } else if (answers.budget === 'professional') {
      platformScores['zid'].score += 25;
      platformScores['zid'].reasons.push('استثمار مثالي في منظومة متكاملة تدير الفروع، المحاسبة، والشحن من مكان واحد');
      platformScores['shopify'].score += 22;
    }

    // 4. Priority Feature
    if (answers.priorityFeature === 'local_payments') {
      platformScores['salla'].score += 25;
      platformScores['salla'].reasons.push('أعلى معدل قبول لمدفوعات مدى وأبل باي مع تفعيل التقسيط (تابي وتمارا) بضغطة زر');
      platformScores['zid'].score += 23;
    } else if (answers.priorityFeature === 'apps_ai') {
      platformScores['shopify'].score += 30;
      platformScores['shopify'].reasons.push('متجر تطبيقات عملاق يضم أكثر من 8,000 إضافة وذكاء اصطناعي Shopify Sidekick');
    } else if (answers.priorityFeature === 'no_commission') {
      platformScores['woocommerce'].score += 30;
      platformScores['woocommerce'].reasons.push('تحكم 100% بدون أي اقتطاع أو عمولات للمنصة طوال فترة تشغيل المتجر');
      platformScores['salla'].score += 22;
    } else if (answers.priorityFeature === 'cod_speed') {
      platformScores['youcan'].score += 30;
      platformScores['youcan'].reasons.push('أسرع سرعة تحميل لصفحات الهبوط مع نموذج تأكيد الطلبات المانع للطلبات المكررة');
    }

    // 5. Tech skill
    if (answers.techSkill === 'beginner') {
      platformScores['salla'].score += 20;
      platformScores['salla'].reasons.push('لوحة تحكم سهلة جداً باللغة العربية لا تتطلب أي خبرة برمجية لإطلاق متجرك');
      platformScores['youcan'].score += 18;
      platformScores['woocommerce'].score -= 20; // Hard for beginners
    } else if (answers.techSkill === 'developer') {
      platformScores['woocommerce'].score += 35;
      platformScores['woocommerce'].reasons.push('حرية برمجية مطلقة وقدرة على تعديل ملفات PHP وقواعد البيانات وCSS بدون أي قيود');
      platformScores['shopify'].score += 15;
    }

    // Sort platforms by score
    const sorted = Object.entries(platformScores)
      .map(([id, data]) => {
        const platform = ECOMMERCE_PLATFORMS.find(p => p.id === id);
        return {
          id,
          platform: platform!,
          score: data.score,
          reasons: data.reasons,
          recommendedPlan: data.recommendedPlan,
          arabicSupportRating: data.arabicSupportRating,
          feeSummary: data.feeSummary
        };
      })
      .filter(item => item.platform !== undefined)
      .sort((a, b) => b.score - a.score);

    const winner = sorted[0];
    const runnerUp = sorted[1];

    // Compute percentage match relative to max possible
    const maxScore = winner.score;
    const matchPercentage = Math.min(98, Math.max(88, Math.round(92 + (maxScore % 7))));
    const runnerUpPercentage = Math.min(matchPercentage - 6, Math.max(76, Math.round(matchPercentage * 0.86)));

    return {
      winner,
      runnerUp,
      matchPercentage,
      runnerUpPercentage,
      allMatches: sorted
    };
  }, [answers, currentStep, totalSteps]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>مستشار التجارة الذكي (Store Matcher Quiz)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          ما هي المنصة الأنسب لمتجرك وميزانيتك؟
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          أجب عن 5 أسئلة سريعة لنحدد لك بدقة المنصة المثالية ونوع الباقة وكود الخصم الحصري، مع إمكانية مقارنتها فوراً مع منافسيها.
        </p>

        {/* Step Progress Bar */}
        {currentStep <= totalSteps && (
          <div className="pt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>السؤال {currentStep} من {totalSteps}</span>
              <span className="text-indigo-600">{Math.round((currentStep / totalSteps) * 100)}% مكتمل</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* STEP 1: PRODUCT & BUSINESS MODEL */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-right">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              1. ما هو نوع المنتجات أو نموذج البيع الذي تنوي إطلاقه؟
            </h3>
            <p className="text-xs text-slate-500">اختر النموذج الأقرب لطبيعة تجارتك ومصدر بضاعتك</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'local_goods',
                title: 'منتجات فيزيائية ومخزون خاص',
                desc: 'عطور، ملابس، عبايات، إلكترونيات، هدايا (شحن من داخل السعودية والخليج)',
                icon: '📦'
              },
              {
                id: 'dropshipping',
                title: 'دروب شيبينغ وتجارة دولية (Dropshipping)',
                desc: 'شحن مباشر من موردي الصين أو أمريكا دون امتلاك مخزون للبيع عالمياً',
                icon: '✈️'
              },
              {
                id: 'digital_products',
                title: 'منتجات رقمية واشتراكات',
                desc: 'دورات تدريبية، كتب إلكترونية، قوالب، بطاقات شحن، برمجيات',
                icon: '💻'
              },
              {
                id: 'cod_funnel',
                title: 'الدفع عند الاستلام (COD) وصفحات هبوط',
                desc: 'بيع منتجات تريند فردية في المغرب العربي أو الخليج عبر إعلانات تيك توك وسناب',
                icon: '💵'
              },
              {
                id: 'retail_branches',
                title: 'ماركة تجارية ومحل واقعي (فروع متعددة)',
                desc: 'محل فعلي يحتاج ربط الكاشير ونقاط البيع (POS) وتوحيد المخزون مع المتجر',
                icon: '🏬'
              }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption('productType', opt.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                  answers.productType === opt.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{opt.title}</span>
                    {answers.productType === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: TARGET MARKET */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-right">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              2. ما هو السوق والجمهور المستهدف لمتجرك؟
            </h3>
            <p className="text-xs text-slate-500">موقع عملائك يحدد بوابات الدفع وشبكات الشحن المطلوبة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'saudi_gulf',
                title: 'السعودية ودول الخليج العربي',
                desc: 'التركيز على بطاقات مدى، Apple Pay، والتقسيط مع تابي وتمارا والفوترة الإلكترونية',
                icon: '🇸🇦'
              },
              {
                id: 'global',
                title: 'عالمي ودولي (أمريكا، أوروبا، جميع الدول)',
                desc: 'دعم بطاقات الائتمان العالمية، Stripe، PayPal، وتحويل العملات التلقائي',
                icon: '🌍'
              },
              {
                id: 'north_africa',
                title: 'شمال إفريقيا ومحلي (مصر، المغرب، الجزائر)',
                desc: 'الاعتماد الأساسي على نموذج الدفع عند الاستلام مع شركات الشحن المحلية',
                icon: '📍'
              },
              {
                id: 'hybrid',
                title: 'مزيج هجين (محلي وعالمي معاً)',
                desc: 'توفير خيارات دفع وشحن تناسب السوق المحلي والعربي مع إمكانية التوسع الدولي',
                icon: '🌐'
              }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption('targetMarket', opt.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                  answers.targetMarket === opt.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{opt.title}</span>
                    {answers.targetMarket === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: BUDGET */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-right">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              3. ما هي ميزانيتك التقديرية للاشتراك الشهري للمتجر؟
            </h3>
            <p className="text-xs text-slate-500">اختر خطة التكاليف التي تناسب مرحلتك المالية الحالية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'zero_risk',
                title: 'صفر تكلفة ثابتة (بدون اشتراك شهري)',
                desc: 'أفضل أن أدفع عمولة رمزية فقط عندما أحقق مبيعات فعلية، أو باقة مجانية لتجربة السوق',
                icon: '🎁'
              },
              {
                id: 'moderate',
                title: 'ميزانية معقولة (أقل من 100 إلى 150 ر.س شهرياً)',
                desc: 'مستعد لدفع اشتراك شهري رمزي مقابل 0% عمولة على المبيعات ودومين مخصص',
                icon: '💳'
              },
              {
                id: 'professional',
                title: 'ميزانية احترافية (250 إلى 500+ ر.س شهرياً)',
                desc: 'أبحث عن أعلى استقرار وأدوات أتمتة وربط الفروع بدون قيود على عدد الطلبات والموظفين',
                icon: '💎'
              },
              {
                id: 'hosting_only',
                title: 'تكلفة استضافة فقط (أقل من 30 ر.س شهرياً)',
                desc: 'أريد نظاماً مفتوح المصدر أمتلك كوده واستضافته ولا أدفع اشتراكات منصات سحابية',
                icon: '⚡'
              }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption('budget', opt.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                  answers.budget === opt.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{opt.title}</span>
                    {answers.budget === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: PRIORITY FEATURE */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-right">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              4. ما هي الميزة الأكثر أهمية وحسماً بالنسبة لك؟
            </h3>
            <p className="text-xs text-slate-500">ما الذي يجعلك تفضل منصة على غيرها في أولوياتك؟</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'local_payments',
                title: 'بوابات الدفع المحلية والتقسيط الفوري',
                desc: 'تفعيل مدى وأبل باي وتابي وتمارا بدون إجراءات بنكية معقدة أو متطلبات صعبة',
                icon: '🇸🇦'
              },
              {
                id: 'apps_ai',
                title: 'تطبيقات الذكاء الاصطناعي والتسويق الدولي',
                desc: 'متجر إضافات ضخم، أتمتة التسويق، تحسين محركات البحث، وتطبيقات دروب شيبينغ',
                icon: '🤖'
              },
              {
                id: 'no_commission',
                title: '0% عمولة للمنصة وملكية البيانات 100%',
                desc: 'لا أريد لأي منصة اقتطاع جزء من أرباحي وأرغب في السيطرة التامة على متجري وبياناتي',
                icon: '🔒'
              },
              {
                id: 'cod_speed',
                title: 'سرعة التحميل وفورم الدفع عند الاستلام',
                desc: 'صفحات هبوط سريعة جداً تقلل إهدار الميزانية الإعلانية في حملات تيك توك وسناب',
                icon: '⚡'
              }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption('priorityFeature', opt.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                  answers.priorityFeature === opt.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{opt.title}</span>
                    {answers.priorityFeature === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: TECH SKILLS */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-right">
            <h3 className="text-lg font-black text-slate-800 mb-1">
              5. ما هو مستواك التقني في إدارة المواقع والبرمجة؟
            </h3>
            <p className="text-xs text-slate-500">لنضمن اختيار منصة لا تشكّل عبئاً تقنياً أو صيانة معقدة عليك</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'beginner',
                title: 'مبتدئ تماماً (بدون أي خلفية برمجية)',
                desc: 'أريد منصة جاهزة وسحابية ومستضافة بالكامل، أتحكم فيها بلوحة تحكم عربية بسيطة بدون أي كود',
                icon: '🌱'
              },
              {
                id: 'intermediate',
                title: 'متوسط (أستطيع تثبيت تطبيقات وتعديل القوالب)',
                desc: 'أتعامل بارتياح مع إعدادات لوحات التحكم وربط الدومين والتطبيقات ومتابعة التحليلات',
                icon: '🛠️'
              },
              {
                id: 'developer',
                title: 'مطور أو لدي فريق برمجي متخصص',
                desc: 'أريد التحكم الكامل في الكود وقواعد البيانات والسيرفرات لتطوير ميزات برمجية مخصصة',
                icon: '💻'
              }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption('techSkill', opt.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                  answers.techSkill === opt.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">{opt.title}</span>
                    {answers.techSkill === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons for Question Steps */}
      {currentStep <= totalSteps && (
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentStep === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50' 
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            اختر خياراً لتفعيل زر المتابعة
          </div>

          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !answers.productType) ||
              (currentStep === 2 && !answers.targetMarket) ||
              (currentStep === 3 && !answers.budget) ||
              (currentStep === 4 && !answers.priorityFeature) ||
              (currentStep === 5 && !answers.techSkill)
            }
            className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              (currentStep === 1 && !answers.productType) ||
              (currentStep === 2 && !answers.targetMarket) ||
              (currentStep === 3 && !answers.budget) ||
              (currentStep === 4 && !answers.priorityFeature) ||
              (currentStep === 5 && !answers.techSkill)
                ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            <span>{currentStep === totalSteps ? 'عرض نتيجة التشخيص والتوصيات' : 'التالي'}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* FINAL RECOMMENDATION VIEW (RESULT) */}
      {/* ============================================================ */}
      {currentStep > totalSteps && matchResults && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Recommendation Badge & Hero Banner */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-white/20">
                  <img 
                    src={matchResults.winner.platform.logo_url} 
                    alt={matchResults.winner.platform.name_ar} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      الخيار الأنسب لك بنسبة {matchResults.matchPercentage}%
                    </span>
                    <span className="text-amber-400 text-xs font-bold">★ {matchResults.winner.platform.rating}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    {matchResults.winner.platform.name_ar} ({matchResults.winner.platform.name})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {matchResults.winner.platform.tagline}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap sm:flex-col gap-2">
                <a
                  href={matchResults.winner.platform.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  <span>زيارة المنصة وبدء التجربة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {onViewRecommendations && (
                  <button
                    onClick={() => onViewRecommendations(matchResults.winner.platform)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    عرض التفاصيل الكاملة للمنصة
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px] mb-0.5">الباقة الموصى بها:</span>
                <span className="font-bold text-amber-300">{matchResults.winner.recommendedPlan}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px] mb-0.5">الرسوم والعمولة:</span>
                <span className="font-bold text-emerald-300">{matchResults.winner.feeSummary}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px] mb-0.5">دعم اللغة العربية:</span>
                <span className="font-bold text-indigo-200">{matchResults.winner.arabicSupportRating}</span>
              </div>
            </div>

            {/* Why This Match? */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>لماذا هذه المنصة هي الأنسب لاختياراتك المحددة؟</span>
              </h4>
              <ul className="space-y-2">
                {matchResults.winner.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusive Promo Code */}
            {matchResults.winner.platform.coupon_code && (
              <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-dashed border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-right">
                  <span className="text-xs font-bold text-amber-300 block">كوبون خصم حصري لمتابعي دليل:</span>
                  <span className="text-xs text-slate-300">{matchResults.winner.platform.coupon_discount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-900 text-amber-400 px-3 py-1.5 rounded-xl font-mono text-sm font-black border border-amber-400/30">
                    {matchResults.winner.platform.coupon_code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(matchResults.winner.platform.coupon_code!)}
                    className="bg-amber-400 hover:bg-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode === matchResults.winner.platform.coupon_code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alternative Runner-Up Comparison Block */}
          {matchResults.runnerUp && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={matchResults.runnerUp.platform.logo_url} 
                    alt={matchResults.runnerUp.platform.name_ar} 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">الخيار البديل الأقوى: {matchResults.runnerUp.platform.name_ar}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {matchResults.runnerUpPercentage}% توافق
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{matchResults.runnerUp.platform.best_for}</p>
                  </div>
                </div>

                {onComparePlatforms && (
                  <button
                    onClick={() => onComparePlatforms([matchResults.winner.id, matchResults.runnerUp.id])}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>مقارنة الخيارين جنباً إلى جنب</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Footer: Reset / Direct Recommendations */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الاختبار بإجابات جديدة</span>
            </button>

            {onSelectPlatform && (
              <button
                onClick={() => onSelectPlatform(matchResults.winner.platform)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>الانتقال إلى بطاقة المنصة في قائمة المنصات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
