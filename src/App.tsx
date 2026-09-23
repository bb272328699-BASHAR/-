import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';

const HomePage = lazy(() => import('./pages/HomePage.tsx').then(m => ({ default: m.HomePage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage.tsx').then(m => ({ default: m.ToolsPage })));
const ToolDetailPage = lazy(() => import('./pages/ToolDetailPage.tsx').then(m => ({ default: m.ToolDetailPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage.tsx').then(m => ({ default: m.CategoriesPage })));
const CategoryDetailPage = lazy(() => import('./pages/CategoryDetailPage.tsx').then(m => ({ default: m.CategoryDetailPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage.tsx').then(m => ({ default: m.ReviewsPage })));
const ComparisonsPage = lazy(() => import('./pages/ComparisonsPage.tsx').then(m => ({ default: m.ComparisonsPage })));
const TutorialsPage = lazy(() => import('./pages/TutorialsPage.tsx').then(m => ({ default: m.TutorialsPage })));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage.tsx').then(m => ({ default: m.ArticlesPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage.tsx').then(m => ({ default: m.ResourcesPage })));
const StaticPages = lazy(() => import('./pages/StaticPages.tsx').then(m => ({ default: m.StaticPages })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.tsx').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx').then(m => ({ default: m.AdminDashboard })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.tsx').then(m => ({ default: m.UserProfilePage })));
const AIAdvisorPage = lazy(() => import('./pages/AIAdvisorPage.tsx').then(m => ({ default: m.AIAdvisorPage })));
const PromptsHubPage = lazy(() => import('./pages/PromptsHubPage.tsx').then(m => ({ default: m.PromptsHubPage })));
const StacksPage = lazy(() => import('./pages/StacksPage.tsx').then(m => ({ default: m.StacksPage })));
const RoiCalculatorPage = lazy(() => import('./pages/RoiCalculatorPage.tsx').then(m => ({ default: m.RoiCalculatorPage })));
const AlternativesPage = lazy(() => import('./pages/AlternativesPage.tsx').then(m => ({ default: m.AlternativesPage })));
const EcommercePage = lazy(() => import('./pages/EcommercePage.tsx').then(m => ({ default: m.EcommercePage })));
const ToolsSitemapPage = lazy(() => import('./pages/ToolsSitemapPage.tsx').then(m => ({ default: m.ToolsSitemapPage })));
import { AuthModal } from './components/AuthModal.tsx';
import { CookieBanner } from './components/CookieBanner.tsx';
import { ComparisonDock } from './components/ComparisonDock.tsx';
import { ScrollProgress } from './components/ScrollProgress.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Tool, Category, Article, Comparison, Review, Tutorial } from './types.ts';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_TOOLS, 
  DEFAULT_COMPARISONS, 
  DEFAULT_REVIEWS, 
  DEFAULT_TUTORIALS, 
  DEFAULT_ARTICLES 
} from './data/defaultCatalog.ts';
import { Loader2 } from 'lucide-react';
import { usePageTracking } from './hooks/usePageTracking.ts';
import { useRealtimePresence } from './hooks/useRealtimePresence.ts';
import { fetchAdSettings } from './components/AdSlot.tsx';
import { getSavedConsent } from './utils/consent.ts';
import { applyRouteSEO } from './utils/seo.ts';
import { syncClientCache } from './utils/cacheManager.ts';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVoiceMode, setSearchVoiceMode] = useState(false);

  const openSearch = () => {
    setSearchVoiceMode(false);
    setSearchOpen(true);
  };

  const openVoiceSearch = () => {
    setSearchVoiceMode(true);
    setSearchOpen(true);
  };

  // Google Analytics 4 automatic page view tracking on route changes
  usePageTracking(currentPath);

  // Maintain Live Real-Time Presence Heartbeat via Firestore & Server
  useRealtimePresence(currentPath);

  // Verify GA4 Tracking code & Property ID status (555078183)
  useEffect(() => {
    const propertyId = '555078183';
    const measurementId = 'G-T1X92GT5YK';

    const isGAActive = typeof window !== 'undefined' && 
      (typeof window.gtag === 'function' || (Array.isArray(window.dataLayer) && window.dataLayer.length > 0));

    // Console log appears only in development mode to confirm successful binding
    if (process.env.NODE_ENV !== 'production') {
      if (isGAActive) {
        console.log(`%c[GA4 Verification] ✅ GA4 Tracking Verified & Active | Property ID: ${propertyId} | Measurement ID: ${measurementId}`, 'color: #10b981; font-weight: bold;');
      } else {
        console.warn(`[GA4 Verification] ⚠️ GA4 Tracking Script initializing for Property ID: ${propertyId}`);
      }
    }
  }, []);

  // Automated Search Engine Optimization (SEO) & Schema.org markup on route changes
  useEffect(() => {
    applyRouteSEO(currentPath);
  }, [currentPath]);

  // Admin session state
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('daleel_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('daleel_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global catalog states initialized with rich default data so Netlify / static hosts render immediately
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [trendingTools, setTrendingTools] = useState<Tool[]>(DEFAULT_TOOLS.filter(t => t.is_trending));
  const [popularTools, setPopularTools] = useState<Tool[]>(DEFAULT_TOOLS.filter(t => t.is_popular));
  const [newTools, setNewTools] = useState<Tool[]>(DEFAULT_TOOLS.slice(0, 6));
  const [latestReviews, setLatestReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [latestComparisons, setLatestComparisons] = useState<Comparison[]>(DEFAULT_COMPARISONS);
  const [latestTutorials, setLatestTutorials] = useState<Tutorial[]>(DEFAULT_TUTORIALS);
  const [latestArticles, setLatestArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Synchronize browser URL on internal navigation
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fetch initial catalog data from backend if available, retaining fallback data on failure
  useEffect(() => {
    let isMounted = true;

    async function fetchSafe(url: string) {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    }

    async function loadData() {
      try {
        const [homeData, catsData, revData, compData, tutData, artData] = await Promise.all([
          fetchSafe('/api/collections/home'),
          fetchSafe('/api/categories'),
          fetchSafe('/api/reviews'),
          fetchSafe('/api/comparisons'),
          fetchSafe('/api/tutorials'),
          fetchSafe('/api/articles'),
        ]);

        if (!isMounted) return;

        if (homeData) {
          if (Array.isArray(homeData?.trending) && homeData.trending.length > 0) {
            setTrendingTools(homeData.trending);
          }
          if (Array.isArray(homeData?.popular) && homeData.popular.length > 0) {
            setPopularTools(homeData.popular);
          }
          if (Array.isArray(homeData?.newest) && homeData.newest.length > 0) {
            setNewTools(homeData.newest);
          }
        }
        if (catsData && Array.isArray(catsData) && catsData.length > 0) {
          setCategories(catsData);
        }
        if (revData && Array.isArray(revData) && revData.length > 0) {
          setLatestReviews(revData);
        }
        if (compData && Array.isArray(compData) && compData.length > 0) {
          setLatestComparisons(compData);
        }
        if (tutData && Array.isArray(tutData) && tutData.length > 0) {
          setLatestTutorials(tutData);
        }
        if (artData && Array.isArray(artData) && artData.length > 0) {
          setLatestArticles(artData);
        }
      } catch (err) {
        console.warn('Initial load handled safely with default catalog:', err);
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    }

    loadData();

    // Cache sync check & live reload on admin cache purge
    syncClientCache().then(res => {
      if (res.updated) {
        loadData();
      }
    });

    const handleCacheInvalidated = () => {
      loadData();
    };

    window.addEventListener('daleel:cache_invalidated', handleCacheInvalidated);

    return () => {
      isMounted = false;
      window.removeEventListener('daleel:cache_invalidated', handleCacheInvalidated);
    };
  }, []);

  // Google AdSense Auto-ads Initialization with Consent Mode awareness
  useEffect(() => {
    let unmounted = false;

    fetchAdSettings().then((settings) => {
      if (unmounted) return;
      const isAdsEnabled = settings?.ads_enabled === 'true' || settings?.ads_enabled === '1';
      const isAutoAdsEnabled = settings?.ads_auto_ads_enabled === 'true' || settings?.ads_auto_ads_enabled === '1' || settings?.ads_auto_ads_enabled === undefined;
      const isTestMode = settings?.ads_test_mode === 'true';
      const rawPubId = settings?.ads_publisher_id || '';
      const cleanPub = rawPubId.replace(/^ca-/, '').trim();
      const publisherId = cleanPub.startsWith('pub-') ? `ca-${cleanPub}` : `ca-pub-${cleanPub}`;

      if (!isAdsEnabled || !isAutoAdsEnabled || isTestMode || !cleanPub || cleanPub === 'pub-0000000000000000') {
        return;
      }

      if ((window as any).__ADSENSE_BLOCKED__) {
        return;
      }

      const scriptId = 'google-adsense-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', publisherId);
        script.onerror = () => {
          (window as any).__ADSENSE_BLOCKED__ = true;
          window.dispatchEvent(new CustomEvent('daleel_ads_blocked'));
        };
        document.head.appendChild(script);
      } else if (!script.getAttribute('data-ad-client')) {
        script.setAttribute('data-ad-client', publisherId);
      }
    });

    return () => {
      unmounted = true;
    };
  }, []);

  const handleAdminLogin = (token: string, user: any) => {
    localStorage.setItem('daleel_admin_token', token);
    localStorage.setItem('daleel_admin_user', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
    navigate('/admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('daleel_admin_token');
    localStorage.removeItem('daleel_admin_user');
    setAdminToken(null);
    setAdminUser(null);
    navigate('/admin/login');
  };

  // Router matching logic
  const renderRoute = () => {
    if (loadingInitial) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold text-base">جاري تحميل منصة دليل الذكاء الاصطناعي...</p>
        </div>
      );
    }

    // 1. Home
    if (currentPath === '/') {
      return (
        <HomePage
          categories={categories}
          trendingTools={trendingTools}
          popularTools={popularTools}
          newTools={newTools}
          latestReviews={latestReviews}
          latestComparisons={latestComparisons}
          latestTutorials={latestTutorials}
          latestArticles={latestArticles}
          navigate={navigate}
          openSearch={openSearch}
          openVoiceSearch={openVoiceSearch}
        />
      );
    }

    // 2. Tools list
    if (currentPath === '/ai-tools' || currentPath.startsWith('/ai-tools?')) {
      return <ToolsPage categories={categories} navigate={navigate} />;
    }

    const sanitizeSlug = (raw: string) => raw.split('?')[0].split('#')[0].replace(/\/$/, '');

    // 3. Tool Details: /tools/:slug or /tool/:slug
    if (currentPath.startsWith('/tools/') || currentPath.startsWith('/tool/')) {
      const slug = sanitizeSlug(currentPath.startsWith('/tools/') ? currentPath.replace('/tools/', '') : currentPath.replace('/tool/', ''));
      return <ToolDetailPage slug={slug} navigate={navigate} />;
    }

    // 4. Categories list: /categories
    if (currentPath === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    // 5. Category Details: /categories/:slug
    if (currentPath.startsWith('/categories/')) {
      const slug = sanitizeSlug(currentPath.replace('/categories/', ''));
      return <CategoryDetailPage slug={slug} navigate={navigate} />;
    }

    // 6. Reviews: /reviews or /reviews/:slug
    if (currentPath === '/reviews') {
      return <ReviewsPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/reviews/')) {
      const slug = sanitizeSlug(currentPath.replace('/reviews/', ''));
      return <ReviewsPage navigate={navigate} reviewSlug={slug} />;
    }

    // 7. Comparisons: /comparisons or /comparisons/:slug
    if (currentPath === '/comparisons' || currentPath.startsWith('/comparisons?')) {
      const search = currentPath.includes('?') ? currentPath.split('?')[1] : window.location.search;
      const params = new URLSearchParams(search);
      const tool1 = params.get('tool1') || undefined;
      const tool2 = params.get('tool2') || undefined;
      const tool3 = params.get('tool3') || undefined;
      return <ComparisonsPage navigate={navigate} initialToolA={tool1} initialToolB={tool2} initialToolC={tool3} />;
    }
    if (currentPath.startsWith('/comparisons/')) {
      const slug = sanitizeSlug(currentPath.replace('/comparisons/', ''));
      return <ComparisonsPage navigate={navigate} comparisonSlug={slug} />;
    }

    // 8. Tutorials: /tutorials or /tutorials/:slug
    if (currentPath === '/tutorials') {
      return <TutorialsPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/tutorials/')) {
      const slug = sanitizeSlug(currentPath.replace('/tutorials/', ''));
      return <TutorialsPage navigate={navigate} tutorialSlug={slug} />;
    }

    // 9. Articles: /articles or /articles/:slug
    if (currentPath === '/articles') {
      return <ArticlesPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/articles/')) {
      const slug = sanitizeSlug(currentPath.replace('/articles/', ''));
      return <ArticlesPage navigate={navigate} articleSlug={slug} />;
    }

    // 10. Resources: /resources
    if (currentPath === '/resources') {
      return <ResourcesPage />;
    }

    // 11. AI Advisor: /advisor
    if (currentPath === '/advisor') {
      return <AIAdvisorPage navigate={navigate} />;
    }

    // 12. Prompts Hub: /prompts
    if (currentPath === '/prompts') {
      return <PromptsHubPage navigate={navigate} />;
    }

    // 13. AI Stacks: /stacks
    if (currentPath === '/stacks') {
      return <StacksPage navigate={navigate} />;
    }

    // 14. ROI Calculator: /calculator
    if (currentPath === '/calculator') {
      return <RoiCalculatorPage navigate={navigate} />;
    }

    // 15. Alternatives Directory: /alternatives
    if (currentPath === '/alternatives') {
      return <AlternativesPage navigate={navigate} />;
    }

    // 16. User Profile & Bookmarks
    if (currentPath === '/profile') {
      return <UserProfilePage navigate={navigate} />;
    }

    // 17. E-commerce Platforms & Affiliate: /ecommerce or /ecommerce-platforms
    if (currentPath === '/ecommerce' || currentPath === '/ecommerce-platforms' || currentPath.startsWith('/ecommerce')) {
      return <EcommercePage navigate={navigate} />;
    }

    // 18. Tools & Content HTML Site Map: /sitemap, /tools-sitemap, /site-map
    if (currentPath === '/sitemap' || currentPath === '/tools-sitemap' || currentPath === '/site-map') {
      return <ToolsSitemapPage navigate={navigate} categories={categories} tools={DEFAULT_TOOLS} />;
    }

    // 12. Static Pages
    if (currentPath === '/about') return <StaticPages type="about" navigate={navigate} />;
    if (currentPath === '/contact') return <StaticPages type="contact" navigate={navigate} />;
    if (currentPath === '/privacy' || currentPath === '/privacy-policy') return <StaticPages type="privacy" navigate={navigate} />;
    if (currentPath === '/terms' || currentPath === '/terms-of-service') return <StaticPages type="terms" navigate={navigate} />;
    if (currentPath === '/affiliate-disclosure') return <StaticPages type="affiliate" navigate={navigate} />;
    if (currentPath === '/editorial-policy') return <StaticPages type="editorial" navigate={navigate} />;
    if (currentPath === '/cookie-policy' || currentPath === '/cookies') return <StaticPages type="cookies" navigate={navigate} />;

    // 13. Admin Routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onLoginSuccess={handleAdminLogin} navigate={navigate} />;
    }
    if (currentPath === '/admin') {
      if (!adminToken) {
        return <AdminLoginPage onLoginSuccess={handleAdminLogin} navigate={navigate} />;
      }
      return <AdminDashboard navigate={navigate} onLogout={handleAdminLogout} token={adminToken} />;
    }

    // 14. 404 Fallback
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-7xl font-black text-indigo-600 block tracking-tight">404</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">عذراً، الصفحة المطلوبة غير موجودة أو تم نقلها</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">تأكد من صحة الرابط أو تصفح أبرز أدوات الذكاء الاصطناعي الأكثر شهرة واستخداماً أدناه.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              العودة للرئيسية
            </button>
            <button
              onClick={() => navigate('/ai-tools')}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              تصفح جميع الأدوات
            </button>
            <button
              onClick={() => navigate('/advisor')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              المستشار الذكي
            </button>
          </div>
        </div>

        {/* Popular Tools Suggestions */}
        <div className="border-t border-slate-200 pt-8 mt-8 text-right">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            أبرز الأدوات الشائعة التي يقصدها الزوار:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Claude 3.5 Sonnet', slug: 'claude-3-5-sonnet', tagline: 'المساعد الرائد للبرمجة وكتابة المحتوى المتقدم', rating: '4.95', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
              { name: 'Midjourney v6', slug: 'midjourney-v6', tagline: 'المعيار الذهبي لتوليد الصور السينمائية والواقعية', rating: '4.90', logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop' },
              { name: 'FLUX.1 (Black Forest Labs)', slug: 'flux-1', tagline: 'دقة لا تصدق في كتابة النصوص داخل الصور المبتكرة', rating: '4.88', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' },
              { name: 'ChatGPT Plus', slug: 'chatgpt-plus', tagline: 'المساعد الذكي الأكثر انتشاراً مع البحث الحي', rating: '4.88', logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&h=100&fit=crop' },
              { name: 'Cursor AI', slug: 'cursor-ai', tagline: 'محرر الأكواد الذكي المشتق من VS Code', rating: '4.98', logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop' },
              { name: 'Gemini Advanced', slug: 'gemini-advanced', tagline: 'نافذة سياق عملاقة وتكامل عميق مع خدمات جوجل', rating: '4.87', logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop' }
            ].map((tool) => (
              <div
                key={tool.slug}
                onClick={() => navigate(`/tools/${tool.slug}`)}
                className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group text-right"
              >
                <img src={tool.logo} alt={tool.name} className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100" referrerPolicy="no-referrer" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{tool.name}</h4>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">★ {tool.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tool.tagline}</p>
                  <span className="text-[11px] text-indigo-600 font-medium mt-1 inline-block">استكشف الأداة ←</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Subtle Scroll Progress Indicator */}
      <ScrollProgress currentPath={currentPath} />

      {/* Global Navbar */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        openSearch={openSearch}
        openVoiceSearch={openVoiceSearch}
        openAdmin={() => navigate(adminToken ? '/admin' : '/admin/login')}
        isAdminLoggedIn={!!adminToken}
      />

      {/* Main Routed Page Content wrapped in ErrorBoundary with route key */}
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-bold text-slate-500">جاري تحميل المحتوى الذكي...</span>
          </div>
        }>
          <ErrorBoundary key={currentPath} navigate={navigate}>
            {renderRoute()}
          </ErrorBoundary>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer navigate={navigate} />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Global Search Modal with widget ErrorBoundary */}
      <ErrorBoundary isWidget widgetName="نافذة البحث">
        <SearchModal
          isOpen={searchOpen}
          onClose={() => {
            setSearchOpen(false);
            setSearchVoiceMode(false);
          }}
          navigate={navigate}
          initialVoiceMode={searchVoiceMode}
        />
      </ErrorBoundary>

      {/* Global Authentication Modal */}
      <AuthModal />

      {/* Global Comparison Dock */}
      <ComparisonDock navigate={navigate} />

      {/* Global Cookie Compliance Banner */}
      <CookieBanner navigate={navigate} />
    </div>
  );
}
