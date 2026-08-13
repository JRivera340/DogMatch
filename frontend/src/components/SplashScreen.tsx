import { useEffect, useState } from 'react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out at 4.0s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4000);

    // Complete and unmount at 4.6s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-paper transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Container for the radar and central icon */}
      <div className="relative flex h-64 w-64 items-center justify-center">
        {/* Radar Ping Effects */}
        <div className="absolute inset-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border-4 border-brand-200 opacity-75"></div>
        <div className="absolute inset-4 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_0.5s_infinite] rounded-full border-4 border-brand-300 opacity-60"></div>
        <div className="absolute inset-8 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_1s_infinite] rounded-full border-4 border-brand-400 opacity-40"></div>
        
        {/* Central Paw */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-5xl shadow-[0_0_20px_rgba(200,30,58,0.5)]">
          🐾
        </div>

        {/* Floating Hearts */}
        {/* We use inline styles for positioning and random-looking animation delays */}
        <div className="absolute top-[10%] left-[20%] animate-[bounce_1s_infinite_0.1s] text-2xl text-brand-600 drop-shadow-md">
          ❤️
        </div>
        <div className="absolute bottom-[20%] left-[10%] animate-[bounce_1.2s_infinite_0.3s] text-3xl text-brand-500 drop-shadow-md">
          ❤️
        </div>
        <div className="absolute top-[20%] right-[15%] animate-[bounce_1.1s_infinite_0.5s] text-2xl text-brand-600 drop-shadow-md">
          ❤️
        </div>
        <div className="absolute bottom-[10%] right-[25%] animate-[bounce_0.9s_infinite_0.2s] text-xl text-brand-400 drop-shadow-md">
          ❤️
        </div>
        <div className="absolute top-[-10%] right-[40%] animate-[bounce_1.3s_infinite_0.4s] text-3xl text-brand-600 drop-shadow-md">
          ❤️
        </div>
      </div>
      
      {/* Title / Slogan at the bottom */}
      <div className="absolute bottom-16 text-center">
        <h1 className="text-5xl font-black tracking-tight text-brand-800 drop-shadow-lg sm:text-6xl">Huellas S.O.S.</h1>
        <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-brand-600 drop-shadow-sm">Buscamos. Rescatamos. Reencontramos.</p>
      </div>
    </div>
  );
}
