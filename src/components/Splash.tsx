import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId } from '../types';
import { TOURIST_SPOTS } from './TouristBackground';
import { SimfinityLogo } from './SimfinityLogo';

interface SplashProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push' | 'push_back') => void;
  onStartTutorial: () => void;
}

export function Splash({ onNavigate, onStartTutorial }: SplashProps) {
  const [currentSpotIdx, setCurrentSpotIdx] = useState(0);

  // Rotate featured tourist destinations on both the fullscreen background and card preview
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSpotIdx((prev) => (prev + 1) % TOURIST_SPOTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredSpot = TOURIST_SPOTS[currentSpotIdx];

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 relative z-10">
      
      {/* Fullscreen Centered Tourist Landmark Background Carousel */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#050505]">
        {TOURIST_SPOTS.map((spot, idx) => (
          <div
            key={`bg-spot-${spot.id}`}
            className="absolute inset-0 bg-cover bg-center transition-all duration-1500 ease-in-out"
            style={{
              backgroundImage: `url(${spot.imageUrl})`,
              opacity: idx === currentSpotIdx ? 0.45 : 0,
              transform: idx === currentSpotIdx ? 'scale(1.03)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
            }}
          />
        ))}
        {/* Subtle dark gradient overlay covering the full background for premium text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10" />
      </div>

      {/* Floating Interactive Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg glass-panel border border-[#ffd700]/25 rounded-3xl p-6 sm:p-10 space-y-8 text-center bg-slate-950/85 backdrop-blur-lg shadow-[0_0_60px_rgba(255,215,0,0.15)] relative overflow-hidden z-20"
      >
        {/* Subtle gold line bar decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#ffd700]/60 to-transparent"></div>
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#ffd700]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* 1. Integrated Premium Simfinity Brand Logo & Tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="py-4 flex flex-col items-center justify-center"
        >
          <SimfinityLogo size={145} showText={true} />
          <div className="mt-4 px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/25 rounded-full text-[10px] sm:text-xs uppercase font-mono tracking-widest text-[#ffd700] font-bold">
            Ghana 5G Traveler eSIM Companion
          </div>
        </motion.div>

        {/* Postcard of active tourist site preview */}
        <div className="relative h-44 rounded-2xl overflow-hidden border border-gray-900 shadow-inner">
          {TOURIST_SPOTS.map((spot, idx) => (
            <div
              key={spot.id}
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
              style={{
                backgroundImage: `url(${spot.imageUrl})`,
                opacity: idx === currentSpotIdx ? 1 : 0,
                transform: idx === currentSpotIdx ? 'scale(1)' : 'scale(1.05)',
              }}
            />
          ))}
          
          {/* Postcard gradient dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40"></div>

          {/* Postcard content info overlay text */}
          <div className="absolute bottom-3 left-3 right-3 text-left flex items-end justify-between">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono uppercase bg-[#ffd700]/95 text-black px-1.5 py-0.5 rounded font-extrabold tracking-wider shadow-sm">
                Ghana Landmark
              </span>
              <h4 className="font-display text-white text-xs font-black tracking-tight leading-none mt-1">
                {featuredSpot.name}
              </h4>
              <p className="text-[9px] text-gray-300 font-mono font-medium flex items-center gap-0.5 mt-0.5 animate-pulse">
                <span className="material-symbols-outlined text-[10px] text-[#ffd700]">location_on</span>
                {featuredSpot.location}
              </p>
            </div>
          </div>
        </div>

        {/* Informative description paragraph */}
        <div className="space-y-2 max-w-sm mx-auto">
          <p className="text-gray-300 font-sans text-xs sm:text-[13px] leading-relaxed antialiased">
            Welcome to the ultimate digital roaming gateway. Simfinity keeps you seamlessly connected across Ghana's historic landmarks using premium virtual SIM profiles.
          </p>
        </div>

        {/* Action Button Controls */}
        <div className="space-y-3.5 pt-2 relative z-30">
          <button
            type="button"
            onClick={onStartTutorial}
            className="w-full py-3.5 bg-[#ffd700] hover:bg-[#ffe033] duration-150 rounded-xl text-xs font-mono font-black text-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(255,215,0,0.22)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-black animate-bounce">explore</span>
            <span>Start Interactive Tour</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate(ScreenId.LOGIN, 'push')}
              className="flex-1 py-3 bg-gray-950 hover:bg-gray-900 border border-gray-850 hover:border-[#ffd700]/30 rounded-xl text-xs font-mono font-bold text-gray-300 hover:text-white transition duration-150 cursor-pointer text-center"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => onNavigate(ScreenId.SIGN_UP, 'push')}
              className="flex-1 py-3 bg-gradient-to-r from-gray-900 to-gray-950 hover:to-gray-900 border border-amber-900/10 hover:border-[#ffd700]/20 rounded-xl text-xs font-mono font-bold text-gray-300 hover:text-white transition duration-150 cursor-pointer text-center"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Bottom secure banner seal */}
        <div className="opacity-40 pt-2 flex items-center justify-center gap-1.5 text-[9px] font-mono text-gray-500">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          <span>Double-redundant local network fallback nodes active</span>
        </div>
      </motion.div>
    </div>
  );
}
