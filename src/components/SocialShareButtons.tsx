import React, { useState } from 'react';
import { Share2, Check, MessageCircle, Send, Linkedin, Link as LinkIcon } from 'lucide-react';

interface SocialShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  description = '',
  url,
  className = '',
  variant = 'compact',
}) => {
  const [copied, setCopied] = useState(false);

  // Compute canonical share target
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://daleel.ai');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(description ? `${title} - ${description}` : title);

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=DaleelAI`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-indigo-900/40 ${className}`}>
        <div className="space-y-1">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>هل أعجبك هذا المحتوى؟ ساهم في نشره</span>
          </h4>
          <p className="text-xs text-slate-300">
            شارك الفائدة مع زملائك على منصات التواصل لدعم المحتوى العربي المتخصص في الذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* X / Twitter */}
          <a
            href={shareLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-white border border-white/10"
            title="مشاركة على منصة X (تويتر)"
          >
            <span className="font-mono font-bold text-sm">𝕏</span>
            <span className="hidden xs:inline">مشاركة</span>
          </a>

          {/* WhatsApp */}
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-xs font-bold transition-all text-white"
            title="مشاركة عبر واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>

          {/* Telegram */}
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600/90 hover:bg-sky-600 text-xs font-bold transition-all text-white"
            title="مشاركة عبر تيليجرام"
          >
            <Send className="w-3.5 h-3.5" />
            <span>تيليجرام</span>
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-xs font-bold transition-all text-white"
            title="مشاركة على لينكد إن"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="نسخ رابط الصفحة"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Compact / Standard view for headers and action bars
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Mobile Web Share API trigger when available */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs cursor-pointer flex sm:hidden items-center gap-1 text-xs font-bold"
          title="مشاركة عبر التطبيقات"
        >
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>مشاركة</span>
        </button>
      )}

      {/* X (Twitter) */}
      <a
        href={shareLinks.x}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs"
        title="مشاركة على X"
      >
        <span className="font-mono text-sm font-black">𝕏</span>
      </a>

      {/* WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs transition-all shadow-2xs"
        title="مشاركة عبر واتساب"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* Telegram */}
      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs transition-all shadow-2xs"
        title="مشاركة عبر تيليجرام"
      >
        <Send className="w-4 h-4" />
      </a>

      {/* LinkedIn */}
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs transition-all shadow-2xs"
        title="مشاركة عبر LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>

      {/* Direct Copy Button */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          copied
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
        }`}
        title="نسخ الرابط إلى الحافظة"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">تم النسخ!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">نسخ الرابط</span>
          </>
        )}
      </button>
    </div>
  );
};
