import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>أنت تعمل حالياً في وضع عدم الاتصال (Offline) — يتم استخدام البيانات المخزنة مؤقتاً.</span>
    </div>
  );
};
