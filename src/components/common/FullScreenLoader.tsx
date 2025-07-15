import { Loader2  } from 'lucide-react';

export const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    </div>
  );
};