import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Rocket, 
  ShieldCheck, 
  HelpCircle, 
  Target, 
  Layers, 
  DollarSign, 
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

interface RoadmapDay {
  day: number;
  phase: string;
  phaseTitle: string;
  title: string;
  details: string;
  actionItems: string[];
  toolRecommendation: string;
}

const NICHES = [
  { id: 'fashion', label: 'الأزياء والعبايات والملابس', icon: '👗', avgBudget: '1500 - 3000 ريال' },
  { id: 'perfumes', label: 'العطور ومستحضرات التجميل', icon: '✨', avgBudget: '2000 - 5000 ريال' },
  { id: 'gadgets', label: 'الإلكترونيات والملحقات الذكية', icon: '🔌', avgBudget: '1000 - 2500 ريال' },
  { id: 'coffee', label: 'القهوة المختصة وأدوات الباريستا', icon: '☕', avgBudget: '2000 - 4000 ريال' },
  { id: 'digital', label: 'المنتجات الرقمية والاشتراكات', icon: '💻', avgBudget: '200 - 800 ريال' },
  { id: 'home', label: 'المستلزمات والديكورات المنزلية', icon: '🏡', avgBudget: '1500 - 3500 ريال' }
];

export const StoreRoadmapGenerator: React.FC = () => {
  const [selectedNiche, setSelectedNiche] = useState<string>('fashion');
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  const toggleDayCompletion = (dayNum: number) => {
    setCompletedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  const currentNicheObj = NICHES.find(n => n.id === selectedNiche) || NICHES[0];

  // 30-Day Plan Dataset
  const daysData: RoadmapDay[] = [
    // Week 1: Phase 1: التأسيس والهوية القانونية
    {
      day: 1,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'استخراج وثيقة العمل الحر أو السجل التجاري',
      details: 'الحصول على التراخيص الرسمية خطوة أساسية ومجانية في السعودية لتفعيل بوابات الدفع (مدى وأبل باي) دون أي تعطيل.',
      actionItems: ['الدخول لبوابة العمل الحر (Freelance.sa)', 'إصدار وثيقة تخصص التجارة الإلكترونية أو التسويق', 'توثيق الحساب عبر نفاذ الوطني'],
      toolRecommendation: 'منصة العمل الحر الحكومية (مجاناً)'
    },
    {
      day: 2,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'اختيار اسم العلامة التجارية وحجز النطاق (Domain)',
      details: 'اختر اسماً قصيراً وسهل الحفظ والنطق، وتأكد من توفر اليوزر على منصات التواصل (تيك توك، إنستغرام).',
      actionItems: ['عصف ذهني واختبار الاسم مع الأصدقاء', 'فحص النطاق .com أو .sa وحجزه عبر Namecheap أو مع باقة سلة', 'حجز معرفات السوشيال ميديا فوراً'],
      toolRecommendation: 'أداة Namecheap أو تسجيل النطاقات مع سلة'
    },
    {
      day: 3,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'تصميم الشعار (Logo) والألوان وهوية البراند',
      details: 'بناء هوية بصرية متناسقة تعطي انطباع الفخامة والموثوقية لزوار متجرك من اللحظة الأولى.',
      actionItems: ['تحديد لوحة الألوان (Color Palette) من 2-3 ألوان رئيسية', 'تصميم الشعار وأيقونة المتجر Favicon', 'تصميم بنرات الترويسة الرئيسية للهاتف والكمبيوتر'],
      toolRecommendation: 'Canva Pro أو Looka AI'
    },
    {
      day: 4,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'إنشاء حساب المتجر على المنصة المناسبة',
      details: 'التسجيل في منصة سلة أو زد أو شوبيفاي حسب ميزانيتك ونوع منتجك والاستفادة من أكواد الخصم الترويجية.',
      actionItems: ['التسجيل في منصة سلة (باقة بلس) أو شوبيفاي', 'ربط الدومين الخاص بالمتجر', 'كتابة نبذة عن المتجر وبيانات التواصل وخدمة العملاء'],
      toolRecommendation: 'منصة سلة / زد / شوبيفاي (عبر دليلنا)'
    },
    {
      day: 5,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'إعداد وتوثيق المتجر في منصة الأعمال السعودية',
      details: 'توثيق متجرك رسمياً في المركز السعودي للأعمال للحصول على الشارة الذهبية وبناء أعلى ثقة للعميل.',
      actionItems: ['الدخول للمركز السعودي للأعمال وتوثيق المتجر الإلكتروني', 'إضافة شارة التوثيق في أسفل فوتر المتجر', 'ربط الحساب البنكي التجاري'],
      toolRecommendation: 'المركز السعودي للأعمال (SBC)'
    },
    {
      day: 6,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'كتابة صفحات السياسات الإلزامية وتجربة العميل',
      details: 'الشفافية في السياسات تحميك قانونياً وتزيد معدل الشراء بنسبة تصل إلى 28%.',
      actionItems: ['صياغة سياسة الاستبدال والاسترجاع بوضوح', 'كتابة سياسة الشحن ومدة التوصيل', 'إضافة سياسة الخصوصية والشروط والأحكام'],
      toolRecommendation: 'نماذج السياسات التلقائية في سلة أو ChatGPT'
    },
    {
      day: 7,
      phase: 'الأسبوع 1',
      phaseTitle: 'التأسيس والهوية وتوثيق المتجر',
      title: 'مراجعة الأسبوع الأول واختبار واجهة المتجر',
      details: 'تصفح المتجر من شاشة الهاتف الذكي كأنك متسوق جديد للتأكد من سلاسة التصفح وسرعة التحميل.',
      actionItems: ['فحص ظهور الشعار والألوان على مختلف مقاسات الشاشات', 'التأكد من سهولة التنقل بالقائمة العلوية والتصنيفات', 'حفظ نسخة احتياطية من الإعدادات'],
      toolRecommendation: 'متصفح الجوال الشخصي'
    },

    // Week 2: Phase 2: المنتجات والمحتوى والتسعير
    {
      day: 8,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'تحديد القائمة الأولية للمنتجات (10 - 20 منتجاً)',
      details: 'ابدأ بعدد مركز من المنتجات التي تلبي احتياجاً حقيقياً أو تحل مشكلة شائعة لدى جمهورك.',
      actionItems: ['حصر 10-15 منتجاً أساسياً للبداية', 'التأكد من توفر المخزون لدى المورد أو في مستودعك', 'حساب تكلفة الشراء مع الشحن والجمارك بدقة'],
      toolRecommendation: 'رادار المنتجات الرابحة في موقعنا'
    },
    {
      day: 9,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'جلسة تصوير احترافية للمنتجات أو طلب عينات',
      details: 'الصورة تبيع أكثر من ألف كلمة؛ العميل يشتري بعينيه أولاً في التجارة الرقمية.',
      actionItems: ['تصوير زوايا متعددة للمنتج (أمامي، جانبي، تفاصيل الملمس)', 'تصوير فيديو سريع يوضح طريقة الاستخدام أو اللبس', 'عزل الخلفيات وتوحيد الأبعاد (1:1 مربعة)'],
      toolRecommendation: 'PhotoRoom أو أداة Pebblely AI'
    },
    {
      day: 10,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'صياغة نصوص وصف المنتجات المقنعة (Copywriting)',
      details: 'لا تكتفِ بذكر المقاسات؛ ركّز على الفوائد والشعور الذي يمنحه المنتج للعميل.',
      actionItems: ['كتابة عنوان واضح للمنتج مع الكلمات الدلالية', 'سرد 4-5 نقاط تلخص مميزات المنتج الحقيقية', 'توضيح طريقة الاستخدام وضمان الجودة'],
      toolRecommendation: 'أداة Copy.ai أو ChatGPT'
    },
    {
      day: 11,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'هندسة التسعير وتحديد عروض الحزم (Bundles)',
      details: 'التسعير الذكي هو الفارق بين متجر خاسر ومتجر يضاعف متوسط قيمة الطلب (AOV).',
      actionItems: ['تحديد سعر يغطي تكلفة المنتج + الشحن + الإعلان + هامش ربح لا يقل عن 50%', 'إنشاء عروض الحزم (مثال: اشترِ 2 واحصل على الثالث بنصف السعر)', 'تفعيل ميزة الشحن المجاني للطلبات فوق 200 ريال'],
      toolRecommendation: 'حاسبة رسوم وأرباح المتاجر في دليلنا'
    },
    {
      day: 12,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'رفع المنتجات وتنسيق التصنيفات (Categories)',
      details: 'تنظيم واجهة المتجر وتصنيفاته يضمن وصول العميل لغايته خلال أقل من 3 نقرات.',
      actionItems: ['رفع المنتجات مع الصور والأسعار والخيارات (المقاسات/الألوان)', 'توزيعها على تصنيفات رئيسية واضحة', 'تعيين الكلمات المفتاحية للسيو (SEO) لكل منتج'],
      toolRecommendation: 'لوحة تحكم منصة المتجر'
    },
    {
      day: 13,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'تصميم صور التقييمات وتجارب العملاء الأولية',
      details: 'إبراز الدليل الاجتماعي (Social Proof) يزيل تردد المشتري لأول مرة.',
      actionItems: ['تجهيز تقييمات أولية أو شهادات تجريبية من المقربين', 'إبراز أيقونات الثقة: شحن سريع، دفع آمن، ضمان ذهبي', 'تثبيت بانر الثقة أعلى صفحة المنتج'],
      toolRecommendation: 'Canva'
    },
    {
      day: 14,
      phase: 'الأسبوع 2',
      phaseTitle: 'المنتجات والتصوير وصياغة الأوصاف',
      title: 'مراجعة كاتالوج المنتجات وتدقيق الروابط',
      details: 'اختبار عملية اختيار المقاس وإضافة المنتج للسلة للتأكد من عدم وجود أي خطأ برمجي.',
      actionItems: ['اختبار إضافة عدة منتجات للسلة', 'فحص حساب الخصومات والأكواد الترويجية بدقة', 'التأكد من تناسق أسعار الضريبة المضافة'],
      toolRecommendation: 'تجربة حية على المتجر'
    },

    // Week 3: Phase 3: بوابات الدفع والشحن والربط
    {
      day: 15,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'تفعيل بوابات الدفع الإلكتروني (مدى وأبل باي)',
      details: 'أكثر من 85% من مشتريات التجارة الإلكترونية في الخليج تتم عبر Apple Pay ومدى.',
      actionItems: ['تفعيل بوابة سلة باي أو زد باي بنقرة واحدة', 'التحقق من تفعيل خيار Apple Pay على أجهزة الآيفون', 'فحص تسوية الأموال في حسابك البنكي'],
      toolRecommendation: 'سلة باي / بوابة الدفع المعتمدة'
    },
    {
      day: 16,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'الربط مع شركات التقسيط (تابي وتمارا)',
      details: 'خدمات "اشتر الآن وادفع لاحقاً" ترفع المبيعات بنسبة تتجاوز 40% وتزيد قيمة السلة.',
      actionItems: ['تقديم طلب الربط مع تابي (Tabby)', 'تقديم طلب الربط مع تمارا (Tamara)', 'إبراز ويدجت التقسيط بوضوح تحت سعر المنتج'],
      toolRecommendation: 'تطبيقات تابي وتمارا في متجر التطبيقات'
    },
    {
      day: 17,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'تفعيل خيارات الشحن والتوصيل المحلي والدولي',
      details: 'الربط مع شركات شحن سريعة وموثوقة (أرامكس، سبل، سمسا، ردبوكس، إمكان).',
      actionItems: ['اختيار 2-3 شركات شحن بأسعار منافسة (عبر بوليصات سلة المخفضة)', 'تفعيل خيار خزائن التوصيل الذكية (مثل RedBox) لتكلفة شحن رخيصة', 'تحديد تكلفة الشحن ومناطق التغطية بالتفصيل'],
      toolRecommendation: 'بوليصات الشحن المخفضة في سلة/زد'
    },
    {
      day: 18,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'تثبيت بيكسل تيك توك وسناب شات وميتا (Tracking Pixels)',
      details: 'البيكسل هو العين التي تقيس نتائج الإعلانات وتدرب الذكاء الاصطناعي على جلب مشترين حقيقيين.',
      actionItems: ['إنشاء حساب إعلاني على TikTok Ads وSnapchat Ads', 'تثبيت بيكسل تيك توك وتفعيل الـ Events (مشاهدة المحتوى، إضافة للسلة، الشراء)', 'تثبيت بيكسل سناب شات وفيسبوك'],
      toolRecommendation: 'أدوات الربط التلقائي في المنصة'
    },
    {
      day: 19,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'إعداد إشعارات السلات المتروقة عبر الواتساب',
      details: 'استرجاع ما يصل إلى 25% من العملاء الذين دخلوا المتجر وغادروا دون إكمال الشراء.',
      actionItems: ['تفعيل تطبيق رسائل الواتساب التلقائية', 'صياغة رسالة لطيفة مع كود خصم 5% بعد ساعة من ترك السلة', 'تجهيز قوالب الردود السريعة لخدمة العملاء'],
      toolRecommendation: 'تطبيق رسايل أو زد سندر أو ربط واتساب الرسمي'
    },
    {
      day: 20,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'إجراء طلب تجريبي حقيقي (Test Order)',
      details: 'قم بعمل طلب شراء حقيقي ببطاقتك بمبلغ رمزي لتجربة رحلة العميل من الألف إلى الياء.',
      actionItems: ['الدخول كعميل والشراء ببطاقتك أو Apple Pay', 'فحص وصول رسالة تأكيد الطلب للواتساب والإيميل', 'تجربة طباعة البوليصة وفحص خصم المبلغ وإلغاء الطلب'],
      toolRecommendation: 'متجرك الإلكتروني الفعلي'
    },
    {
      day: 21,
      phase: 'الأسبوع 3',
      phaseTitle: 'بوابات الدفع والشحن والتقسيط',
      title: 'تجهيز كراتين التغليف وكرت الشكر (Unboxing Experience)',
      details: 'التغليف الفاخر يشجع العميل على تصوير ونشر تجربته على تيك توك مجاناً (UGC).',
      actionItems: ['تجهيز كراتين الشحن الملائمة لحجم المنتجات', 'طباعة كروت شكر للعميل تتضمن كود خصم للطلب الثاني', 'إضافة هدية رمزية بسيطة (عينة عطر، ستيكر، حبة حلاو) لمفاجأة العميل'],
      toolRecommendation: 'موردين التغليف المحليين'
    },

    // Week 4: Phase 4: التسويق والإطلاق الممكّن
    {
      day: 22,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'صناعة 5 فيديوهات محتوى عفوي لتيك توك وسناب شات',
      details: 'الفيديوهات العفوية الواقعية (UGC) تتفوق على الإعلانات المصممة بـ 5 أضعاف في المبيعات.',
      actionItems: ['تصوير فيديو يوضح المشكلة والحل بالمنتج', 'تصوير فيديو لتغليف طلبية وهمية بأسلوب ممتع (Pack with me)', 'تصوير فيديو مقارنة: منتجنا مقابل المنتجات التقليدية بالسوق'],
      toolRecommendation: 'تطبيق CapCut للجوال'
    },
    {
      day: 23,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'نشر المحتوى المجاني (Organic) على حسابات المتجر',
      details: 'بناء نشاط وحيوية في الحسابات قبل إطلاق الإعلانات المدفوعة ليرى العميل متجراً حياً.',
      actionItems: ['نشر 2-3 فيديوهات يومياً على تيك توك وسناب شات', 'استخدام الصوتيات الأكثر انتشاراً (Trending Sounds)', 'وضع رابط المتجر في البايو (Bio) مع جملة تشجيعية'],
      toolRecommendation: 'TikTok & Instagram Reels'
    },
    {
      day: 24,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'إطلاق أول حملة تيك توك مدفوعة (TikTok Spark Ads)',
      details: 'الترويج لأفضل فيديو حصل على تفاعل مجاني بميزانية اختبار تبدأ من 50-100 ريال يومياً.',
      actionItems: ['اختيار أفضل فيديو من حساب المتجر', 'تحديد الجمهور المستهدف (العمر، الاهتمامات، الموقع)', 'تحديد هدف الحملة: مبيعات وتحويلات (Conversions)'],
      toolRecommendation: 'TikTok Ads Manager'
    },
    {
      day: 25,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'إطلاق حملة سناب شات الترويجية (Snapchat Ads)',
      details: 'سناب شات هو المنصة رقم 1 للشراء المباشر في السعودية للمنتجات الاستهلاكية والنسائية والعطور.',
      actionItems: ['رفع إعلان فيديو عمودي 9:16 مدته 10-15 ثانية', 'وضع Swipe Up مباشر لصفحة المنتج المعني وليس الصفحة الرئيسية', 'استهداف المدن الرئيسية (الرياض، جدة، الشرقية)'],
      toolRecommendation: 'Snapchat Ads Manager'
    },
    {
      day: 26,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'تحليل أول 48 ساعة من الإعلانات والأرقام',
      details: 'مراقبة تكلفة النقرة (CPC) ومعدل الوصول وإضافة السلات المتروكة.',
      actionItems: ['إيقاف أي إعلان تكلفة النقرة فيه مرتفعة أو لا يأتي بسلات', 'مضاعفة الميزانية على الإعلان الذي يحقق مبيعات وعائد إعلاني (ROAS)', 'الرد الفوري على تعليقات واستفسارات العملاء في الإعلانات'],
      toolRecommendation: 'لوحة تحليلات الإعلانات'
    },
    {
      day: 27,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'التواصل مع 5 صناع محتوى صغار (Micro-Influencers)',
      details: 'إرسال عينات مجانية لصناع محتوى يمتلكون من 10k إلى 50k متابع مقابل مراجعة ونشر صادق.',
      actionItems: ['تحديد 5 حسابات متخصصة في نفس نيش متجرك', 'مراسلتهم باحترام وتقديم المنتج كهدية مجانية بدون شروط معقدة', 'منحهم كود خصم خاص بمتابعيهم لتتبع مبيعاتهم بدقة'],
      toolRecommendation: 'الرسائل المباشرة (Instagram / TikTok DM)'
    },
    {
      day: 28,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'تحسين سرعة التوصيل وخدمة ما بعد البيع',
      details: 'متابعة أول الشحنات التي خرجت للعملاء والاتصال بهم للتأكد من رضاهم وسماع آرائهم.',
      actionItems: ['متابعة أرقام التتبع والتأكد من تسليم الطلبات في موعدها', 'إرسال رسالة واتساب للعميل بعد الاستلام للاطمئنان عليه', 'طلب تقييم المنتج على المتجر'],
      toolRecommendation: 'تطبيق تتبع الشحنات ولوحة التحكم'
    },
    {
      day: 29,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'إعادة استهداف زوار المتجر (Retargeting Campaign)',
      details: 'العميل يحتاج إلى رؤية علامتك من 3 إلى 7 مرات قبل اتخاذ قرار الشراء النهائي.',
      actionItems: ['إنشاء جمهور مخصص (Custom Audience) لكل من زار المتجر ولم يشترِ', 'إطلاق إعلان خاص يعرض كود خصم إضافي أو توصيل مجاني لمدة 24 ساعة فقط', 'خلق شعور بالإلحاح (Urgency)'],
      toolRecommendation: 'إعلانات إعادة الاستهداف في تيك توك وسناب'
    },
    {
      day: 30,
      phase: 'الأسبوع 4',
      phaseTitle: 'التسويق والحملات الممولة والإطلاق',
      title: 'حفل الإطلاق الرسمي ومراجعة الأرباح والنمو',
      details: 'مبروك! متجرك الآن يعمل بكفاءة كاملة وتستقبل مبيعاتك اليومية بثبات وثقة.',
      actionItems: ['حساب صافي الأرباح بعد خصم تكاليف الإعلانات والمنتجات', 'إعادة استثمار 70% من الأرباح في طلب كميات جديدة وتوسيع الإعلانات', 'وضع أهداف الشهر القادم ومضاعفة المبيعات'],
      toolRecommendation: 'حاسبة الأرباح وإكسل التدفق المالي'
    }
  ];

  const currentWeekDays = daysData.filter(d => {
    if (activeWeek === 1) return d.day >= 1 && d.day <= 7;
    if (activeWeek === 2) return d.day >= 8 && d.day <= 14;
    if (activeWeek === 3) return d.day >= 15 && d.day <= 21;
    return d.day >= 22 && d.day <= 30;
  });

  const totalCompleted = Object.values(completedDays).filter(Boolean).length;
  const progressPct = Math.round((totalCompleted / 30) * 100);

  const handleCopyRoadmap = () => {
    const textToCopy = `خطة إطلاق المتجر الإلكتروني في 30 يوماً:\nالنيش: ${currentNicheObj.label}\n\n` +
      daysData.map(d => `اليوم ${d.day}: ${d.title}\n- ${d.details}\n- الأداة: ${d.toolRecommendation}\n`).join('\n');
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/20">
            <Rocket className="w-3.5 h-3.5 text-indigo-400" />
            <span>خريطة الطريق التنفيذية التفاعلية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            خطة إطلاق متجرك الإلكتروني خطوة بخطوة في 30 يوماً
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            دليل عملي يومي ينقلك من نقطة الصفر بدون خبرة برمجية إلى استقبال أول طلبات الشراء الحقيقية على متجرك بأعلى كفاءة وتنظيم.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>نسبة تقدمك في الخطة:</span>
              <span className="font-mono text-emerald-400">{progressPct}% ({totalCompleted} من 30 يوماً)</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleCopyRoadmap}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            {copiedPlan ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم نسخ الخطة بالكامل!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الخطة إلى الملاحظات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Select Niche Horizontal Scroller */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>اختر مجال متجرك لتخصيص الخطة:</span>
          </span>
          <span className="text-xs text-slate-500 font-bold">
            الميزانية التقريبية المقترحة: <strong className="text-indigo-600 font-mono">{currentNicheObj.avgBudget}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {NICHES.map((niche) => {
            const isSelected = selectedNiche === niche.id;
            return (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xl">{niche.icon}</span>
                <span className="text-xs font-bold leading-tight">{niche.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { week: 1, title: 'الأسبوع 1: التأسيس والتوثيق', days: 'الأيام 1 - 7' },
          { week: 2, title: 'الأسبوع 2: المنتجات والتصوير', days: 'الأيام 8 - 14' },
          { week: 3, title: 'الأسبوع 3: الدفع والربط والشحن', days: 'الأيام 15 - 21' },
          { week: 4, title: 'الأسبوع 4: الإعلانات والإطلاق', days: 'الأيام 22 - 30' }
        ].map((w) => {
          const isActive = activeWeek === w.week;
          return (
            <button
              key={w.week}
              onClick={() => setActiveWeek(w.week)}
              className={`flex-1 min-w-[200px] p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className={`font-mono font-bold ${isActive ? 'text-indigo-200' : 'text-indigo-600'}`}>{w.days}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>مرحلة {w.week}</span>
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm">{w.title}</h4>
            </button>
          );
        })}
      </div>

      {/* Days Action Cards */}
      <div className="space-y-4">
        {currentWeekDays.map((dayItem) => {
          const isDone = !!completedDays[dayItem.day];
          return (
            <div
              key={dayItem.day}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox Button */}
                  <button
                    onClick={() => toggleDayCompletion(dayItem.day)}
                    className={`w-7 h-7 rounded-xl border mt-0.5 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md font-mono ${
                        isDone ? 'bg-emerald-200 text-emerald-950' : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        اليوم {dayItem.day}
                      </span>
                      <h3 className={`text-sm sm:text-base font-extrabold ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                        {dayItem.title}
                      </h3>
                    </div>

                    <p className={`text-xs ${isDone ? 'text-emerald-700' : 'text-slate-600'} leading-relaxed max-w-3xl`}>
                      {dayItem.details}
                    </p>

                    {/* Action Items List */}
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 block">مهام التنفيذ السريعة:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {dayItem.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Tool Badge */}
                <div className="sm:text-left self-start sm:self-auto bg-indigo-50/80 px-3 py-2 rounded-xl border border-indigo-100/80 flex-shrink-0">
                  <span className="text-[10px] text-indigo-700 block font-bold">الأداة / المنصة المقترحة:</span>
                  <span className="text-xs font-black text-indigo-950">{dayItem.toolRecommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Encouragement */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-2xl bg-white/10">💡</span>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base">نصيحة ذهبية للنجاح والاستمرارية:</h4>
            <p className="text-xs text-amber-100 leading-relaxed">
              لا تنتظر الكمال المطلق لإطلاق المتجر. أطلق متجرك بمجرد جاهزية 80% من العناصر، ثم طوّر وحسّن بناءً على تعليقات عملائك الحقيقيين.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveWeek(1)}
          className="w-full sm:w-auto bg-white text-orange-950 hover:bg-orange-50 font-black text-xs px-5 py-3 rounded-xl transition-all shadow cursor-pointer whitespace-nowrap"
        >
          البدء من اليوم الأول
        </button>
      </div>
    </div>
  );
};
