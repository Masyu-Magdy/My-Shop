"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
      <div className="bg-neutral-900 text-white text-sm px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
        <WifiOff size={16} />
        You&apos;re currently offline
      </div>
    </div>
  );
}
