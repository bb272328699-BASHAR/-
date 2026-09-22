import React, { useState } from 'react';
import { 
  Scale, 
  Check, 
  X, 
  ExternalLink, 
  Copy, 
  Sparkles, 
  HelpCircle, 
  Plus, 
  Trash2, 
  AlertCircle, 
  DollarSign, 
  Layers, 
  Languages, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Info,
  ChevronDown
} from 'lucide-react';
import { ECOMMERCE_PLATFORMS } from '../data/ecommerceData.ts';
import { EcommercePlatform } from '../types.ts';

interface EcommercePlatformComparisonProps {
  selectedPlatformIds: string[];
  onTogglePlatform: (id: string) => void;
  onClearPlatforms: () => void;
  onSelectPlatformDetail?: (platform: EcommercePlatform) => void;
}

export const EcommercePlatformComparison: React.FC<EcommercePlatformComparisonProps> = ({
  selectedPlatformIds,
  onTogglePlatform,
  onClearPlatforms,
  onSelectPlatformDetail
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'fees' | 'features' | 'arabic'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Get selected platforms objects
  const selectedPlatforms = ECOMMERCE_PLATFORMS.filter(p => selectedPlatformIds.includes(p.id));

  // Quick comparison presets
  const applyPreset = (ids: string[]) => {
    onClearPlatforms();
    ids.forEach(id => onTogglePlatform(id));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Detailed platform comparison metadata
  const platformComparisonDetails: Record<string, {
    fees: {
      monthlyRange: string;
      annualDiscount: string;
      platformCommission: string;
      paymentFeeMada: string;
      paymentFeeCards: string;
      bnplFee: string; // Tabby/Tamara
      hiddenOrExtraCosts: string;
      freeTrial: string;
    };
    features: {
      shippingIntegrations: string;
      dropshippingSupport: string;
      dropshippingRating: string;
      appStoreCount: string;
      posAndBranches: string;
      themeCustomization: string;
      mobileAppMerchant: string;
      aiTools: string[];
    };
    arabicSupport: {
      arabicUiDashboard: string;
      rtlSupport: string;
      arabicCustomerSupport: string;
      zatcaEInvoicing: string;
      saudiDomainSupport: string;
      complianceRating: string;
    };
    verdict: string;
  }> = {
    'salla': {
      fees: {
        monthlyRange: '0 ر.س (بيسك) / 99 ر.س (بلس) / 299 ر.س (برو)',
        annualDiscount: 'شهرين مجاناً (وفر حتى 20%)',
        platformCommission: '0% على جميع المبيعات في باقات بلس وبرو',
        paymentFeeMada: '1.0% + 1 ريال لكل عملية مدى',
        paymentFeeCards: '2.2% + 1 ريال (فيزا / ماستركارد)',
        bnplFee: 'مدمج فوراً مع تابي وتمارا (حوالي 6.5% - 7%)',
        hiddenOrExtraCosts: 'أسعار بعض التطبيقات المدفوعة في متجر سلة',
        freeTrial: 'باقة بيسك مجانية مدى الحياة'
      },
      features: {
        shippingIntegrations: 'ربط مباشر مع أكثر من 40 شركة شحن (سمسا، أرامكس، رد بوكس، سبل)',
        dropshippingSupport: 'تطبيقات دروب شيبينغ محلية (مخازن، قنوات) وبوليصات شحن آلية',
        dropshippingRating: 'جيد',
        appStoreCount: '+500 تطبيق محلي وعالمي مخصص للخليج',
        posAndBranches: 'دعم الفروع المتعددة والمستودعات في باقة برو',
        themeCustomization: 'محرر قوالب مرئي وتخصيص CSS متقدم للمطورين',
        mobileAppMerchant: 'تطبيق جوال فائق التميز (iOS و Android) لإدارة كل العمليات',
        aiTools: ['توليد نصوص المنتجات', 'تحسين سيو التلقائي', 'روبوت واتساب ذكي']
      },
      arabicSupport: {
        arabicUiDashboard: 'كامل 100%',
        rtlSupport: 'أصلي 100% بدون تشوه',
        arabicCustomerSupport: 'دعم فني عربي ممتاز عبر الشات، التذاكر، والهاتف المباشر لكبار التجار',
        zatcaEInvoicing: 'معتمد ومدمج آلياً (المرحلة 2)',
        saudiDomainSupport: 'مدعوم ومربوط فوراً (.sa)',
        complianceRating: 'مرتفع جداً (رسمي)'
      },
      verdict: 'الخيار الأفضل والمثالي لأي تاجر في السعودية والخليج يبحث عن سرعة الإطلاق وبوابات الدفع المحلية والفوترة دون تعقيدات.'
    },
    'zid': {
      fees: {
        monthlyRange: '230 ر.س / شهر (الانطلاق) / 460 ر.س / شهر (النمو)',
        annualDiscount: 'اشتراكات سنوية مع خصم إضافي',
        platformCommission: '0% عمولة للمنصة (تطبق رسوم زد باي فقط)',
        paymentFeeMada: '1.0% + 1 ريال (عبر زد باي الموحد)',
        paymentFeeCards: '2.2% + 1 ريال (فيزا وماستركارد)',
        bnplFee: 'مفعل عبر زد باي (تمارا وتابي)',
        hiddenOrExtraCosts: 'الاشتراك سنوي فقط في باقات النمو، رسوم إضافية لبعض الإضافات',
        freeTrial: '14 يوماً تجربة مجانية'
      },
      features: {
        shippingIntegrations: 'شبكة زد شيب الموحدة (أكثر من 20 شركة شحن بحساب وأسعار موحدة)',
        dropshippingSupport: 'دعم متوسط للدروب شيبينغ المحلي',
        dropshippingRating: 'محدود',
        appStoreCount: '+300 تطبيق وربط محاسبي مع قيود ودفترة وأودو',
        posAndBranches: 'أقوى نظام نقاط بيع (Zid POS) لربط المعارض الفعلية مع المتجر',
        themeCustomization: 'مرونة عالية ومجتمع مصممي قوالب معتمدين',
        mobileAppMerchant: 'تطبيق جوال ممتاز لمتابعة المبيعات والطلبات',
        aiTools: ['تحليل تنبؤي للمخزون', 'توليد صفحات الهبوط', 'تقسيم العملاء التسويقي']
      },
      arabicSupport: {
        arabicUiDashboard: 'كامل 100%',
        rtlSupport: 'أصلي 100% بدون تشوه',
        arabicCustomerSupport: 'مدير حساب مخصص، أكاديمية تدريبية ودعم فني عربي هاتفياً وشات',
        zatcaEInvoicing: 'معتمد ومدمج آلياً (المرحلة 2)',
        saudiDomainSupport: 'مدعوم ومربوط فوراً (.sa)',
        complianceRating: 'مرتفع جداً (رسمي)'
      },
      verdict: 'الأقوى للشركات ومحلات التجزئة التي تمتلك فروعاً واقعية وترغب في دمج الكاشير والمخزون والشحن الموحد.'
    },
    'shopify': {
      fees: {
        monthlyRange: '$1 لأول شهر ثم $39 (Basic) / $105 (Standard) / $399 (Advanced)',
        annualDiscount: 'خصم 25% عند الدفع السنوي ($29/شهر للبيسك)',
        platformCommission: '0% مع Shopify Payments، أو 2.0% إلى 0.5% عند استخدام بوابات خارجية',
        paymentFeeMada: 'حسب البوابة الوسيطة (Tap أو PayTabs عادة 2.5% - 2.9%)',
        paymentFeeCards: '2.9% + 30¢ مع Shopify Payments أو حسب البوابة',
        bnplFee: 'يتطلب ربط تطبيقات تابي وتمارا الخارجية عبر وسيط',
        hiddenOrExtraCosts: 'عمولة 2% على المبيعات خارج شبكتهم + اشتراكات التطبيقات الشهرية',
        freeTrial: '3 أيام مجاناً + الشهر الأول بـ $1 فقط'
      },
      features: {
        shippingIntegrations: 'ربط عالمي مع DHL, FedEx, UPS وتطبيقات شركات الشحن المحلية',
        dropshippingSupport: 'المنصة العالمية الأولى بلا منازع للدروب شيبينغ (DSers, CJ, Zendrop)',
        dropshippingRating: 'ممتاز',
        appStoreCount: '+8,000 تطبيق في متجر Shopify App Store',
        posAndBranches: 'Shopify POS ممتاز عالمياً ولكن أقل تكاملاً مع الفاتورة السعودية',
        themeCustomization: 'حرية برمجية وتصميمية كاملة باستخدام Liquid ومحرر السحب والإفلات',
        mobileAppMerchant: 'تطبيق جوال عالمي فائق الاحترافية لتحليل المبيعات والتنبيهات',
        aiTools: ['Shopify Magic', 'مساعد Sidekick الذكي', 'تحسين صور المنتجات']
      },
      arabicSupport: {
        arabicUiDashboard: 'جيد (يدعم الواجهة المعربة، بعض الإعدادات المتقدمة بالإنجليزية)',
        rtlSupport: 'مدعوم في القوالب الحديثة (Theme 2.0)',
        arabicCustomerSupport: 'دعم فني عبر الشات والبريد الإلكتروني، التركيز الأكبر باللغة الإنجليزية',
        zatcaEInvoicing: 'عبر تطبيقات وسيطة ومدفوعة في متجر شوبيفاي',
        saudiDomainSupport: 'مدعوم عبر إعدادات DNS الخارجية',
        complianceRating: 'عالمي عام'
      },
      verdict: 'الخيار الذي لا يعلى عليه للدروب شيبينغ الدولي والماركات العالمية التي تبيع في عدة دول بعملات متعددة.'
    },
    'woocommerce': {
      fees: {
        monthlyRange: '0$ برمجية مجانية (تكلفة الاستضافة تبدأ من $3 إلى $15 شهرياً)',
        annualDiscount: 'خصومات استضافة سنوية تصل إلى 75% مع Hostinger',
        platformCommission: '0% نهائياً للمنصة (أنت تدفع عمولة بوابة الدفع فقط)',
        paymentFeeMada: 'حسب البوابة المفعلة (Moyasar / PayTabs / Tap)',
        paymentFeeCards: 'حسب بوابة الدفع المختارة مباشرة بدون أي وسيط',
        bnplFee: 'إضافات تابي وتمارا الرسمية لووردبريس متوفرة مجاناً',
        hiddenOrExtraCosts: 'تكلفة تجديد الاستضافة السنوية، بعض الإضافات المدفوعة المتخصصة',
        freeTrial: 'مفتوح المصدر ومجاني للأبد'
      },
      features: {
        shippingIntegrations: 'إضافات لجميع شركات الشحن العالمية والمحلية في العالم العربي',
        dropshippingSupport: 'إضافات شهيرة مثل AliDropship و WooCommerce Dropshipping',
        dropshippingRating: 'جيد',
        appStoreCount: '+60,000 إضافة ووردبريس غير محدودة',
        posAndBranches: 'إضافات POS متعددة ومفتوحة المصدر',
        themeCustomization: 'حرية برمجية مطلقة 100% مع تحكم كامل بالكود وقاعدة البيانات',
        mobileAppMerchant: 'تطبيق WooCommerce الرسمي للجوال',
        aiTools: ['إضافات GPT و Gemini المباشرة', 'RankMath AI و Yoast AI']
      },
      arabicSupport: {
        arabicUiDashboard: 'كامل 100%',
        rtlSupport: 'أصلي 100% بدون تشوه',
        arabicCustomerSupport: 'مجتمع عربي ضخم ومطورون كُثر، ولكن لا يوجد رقم دعم فني مركزي رسمي',
        zatcaEInvoicing: 'إضافات مدفوعة ومعتمدة للفوترة الإلكترونية على ووردبريس',
        saudiDomainSupport: 'مدعوم ومربوط فوراً عبر لوحة تحكم الاستضافة',
        complianceRating: 'مرتفع'
      },
      verdict: 'الأنسب للمطورين والشركات الكبرى التي تبحث عن ملكية تامة للبيانات وعدم دفع أي اشتراكات أو عمولات سحابية.'
    },
    'youcan': {
      fees: {
        monthlyRange: '0$ شهرياً (بدون أي اشتراك شهري ثابت)',
        annualDiscount: 'لا يوجد اشتراك سنوي - نظام الدفع عند النجاح',
        platformCommission: '0.5% فقط على الطلبات الناجحة المكتملة',
        paymentFeeMada: 'تدعم الدفع عند الاستلام بامتياز + بوابات محلية',
        paymentFeeCards: 'عمولة البوابة المحلية المربوطة أو Stripe',
        bnplFee: 'محدود - التركيز الأساسي على COD',
        hiddenOrExtraCosts: 'شحن رصيد أولي $10 لتفعيل المتجر',
        freeTrial: 'بدون مدة انتهاء - ادفع فقط عندما تبيع'
      },
      features: {
        shippingIntegrations: 'ربط ممتاز مع شركات الدفع عند الاستلام في المغرب، مصر، والخليج',
        dropshippingSupport: 'ممتاز لدروب شيبينغ الدفع عند الاستلام (Local COD Dropshipping)',
        dropshippingRating: 'ممتاز',
        appStoreCount: 'ميزات مدمجة ذاتية بدون الحاجة لكثرة التطبيقات الخارجية',
        posAndBranches: 'غير مخصص لإدارة الفروع المتعددة',
        themeCustomization: 'صفحات هبوط وفورم طلب بنقرة واحدة سريعة جداً',
        mobileAppMerchant: 'لوحة تحكم متجاوبة بالكامل مع متصفح الجوال',
        aiTools: ['توليد صفحات الهبوط', 'كتابة العروض السريعة', 'فلترة الطلبات الوهمية']
      },
      arabicSupport: {
        arabicUiDashboard: 'كامل 100%',
        rtlSupport: 'أصلي 100% بدون تشوه',
        arabicCustomerSupport: 'دعم فني عربي ممتاز ومخصص للمنطقة عبر الشات والتذاكر',
        zatcaEInvoicing: 'عبر تطبيقات وسيطة',
        saudiDomainSupport: 'مدعوم عبر إعدادات DNS الخارجية',
        complianceRating: 'مرتفع'
      },
      verdict: 'الحل السحري والأوفر للمبتدئين ومسوقي الدفع عند الاستلام (COD) وحملات المنتج الواحد عبر تيك توك.'
    },
    'wix-ecommerce': {
      fees: {
        monthlyRange: 'تبدأ من $17 إلى $35 / شهرياً',
        annualDiscount: 'خصومات دورية 50% على الاشتراكات السنوية',
        platformCommission: '0% عمولة للمنصة',
        paymentFeeMada: 'عبر بوابات دفع خارجية وسيطة',
        paymentFeeCards: 'حسب بوابة الدفع الخارجية',
        bnplFee: 'محدود في العالم العربي',
        hiddenOrExtraCosts: 'رسوم بعض التطبيقات في متجر Wix App Market',
        freeTrial: '14 يوماً ضمان استرجاع أموال'
      },
      features: {
        shippingIntegrations: 'ربط عبر بوابات شحن عالمية',
        dropshippingSupport: 'دعم دروب شيبينغ عبر Modalyst و Printful',
        dropshippingRating: 'جيد',
        appStoreCount: '+500 تطبيق في Wix App Market',
        posAndBranches: 'Wix POS في أمريكا والدول المدعومة',
        themeCustomization: 'أقوى محرر سحب وإفلات مرئي في العالم (Pixel Perfect)',
        mobileAppMerchant: 'تطبيق Wix Owner ممتاز للجوال',
        aiTools: ['Wix AI Site Creator', 'توليد نصوص وتسويق آلي']
      },
      arabicSupport: {
        arabicUiDashboard: 'كامل 100%',
        rtlSupport: 'مدعوم في القوالب الحديثة',
        arabicCustomerSupport: 'دعم فني عبر التذاكر وقاعدة معرفة معربة',
        zatcaEInvoicing: 'غير مدمج مباشرة (يحتاج ربط خارجي)',
        saudiDomainSupport: 'مدعوم عبر إعدادات DNS',
        complianceRating: 'عالمي عام'
      },
      verdict: 'ممتاز للمصممين وأصحاب المتاجر الصغيرة الذين يعطون الأولوية للمظهر الجمالي والتحكم بالسحب والإفلات.'
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and Presets Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>مقارنة المنصات التفاعلية (Ecommerce Head-to-Head)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              قارن بين المنصات لاكتشاف الفروقات في الرسوم، الميزات، ودعم اللغة العربية
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              حدد منصتين أو أكثر من القائمة أدناه لعرض جدول مقارنة مفصل ومباشر يوضح تكاليف الاشتراكات، عمولات الدفع، التوافق الضريبي، والمميزات التنافسية.
            </p>
          </div>

          {/* Quick Presets Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200/80 self-start md:self-center">
            <span className="text-[11px] font-bold text-slate-400 px-2">مقارنات شائعة:</span>
            <button
              onClick={() => applyPreset(['salla', 'zid'])}
              className="text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              سلة ضد زد 🇸🇦
            </button>
            <button
              onClick={() => applyPreset(['salla', 'shopify'])}
              className="text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              سلة ضد شوبيفاي 🌍
            </button>
            <button
              onClick={() => applyPreset(['shopify', 'woocommerce'])}
              className="text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              شوبيفاي ضد ووكومرس ⚙️
            </button>
            <button
              onClick={() => applyPreset(['salla', 'youcan'])}
              className="text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              سلة ضد يوكان 💵
            </button>
          </div>
        </div>

        {/* Platform Selection Chips */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>اختر المنصات للمقارنة (المحدد حالياً: {selectedPlatforms.length})</span>
              {selectedPlatforms.length < 2 && (
                <span className="text-rose-500 font-normal text-[11px]">(اختر منصتين على الأقل)</span>
              )}
            </span>

            {selectedPlatforms.length > 0 && (
              <button
                onClick={onClearPlatforms}
                className="text-[11px] text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>إلغاء التحديد</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ECOMMERCE_PLATFORMS.map(platform => {
              const isSelected = selectedPlatformIds.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => onTogglePlatform(platform.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img 
                    src={platform.logo_url} 
                    alt={platform.name_ar} 
                    className="w-4 h-4 rounded-md object-cover"
                  />
                  <span>{platform.name_ar}</span>
                  <span className="text-[10px] opacity-75 font-normal">({platform.name})</span>
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'all', label: 'جميع محاور المقارنة', icon: Layers },
            { id: 'fees', label: 'الرسوم وعمولات الدفع', icon: DollarSign },
            { id: 'features', label: 'الميزات وقدرات المنصة', icon: Zap },
            { id: 'arabic', label: 'دعم اللغة العربية والأنظمة المحلية', icon: Languages }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {selectedPlatforms.length < 2 ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-amber-950">يرجى اختيار منصتين على الأقل للمقارنة</h3>
            <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
              اضغط على أزرار المنصات في الأعلى أو اختر إحدى المقارنات الجاهزة (مثل سلة ضد زد، أو سلة ضد شوبيفاي) للبدء في استعراض الفروقات.
            </p>
          </div>
          <button
            onClick={() => applyPreset(['salla', 'zid', 'shopify'])}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            مقارنة أشهر 3 منصات (سلة، زد، شوبيفاي)
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              {/* Table Header: Platform Titles & Logos */}
              <thead>
                <tr className="bg-slate-900 text-white divide-x divide-x-reverse divide-slate-800">
                  <th className="p-4 sm:p-5 w-48 text-xs font-black text-slate-300 bg-slate-950">
                    معيار المقارنة
                  </th>
                  {selectedPlatforms.map(platform => (
                    <th key={platform.id} className="p-4 sm:p-5 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={platform.logo_url} 
                          alt={platform.name_ar} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-sm"
                        />
                        <div className="text-right">
                          <h4 className="text-sm font-black text-white">{platform.name_ar}</h4>
                          <span className="text-[11px] text-slate-400 block font-normal">({platform.name})</span>
                          <span className="text-[10px] text-amber-400 font-bold">★ {platform.rating}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {/* ========================================== */}
                {/* SECTION 1: FEES & COMMISSIONS */}
                {/* ========================================== */}
                {(activeCategory === 'all' || activeCategory === 'fees') && (
                  <>
                    <tr className="bg-indigo-50/60 font-black text-indigo-950">
                      <td colSpan={selectedPlatforms.length + 1} className="p-3 text-xs flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-600" />
                        <span>1. الرسوم، الاشتراكات، وعمولات الدفع (Fees & Commissions)</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">رسوم الاشتراك الشهري</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 font-bold text-slate-800">
                            {meta?.monthlyRange || p.starting_price}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">خصم الدفع السنوي</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 text-emerald-600 font-semibold">
                            {meta?.annualDiscount || 'متوفر'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">عمولة المنصة على المبيعات</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        const isZero = p.transaction_fee_rate === 0;
                        return (
                          <td key={p.id} className="p-4">
                            <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-md ${
                              isZero ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {meta?.platformCommission || p.transaction_fee}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">عمولة بطاقات مدى (Mada)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 text-slate-700 font-mono">
                            {meta?.paymentFeeMada || 'حسب البوابة الوسيطة'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">عمولة البطاقات الائتمانية</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 text-slate-700 font-mono">
                            {meta?.paymentFeeCards || 'حوالي 2.2% - 2.9%'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">التقسيط (تابي وتمارا)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 text-slate-700">
                            {meta?.bnplFee || 'مدعوم'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الباقة التجريبية / المجانية</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="p-4 text-slate-700">
                          {p.trial_info}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">تكاليف إضافية يجب الانتباه لها</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.fees;
                        return (
                          <td key={p.id} className="p-4 text-slate-500 text-[11px] leading-relaxed">
                            {meta?.hiddenOrExtraCosts || 'لا توجد تكاليف خفية معلنة'}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* ========================================== */}
                {/* SECTION 2: CORE FEATURES */}
                {/* ========================================== */}
                {(activeCategory === 'all' || activeCategory === 'features') && (
                  <>
                    <tr className="bg-indigo-50/60 font-black text-indigo-950">
                      <td colSpan={selectedPlatforms.length + 1} className="p-3 text-xs flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span>2. الميزات وقدرات المنصة (Core Features & Capabilities)</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الربط مع شركات الشحن</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.features;
                        return (
                          <td key={p.id} className="p-4 text-slate-700 leading-relaxed">
                            {meta?.shippingIntegrations || p.shipping_partners.join('، ')}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">دعم الدروب شيبينغ (Dropshipping)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.features;
                        const rating = meta?.dropshippingRating || 'جيد';
                        const badgeColor = 
                          rating === 'ممتاز' ? 'bg-emerald-100 text-emerald-800' :
                          rating === 'جيد' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700';

                        return (
                          <td key={p.id} className="p-4 space-y-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${badgeColor}`}>
                              {rating}
                            </span>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {meta?.dropshippingSupport || 'مدعوم عبر إضافات'}
                            </p>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">حجم متجر التطبيقات (App Store)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.features;
                        return (
                          <td key={p.id} className="p-4 font-bold text-slate-800">
                            {meta?.appStoreCount || 'مئات التطبيقات'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الفروع ونقاط البيع (POS)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.features;
                        return (
                          <td key={p.id} className="p-4 text-slate-700">
                            {meta?.posAndBranches || 'مدعوم'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">تطبيق جوال لإدارة المتجر</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.features;
                        return (
                          <td key={p.id} className="p-4 text-slate-700">
                            {meta?.mobileAppMerchant || 'متوفر iOS و Android'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">ميزات الذكاء الاصطناعي</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="p-4">
                          <ul className="space-y-1">
                            {p.ai_features.slice(0, 3).map((feat, i) => (
                              <li key={i} className="flex items-start gap-1 text-[11px] text-slate-600">
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* ========================================== */}
                {/* SECTION 3: ARABIC SUPPORT & COMPLIANCE */}
                {/* ========================================== */}
                {(activeCategory === 'all' || activeCategory === 'arabic') && (
                  <>
                    <tr className="bg-indigo-50/60 font-black text-indigo-950">
                      <td colSpan={selectedPlatforms.length + 1} className="p-3 text-xs flex items-center gap-2">
                        <Languages className="w-4 h-4 text-indigo-600" />
                        <span>3. دعم اللغة العربية والأنظمة المحلية (Arabic Support & Compliance)</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">لوحة التحكم بالعربية (Dashboard)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        const is100 = meta?.arabicUiDashboard === 'كامل 100%';
                        return (
                          <td key={p.id} className="p-4">
                            <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-md ${
                              is100 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {meta?.arabicUiDashboard || 'مدعوم'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">اتجاه القوالب والخطوط (RTL)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        return (
                          <td key={p.id} className="p-4 text-slate-700 font-medium">
                            {meta?.rtlSupport || 'مدعوم'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الدعم الفني باللغة العربية</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        return (
                          <td key={p.id} className="p-4 text-slate-700 leading-relaxed">
                            {meta?.arabicCustomerSupport || 'دعم متوفر'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الفوترة الإلكترونية (ZATCA)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        const isAuto = meta?.zatcaEInvoicing?.includes('آلياً');
                        return (
                          <td key={p.id} className="p-4">
                            <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-md text-[11px] ${
                              isAuto ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{meta?.zatcaEInvoicing || 'مدعوم'}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">دعم النطاق السعودي (.sa)</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        return (
                          <td key={p.id} className="p-4 text-slate-700">
                            {meta?.saudiDomainSupport || 'مدعوم'}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-4 font-bold text-slate-600 bg-slate-50/80">مستوى الامتثال القانوني المحلي</td>
                      {selectedPlatforms.map(p => {
                        const meta = platformComparisonDetails[p.id]?.arabicSupport;
                        return (
                          <td key={p.id} className="p-4 font-black text-indigo-700">
                            {meta?.complianceRating || 'مرتفع'}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* ========================================== */}
                {/* SECTION 4: PROS & CONS */}
                {/* ========================================== */}
                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/80">أبرز المميزات (Pros)</td>
                  {selectedPlatforms.map(p => (
                    <td key={p.id} className="p-4 align-top">
                      <ul className="space-y-1.5">
                        {p.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/80">أبرز العيوب (Cons)</td>
                  {selectedPlatforms.map(p => (
                    <td key={p.id} className="p-4 align-top">
                      <ul className="space-y-1.5">
                        {p.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-rose-700">
                            <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* ========================================== */}
                {/* SECTION 5: VERDICT & SUMMARY */}
                {/* ========================================== */}
                <tr className="bg-slate-50/50">
                  <td className="p-4 font-black text-slate-800 bg-slate-100">خلاصة حكم دليل</td>
                  {selectedPlatforms.map(p => {
                    const meta = platformComparisonDetails[p.id];
                    return (
                      <td key={p.id} className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
                        {meta?.verdict || p.best_for}
                      </td>
                    );
                  })}
                </tr>

                {/* ========================================== */}
                {/* SECTION 6: ACTIONS & COUPONS */}
                {/* ========================================== */}
                <tr className="bg-white">
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/80">كود الخصم الحصري</td>
                  {selectedPlatforms.map(p => (
                    <td key={p.id} className="p-4">
                      {p.coupon_code ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                          <code className="font-mono font-bold text-amber-950 text-xs">{p.coupon_code}</code>
                          <button
                            onClick={() => handleCopyCode(p.coupon_code!)}
                            className="bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-lg transition-colors cursor-pointer mr-auto"
                            title="نسخ الكود"
                          >
                            {copiedCode === p.coupon_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">عروض المنصة التلقائية</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/80">الروابط المباشرة</td>
                  {selectedPlatforms.map(p => (
                    <td key={p.id} className="p-4 space-y-2">
                      <a
                        href={p.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <span>بدء التجربة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {onSelectPlatformDetail && (
                        <button
                          onClick={() => onSelectPlatformDetail(p)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-[11px] transition-colors cursor-pointer text-center"
                        >
                          عرض تفاصيل المنصة
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
