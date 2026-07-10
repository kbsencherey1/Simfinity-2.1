/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface TouristSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
}

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'kakum',
    name: 'Kakum Canopy Walkway',
    location: 'Central Region, Ghana',
    description: 'A spectacular perspective of the dense tropical rainforest, suspended 30 meters high across seven suspension bridges.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-155deee21623?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'cape_coast',
    name: 'Cape Coast Castle Coastline',
    location: 'Central Region, Ghana',
    description: 'A world heritage site of immense historical significance, looking over pristine Atlantic waves crashing on the coast.',
    imageUrl: 'https://images.unsplash.com/photo-1591389703635-e15a07b842d7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'mole',
    name: 'Mole National Park',
    location: 'Savannah Region, Ghana',
    description: "Ghana's premier savanna wildlife refuge, sheltering majestic African elephants, rare antelopes, and local primates.",
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'wli',
    name: 'Wli Waterfalls',
    location: 'Volta Region, Ghana',
    description: 'The highest cascading waterfall in West Africa, flowing with majestic purity deep inside a lush mountain sanctuary.',
    imageUrl: 'https://images.unsplash.com/photo-1432406186267-3c72dee6e491?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'elmina',
    name: 'Elmina Fishing Harbor & Castle',
    location: 'Central Region, Ghana',
    description: 'A vibrant harbor loaded with beautifully carved canoes, adjacent to one of the earliest transatlantic stone structures.',
    imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1600&q=80',
  },
];

export interface TouristBackgroundProps {
  currentScreen?: string;
}

export function TouristBackground({ currentScreen }: TouristBackgroundProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % TOURIST_SPOTS.length);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Minimize automatically if we transition away from Home or Splash
  useEffect(() => {
    if (currentScreen && currentScreen !== 'home' && currentScreen !== 'splash') {
      setIsMinimized(true);
    }
  }, [currentScreen]);

  const activeSpot = TOURIST_SPOTS[currentIdx];

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-[#0a0a0a]">
      {/* Absolute image layers crossfading */}
      {TOURIST_SPOTS.map((spot, index) => (
        <div
          key={spot.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out`}
          style={{
            backgroundImage: `url(${spot.imageUrl})`,
            opacity: index === currentIdx ? 0.35 : 0, // Lowered opacity so page text is even clearer
          }}
        />
      ))}

      {/* Visually stunning light-to-moderate ambient glass layer overlay so page text remains fully readable but the beauty of Ghana is clear */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />

      {/* Elegant, interactive floating information badge of the active tourist site */}
      <div className="absolute bottom-24 left-4 md:left-8 z-30 pointer-events-auto select-text hidden sm:flex flex-col max-w-xs transition-all duration-300">
        {isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="glass-panel backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/30 hover:border-gold hover:bg-black/80 flex items-center gap-1.5 shadow-lg shadow-black/80 text-gold transition-all text-[11px] font-mono font-bold cursor-pointer"
            title="Expand Heritage Destination Details"
          >
            <span className="material-symbols-outlined text-[12px] animate-pulse">location_on</span>
            <span>Heritage Spot: {activeSpot.name.split(' ')[0]}...</span>
          </button>
        ) : (
          <div className="glass-panel backdrop-blur-md px-4 py-3 rounded-xl border border-gold/15 flex flex-col gap-1 shadow-2xl relative overflow-hidden group hover:border-gold/30 transition-all">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gold/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-1.5 text-gold text-[10px] font-mono tracking-wider font-bold">
                <span className="material-symbols-outlined text-[13px] animate-bounce">location_on</span>
                <span>DISCOVER GHANA</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="w-4 h-4 rounded-full hover:bg-gold/15 flex items-center justify-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
                title="Minimize details"
              >
                <span className="material-symbols-outlined text-[10px] font-bold">close</span>
              </button>
            </div>
            
            <h4 className="font-display font-extrabold text-sm text-white tracking-tight leading-none pt-0.5">
              {activeSpot.name}
            </h4>
            
            <p className="text-[10px] text-gray-400 font-mono font-medium">
              {activeSpot.location}
            </p>
            
            <p className="text-[10px] text-gray-500 leading-relaxed font-sans pt-1 border-t border-gold/5 mt-1 select-none">
              {activeSpot.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
