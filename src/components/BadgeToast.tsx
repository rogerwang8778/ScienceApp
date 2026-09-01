import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';
import { badges } from '@/data/badges';

interface BadgeToastProps {
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeToast({ badgeIds, onClose }: BadgeToastProps) {
  useEffect(() => {
    if (badgeIds.length === 0) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [badgeIds, onClose]);

  if (badgeIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 animate-slide-up max-w-xs">
      {badgeIds.map((id) => {
        const badge = badges.find((b) => b.id === id);
        if (!badge) return null;
        const Icon = Icons[badge.icon as keyof typeof Icons] as Icons.LucideIcon;
        return (
          <div
            key={id}
            className="flex items-center gap-3 bg-slate-800 border border-cyan-500/40 rounded-xl p-4 shadow-2xl shadow-cyan-500/20"
          >
            <div className="w-11 h-11 bg-cyan-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-cyan-400 font-medium">徽章解鎖！</p>
              <p className="text-sm text-white font-semibold">{badge.name}</p>
              <p className="text-xs text-slate-400">{badge.description}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
