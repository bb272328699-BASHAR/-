import React from 'react';
import { 
  Sparkles, 
  Search, 
  Compass, 
  Layers, 
  Scale, 
  BookOpen, 
  FileText, 
  Menu, 
  X, 
  ShieldCheck, 
  ArrowLeft,
  LogIn,
  User,
  Heart,
  Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSearch: () => void;
  openVoiceSearch?: () => void;
  openAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, openSearch, openVoiceSearch, openAdmin, isAdminLoggedIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, openAuthModal, bookmarksCount } = useAuth();
  const { compareItems, setIsDockOpen } = useCompare();

  const navLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'المستشار الذكي ✨', path: '/advisor', highlight: true },
    { label: 'مولد الفيديو Veo 3 🎬', path: '/ai-video-generator', highlight: true },
    { label: 'الأدوات', path: '/ai-tools' },
    { label: 'المتاجر والأفلييت 🛒', path: '/ecommerce' },
    { label: 'الأوامر والبرومبتات', path: '/prompts' },
    { label: 'حزم الأدوات', path: '/stacks' },
    { label: 'المقارنات', path: '/comparisons' },
    { label: 'دليل البدائل', path: '/alternatives' },
    { label: 'حاسبة ROI', path: '/calculator' },
    { label: 'المقالات', path: '/articles' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>مرجع أدوات وتطبيقات الذكاء الاصطناعي 2026 - محدث يومياً بالبيانات والتقييمات الموثوقة</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">دليل AI</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200/60">2026</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">بوابتك لأفضل أدوات المستقبل</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-indigo-600 bg-indigo-50/80 font-bold' 
                    : 'hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Button */}
          <button
            onClick={openSearch}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 transition-all cursor-pointer"
            title="بحث شامل"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">بحث...</span>
            <kbd className="hidden md:inline-block bg-white text-[10px] text-slate-500 px-1.5 py-0.5 rounded border border-slate-300">⌘K</kbd>
          </button>

          {/* Voice Search Mic Button */}
          {openVoiceSearch && (
            <button
              onClick={openVoiceSearch}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
              title="البحث الصوتي بالذكاء الاصطناعي"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Compare Indicator Button */}
          {compareItems.length > 0 && (
            <button
              onClick={() => setIsDockOpen(true)}
              className="relative flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold border border-indigo-200/80 transition-all cursor-pointer"
              title="عرض الأدوات المحددة للمقارنة"
            >
              <Scale className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">مقارنة</span>
              <span className="bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {compareItems.length}
              </span>
            </button>
          )}

          {/* User Account / Profile Button */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {/* Bookmarks quick button */}
              <button
                onClick={() => navigate('/profile')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="أدواتك المفضلة"
              >
                <Heart className="w-4 h-4" />
                {bookmarksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {bookmarksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.full_name}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Admin Dashboard Entry */}
          <button
            onClick={openAdmin}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAdminLoggedIn 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isAdminLoggedIn ? 'لوحة الإدارة' : 'الإدارة'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                currentPath === link.path
                  ? 'text-indigo-600 bg-indigo-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-bold text-slate-500">المظهر:</span>
              <ThemeToggle showLabel={true} />
            </div>

            {user ? (
              <button
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-2.5 rounded-lg text-sm font-bold text-indigo-600 bg-indigo-50 flex items-center justify-between"
              >
                <span>حسابي: {user.full_name}</span>
                <span className="text-xs bg-indigo-200/80 px-2 py-0.5 rounded-full">{bookmarksCount} مفضلة</span>
              </button>
            ) : (
              <button
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold"
              >
                تسجيل الدخول أو إنشاء حساب
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
