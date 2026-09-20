import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  Scale, 
  Bookmark, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Check 
} from 'lucide-react';
import { useCompare } from '../context/CompareContext.tsx';
import { useToolBookmark } from '../utils/bookmarks.ts';
import { OptimizedImage } from './OptimizedImage.tsx';

interface SmartNeedNavigatorProps {
  navigate: (path: string) => void;
}

interface RecommendedToolItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  tagline: string;
  badge: string;
  badgeType: 'top_pick' | 'arabic_pro' | 'budget' | 'speed';
  whyRecommended: string;
  pricing_type: string;
  starting_price: string;
  rating: number;
  arabic_support: boolean;
  website_url?: string;
  isFreeAvailable: boolean;
}

interface TaskNeedCategory {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  tools: RecommendedToolItem[];
}

const NEED_CATEGORIES: TaskNeedCategory[] = [
  {
    id: 'writing',
    title: 'كتابة وصناعة المحتوى',
    shortTitle: 'كتابة ومقالات',
    icon: '✍️',
    description: 'صياغة مقالات متوافقة مع سيو، رسائل بريد إلكتروني احترافية، ونصوص إعلانية جذابة.',
    tools: [
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        slug: 'claude',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        tagline: 'النموذج الأرقى في الكتابة الأدبية والأكاديمية وصياغة النصوص الطويلة بفهم سياقي فائق.',
        badge: 'الأفضل للكتابة الأدبية والتحليل',
        badgeType: 'top_pick',
        whyRecommended: 'أسلوبه البلاغي باللغة العربية طبيعي جداً بدون ركاكة الترجمة الآلية.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $20 شهرياً',
        rating: 4.9,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'chatgpt',
        name: 'ChatGPT (GPT-4o)',
        slug: 'chatgpt',
        logo_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
        tagline: 'المساعد الذكي الأكثر شمولاً وتكاملاً للبحث والتلخيص وصناعة الأفكار والعصف الذهني.',
        badge: 'الأشمل والأكثر تنوعاً',
        badgeType: 'top_pick',
        whyRecommended: 'يحتوي على نمط صوتي متقدم وتكامل مباشر مع الويب وقدرات تحليل ملفات عملاقة.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $20 شهرياً',
        rating: 4.9,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'jasper-ai',
        name: 'Jasper AI',
        slug: 'jasper',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        tagline: 'منصة متخصصة في كتابة المحتوى التسويقي، حملات الإعلانات، وبناء نبرة الصوت للمؤسسات.',
        badge: 'الأفضل لفرق التسويق والشركات',
        badgeType: 'speed',
        whyRecommended: 'يحتفظ بنبرة هوية علامتك التجارية (Brand Voice) ويولد حملات تسويقية متكاملة.',
        pricing_type: 'Free Trial',
        starting_price: '$39 شهرياً',
        rating: 4.7,
        arabic_support: true,
        isFreeAvailable: false,
      },
      {
        id: 'rytr',
        name: 'Rytr',
        slug: 'rytr',
        logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop',
        tagline: 'أداة كتابة سريعة وخفيفة تدعم أكثر من 30 لغة مع باقة مجانية دائمة ومناسبة للمبتدئين.',
        badge: 'الأوفر تكلفة واقتصادي',
        badgeType: 'budget',
        whyRecommended: 'خيار اقتصادي ممتاز للمدونين والمستقلين مع دعم ممتاز للعربية وخطة مجانية سخية.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $9 شهرياً',
        rating: 4.6,
        arabic_support: true,
        isFreeAvailable: true,
      }
    ]
  },
  {
    id: 'images',
    title: 'تصميم وتوليد الصور',
    shortTitle: 'صور وتصاميم',
    icon: '🎨',
    description: 'توليد صور واقعية، شعارات فكتور، وتعديل الصور بدقة سينمائية وتفاصيل بصرية مذهلة.',
    tools: [
      {
        id: 'midjourney',
        name: 'Midjourney v6.1',
        slug: 'midjourney',
        logo_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop',
        tagline: 'المعيار الذهبي لتوليد الصور الفوتوغرافية والفنية السينمائية بأدق التفاصيل والواقعية.',
        badge: 'الأعلى جودة وواقعية بصرية',
        badgeType: 'top_pick',
        whyRecommended: 'لا يضاهى في التباين والضوء والتركيب الفني السينمائي ورسم الملامح.',
        pricing_type: 'Paid',
        starting_price: '$10 شهرياً',
        rating: 4.9,
        arabic_support: false,
        isFreeAvailable: false,
      },
      {
        id: 'flux-1',
        name: 'FLUX.1 (Black Forest Labs)',
        slug: 'flux',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        tagline: 'الجيل الجديد الأقوى في توليد الصور وتجسيد النصوص المكتوبة داخل الصور بدقة متناهية.',
        badge: 'دقة لا تصدق في كتابة النصوص',
        badgeType: 'speed',
        whyRecommended: 'أقوى نموذج يكتب الكلمات والعبارات داخل الصور بدقة تامة ومتاح مفتوح المصدر.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / مفتوح المصدر',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'leonardo-ai',
        name: 'Leonardo AI',
        slug: 'leonardo-ai',
        logo_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop',
        tagline: 'منصة استوديو متكاملة لتوليد الصور وأصول الألعاب والأنيمي مع لوحة كانفاس وتعديل أجزاء الصور.',
        badge: 'أفضل كانفاس وتعديل مرن',
        badgeType: 'budget',
        whyRecommended: 'يقدم 150 نقطة مجانية يومياً تتجدد تلقائياً دون الحاجة لبطاقة بنكية.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني (150 نقطة/يوم)',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      }
    ]
  },
  {
    id: 'coding',
    title: 'البرمجة وتطوير التطبيقات',
    shortTitle: 'كود وبرمجة',
    icon: '💻',
    description: 'كتابة الأكواد، بناء تطبيقات كاملة بالذكاء الاصطناعي، واكتشاف الثغرات وتصحيح الأخطاء في ثوانٍ.',
    tools: [
      {
        id: 'cursor-ai',
        name: 'Cursor AI IDE',
        slug: 'cursor-ai',
        logo_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop',
        tagline: 'بيئة تطوير برمجية متكاملة ومبنية على VS Code تفهم بنية مشروعك بالكامل وتعدل عدة ملفات.',
        badge: 'محرر الأكواد الأول للمطورين',
        badgeType: 'top_pick',
        whyRecommended: 'يقرأ كامل ملفات مشروعك وينفذ تعديلات عبر عدة ملفات برمجية بضغطة واحدة.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $20 شهرياً',
        rating: 4.9,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'v0-dev',
        name: 'v0 by Vercel',
        slug: 'v0-dev',
        logo_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=100&h=100&fit=crop',
        tagline: 'توليد واجهات مستخدم React وTailwind CSS عصرية ومتجاوبة بمجرد كتابة الوصف أو رفع صورة.',
        badge: 'الأسرع لبناء واجهات المستخدم',
        badgeType: 'speed',
        whyRecommended: 'يحول أي فكرة أو لقطة شاشة إلى كود React + Tailwind نظيف وقابل للنسخ فوراً.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $20 شهرياً',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        slug: 'github-copilot',
        logo_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=100&h=100&fit=crop',
        tagline: 'المساعد البرمجي الرسمي لفرق العمل، مدعوم بأحدث نماذج OpenAI وAnthropic داخل محررك.',
        badge: 'الأكثر استقراراً وتكاملاً للشركات',
        badgeType: 'top_pick',
        whyRecommended: 'تكامل مباشر وسلس داخل VS Code وJetBrains مع حماية ملكية فكرية للشركات.',
        pricing_type: 'Paid',
        starting_price: '$10 شهرياً (مجاني للطلاب)',
        rating: 4.7,
        arabic_support: true,
        isFreeAvailable: false,
      }
    ]
  },
  {
    id: 'video',
    title: 'إنتاج وتحرير الفيديو',
    shortTitle: 'فيديو ومونتاج',
    icon: '🎬',
    description: 'توليد مقاطع فيديو سينمائية من نص، إزالة الخلفيات، وصناعة مقاطع قصيرة للريلز وتيك توك.',
    tools: [
      {
        id: 'runway-gen3',
        name: 'Runway Gen-3 Alpha',
        slug: 'runway',
        logo_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=100&h=100&fit=crop',
        tagline: 'منصة إنتاج سينمائي تحول الأفكار والصور إلى مشاهد واقعية بحركات كاميرا واحترافية عالية.',
        badge: 'الأعلى واقعية لحركة الكاميرا',
        badgeType: 'top_pick',
        whyRecommended: 'فيزيائية حركة دقيقة جداً مع تحكم كامل بزوايا الكاميرا وسرعة المشهد.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني للتجربة / $12 شهرياً',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'kling-ai',
        name: 'Kling AI',
        slug: 'kling-ai',
        logo_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100&h=100&fit=crop',
        tagline: 'توليد فيديو عالي الدقة يصل إلى 1080p مع مرونة حركة بشرية وتفاصيل فيزيائية متطورة.',
        badge: 'أطول مدة فيديو وأداء واقعي',
        badgeType: 'speed',
        whyRecommended: 'يولد لقطات فيديو أطول من المنافسين بحركة طبيعية جداً للملابس والوجوه.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني يومي / $10 شهرياً',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'opus-clip',
        name: 'Opus Clip',
        slug: 'opus-clip',
        logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
        tagline: 'تحويل مقاطع اليوتيوب الطويلة والبودكاست إلى فيديوهات Shorts وReels مع كابشن تلقائي.',
        badge: 'الأفضل لصناع المحتوى والبودكاست',
        badgeType: 'arabic_pro',
        whyRecommended: 'يدعم توليد الكابشن والنصوص باللغة العربية مع إبراز الكلمات الهامة وتتبع الوجه.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني (60 دقيقة) / $9 شهرياً',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      }
    ]
  },
  {
    id: 'audio',
    title: 'هندسة الصوت والتفريغ الصوتي',
    shortTitle: 'صوت وتفريغ',
    icon: '🎙️',
    description: 'توليد أصوات بشرية طبيعية، استنساخ الصوت، وتفريغ تسجيلات المحاضرات والاجتماعات بدقة.',
    tools: [
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        logo_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&h=100&fit=crop',
        tagline: 'محرك الصوت البشري الأكثر واقعية على الإطلاق؛ نبرات صوتية طبيعية واستنساخ صوت فوري.',
        badge: 'الصوت البشري الأكثر إقناعاً بالعربية',
        badgeType: 'arabic_pro',
        whyRecommended: 'نبرات عربية واقعية للغاية تشمل اللهجات الخليجية والمصرية والفصحى بنقاء مذهل.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني (10,000 حرف) / $5 شهرياً',
        rating: 4.9,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'suno-ai',
        name: 'Suno AI v3.5',
        slug: 'suno-ai',
        logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop',
        tagline: 'تأليف وإنتاج أغانٍ ومقاطع موسيقية كاملة بصوت مغنٍ ولحن وتوزيع في أي نمط وموسيقى.',
        badge: 'الأقوى في تلحين الكلمات العربية',
        badgeType: 'top_pick',
        whyRecommended: 'يغني القصائد والكلمات العربية في ثوانٍ بأصوات ذكورية وأنثوية بأي إيقاع.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني (50 نقطة/يوم) / $8 شهرياً',
        rating: 4.8,
        arabic_support: true,
        isFreeAvailable: true,
      }
    ]
  },
  {
    id: 'research',
    title: 'البحث وتلخيص المستندات (PDF)',
    shortTitle: 'أبحاث وتلخيص',
    icon: '📊',
    description: 'استخراج الأفكار من ملفات PDF والكتب ومحركات البحث الأكاديمية مع الاستشهاد بالمصادر.',
    tools: [
      {
        id: 'perplexity-ai',
        name: 'Perplexity AI',
        slug: 'perplexity-ai',
        logo_url: 'https://images.unsplash.com/photo-1507842229452-79e5ff30e522?w=100&h=100&fit=crop',
        tagline: 'محرك بحث إجاباتي ذكي يقرأ الإنترنت لحظياً ويوثق كل معلومة بروابط مصادرها المباشرة.',
        badge: 'بديل جوجل الذكي وموثق بالمراجع',
        badgeType: 'top_pick',
        whyRecommended: 'يعطيك إجابة دقيقة ومختصرة مع روابط المصادر بدون إعلانات أو روابط سبام.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني / $20 شهرياً',
        rating: 4.9,
        arabic_support: true,
        isFreeAvailable: true,
      },
      {
        id: 'chatpdf',
        name: 'ChatPDF',
        slug: 'chatpdf',
        logo_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop',
        tagline: 'ارفع أي كتاب أو بحث علمي وتحدث معه مباشرة باللغة العربية واسأله عن أدق التفاصيل.',
        badge: 'الأسهل للكتب والمذكرات الدراسية',
        badgeType: 'budget',
        whyRecommended: 'يرشدك لرقم الصفحة الدقيق التي تحتوي على الجواب داخل المستند.',
        pricing_type: 'Freemium',
        starting_price: 'مجاني (3 ملفات يومياً)',
        rating: 4.7,
        arabic_support: true,
        isFreeAvailable: true,
      }
    ]
  }
];

export const SmartNeedNavigator: React.FC<SmartNeedNavigatorProps> = ({ navigate }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('writing');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'arabic'>('all');

  const { addToCompare, isInCompare } = useCompare();

  const currentCategory = NEED_CATEGORIES.find((c) => c.id === selectedCategoryId) || NEED_CATEGORIES[0];

  const filteredTools = currentCategory.tools.filter((tool) => {
    if (filterType === 'free') return tool.isFreeAvailable;
    if (filterType === 'arabic') return tool.arabic_support;
    return true;
  });

  const getBadgeStyle = (badgeType: RecommendedToolItem['badgeType']) => {
    switch (badgeType) {
      case 'top_pick':
        return 'bg-indigo-600 text-white';
      case 'arabic_pro':
        return 'bg-emerald-600 text-white';
      case 'budget':
        return 'bg-blue-600 text-white';
      case 'speed':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200/70 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>المستكشف الذكي الفوري</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ماذا تريد أن تنجز اليوم؟
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            حدد هدفك مباشرة وسنرشح لك أفضل الأدوات المختبرة والمعتمدة دون حيرة.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl self-start md:self-auto border border-slate-200/60">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'free'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            خطة مجانية 🆓
          </button>
          <button
            onClick={() => setFilterType('arabic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'arabic'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            يدعم العربية 🇸🇦
          </button>
        </div>
      </div>

      {/* Needs Category Buttons (Horizontal scroll or flex wrap) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {NEED_CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-extrabold">{cat.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Description of active task */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentCategory.icon}</span>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">{currentCategory.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{currentCategory.description}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai-tools')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <span>تصفح كل الأدوات</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filtered Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const inCompare = isInCompare(tool.slug || tool.id);

          return (
            <div
              key={tool.id}
              className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge: Specialty Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${getBadgeStyle(
                      tool.badgeType
                    )}`}
                  >
                    {tool.badge}
                  </span>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-900 text-xs font-bold border border-amber-200/50">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{tool.rating}</span>
                  </div>
                </div>

                {/* Logo & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    <OptimizedImage
                      src={tool.logo_url}
                      alt={tool.name}
                      width={48}
                      height={48}
                      fallbackText={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      containerClassName="w-full h-full"
                    />
                  </div>
                  <div>
                    <h3
                      onClick={() => navigate(`/tools/${tool.slug}`)}
                      className="font-black text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">{tool.pricing_type}</span>
                      {tool.arabic_support && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          يدعم العربية 🟢
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {tool.tagline}
                </p>

                {/* Why Recommended Callout Box */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 mb-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900">لماذا اخترناها: </strong>
                    <span>{tool.whyRecommended}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <span className="text-[11px] font-bold text-slate-500">
                  {tool.starting_price}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Compare toggle */}
                  <button
                    onClick={() => addToCompare(tool as any)}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      inCompare
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border-slate-200'
                    }`}
                    title={inCompare ? 'إلغاء المقارنة' : 'إضافة إلى المقارنة'}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{inCompare ? 'محدد' : 'قارن'}</span>
                  </button>

                  {/* Read review & Details */}
                  <button
                    onClick={() => navigate(`/tools/${tool.slug}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>التفاصيل</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
