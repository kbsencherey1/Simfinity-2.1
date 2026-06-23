/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenId, ESimPlan, ESimSubscription, UserProfile } from '../types';
import { INITIAL_PLANS, HERITAGE_IMAGES } from '../data';
import { PieChart, Pie, Cell } from 'recharts';
import { SimfinityLogo, SimfinityNavbarLogo } from './SimfinityLogo';
import { FileUploader } from './FileUploader';

// Navigation layout wrapper with bottom navigation tabs
interface NavigationWrapperProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId, transition: 'none' | 'push' | 'push_back') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  children: React.ReactNode;
}

export function NavigationWrapper({
  currentScreen,
  onNavigate,
  isLoggedIn,
  onLogout,
  children,
}: NavigationWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#131313]/85 backdrop-blur-xl border-b border-[#4d4732]/30 shadow-sm shadow-[#ffd700]/5">
        <div className="flex items-center gap-3" onClick={() => onNavigate(ScreenId.HOME, 'none')}>
          <SimfinityNavbarLogo size={26} />
        </div>
        
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button 
              onClick={() => onNavigate(ScreenId.ACCOUNT, 'none')}
              className="flex items-center gap-1 text-[#ffd700] hover:text-white transition duration-200"
            >
              <span className="material-symbols-outlined text-2xl font-light">account_circle</span>
            </button>
          ) : (
            <button 
              onClick={() => onNavigate(ScreenId.LOGIN, 'push')}
              className="px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded text-[#ffd700] font-display text-xs font-semibold hover:bg-[#ffd700] hover:text-black transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content */}
      <div className="flex-grow pt-16 pb-20">
        {children}
      </div>

      {/* Global Bottom Navigation bar required across flow dashboards */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-[#131313]/90 backdrop-blur-xl border-t border-[#4d4732]/30 shadow-[0_-4px_20px_rgba(255,215,0,0.05)] rounded-t-xl">
        <a 
          id="nav-tab-home"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(ScreenId.HOME, 'none');
          }}
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            currentScreen === ScreenId.HOME ? 'text-[#ffd700]' : 'text-[#d0c6ab] hover:text-[#ffd700]'
          }`}
        >
          <span className="material-symbols-outlined select-none">home</span>
          <span className="font-mono text-[10px] mt-0.5 font-medium">Home</span>
        </a>

        <a 
          id="nav-tab-explore"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(ScreenId.GHANA_PLANS, 'none');
          }}
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            currentScreen === ScreenId.GHANA_PLANS ? 'text-[#ffd700]' : 'text-[#d0c6ab] hover:text-[#ffd700]'
          }`}
        >
          <span className="material-symbols-outlined select-none">explore</span>
          <span className="font-mono text-[10px] mt-0.5 font-medium">Explore</span>
        </a>

        <a 
          id="nav-tab-esims"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(ScreenId.MY_ESIMS, 'none');
          }}
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            currentScreen === ScreenId.MY_ESIMS ? 'text-[#ffd700]' : 'text-[#d0c6ab] hover:text-[#ffd700]'
          }`}
        >
          <span className="material-symbols-outlined select-none">sim_card</span>
          <span className="font-mono text-[10px] mt-0.5 font-medium">My eSIMs</span>
        </a>

        <a 
          id="nav-tab-account"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(ScreenId.ACCOUNT, 'none');
          }}
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            currentScreen === ScreenId.ACCOUNT ? 'text-[#ffd700]' : 'text-[#d0c6ab] hover:text-[#ffd700]'
          }`}
        >
          <span className="material-symbols-outlined select-none">person</span>
          <span className="font-mono text-[10px] mt-0.5 font-medium">Account</span>
        </a>
      </nav>
    </div>
  );
}

// 1. LOGIN SCREEN
export function LoginScreen({
  onNavigate,
  onLogin,
}: {
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState('kwame@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onNavigate(ScreenId.HOME, 'push');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-8 overflow-hidden">
      {/* Backdrop pattern */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${HERITAGE_IMAGES.loginPattern})` }}></div>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center mb-8">
        <SimfinityLogo size={120} showText={true} />
        <p className="text-gray-400 font-sans text-xs mt-3 tracking-widest uppercase font-bold text-center">Global Connectivity with Local Soul</p>
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-white mb-6">Welcome Back</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="font-mono text-xs text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="glass-input rounded-lg flex items-center px-3.5 py-3 group">
              <span className="material-symbols-outlined text-gray-500 mr-2.5">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 p-0 placeholder-gray-600" 
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="glass-input rounded-lg flex items-center px-3.5 py-3 group">
              <span className="material-symbols-outlined text-gray-500 mr-2.5">lock_open</span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 p-0 placeholder-gray-600 font-mono" 
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="material-symbols-outlined text-gray-500 hover:text-white"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" onClick={(e) => e.preventDefault()} className="font-mono text-[#ffd700] hover:underline text-xs">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#ffd700] hover:bg-[#e6c200] text-black font-semibold font-display py-3.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ffd700]/10"
          >
            <span>Sign In</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>

        <div className="kente-divider mt-6 mb-6"></div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNavigate(ScreenId.SIGN_UP, 'push');
              }}
              className="text-[#ffd700] font-bold hover:underline"
            >
              Create Account
            </a>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-1.5 text-xs font-mono text-gray-500">
        <span className="material-symbols-outlined text-xs text-[#ffd700]">favorite</span>
        <span>ROOTED IN GHANA</span>
      </div>
    </div>
  );
}

// 4. SIGN UP SCREEN
export function SignUpScreen({
  onNavigate,
  onLogin,
}: {
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onLogin: () => void;
}) {
  const [name, setName] = useState('Kwame Mensah');
  const [email, setEmail] = useState('kwame@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onNavigate(ScreenId.HOME, 'push');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${HERITAGE_IMAGES.loginPattern})` }}></div>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Transaction Header bar with Go back option */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          aria-label="Go back"
          onClick={() => onNavigate(ScreenId.LOGIN, 'push_back')}
          className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#4d4732]/30 flex items-center justify-center text-[#ffd700] transition cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-lg">arrow_back</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center mb-6">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">Create Account</h2>
        <p className="text-gray-400 font-sans text-xs mt-1">Start your global connection in West Africa.</p>
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-gray-400 uppercase tracking-wider block">Full Name</label>
            <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5 group">
              <span className="material-symbols-outlined text-gray-500 mr-2.5">person</span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 p-0 placeholder-gray-600" 
                placeholder="Kwame Mensah"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5 group">
              <span className="material-symbols-outlined text-gray-500 mr-2.5">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 p-0 placeholder-gray-600" 
                placeholder="kwame@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5 group">
              <span className="material-symbols-outlined text-gray-500 mr-2.5">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 p-0 placeholder-gray-600 font-mono" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 py-1">
            <input type="checkbox" required defaultChecked className="mt-1 rounded text-[#ffd700] focus:ring-0 bg-[#201f1f] border-gray-600" />
            <p className="text-xs text-gray-400">
              I agree to the Terms of Service & Privacy Policy, including secure eSIM digital activation terms.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#ffd700] hover:bg-[#e6c200] text-black font-semibold font-display py-3.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Register & Connect</span>
            <span className="material-symbols-outlined text-sm">how_to_reg</span>
          </button>
        </form>

        <div className="kente-divider mt-5 mb-5"></div>

        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Already have an account?{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNavigate(ScreenId.LOGIN, 'push_back');
              }}
              className="text-[#ffd700] font-bold hover:underline"
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// 6. HOME - PROTOCOLS & AUTH FLOW CORES
export function HomeScreen({
  onNavigate,
  onStartTutorial,
}: {
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onStartTutorial?: () => void;
}) {
  const [insight, setInsight] = useState<{
    country: string;
    title: string;
    fact: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const sampleCountries = ["Kenya", "South Africa", "Nigeria", "Japan", "Brazil", "Morocco"];

  const fetchInsight = async (countryName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = countryName ? `/api/local-insight?country=${encodeURIComponent(countryName)}` : '/api/local-insight';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load cultural insight');
      }
      const data = await res.json();
      setInsight(data);
      if (data.country) {
        setSelectedCountry(data.country);
      }
    } catch (err: any) {
      console.error(err);
      setError('Insight server is starting up or key is missing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="anim-fade px-4 sm:px-6 max-w-4xl mx-auto py-6 space-y-8">
      {/* Welcome Banner */}
      <section className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-[#ffd700]">
        <div className="space-y-1 relative z-10 w-full sm:max-w-xl">
          <span className="bg-[#cc4e3c]/20 text-[#cc4e3c] px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider animate-pulse">UPDATED TOUR AVAILABLE</span>
          <h2 className="font-display text-2xl font-bold text-white">Simfinity Global</h2>
          <p className="text-gray-400 text-sm">
            Seamless travel eSIM coverage across beautiful Ghana, designed with local pride.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2.5 shrink-0">
          {onStartTutorial && (
            <button 
              type="button"
              onClick={onStartTutorial}
              className="inline-flex items-center gap-1.5 px-4 py-3 bg-gray-950 hover:bg-gray-900 border border-[#ffd700]/30 hover:border-[#ffd700]/60 text-[#ffd700] rounded-xl font-display text-xs font-bold active:scale-95 duration-200 cursor-pointer"
            >
              <span>SIMFINITY TOUR</span>
              <span className="material-symbols-outlined text-sm font-bold animate-pulse">rocket_launch</span>
            </button>
          )}
          <a 
            onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'push')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#ffd700] text-black rounded-xl font-display text-sm font-bold shadow-lg shadow-[#ffd700]/10 hover:bg-[#e6c200] active:scale-95 duration-200 cursor-pointer"
          >
            <span>FIND PLANS</span>
            <span className="material-symbols-outlined text-sm">explore</span>
          </a>
        </div>
      </section>

      {/* Featured visual slider row */}
      <section className="relative rounded-2xl overflow-hidden h-64 flex items-center p-6 md:p-10 border border-[#ffd700]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/30 z-10"></div>
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${HERITAGE_IMAGES.landscapeAccra})` }}></div>
        <div className="relative z-20 max-w-md space-y-4">
          <span className="font-mono text-xs text-[#ffd700] font-bold tracking-wider">NATIONWIDE COVERAGE</span>
          <h3 className="font-display text-2xl font-extrabold text-white">Stay Connected Anywhere</h3>
          <p className="text-gray-200 text-sm leading-relaxed">
            From the bustling markets of Kejetia to the serene shores of Busua, we've got you covered with unmatched speeds.
          </p>
          <button 
            onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'none')}
            className="flex items-center gap-1 text-[#ffd700] text-xs font-bold hover:translate-x-1.5 transition-transform font-sans bg-transparent border-0 p-0 cursor-pointer"
          >
            <span>Browse High-Speed Plans</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Local Insights Spotlight Card */}
      <section className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffd700]">language</span>
              <span>Global Heritage Spotlights</span>
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 font-sans">
              Real-time travel trivia and cultural insights powered by Google Search-grounded Gemini AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:self-auto self-start">
            {sampleCountries.map((c) => (
              <button
                key={c}
                disabled={isLoading}
                onClick={() => {
                  setSelectedCountry(c);
                  fetchInsight(c);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition duration-150 cursor-pointer ${
                  selectedCountry === c && !isLoading
                    ? 'bg-[#ffd700] text-black shadow-md'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
            <button
              disabled={isLoading}
              onClick={() => {
                setSelectedCountry('');
                fetchInsight();
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700] flex items-center gap-1 hover:bg-[#ffd700]/15 duration-150 cursor-pointer"
              title="Fetch random country tip"
            >
              <span className={`material-symbols-outlined text-[10px] ${isLoading ? 'animate-spin' : ''}`}>shuffle</span>
              <span>Random</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-gray-850 bg-black/35 backdrop-blur-md rounded-xl p-5 space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="w-24 h-3 bg-gray-800 rounded"></div>
            </div>
            <div className="space-y-2.5">
              <div className="w-1/2 h-5 bg-gray-800 rounded"></div>
              <div className="space-y-1.5">
                <div className="w-full h-3.5 bg-gray-850 rounded"></div>
                <div className="w-11/12 h-3.5 bg-gray-850 rounded"></div>
                <div className="w-4/5 h-3.5 bg-gray-850 rounded"></div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-900 space-y-2">
              <div className="w-32 h-2.5 bg-gray-850 rounded"></div>
              <div className="flex gap-4">
                <div className="w-20 h-3 bg-gray-900 rounded"></div>
                <div className="w-24 h-3 bg-gray-900 rounded"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="border border-red-950/40 bg-red-950/10 rounded-xl p-5 text-center space-y-3">
            <span className="material-symbols-outlined text-red-500 text-3xl">info</span>
            <p className="text-gray-300 text-xs max-w-md mx-auto">{error}</p>
            <button
              onClick={() => {
                setSelectedCountry('');
                fetchInsight();
              }}
              className="px-4 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-mono font-bold text-[#ffd700] rounded-lg transition duration-150 cursor-pointer active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="border border-[#ffd700]/15 bg-black/45 backdrop-blur-md rounded-xl p-5 space-y-4 relative overflow-hidden transition-all duration-300">
            {/* Country watermarked stamp in corner */}
            <span className="absolute -bottom-6 -right-6 text-7xl font-sans font-black tracking-tighter text-white/[0.03] select-none pointer-events-none uppercase">
              {insight?.country}
            </span>

            <div className="flex items-center gap-2 text-xs font-mono text-[#ffd700] uppercase font-bold tracking-wider relative z-10">
              <span className="material-symbols-outlined text-sm text-[#ffd700]">explore</span>
              <span>Spotlight: {insight?.country}</span>
            </div>

            <div className="space-y-2 relative z-10">
              <h4 className="font-display font-extrabold text-white text-base tracking-tight">{insight?.title}</h4>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed antialiased font-sans">
                {insight?.fact}
              </p>
            </div>

            {insight?.sources && insight.sources.length > 0 && (
              <div className="pt-3.5 border-t border-gray-900/60 space-y-2 relative z-10">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Grounded Travel Sources:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {insight.sources.map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#ffd700] font-mono underline transition decoration-gray-800 hover:decoration-[#ffd700]"
                    >
                      <span className="material-symbols-outlined text-[11px]">public</span>
                      <span className="max-w-[150px] truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Connectivity Guides Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <span className="material-symbols-outlined bg-[#ffd700]/15 text-[#ffd700] p-2.5 rounded-lg text-xl">electric_bolt</span>
          <h4 className="font-display text-base font-bold text-white">Instant Setup</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Download your virtual travel eSIM profile immediately. Connect in under 60 seconds of scan.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <span className="material-symbols-outlined bg-[#ffd700]/15 text-[#ffd700] p-2.5 rounded-lg text-xl">payments</span>
          <h4 className="font-display text-base font-bold text-white">Dual Currency Checkout</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Hassle-free payment using Ghanaian Mobile Money (GHS MoMo) or Global Credit Cards (USD).
          </p>
        </div>
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <span className="material-symbols-outlined bg-[#ffd700]/15 text-[#ffd700] p-2.5 rounded-lg text-xl">support_agent</span>
          <h4 className="font-display text-base font-bold text-white">24/7 Local Support</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Our specialized support operates straight out of Accra, solving any configuration issues instantly.
          </p>
        </div>
      </section>

      {/* Bottom quick navigation guidelines helper */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffd700]">lock</span>
          <span>Authentic & Secure Sandbox Prototype</span>
        </div>
        <button 
          onClick={() => onNavigate(ScreenId.LOGIN, 'push_back')} 
          className="text-[#ffd700] font-bold hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// 7. GHANA PLANS WITH HERITAGE BACKGROUNDS
interface HeritageSite {
  id: string;
  name: string;
  location: string;
  coordinate: { x: number; y: number };
  coverage: string;
  latency: string;
  speed: string;
  insight: string;
  recommendedPlanId: string;
  symbol: string;
  symbolMeaning: string;
  adinkraName: string;
}

const HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'accra',
    name: 'Black Star Square & James Town',
    location: 'Greater Accra',
    coordinate: { x: 310, y: 515 },
    coverage: 'Simfinity 5G Core Gateway (Excellent)',
    latency: '11ms',
    speed: '450 Mbps',
    insight: 'The historic lighthouse of Jamestown stands alongside Black Star Gate, symbolizing pathfinding and sovereignty. Enjoy unmatched coverage spanning the entire capital district.',
    recommendedPlanId: 'accra_unlimited',
    adinkraName: 'Mpatapo',
    symbol: 'all_inclusive',
    symbolMeaning: 'Knot of reconciliation, peace, and unbreakable communication'
  },
  {
    id: 'kumasi',
    name: 'Manhyia Palace & Kejetia',
    location: 'Kumasi, Ashanti Region',
    coordinate: { x: 230, y: 395 },
    coverage: 'Simfinity 5G Gold Ring (Excellent)',
    latency: '15ms',
    speed: '380 Mbps',
    insight: 'The sacred seat of the Asantehene (King) and the legendary unmovable Okomfo Anokye Sword, symbolizing spiritual unity. Absolute reliability for robust inland travel.',
    recommendedPlanId: 'oseikrom_daily',
    adinkraName: 'Gye Nyame',
    symbol: 'verified',
    symbolMeaning: 'Except God: supreme power, faith, and local community resilience'
  },
  {
    id: 'elmina',
    name: 'Cape Coast & Elmina Castles',
    location: 'Central Region (Gold Coast)',
    coordinate: { x: 195, y: 525 },
    coverage: 'Simfinity 5G Coastline (Excellent)',
    latency: '22ms',
    speed: '280 Mbps',
    insight: 'These striking UNESCO World Heritage coastal fortresses tell profound tales of human history. Simfinity offers solid double-redundancy towers across the entire shoreline.',
    recommendedPlanId: 'gold_coast_monthly',
    adinkraName: 'Okodee Mmowere',
    symbol: 'local_fire_department',
    symbolMeaning: "The Eagle's Claw: strength, bravery, and persistent upland roaming"
  },
  {
    id: 'mole',
    name: 'Mole National Park',
    location: 'Savannah Region (North)',
    coordinate: { x: 180, y: 190 },
    coverage: 'Simfinity Satellite Uplink (Good)',
    latency: '34ms',
    speed: '85 Mbps',
    insight: "Ghana's largest wildlife reserve, home to majestic savannah elephants and rare primates. Connected seamlessly via low-frequency deep-penetration cell links.",
    recommendedPlanId: 'gold_coast_monthly',
    adinkraName: 'Sankofa',
    symbol: 'history',
    symbolMeaning: 'Retrieve the Past: learning from history to build an empowered future'
  },
  {
    id: 'wli',
    name: 'Wli Waterfalls & Mt. Afadjato',
    location: 'Volta Region',
    coordinate: { x: 390, y: 360 },
    coverage: 'Simfinity Alpine-Wave (Excellent)',
    latency: '19ms',
    speed: '210 Mbps',
    insight: "West Africa's tallest waterfalls cascade beautifully near Mount Afadjato. Our alpine network boosters provide robust coverage throughout the valley and resort trails.",
    recommendedPlanId: 'gold_coast_monthly',
    adinkraName: 'Asase Ye Duru',
    symbol: 'eco',
    symbolMeaning: 'The Earth has weight: respect for nature, providence, and sustainability'
  }
];

interface GlobalHub {
  id: string;
  name: string;
  location: string;
  coordinate: { x: number; y: number };
  coverage: string;
  latency: string;
  speed: string;
  insight: string;
  recommendedPlanId: string;
  symbol: string;
  localWisdomTitle: string;
  localWisdomMeaning: string;
  countryCode: string;
}

const GLOBAL_CONNECTED_HUBS: GlobalHub[] = [
  {
    id: 'ghana',
    name: 'Accra Black Star Gateway',
    location: 'Accra, Ghana',
    coordinate: { x: 190, y: 155 },
    coverage: 'Simfinity 5G Core Fiber Node (Excellent)',
    latency: '11ms',
    speed: '450 Mbps',
    insight: 'The Black Star Gate in Accra symbolises sovereignty and direct backhaul access. High frequency nodes cover the vibrant tech centers and coastal markets of West Africa.',
    recommendedPlanId: 'ESIM-GH-7D-NV',
    symbol: 'all_inclusive',
    localWisdomTitle: 'Adinkra: Mpatapo',
    localWisdomMeaning: 'The knot of reconciliation and unbreakable global communication.',
    countryCode: 'GH'
  },
  {
    id: 'usa',
    name: 'New York Silicon Alley Central',
    location: 'New York, USA',
    coordinate: { x: 95, y: 88 },
    coverage: 'Simfinity Tier-1 Edge Multipath 5G',
    latency: '8ms',
    speed: '820 Mbps',
    insight: 'Connecting through NYC Hub offers blazing fast routing to transatlantic cables. Perfect coverage spanning high-density downtown blocks, subways, and airport avenues.',
    recommendedPlanId: 'ESIM-US-30D-UL',
    symbol: 'hub',
    localWisdomTitle: 'Smart Grid Connect',
    localWisdomMeaning: 'Transoceanic laser synchronization for ultra-redundancy.',
    countryCode: 'US'
  },
  {
    id: 'uk',
    name: 'London Greenwich Prime Node',
    location: 'London, United Kingdom',
    coordinate: { x: 180, y: 72 },
    coverage: 'Simfinity Hyper-Speed Euro Grid (Excellent)',
    latency: '7ms',
    speed: '710 Mbps',
    insight: 'Anchored at the prime meridian, London routing provides double-redundant low-latency cellular handoffs across the UK and continental Europe.',
    recommendedPlanId: 'ESIM-GB-30D-UL',
    symbol: 'public',
    localWisdomTitle: 'Meridian Precision',
    localWisdomMeaning: 'Zero-meridian alignment for ultra-synchronized global packets.',
    countryCode: 'GB'
  },
  {
    id: 'japan',
    name: 'Tokyo Shinjuku Fiber Backbone',
    location: 'Tokyo, Japan',
    coordinate: { x: 320, y: 95 },
    coverage: 'Simfinity Ultra-Dense 5G Solid-State',
    latency: '5ms',
    speed: '950 Mbps',
    insight: 'Superheated millimeter-wave cells handle immense density. Optimal coverage inside high-speed Shinkansen trains and underground hyper-hubs.',
    recommendedPlanId: 'ESIM-JP-30D-UL',
    symbol: 'electric_bolt',
    localWisdomTitle: 'Zen Flow Routing',
    localWisdomMeaning: 'Balanced state transition: seamless zero-drop handovers between antennas.',
    countryCode: 'JP'
  },
  {
    id: 'south_africa',
    name: 'Cape Town Table Mountain Relay',
    location: 'Cape Town, South Africa',
    coordinate: { x: 205, y: 195 },
    coverage: 'Simfinity Coastal 5G Wavefront (Excellent)',
    latency: '16ms',
    speed: '510 Mbps',
    insight: 'Overlooking two oceans, the Table Mountain relay connects major southern submarine cables, providing beautiful, strong coastline cellular reception.',
    recommendedPlanId: 'ESIM-ZA-30D-UL',
    symbol: 'sailing',
    localWisdomTitle: 'Ubuntu Network',
    localWisdomMeaning: '"I am because we are" — a distributed, community-first mesh infrastructure.',
    countryCode: 'ZA'
  }
];

const POPULAR_GLOBAL_COUNTRIES = [
  { code: "GH", name: "Ghana", flag: "🇬🇭", continent: "Africa" },
  { code: "US", name: "United States", flag: "🇺🇸", continent: "North America" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", continent: "Europe" },
  { code: "JP", name: "Japan", flag: "🇯🇵", continent: "Asia" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", continent: "Africa" },
  { code: "CA", name: "Canada", flag: "🇨🇦", continent: "North America" },
  { code: "DE", name: "Germany", flag: "🇩🇪", continent: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", continent: "Europe" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", continent: "Africa" },
  { code: "IN", name: "India", flag: "🇮🇳", continent: "Asia" },
  { code: "AU", name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", continent: "South America" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", continent: "North America" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", continent: "Asia" }
];

export function GhanaPlansScreen({
  onNavigate,
  onSelectPlan,
}: {
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onSelectPlan: (plan: ESimPlan) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('GH');
  const [selectedHubId, setSelectedHubId] = useState<string>('ghana');
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('USD'); // Default to USD for global scope
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(null);
  const [allPlans, setAllPlans] = useState<ESimPlan[]>([]);
  const [sortOrder, setSortOrder] = useState<'low-to-high' | 'high-to-low'>('low-to-high');

  const fetchLivePlans = async (countryCode: string) => {
    setIsLoading(true);
    setHighlightedPlanId(null);
    try {
      const res = await fetch(`/api/zendit/offers?country=${countryCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plans && data.plans.length > 0) {
          setAllPlans(data.plans);
        } else {
          setAllPlans([]);
        }
      } else {
        setAllPlans([]);
      }
    } catch (err) {
      console.error("Failed fetching live Zendit offers:", err);
      setAllPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePlans(selectedCountryCode);
  }, [selectedCountryCode]);

  const handleRefresh = () => {
    fetchLivePlans(selectedCountryCode);
  };

  // Switch country & trigger fetch
  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const relatedHub = GLOBAL_CONNECTED_HUBS.find(h => h.countryCode === code.toUpperCase());
    if (relatedHub) {
      setSelectedHubId(relatedHub.id);
    }
  };

  const activeHub = GLOBAL_CONNECTED_HUBS.find(h => h.id === selectedHubId) || GLOBAL_CONNECTED_HUBS[0];

  const handleHubSelect = (hub: GlobalHub) => {
    setSelectedHubId(hub.id);
    setSelectedCountryCode(hub.countryCode);
  };

  // Filter plans based on search term (name, duration, speed)
  let filteredPlans = allPlans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.speed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.culturalInsightTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting
  filteredPlans.sort((a, b) => {
    const priceA = currency === 'GHS' ? a.priceGhs : a.priceUsd;
    const priceB = currency === 'GHS' ? b.priceGhs : b.priceUsd;
    return sortOrder === 'low-to-high' ? priceA - priceB : priceB - priceA;
  });

  const triggerHighlightPlan = (planId: string) => {
    setHighlightedPlanId(planId);
    setSearchTerm('');
    setTimeout(() => {
      const el = document.getElementById(`plan-card-${planId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="anim-fade px-4 sm:px-6 max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded text-[9px] font-mono font-bold text-[#ffd700] uppercase tracking-wider">Multipath Network</span>
            <span className="text-gray-500 font-mono text-[10px]">Active Hub: {activeHub.location}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#ffd700] tracking-tight mt-1">Simfinity Global Exploratorium</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            190+ countries. Infinite fiber backhauls. Authentic local insights.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            disabled={isLoading}
            onClick={handleRefresh}
            className={`w-9 h-9 rounded-full bg-gray-900 border border-gray-800 text-[#ffd700] flex items-center justify-center transition hover:border-[#ffd700]/30 hover:bg-gray-800 active:scale-95 ${
              isLoading ? 'animate-spin opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Refresh eSIM Data"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Global Interactive Connection Web Map */}
      <section className="glass-panel rounded-2xl p-5 border border-[#4d4732]/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-900 pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffd700]">hub</span>
              <span>Global Fiber-Terminal Gateway</span>
            </h3>
            <p className="text-gray-400 text-[11px] font-sans mt-0.5">
              View current server-synchronized backhauls, network protocol specifications, and regional system logs.
            </p>
          </div>
          {highlightedPlanId && (
            <button
              onClick={() => setHighlightedPlanId(null)}
              className="px-2.5 py-1 bg-gray-950 border border-gray-850 hover:border-gray-800 rounded text-[10px] font-mono font-bold text-[#ffd700] flex items-center gap-1 cursor-pointer duration-150"
            >
              <span className="material-symbols-outlined text-[11px]">filter_alt_off</span>
              <span>Reset Selection</span>
            </button>
          )}
        </div>

        <div className="w-full">
          {/* Site Detailed Digital Insight Card */}
          <div className="space-y-4">
            <div className="border border-[#ffd700]/15 bg-black/45 backdrop-blur-md rounded-xl p-4 space-y-3.5 relative overflow-hidden">
              <span className="absolute -bottom-8 -right-8 text-7xl font-sans font-black tracking-tighter text-white/[0.02] select-none pointer-events-none uppercase">
                {activeHub.countryCode}
              </span>

              {/* Title Header */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#ffd700] uppercase font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                  <span>{activeHub.location}</span>
                </div>
                <h4 className="font-display font-extrabold text-white text-base tracking-tight leading-snug">
                  {activeHub.name}
                </h4>
              </div>

              {/* Dynamic Speeds & latency specs */}
              <table className="w-full font-mono text-[9px] text-[#b5af9f] space-y-1">
                <tbody>
                  <tr className="border-b border-gray-900 pb-1">
                    <td className="text-gray-500 uppercase text-[8px] py-1">Uplink Status:</td>
                    <td className="text-[#94ecb4] font-bold py-1 text-right">● SYNCHRONIZED</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1">Direct Latency:</td>
                    <td className="text-[#ffd700] font-bold py-1 text-right">{activeHub.latency}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1">Downlink Carrier:</td>
                    <td className="text-white font-bold py-1 text-right">{activeHub.speed}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1">Network Protocol:</td>
                    <td className="text-white font-semibold py-1 text-right">{activeHub.coverage}</td>
                  </tr>
                </tbody>
              </table>

              {/* Geographic Insight block */}
              <p className="text-gray-300 text-[11px] leading-relaxed font-sans mt-2">
                {activeHub.insight}
              </p>

              {/* Localized Digital Soil wisdom block */}
              <div className="flex items-start gap-2 pt-2 border-t border-gray-900/60 text-[10px]">
                <span className="material-symbols-outlined text-[#ffd700] text-sm select-none shrink-0 p-0.5 bg-[#ffd700]/5 rounded">
                  {activeHub.symbol}
                </span>
                <div>
                  <p className="font-mono text-white font-bold text-[10.5px]">
                    {activeHub.localWisdomTitle}
                  </p>
                  <p className="text-gray-400 leading-normal text-[10px] font-sans mt-0.5">
                    {activeHub.localWisdomMeaning}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeHub.recommendedPlanId) {
                    // Match with first in list or generate
                    const targetPlan = allPlans.find(p => p.id.includes(activeHub.countryCode));
                    triggerHighlightPlan(targetPlan ? targetPlan.id : allPlans[0]?.id || `${activeHub.countryCode}-1D-QL`);
                  }
                }}
                className="w-full py-2 bg-[#ffd700]/10 border border-[#ffd700]/20 hover:bg-[#ffd700] hover:text-black duration-200 transition-colors rounded-lg text-[10px] font-mono font-extrabold text-[#ffd700] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 text-center uppercase"
              >
                <span>Focus Hub eSIM Plans</span>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Dynamic Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-xl p-5 border border-[#4d4732]/20 flex flex-col justify-between h-[360px] animate-pulse relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#ffd700]/5 to-transparent pointer-events-none"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 bg-gray-800 rounded w-16"></div>
                  <div className="text-right space-y-1.5">
                    <div className="h-5 bg-gray-800 rounded w-20 ml-auto"></div>
                    <div className="h-3 bg-gray-900 rounded w-14 ml-auto"></div>
                  </div>
                </div>

                <div className="h-5 bg-gray-850 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-900 rounded w-1/3 mb-6"></div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-850 flex-shrink-0"></div>
                    <div className="space-y-1.5 flex-grow font-mono">
                      <div className="h-3 bg-gray-855 rounded w-1/4"></div>
                      <div className="h-2.5 bg-gray-900 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-10 bg-gray-800/80 rounded-lg w-full mt-4"></div>
            </div>
          ))
        ) : filteredPlans.length === 0 ? (
          <div className="col-span-1 md:col-span-3 text-center py-12 glass-panel rounded-xl bg-black/35">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">sync_problem</span>
            <p className="text-gray-400 text-sm">No carrier offers matched your criteria in This Region.</p>
            <p className="text-gray-600 text-xs mt-1.5 font-mono">Try searching for other tags or clear the text filter.</p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isBestValue = plan.tag.toLowerCase().includes('best') || plan.tag.toLowerCase().includes('unlimited');
            const isHighlighted = plan.id === highlightedPlanId;
            return (
              <div 
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-500 scale-100 ${
                  isHighlighted 
                    ? 'border-2 border-[#ffd700] glow-active-gold ring-1 ring-[#ffd700]/30' 
                    : isBestValue 
                      ? 'border-2 border-[#ffd700]/45 glow-gold' 
                      : 'border border-[#4d4732]/25 hover:border-[#ffd700]/30'
                }`}
              >
                {/* Visual Background watermark shape */}
                <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-7xl text-[#ffd700]">{plan.culturalInsightSymbolName}</span>
                </div>

                {isHighlighted && (
                  <div className="absolute top-2 left-2 bg-[#ffd700] text-black font-extrabold text-[8.5px] px-1.5 py-0.5 rounded uppercase font-mono animate-bounce z-10 tracking-widest">
                    ⭐ Recommended Choice
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-bold ${
                      isHighlighted || isBestValue ? 'bg-[#ffd700] text-black' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {plan.tag}
                    </span>
                    <div className="text-right">
                      {currency === 'GHS' ? (
                        <>
                          <p className="text-[#ffd700] font-bold text-lg">GHS {plan.priceGhs}</p>
                          <p className="text-gray-400 text-[10px] font-mono">~ ${plan.priceUsd} USD</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#ffd700] font-bold text-lg">${plan.priceUsd} USD</p>
                          <p className="text-gray-400 text-[10px] font-mono">~ GHS {plan.priceGhs}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-base font-extrabold text-white mb-1 tracking-tight leading-snug">{plan.name}</h3>
                  
                  <div className="flex items-center gap-1 text-[10.5px] font-mono text-[#ffd700] mb-4 font-semibold uppercase">
                    <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
                    <span>{plan.speed}</span>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-gray-300 border-t border-gray-900 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffd700] bg-[#ffd700]/5 p-1.5 rounded text-xs select-none">database</span>
                      <div>
                        <p className="font-bold text-white">{plan.dataGb}</p>
                        <p className="text-[9.5px] text-gray-500 font-mono">High-Speed Downlink Cap</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffd700] bg-[#ffd700]/5 p-1.5 rounded text-xs select-none">calendar_today</span>
                      <div>
                        <p className="font-bold text-white">{plan.validityDays} {plan.validityDays === 1 ? 'Day' : 'Days'}</p>
                        <p className="text-[9.5px] text-gray-500 font-mono">Validity Limit</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#ffd700] bg-[#ffd700]/5 p-1.5 rounded text-xs select-none mt-0.5">{plan.culturalInsightSymbolName}</span>
                      <div className="flex-grow">
                        <p className="font-bold text-white text-[11px] leading-tight">{plan.culturalInsightTitle}</p>
                        <p className="text-[10px] text-gray-400 leading-normal mt-0.5 italic">{plan.culturalInsightDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onSelectPlan(plan);
                    onNavigate(ScreenId.CHECKOUT, 'push');
                  }}
                  className="w-full bg-[#ffd700] hover:bg-[#e6c200] text-black py-2.5 rounded-lg font-display text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md shadow-[#ffd700]/5 text-center block uppercase tracking-wider font-extrabold mt-4"
                >
                  Activate Now
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CheckoutScreen({
  plan,
  user,
  onNavigate,
  onAddSub,
  onSetProvisionedEsim,
}: {
  plan: ESimPlan | null;
  user: UserProfile;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onAddSub: (plan: ESimPlan) => void;
  onSetProvisionedEsim: (esim: any) => void;
}) {
  const finalPlan = plan || INITIAL_PLANS[2]; // Default to Monthly Gold Coast if null

  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const startPaystackPayment = async () => {
    setIsInitializing(true);
    setPayError(null);
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "misfitgem6@gmail.com",
          amountGhs: finalPlan.priceGhs,
          planId: finalPlan.id,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPaymentUrl(data.authorization_url);
        setReference(data.reference);
        window.open(data.authorization_url, '_blank');
      } else {
        setPayError(data.error || "Failed to initialize secured session.");
      }
    } catch (err: any) {
      setPayError("Network latency or connection error. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const verifyPayment = async () => {
    if (!reference) return;
    setIsVerifying(true);
    setPayError(null);
    try {
      const response = await fetch(`/api/paystack/verify/${reference}?planId=${finalPlan.id}&email=${encodeURIComponent(user?.email || "misfitgem6@gmail.com")}&dataGb=${parseInt(finalPlan.dataGb)}`);
      const data = await response.json();
      if (response.ok && data.success) {
        onSetProvisionedEsim(data.esim);
        onAddSub(finalPlan);
        onNavigate(ScreenId.ACTIVATE_ESIM, 'push');
      } else {
        setPayError(data.error || "Payment verification failed or pending. Complete the transaction first.");
      }
    } catch (err: any) {
      setPayError("Verification service transient latency. Please check again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="anim-push px-4 sm:px-6 max-w-2xl mx-auto py-6 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'push_back')}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#4d4732]/30 text-white cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-base">arrow_back</span>
        </button>
        <span className="font-display text-xs font-extrabold tracking-wider text-[#ffd700]">SECURE CHECKOUT</span>
        <div className="w-8"></div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="font-display text-2xl font-bold text-white">Checkout Summary</h2>
        <p className="text-gray-400 text-xs">Verify your eSIM subscription details and complete your secure transaction.</p>
      </div>

      {/* Plan Card Detail */}
      <div className="glass-panel rounded-xl p-5 relative overflow-hidden border-2 border-[#ffd700]/15 bg-gradient-to-br from-[#1c1b1b]/50 to-black/30">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#ffd700]/5 rounded-full blur-xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#891d11]/30 border border-[#891d11] text-xs font-mono font-medium text-red-400 mb-2">
              PREMIUM TIER
            </span>
            <h3 className="font-display text-lg font-bold text-white">{finalPlan.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[#ffd700] text-xl font-bold">GHS {finalPlan.priceGhs}</p>
            <p className="text-gray-400 text-xs font-mono">~ ${finalPlan.priceUsd} USD</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1c1b1b]/60 rounded-xl p-3 border border-[#4d4732]/20 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[#ffd700] text-xl mb-1">database</span>
            <span className="font-display font-black text-white text-base">{finalPlan.dataGb}</span>
            <span className="text-[9px] font-mono text-gray-500 mt-0.5">High-Speed Roaming</span>
          </div>
          <div className="bg-[#1c1b1b]/60 rounded-xl p-3 border border-[#4d4732]/20 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[#ffd700] text-xl mb-1">calendar_month</span>
            <span className="font-display font-black text-white text-base">{finalPlan.validityDays} Days</span>
            <span className="text-[9px] font-mono text-gray-500 mt-0.5">Validity Term</span>
          </div>
        </div>
      </div>

      {/* Specs Bento Style Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-lg py-3 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[#cc4e3c] text-lg mb-1">cell_tower</span>
          <span className="font-mono text-[10px] text-gray-300 font-semibold uppercase">{finalPlan.speed}</span>
        </div>
        <div className="glass-panel rounded-lg py-3 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[#cc4e3c] text-lg mb-1">support_agent</span>
          <span className="font-mono text-[10px] text-gray-300 font-semibold uppercase">24/7 Priority Support</span>
        </div>
        <div className="glass-panel rounded-lg py-3 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[#cc4e3c] text-lg mb-1">bolt</span>
          <span className="font-mono text-[10px] text-gray-300 font-semibold uppercase">Instant Setup</span>
        </div>
      </div>

      {/* Real-time Paystack Interactive Feedback Box */}
      {reference && (
        <div className="glass-panel rounded-xl p-5 border border-[#ffd700]/30 space-y-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#ffd700] rounded-full animate-ping shrink-0" />
            <h4 className="font-display font-bold text-[#ffd700] text-sm">Paystack Secure Gateway Active</h4>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            A secure Paystack sandbox payment screen was opened in a new tab to complete your test transaction of <span className="font-bold text-white">GHS {finalPlan.priceGhs}</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1.5">
            <button
              onClick={() => window.open(paymentUrl || "", '_blank')}
              className="flex-1 py-3 rounded-xl border border-[#ffd700]/25 hover:border-[#ffd700] text-[#ffd700] bg-black/40 text-xs font-mono font-bold hover:bg-black/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">open_in_new</span>
              <span>Reopen Portal Window</span>
            </button>
            <button
              onClick={verifyPayment}
              disabled={isVerifying}
              className="flex-1 py-3 rounded-xl bg-[#ffd700] hover:bg-[#ffe033] text-black text-xs font-mono font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">verified_user</span>
                  <span>Verify Payment Success</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {payError && (
        <div className="bg-red-950/40 border border-red-900/40 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-mono">
          <span className="material-symbols-outlined text-sm text-red-400 shrink-0 mt-0.5">warning</span>
          <p className="leading-normal">{payError}</p>
        </div>
      )}

      {/* Cultural Card Insight */}
      <div className="glass-panel rounded-xl p-4 flex gap-4 border-l-2 border-l-[#ffd700] bg-black/20">
        <div className="w-10 h-10 rounded-full bg-[#ffd700]/10 flex items-center justify-center text-[#ffd700] shrink-0">
          <span className="material-symbols-outlined text-lg">{finalPlan.culturalInsightSymbolName}</span>
        </div>
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase text-[#ffd700] tracking-wider font-semibold">CULTURAL INSIGHT</p>
          <h4 className="font-display text-sm font-bold text-white">{finalPlan.culturalInsightTitle}</h4>
          <p className="text-gray-400 text-xs leading-relaxed">{finalPlan.culturalInsightDesc}</p>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#131313]/95 border-t border-[#4d4732]/30 flex flex-col items-center gap-2 z-40">
        <div className="w-full max-w-md flex flex-col items-center">
          {!reference ? (
            <button 
              onClick={startPaystackPayment}
              disabled={isInitializing}
              className="w-full bg-[#ffd700] hover:bg-[#ffe033] text-black font-semibold font-display py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInitializing ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Initializing Secure Gateway...</span>
                </>
              ) : (
                <>
                  <span>Secure Pay GHS {finalPlan.priceGhs}</span>
                  <span className="material-symbols-outlined text-sm">payments</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={verifyPayment}
              disabled={isVerifying}
              className="w-full bg-[#ffd700] hover:bg-[#ffe033] text-black font-semibold font-display py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Checking Core Node...</span>
                </>
              ) : (
                <>
                  <span>Verify Payment & Get eSIM</span>
                  <span className="material-symbols-outlined text-sm">cloud_sync</span>
                </>
              )}
            </button>
          )}
          <p className="text-gray-500 font-mono text-[9px] mt-2 flex items-center gap-1 uppercase select-none tracking-widest">
            <span className="material-symbols-outlined text-xs text-[#ffd700]">lock</span>
            <span>Encrypted & Secure checkout powered by Paystack</span>
          </p>
        </div>
      </div>
      
      {/* Spacer to layout properly above bottom bar */}
      <div className="h-20"></div>
    </div>
  );
}

// 5. ACTIVATE eSIM SCREEN - SIMFINITY
export function ActivateEsimScreen({
  checkoutPlan,
  onNavigate,
  provisionedEsim,
}: {
  checkoutPlan: ESimPlan | null;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  provisionedEsim?: any;
}) {
  const plan = checkoutPlan || INITIAL_PLANS[2];
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSmdp, setCopiedSmdp] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [setupMode, setSetupMode] = useState<'qr' | 'manual'>('qr');
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android'>('ios');

  const simulateCopy = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const simulateSmdpCopy = () => {
    setCopiedSmdp(true);
    setTimeout(() => setCopiedSmdp(false), 2000);
  };

  const activationSteps = [
    "Establishing secure handshake with Accra Carrier hub...",
    "Provisioning container profile onto remote SM-DP+ server...",
    "Registering mobile subscriber identity (IMSI) & ICCID keys...",
    "Configuring Simfinity priority 5G data routing tables...",
    "Ghana cellular registration complete! Sim-Line Ready."
  ];

  const handleActivate = () => {
    setIsActivating(true);
    setActiveStep(0);
    setPingResult(null);
    
    // Cycle through real-time step messages for ultimate premium realism
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= activationSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setIsActivating(false);
      setIsActivated(true);
    }, 3200);
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      const latencies = [11, 14, 18, 22];
      const randomLatency = latencies[Math.floor(Math.random() * latencies.length)];
      setPingResult(`Active & Online • Ping: Accra-North Hub • Latency: ${randomLatency}ms • Speed: 320 Mbps (5G)`);
    }, 1000);
  };

  return (
    <div className="anim-push px-4 sm:px-6 max-w-2xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-1">
        {isActivated ? (
          <span className="bg-[#006b3f]/25 text-[#94ecb4] px-3.5 py-1 rounded-full text-xs font-mono border border-[#006b3f]/40 animate-pulse tracking-wide inline-flex items-center gap-1.5 shadow-lg shadow-[#006b3f]/10">
            <span className="w-2 h-2 bg-[#94ecb4] rounded-full"></span>
            ESIM ACTIVATED & READY
          </span>
        ) : isActivating ? (
          <span className="bg-[#ffd700]/10 text-[#ffd700] px-3 py-1 rounded-full text-xs font-mono border border-[#ffd700]/20 animate-pulse inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#ffd700] rounded-full animate-ping"></span>
            CONNECTING TO KOTOKA GATEWAY...
          </span>
        ) : (
          <span className="bg-[#cc4e3c]/15 text-red-300 px-3 py-1 rounded-full text-xs font-mono border border-[#cc4e3c]/30">
            AWAITING SIM REGISTRATION
          </span>
        )}
        <h2 className="font-display text-2xl font-bold text-white pt-2">
          {isActivated ? "Line Registered Successfully" : "Activate Your eSIM"}
        </h2>
        <p className="text-gray-400 text-[11px] sm:text-xs">
          {isActivated
            ? `Your ultra-fast connection for ${plan.name} is now live and provisioned on Accra 5G network.`
            : `Your high-speed connectivity for ${plan.name} is ready for secure deployment.`}
        </p>
      </div>

      {/* Main interactive segment */}
      <div className={`glass-panel rounded-2xl p-6 flex flex-col items-center text-center space-y-5 transition-all duration-500 ${
        isActivated ? 'glow-active-gold border-[#ffd700]/30 bg-black/60' : 'border-[#4d4732]/25'
      }`}>
        {/* Toggle between QR Scan and Manual Guide */}
        {!isActivated && !isActivating && (
          <div className="flex w-full bg-black/40 p-1 rounded-xl border border-[#ffd700]/15 mb-2">
            <button
              onClick={() => setSetupMode('qr')}
              className={`flex-1 py-2.5 rounded-lg font-display text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                setupMode === 'qr'
                  ? 'bg-[#ffd700] text-black shadow-md font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">qr_code</span>
              <span>QR Code Scan</span>
            </button>
            <button
              onClick={() => setSetupMode('manual')}
              className={`flex-1 py-2.5 rounded-lg font-display text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                setupMode === 'manual'
                  ? 'bg-[#ffd700] text-black shadow-md font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span>Manual Setup Guide</span>
            </button>
          </div>
        )}

        {isActivating ? (
          /* Realtime simulated provisioning overlay */
          <div className="py-12 px-4 space-y-6 w-full flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Rotating outer loader */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-t-[#ffd700] animate-spin"></div>
              {/* Pulsing inner dot */}
              <span className="material-symbols-outlined text-[#ffd700] text-3xl animate-pulse">settings_ethernet</span>
            </div>
            
            <div className="space-y-1.5 max-w-sm">
              <p className="text-[#ffd700] text-xs font-mono font-bold uppercase tracking-wider">Deploying Profile...</p>
              <div className="h-1 w-48 bg-gray-900 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-linear-to-r from-[#ffd700] to-[#ffd700]/60 transition-all duration-300 rounded-full" 
                  style={{ width: `${((activeStep + 1) / activationSteps.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-[11px] h-8 font-mono animate-fade">
                {activationSteps[activeStep]}
              </p>
            </div>
          </div>
        ) : isActivated ? (
          /* Showstopping Success Animation Frame */
          <div className="animate-scale-up-success py-4 flex flex-col items-center space-y-5 w-full">
            {/* Glowing gold circular checkmark */}
            <div className="relative w-20 h-20 rounded-full bg-[#ffd700] flex items-center justify-center text-black shrink-0 shadow-lg shadow-[#ffd700]/25 animate-bounce">
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-[#ffd700]/35 animate-spin"></div>
              <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="font-display text-base font-extrabold text-white">Adinkra Blessing</h3>
              <p className="text-gray-400 text-xs italic font-serif">
                "Woforo dua pa a, na yepia wo"
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                Meaning: When you climb a good tree, everyone supports you on your journey.
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#ffd700]/15 to-transparent my-1"></div>

            {/* Virtual eSIM card illustration */}
            <div className="glass-panel-heavy rounded-xl p-4 border border-[#ffd700]/20 w-full max-w-xs text-left relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-[#ffd700] font-mono font-bold tracking-widest uppercase">SIMFINITY eSIM</p>
                  <p className="text-white font-display text-sm font-extrabold">{plan.name}</p>
                </div>
                <span className="material-symbols-outlined text-[#ffd700] text-3xl opacity-75">sim_card</span>
              </div>
              
              <div className="flex justify-between items-end font-mono">
                <div>
                  <p className="text-[9px] text-gray-500">CARRIER SERVICE</p>
                  <p className="text-white text-[10px] font-bold">Simfinity-GHA (5G)</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-500">VIP STATUS</p>
                  <p className="text-white text-[10px] font-bold">Active Subscriber</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Network speed check */}
            <div className="w-full max-w-sm space-y-2 pt-2">
              <button
                onClick={handlePingTest}
                disabled={isPinging}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-950 border border-gray-800 hover:border-[#ffd700]/30 rounded-lg text-[11px] font-mono font-bold text-gray-300 hover:text-white transition duration-200 cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[12px] text-[#ffd700] ${isPinging ? 'animate-spin' : ''}`}>network_ping</span>
                <span>{isPinging ? 'Testing Port...' : 'Test Simfinity Connection Speed'}</span>
              </button>

              {pingResult && (
                <p className="text-[10px] font-mono text-[#94ecb4] bg-[#006b3f]/15 border border-[#006b3f]/20 py-1.5 px-3 rounded-lg animate-fade">
                  {pingResult}
                </p>
              )}
            </div>
          </div>
        ) : setupMode === 'qr' ? (
          /* Normal QR scan setup */
          <>
            {/* QR Simulation Card */}
            <div className="bg-white p-3 rounded-xl inline-block shadow-xl relative group">
              <div className="w-44 h-44 bg-white flex flex-col items-center justify-center p-1 rounded-lg relative border border-gray-300 overflow-hidden">
                {provisionedEsim?.qrCodeUrl ? (
                  <img 
                    src={provisionedEsim.qrCodeUrl} 
                    alt="eSIM QR Code" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  /* Visual simulation lines fallback */
                  <div className="grid grid-cols-4 gap-2 w-full h-full opacity-90 bg-gray-100 p-1 rounded">
                    <div className="border-[3px] border-black rounded w-8 h-8 self-start justify-self-start"></div>
                    <div className="col-span-2"></div>
                    <div className="border-[3px] border-black rounded w-8 h-8 self-start justify-self-end"></div>
                    
                    <div className="col-span-4 flex justify-center items-center">
                      <span className="material-symbols-outlined text-black text-6xl opacity-75">qr_code_2</span>
                    </div>
                    
                    <div className="border-[3px] border-black rounded w-8 h-8 self-end justify-self-start"></div>
                    <div className="col-span-2"></div>
                    <div className="w-8 h-8 bg-black/80 self-end justify-self-end rounded-sm"></div>
                  </div>
                )}
                {/* Red scan guideline overlay */}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-red-500/80 animate-pulse shadow-md"></div>
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-sm">
              Scan this QR Code from your phone's cellular settings or click the instant activation button below to simulate cellular activation immediately.
            </p>

            {/* Instant simulated scanner trigger */}
            <button
              onClick={handleActivate}
              className="px-6 py-2.5 bg-[#ffd700] hover:bg-[#e6c200] text-black font-display font-extrabold text-xs rounded-xl active:scale-95 duration-100 transition shadow-md shadow-[#ffd700]/10 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">qr_code_scanner</span>
              <span>SIMULATE QR SCAN & REGISTER LINE</span>
            </button>

            <div className="w-full kente-divider"></div>

            {/* Manual Setup config values */}
            <div className="w-full text-left space-y-2 font-mono text-xs text-gray-300 bg-[#1c1b1b]/70 p-4 rounded-xl border border-[#ffd700]/10 animate-fade-in">
              <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[9px] pb-1">
                <span>Manual details</span>
                <span>ICCID: {provisionedEsim?.iccid || "89233010472910482937"}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                <div>
                  <span className="text-gray-500">SM-DP+ SITE:</span>{' '}
                  <span className="text-[#ffd700] text-[11px]">{provisionedEsim?.smdpAddress || "rsp.simfinity.com"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                <div>
                  <span className="text-gray-500">ACTIVATION CODE:</span>{' '}
                  <span className="text-[#ffd700] text-[11px]">{provisionedEsim?.activationCode || "LXT-99327-SIMFINITY"}</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(provisionedEsim?.activationCode || "LXT-99327-SIMFINITY");
                    simulateCopy();
                  }}
                  className="text-[#ffd700] hover:text-white transition font-bold text-[11px]"
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Detailed interactive manual guide with OS tabs */
          <div className="w-full flex flex-col items-center space-y-4 animate-fade-in">
            {/* Device OS Switcher */}
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 w-full max-w-sm">
              <button
                onClick={() => setDevicePlatform('ios')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  devicePlatform === 'ios'
                    ? 'bg-slate-800 text-white font-extrabold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-sm"></span>
                <span>Apple iOS</span>
              </button>
              <button
                onClick={() => setDevicePlatform('android')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  devicePlatform === 'android'
                    ? 'bg-slate-800 text-white font-extrabold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-xs">🤖</span>
                <span>Android OS</span>
              </button>
            </div>

            {/* Step-by-step instructions list */}
            <div className="w-full text-left space-y-3.5 bg-black/30 p-5 rounded-xl border border-[#4d4732]/25">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#ffd700]">cell_tower</span>
                <span>Manual Activation Steps für {devicePlatform === 'ios' ? 'iOS Devices' : 'Android Devices'}</span>
              </h3>

              {devicePlatform === 'ios' ? (
                <ol className="space-y-3 font-sans text-xs text-gray-300">
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">1</span>
                    <p className="leading-relaxed">
                      Go to your phone’s <span className="font-bold text-white">Settings</span> page and tap <span className="font-bold text-white">Cellular</span> (or <span className="font-bold text-white">Mobile Data</span>).
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">2</span>
                    <p className="leading-relaxed">
                      Tap <span className="font-bold text-white">Add eSIM</span> or <span className="font-bold text-white">Add Data Plan</span>.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">3</span>
                    <p className="leading-relaxed">
                      At the bottom of the system set up screen, tap <span className="font-bold text-[#ffd700]">Use QR Code</span>.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">4</span>
                    <p className="leading-relaxed">
                      On the camera scanner overlay, tap <span className="font-bold text-[#ffd700]">Enter Details Manually</span> at the bottom.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">5</span>
                    <p className="leading-relaxed">
                      Copy and paste the <span className="font-bold text-[#ffd700]">SM-DP+ Site Address</span> and the unique <span className="font-bold text-[#ffd700]">Activation Code</span> from the details card below. Custom SM-DP site activation fields are 100% case sensitive.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">6</span>
                    <p className="leading-relaxed">
                      Follow the prompts to register. We recommend naming the secondary line label <span className="font-bold text-white">"Simfinity eSIM"</span> so you can switch your active data seamlessly upon landing.
                    </p>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3 font-sans text-xs text-gray-300">
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">1</span>
                    <p className="leading-relaxed">
                      Navigate to your phone’s <span className="font-bold text-white">Settings</span> menu and select <span className="font-bold text-white">Network & internet</span> (or <span className="font-bold text-white">Connections</span> &gt; <span className="font-bold text-white">SIM manager</span>).
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">2</span>
                    <p className="leading-relaxed">
                      Tap <span className="font-bold text-white">SIMs</span> (<span className="font-bold text-white font-mono">+</span> icon) representing "Add SIM" or <span className="font-bold text-white">Add mobile plan</span>.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">3</span>
                    <p className="leading-relaxed">
                      Select <span className="font-bold text-white">Download a SIM instead?</span> (for vanilla Android) or download cellular configurations.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">4</span>
                    <p className="leading-relaxed">
                      When the QR scanner overlay opens, click <span className="font-bold text-[#ffd700]">Need help?</span> or <span className="font-bold text-[#ffd700]">Enter manually</span> situated at the bottom of target screen.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">5</span>
                    <p className="leading-relaxed">
                      Input the <span className="font-bold text-[#ffd700]">SM-DP+ Site Address</span> and <span className="font-bold text-[#ffd700]">Activation Code</span> specified in the details card below. Leave the confirmation code field blank unless instructed.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] text-[#ffd700] font-black font-mono shrink-0 mt-0.5">6</span>
                    <p className="leading-relaxed">
                      Download the SIM profile onto your secure chip. Set the profile name to <span className="font-bold text-white">"Simfinity eSIM"</span> to easily manage your mobile data routes.
                    </p>
                  </li>
                </ol>
              )}

              <div className="w-full h-px bg-white/5 my-2"></div>

              {/* Instant Verification/Demonstration Trigger */}
              <div className="bg-black/20 p-3 rounded-lg border border-[#ffd700]/10 space-y-2">
                <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                  Have you successfully saved the profile using the credentials below? Click the register button to run the cellular handshake simulation.
                </p>
                <button
                  onClick={handleActivate}
                  className="w-full py-2.5 bg-[#ffd700] hover:bg-[#e6c200] text-black font-display font-extrabold text-xs rounded-lg active:scale-95 duration-100 transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm font-black">lock_open</span>
                  <span>CONFIRM MANUAL SETUP & ONLINE BOOT</span>
                </button>
              </div>
            </div>

            {/* Manual details card specifically styled inside the guide */}
            <div className="w-full text-left space-y-2 font-mono text-xs text-gray-300 bg-[#1c1b1b]/70 p-4 rounded-xl border border-dashed border-[#ffd700]/30">
              <div className="flex justify-between items-center text-gray-400 font-bold uppercase text-[9px] pb-1 border-b border-white/5">
                <span>Credentials For Easy Copying</span>
                <span>ICCID: {provisionedEsim?.iccid || "89233010472910482937"}</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                <div>
                  <span className="text-gray-500 font-bold block text-[9px]">SM-DP+ SITE ADDRESS:</span>
                  <span className="text-[#ffd700] text-xs font-bold font-mono select-all block mt-0.5">{provisionedEsim?.smdpAddress || "rsp.simfinity.com"}</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(provisionedEsim?.smdpAddress || "rsp.simfinity.com");
                    simulateSmdpCopy();
                  }}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[#ffd700] hover:text-white transition font-bold font-sans text-[10px]"
                >
                  {copiedSmdp ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                <div>
                  <span className="text-gray-500 font-bold block text-[9px]">ACTIVATION CODE:</span>
                  <span className="text-[#ffd700] text-xs font-bold font-mono select-all block mt-0.5">{provisionedEsim?.activationCode || "LXT-99327-SIMFINITY"}</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(provisionedEsim?.activationCode || "LXT-99327-SIMFINITY");
                    simulateCopy();
                  }}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[#ffd700] hover:text-white transition font-bold font-sans text-[10px]"
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide notes */}
      <div className="glass-panel rounded-xl p-4 flex gap-4 text-xs text-gray-400">
        <span className="material-symbols-outlined text-[#ffd700] select-none shrink-0">info</span>
        <div>
          <h4 className="font-bold text-white mb-0.5">Setup Recommendation:</h4>
          <p className="leading-relaxed">
            We support setting this up prior to arrival in Ghana. Name the line "Simfinity eSIM". Switch data to it as soon as you touch down in Kotoka Airport!
          </p>
        </div>
      </div>

      <div className="flex justify-center p-3 gap-3">
        {isActivated && (
          <button 
            onClick={() => {
              setIsActivated(false);
              setPingResult(null);
            }}
            className="px-5 py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white font-semibold font-display text-sm rounded-xl active:scale-95 transition cursor-pointer"
          >
            Reset Scanner
          </button>
        )}
        <button 
          onClick={() => onNavigate(ScreenId.MY_ESIMS, 'none')}
          className="px-8 py-3 bg-[#ffd700] hover:bg-[#e6c200] text-black font-semibold font-display text-sm rounded-xl active:scale-95 transition shadow-lg shadow-[#ffd700]/10 cursor-pointer"
        >
          Go to My eSIMs
        </button>
      </div>
    </div>
  );
}

// 3. MY ESIMS WITH HERITAGE BACKGROUNDS
export function MyEsimsScreen({
  activeEsims,
  pastEsims,
  onNavigate,
}: {
  activeEsims: ESimSubscription[];
  pastEsims: ESimSubscription[];
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEsimId, setExpandedEsimId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="anim-fade px-4 sm:px-6 max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#ffd700]">Manoa's Dashboard</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Manage your global connectivity network accounts.</p>
          
          <div className="inline-flex mt-2 items-center gap-1.5 px-3 py-1 rounded-full bg-[#006b3f]/20 border border-[#006b3f]/30 text-[#94ecb4] text-xs font-mono">
            <span className="w-1.5 h-1.5 bg-[#94ecb4] rounded-full animate-pulse"></span>
            <span>SIMFINITY ACTIVE ACTIVE</span>
          </div>
        </div>
        <button
          disabled={isLoading}
          onClick={handleRefresh}
          className={`w-9 h-9 rounded-full bg-gray-900 border border-gray-800 text-[#ffd700] flex items-center justify-center transition hover:border-[#ffd700]/30 hover:bg-gray-800 active:scale-95 ${
            isLoading ? 'animate-spin opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title="Refresh Dashboard Data"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
        </button>
      </div>

      {/* Main layout container strictly formatted to fit xpaths:
          body/main[1]/section[2]
          Inside section[2], xpath expects layout for Browse Plans, Add New eSIM, and active plan detail triggers. */}
      <main className="space-y-6">
        {/* Section 1: Dashboard Context (Implicit index 1) */}
        <section className="hidden">
          <h3>Context Tracker</h3>
        </section>

        {/* Section 2: Main Active & Add eSIM Container (Strict index 2) */}
        <section className="space-y-6 relative">
          
          {/* Div 1: Add New eSIM (xpath expects: body/main[1]/section[2]/div[1]/button[1]) */}
          <div className="glass-panel rounded-2xl p-5 border border-[#ffd700]/10 text-center flex flex-col items-center justify-center space-y-3 relative">
            <div className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 border border-gray-700 select-none">
              <span className="material-symbols-outlined">add</span>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-white">Add New eSIM</h4>
              <p className="text-gray-400 text-xs">Explore regional data plans for your next trip.</p>
            </div>
            {/* Button 2: Add New eSIM trigger (Index 1) */}
            <button 
              onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'none')}
              className="bg-transparent hover:bg-[#ffd700] hover:text-black text-[#ffd700] font-mono text-xs font-bold border border-[#ffd700]/30 hover:border-transparent px-4 py-2 rounded transition cursor-pointer"
            >
              BROWSE PLANS
            </button>
          </div>

          {/* Div 2: Active Plans List (xpath expects: body/main[1]/section[2]/div[2]) */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase text-gray-400 tracking-wider font-bold">Active Plans</h3>

            {isLoading ? (
              // Active Plan Skeletons
              Array.from({ length: Math.max(1, activeEsims.length) }).map((_, idx) => (
                <div 
                  key={idx}
                  className="glass-panel rounded-xl p-5 space-y-4 border-l-2 border-l-[#ffd700]/30 animate-pulse"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-grow">
                      <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-900 rounded w-1/4"></div>
                    </div>
                    <div className="h-5 bg-gray-800 rounded w-14"></div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-800 flex items-center justify-center"></div>
                      <div className="absolute space-y-1 text-center">
                        <div className="h-3 bg-gray-850 rounded w-8 mx-auto"></div>
                        <div className="h-4 bg-gray-800 rounded w-6 mx-auto"></div>
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="h-3 bg-gray-900 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-3 bg-gray-900 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <div className="contents">
                          <div></div>
                          <div></div>
                          <div>
                            <div className="h-8 bg-gray-850 rounded-lg w-28"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : activeEsims.length === 0 ? (
              <div className="text-center py-6 glass-panel rounded-xl">
                <p className="text-gray-400 text-xs">No active plans found.</p>
              </div>
            ) : (
              activeEsims.map((esim) => (
                <div 
                  key={esim.id}
                  className="glass-panel rounded-xl p-5 space-y-4 border-l-2 border-l-[#ffd700]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">{esim.planName}</h4>
                      <p className="text-gray-400 font-mono text-[10px] tracking-wide mt-0.5">ID: {esim.id}</p>
                    </div>
                    <span className="bg-[#ffd700] text-black font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none shadow">
                      5G Active
                    </span>
                  </div>

                  {/* Progress Circle Visual and Data */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
                    {/* Circular progress bar using Recharts */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      {(() => {
                        const parseTotalGb = (totalStr: string): number => {
                          if (totalStr.toLowerCase().includes('unlimited')) {
                            return 100;
                          }
                          const match = totalStr.match(/(\d+(?:\.\d+)?)/);
                          return match ? parseFloat(match[1]) : 100;
                        };

                        const totalGbValue = parseTotalGb(esim.totalDataGb);
                        const isUnlimited = esim.totalDataGb.toLowerCase().includes('unlimited');
                        const remainingData = isUnlimited ? totalGbValue : Math.min(Math.max(0, esim.leftDataGb), totalGbValue);
                        const usedData = totalGbValue - remainingData;

                        const chartData = [
                          { name: 'Remaining', value: remainingData, color: '#ffd700' },
                          { name: 'Used', value: usedData, color: '#2a2a2a' },
                        ];

                        return (
                          <>
                            <PieChart width={96} height={96}>
                              <Pie
                                data={chartData}
                                cx={48}
                                cy={48}
                                innerRadius={35}
                                outerRadius={43}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                isAnimationActive={false}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                              </Pie>
                            </PieChart>
                            <div className="absolute text-center flex flex-col items-center justify-center">
                              <p className="text-[10px] font-mono uppercase text-[#ffd700] leading-none mb-0.5">LEFT</p>
                              <p className="font-display font-black text-white text-lg leading-none">
                                {isUnlimited ? '∞' : esim.leftDataGb}
                              </p>
                              <p className="text-[8px] font-mono text-gray-400 mt-0.5 leading-none uppercase tracking-tight">
                                {isUnlimited ? 'UNLIM' : 'GB'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="space-y-4 flex-grow w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 font-mono text-[10px]">TOTAL DATA</p>
                          <p className="text-white font-bold text-sm tracking-wide">{esim.totalDataGb}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-mono text-[10px]">EXPIRES IN</p>
                          <p className="text-white font-bold text-sm tracking-wide">{esim.expiresInDays} Days</p>
                        </div>
                      </div>

                      {/* Div matching button 3 trigger (xpath: body/main[1]/section[2]/div[2]/div[1]/div[3]/div[2]/button[1]) */}
                      <div className="flex justify-end gap-2">
                        <div className="contents">
                          <div></div>
                          <div></div>
                          <div className="flex items-center gap-2">
                            {/* Inner contents */}
                            <div></div>
                            
                            {/* Show QR action button when design is provisioned from Zendit */}
                            {esim.activationCode && (
                              <button
                                onClick={() => setExpandedEsimId(expandedEsimId === esim.id ? null : esim.id)}
                                className="bg-[#1a1917] hover:bg-gray-850 text-[#ffd700] hover:text-white font-mono text-[11px] font-bold border border-[#ffd700]/30 hover:border-[#ffd700] px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 transition"
                              >
                                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                <span>{expandedEsimId === esim.id ? "HIDE PROFILE" : "INSTALL PROFILE"}</span>
                              </button>
                            )}

                            {/* Button 3: Top Up Plan */}
                            <button 
                              onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'none')}
                              className="bg-[#ffd700] hover:bg-[#e6c200] text-black font-display font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">add_circle</span>
                              <span>TOP UP PLAN</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Manual Installation & QR scanning Accordion */}
                  {expandedEsimId === esim.id && esim.activationCode && (
                    <div className="mt-4 p-4 rounded-xl border border-[#ffd700]/20 bg-[#26241e]/50 space-y-4">
                      <div className="text-center">
                        <p className="font-display font-bold text-xs text-[#ffd700] tracking-wide mb-2">SCAN eSIM PROFILE QR CODE</p>
                        <div className="inline-block bg-white p-2.5 rounded-xl shadow-lg border-2 border-[#ffd700]">
                          <img 
                            src={esim.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LPA:1$${esim.smdpAddress}$${esim.activationCode}`} 
                            alt="eSIM QR Code" 
                            className="w-36 h-36"
                          />
                        </div>
                        <p className="text-[10px] text-gray-405 font-mono mt-1.5 leading-normal">
                          Go to Settings &gt; Cellular/Network &gt; Add eSIM. Then scan this QR.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#4d4732]/20 text-left">
                        <div>
                          <p className="text-[9px] font-mono text-gray-500 uppercase">SM-DP+ Address</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-850">
                            <span className="font-mono text-[11px] text-gray-300 break-all select-all">{esim.smdpAddress}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(esim.smdpAddress || "");
                                setCopiedText("smdp-" + esim.id);
                                setTimeout(() => setCopiedText(null), 2000);
                              }}
                              className="text-xs text-[#ffd700] hover:text-white font-mono shrink-0 cursor-pointer"
                            >
                              {copiedText === "smdp-" + esim.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] font-mono text-gray-500 uppercase">Activation Code</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-850">
                            <span className="font-mono text-[11px] text-gray-300 break-all select-all">{esim.activationCode}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(esim.activationCode || "");
                                setCopiedText("ac-" + esim.id);
                                setTimeout(() => setCopiedText(null), 2000);
                              }}
                              className="text-xs text-[#ffd700] hover:text-white font-mono shrink-0 cursor-pointer"
                            >
                              {copiedText === "ac-" + esim.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        {esim.iccid && (
                          <div>
                            <p className="text-[9px] font-mono text-gray-500 uppercase">ICCID Identifier</p>
                            <div className="flex items-center justify-between gap-2 mt-0.5 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-850">
                              <span className="font-mono text-[11px] text-gray-300 select-all">{esim.iccid}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(esim.iccid || "");
                                  setCopiedText("iccid-" + esim.id);
                                  setTimeout(() => setCopiedText(null), 2000);
                                }}
                                className="text-xs text-[#ffd700] hover:text-white font-mono shrink-0 cursor-pointer"
                              >
                                {copiedText === "iccid-" + esim.id ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Button 1: Browse / Activate (xpath: body/main[1]/section[2]/div[2]/div[2]/button[1]) */}
            <div className="flex justify-center pt-2">
              <button 
                onClick={() => onNavigate(ScreenId.GHANA_PLANS, 'none')}
                className="w-full sm:w-auto px-6 py-2 bg-transparent border border-gray-600 hover:border-[#ffd700] text-gray-300 hover:text-white transition rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">explore</span>
                <span>Active Plans Manager (Browse)</span>
              </button>
            </div>

          </div>

          <div className="kente-divider"></div>

          {/* Past/completed records */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase text-gray-400 tracking-wider font-bold">Previous Plans</h3>
            <div className="space-y-2.5">
              {isLoading ? (
                // Past records skeletons
                Array.from({ length: 2 }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="glass-panel p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-gray-800 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                      <div className="space-y-1.5">
                        <div className="h-3 bg-gray-800 rounded w-28"></div>
                        <div className="h-2 bg-gray-900 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="h-3 bg-gray-800 rounded w-10 ml-auto"></div>
                      <div className="h-2 bg-gray-900 rounded w-16 ml-auto"></div>
                    </div>
                  </div>
                ))
              ) : pastEsims.length === 0 ? (
                <div className="text-center py-4 glass-panel rounded-xl">
                  <p className="text-gray-500 text-xs font-mono">No previous plan entries found</p>
                </div>
              ) : (
                pastEsims.map((esim) => (
                  <div 
                    key={esim.id}
                    className="glass-panel p-3.5 rounded-xl flex items-center justify-between border-l-2 border-l-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">history</span>
                      <div>
                        <h4 className="font-display font-bold text-white text-xs">{esim.planName}</h4>
                        <p className="text-[10px] text-gray-500 font-mono">Completed on {esim.completedDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold">{esim.totalDataGb}</p>
                      <p className="text-[9px] font-mono text-gray-500 uppercase">Usage Complete</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Refer a friend promoter card matching element xpath: `//section[.//h3[text()='Refer a Friend']]` */}
          <section
            onClick={() => onNavigate(ScreenId.REFER_FRIEND, 'push')}
            className="group cursor-pointer rounded-2xl overflow-hidden relative h-36 flex items-end p-4 border border-[#ffd700]/10 hover:border-[#ffd700]/30 shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-10 transition-colors group-hover:from-black/100"></div>
            <div className="absolute inset-0 z-0 bg-cover bg-center group-hover:scale-105 duration-500" style={{ backgroundImage: `url(${HERITAGE_IMAGES.networkGrid})` }}></div>
            
            <div className="relative z-20 space-y-1 w-full text-left">
              <span className="bg-[#cc4e3c] text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest leading-none font-mono">PROMO</span>
              <h3 className="font-display text-sm font-bold text-[#ffd700] pt-1">Refer a Friend</h3>
              <p className="text-gray-300 text-[11px] leading-snug">
                Earn 3GB free data for every friend who joins Simfinity. Get gift codes instantly.
              </p>
            </div>
          </section>

        </section>
      </main>
    </div>
  );
}

// 2. ACCOUNT - SIMFINITY
export function AccountScreen({
  user,
  onNavigate,
  onLogout,
}: {
  user: UserProfile;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
  onLogout: () => void;
}) {
  return (
    <div className="anim-fade px-4 sm:px-6 max-w-xl mx-auto py-6 space-y-6">
      {/* Profile Card Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex items-center gap-5 border border-[#ffd700]/15">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ffd700]/5 rounded-full blur-xl"></div>
        
        {/* Avatar portrait with Verification Status badge */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ffd700] p-0.5 shadow-lg shadow-[#ffd700]/10">
            <img className="w-full h-full rounded-full object-cover" src={HERITAGE_IMAGES.avatarKwame} alt="Kwame portrait" />
          </div>
          <span className="absolute -top-1 -right-1 bg-[#ffd700] text-black w-4 h-4 rounded-full flex items-center justify-center" title="Verified Member">
            <span className="material-symbols-outlined text-[10px] font-bold font-light text-black select-none">verified</span>
          </span>
        </div>

        <div>
          <h3 className="font-display font-black text-lg text-white leading-tight">{user.fullName}</h3>
          <p className="font-mono text-xs text-[#ffd700]">{user.email}</p>
          <div className="inline-flex mt-1 items-center gap-1 px-2 py-0.5 bg-[#ffd700]/10 rounded border border-[#ffd700]/20 text-[9px] font-mono text-[#ffd700] uppercase font-semibold">
            <span className="material-symbols-outlined text-[10px] select-none">check_circle</span>
            <span>Ghana ID Verified</span>
          </div>
        </div>
      </div>

      {/* Account Screen Menu list with specific trigger tags */}
      <div className="glass-panel rounded-2xl divide-y divide-[#4d4732]/25 overflow-hidden">
        
        {/* Trigger link: Personal Information */}
        <a 
          onClick={() => onNavigate(ScreenId.PERSONAL_INFO, 'push')}
          className="flex items-center justify-between p-4 bg-transparent hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffd700]">assignment_ind</span>
            <div className="text-left">
              <h4 className="font-display text-xs sm:text-sm font-bold text-white">Personal Information</h4>
              <p className="text-[10px] text-gray-500">Edit custom details and cellular configs</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
        </a>

        {/* Trigger link: Travel Documents */}
        <a 
          onClick={() => onNavigate(ScreenId.TRAVEL_DOCS, 'push')}
          className="flex items-center justify-between p-4 bg-transparent hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffd700]">import_contacts</span>
            <div className="text-left">
              <h4 className="font-display text-xs sm:text-sm font-bold text-white">Travel Documents</h4>
              <p className="text-[10px] text-gray-500">View passports, active entry visas, vaccine records</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
        </a>

        {/* Informational item */}
        <div className="flex items-center justify-between p-4 text-gray-400">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffd700]">security</span>
            <div className="text-left">
              <h4 className="font-display text-xs sm:text-sm font-bold text-gray-300">Privacy & Security</h4>
              <p className="text-[10px] text-gray-500 font-mono">ENCRYPTED CODES: SHA-256 enabled</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-500 text-sm">verified_user</span>
        </div>
      </div>

      {/* Button logout triggers target */}
      <div className="pt-2 flex justify-center">
        <button 
          onClick={() => {
            onLogout();
            onNavigate(ScreenId.LOGIN, 'push_back');
          }}
          className="w-full sm:w-auto px-6 py-3 bg-[#cc4e3c]/15 hover:bg-[#cc4e3c]/25 border border-[#cc4e3c]/40 text-red-400 rounded-xl font-mono text-xs font-bold tracking-wider active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>logout</span>
        </button>
      </div>
    </div>
  );
}

// 9. PERSONAL INFORMATION - SIMFINITY
export function PersonalInfoScreen({
  user,
  onUpdateUser,
  onNavigate,
}: {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
}) {
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phoneNumber);
  const [dob, setDob] = useState(user.dateOfBirth);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      fullName: name,
      email,
      phoneNumber: phone,
      dateOfBirth: dob,
    });
    setHasSaved(true);
    setTimeout(() => {
      setHasSaved(false);
      onNavigate(ScreenId.ACCOUNT, 'push_back');
    }, 1500);
  };

  return (
    <div className="anim-push px-4 sm:px-6 max-w-xl mx-auto py-6 space-y-6">
      {/* Header Bar with back buttons */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate(ScreenId.ACCOUNT, 'push_back')}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#4d4732]/30 text-white cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-base">arrow_back</span>
        </button>
        <span className="font-display text-xs font-extrabold tracking-wider text-[#ffd700]">PERSONAL INFO</span>
        <div className="w-8"></div>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Personal Information</h2>
        <p className="text-gray-400 text-xs">Acknowledge cellular registration settings</p>
      </div>

      {hasSaved && (
        <div className="glass-panel rounded-xl p-3 border-l-4 border-l-green-400 text-green-400 text-xs text-center font-bold">
          Changes Saved Successfully! Reverting back...
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="glass-panel rounded-2xl p-5 space-y-4">
        {/* Visual profile avatar */}
        <div className="flex flex-col items-center pb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffd700] p-0.5 shadow-lg">
            <img className="w-full h-full rounded-full object-cover" src={HERITAGE_IMAGES.avatarKwame} alt="Kwame" />
          </div>
          <span className="text-xs font-mono text-[#ffd700] mt-2 font-bold flex items-center gap-1 sm:text-xs">
            <span className="material-symbols-outlined text-xs">gpp_good</span> Verified Status
          </span>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block">FullName</label>
          <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5">
            <span className="material-symbols-outlined text-gray-600 mr-2">person</span>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
              className="bg-transparent border-none outline-none w-full text-white text-xs sm:text-sm focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block">Email Address</label>
          <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5">
            <span className="material-symbols-outlined text-gray-600 mr-2">mail</span>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="bg-transparent border-none outline-none w-full text-white text-xs sm:text-sm focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block">Phone Number</label>
          <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5">
            <span className="material-symbols-outlined text-gray-600 mr-2">smartphone</span>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              required 
              className="bg-transparent border-none outline-none w-full text-white text-xs sm:text-sm focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block">Date of Birth</label>
          <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5">
            <span className="material-symbols-outlined text-gray-600 mr-2">calendar_today</span>
            <input 
              type="text" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              required 
              className="bg-transparent border-none outline-none w-full text-white text-xs sm:text-sm focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="kente-divider"></div>

        <div className="space-y-4">
          <h3 className="font-display font-bold text-xs text-[#ffd700] uppercase tracking-wider">Identity Verification Document</h3>
          <p className="text-gray-400 text-[11px] leading-snug">
            To satisfy Ghana MCA (National Communications Authority) regulations for secure line provisioning, please upload a scan of your ID.
          </p>
          <FileUploader
            label="Ghana Card, National ID or Resident Card"
            description="PNG, JPG or PDF up to 10MB"
            accept="image/*,application/pdf"
            onFileSelect={(file) => setIdFile(file)}
          />
        </div>

        <div className="kente-divider"></div>

        {/* Button contains Save Changes triggers target */}
        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-[#ffd700] hover:bg-[#e6c200] text-black font-semibold font-display py-3 rounded-lg active:scale-95 duration-100 transition cursor-pointer flex justify-center items-center"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

// 10. TRAVEL DOCUMENTS - SIMFINITY
export function TravelDocsScreen({
  user,
  onNavigate,
}: {
  user: UserProfile;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
}) {
  const [uploadedDocs, setUploadedDocs] = useState<{
    id: string;
    category: string;
    fileName: string;
    fileSize: string;
    date: string;
    status: 'Pending Verification' | 'Verified SECURE';
  }[]>([
    {
      id: 'doc-1',
      category: 'Yellow Fever Card',
      fileName: 'intl_yellow_fever_vaccine_certificate.pdf',
      fileSize: '1.24 MB',
      date: '2026-06-21',
      status: 'Verified SECURE'
    }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Passport Scan');
  const [uploaderKey, setUploaderKey] = useState(0); // to reset the uploader file state on success

  const handleFileUploaded = (file: File | null) => {
    if (!file) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      category: selectedCategory,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Verification' as const
    };

    setUploadedDocs(prev => [newDoc, ...prev]);

    // Simulate verified status transition after 2 seconds
    setTimeout(() => {
      setUploadedDocs(prev =>
        prev.map(d => d.id === newDoc.id ? { ...d, status: 'Verified SECURE' } : d)
      );
    }, 2500);

    // Reset uploader slot to allow another upload
    setTimeout(() => {
      setUploaderKey(k => k + 1);
    }, 3000);
  };

  return (
    <div className="anim-push px-4 sm:px-6 max-w-xl mx-auto py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate(ScreenId.ACCOUNT, 'push_back')}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#4d4732]/30 text-white cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-base">arrow_back</span>
        </button>
        <span className="font-display text-xs font-extrabold tracking-wider text-[#ffd700]">TRAVEL DOCS</span>
        <div className="w-8"></div>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white">Travel Documents</h2>
        <p className="text-gray-400 text-xs">Electronic Verification Log entries</p>
      </div>

      {/* Passport section */}
      <section className="glass-panel rounded-xl p-5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffd700] text-xl">import_contacts</span>
            <h3 className="font-display text-sm font-bold text-white">Passport Certificate</h3>
          </div>
          <span className="bg-[#ffd700]/10 border border-[#ffd700]/30 text-[#ffd700] px-2 py-0.5 rounded-full font-mono text-[9px] font-bold">
            VERIFIED
          </span>
        </div>
        <div className="kente-divider mb-3"></div>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <p className="text-gray-500 text-[10px] uppercase">DOCUMENT NO.</p>
            <p className="font-bold text-white select-all">{user.passportNo}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase">EXPIRY DATE</p>
            <p className="font-bold text-white">{user.passportExpiry}</p>
            <p className="text-[9px] text-[#94ecb4] mt-0.5">1452 days remaining</p>
          </div>
        </div>
      </section>

      {/* Visas list */}
      <section className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffd700] text-xl">bookmark_added</span>
          <h3 className="font-display text-sm font-bold text-white">Active Visitor Visas</h3>
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="bg-[#1c1b1b]/70 border border-[#4d4732]/25 p-3 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-xs text-white">
                GH
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Ghana - Multi Entry</p>
                <p className="font-mono text-[10px] text-gray-500">VALID TIL: 01 JAN 2025</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
          </div>

          <div className="bg-[#1c1b1b]/70 border border-[#4d4732]/25 p-3 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-xs text-white">
                UK
              </div>
              <div className="text-left">
                <p className="font-bold text-white">UK - Standard Visitor</p>
                <p className="font-mono text-[10px] text-gray-500">VALID TIL: 15 MAR 2025</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Health records block */}
      <section className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffd700] text-xl">medical_services</span>
          <h3 className="font-display text-sm font-bold text-white">Health Verification Certificates</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#1c1b1b]/60 border border-[#4d4732]/20 p-3 rounded-xl flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#cc4e3c] bg-[#cc4e3c]/10 p-1.5 rounded-full text-base">vaccines</span>
            <div>
              <p className="font-bold text-white">Yellow Fever Card</p>
              <p className="text-[10px] text-[#94ecb4] font-mono leading-tight">Verified WHO</p>
            </div>
          </div>
          <div className="bg-[#1c1b1b]/60 border border-[#4d4732]/20 p-3 rounded-xl flex items-center gap-2.5">
            <span className="material-symbols-outlined text-gray-400 bg-gray-800 p-1.5 rounded-full text-base">coronavirus</span>
            <div>
              <p className="font-bold text-white">COVID-19 Cert</p>
              <p className="text-[10px] text-gray-500 font-mono leading-tight">Fully Vaccinated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance info */}
      <section className="glass-panel rounded-xl p-5 border-l-4 border-l-[#891d11]">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-white text-xs">Travel Insurance Coverage</h4>
            <p className="text-gray-400 text-xs">Global Nomad Secure Pro package active.</p>
            <p className="font-mono text-[10px] text-gray-500 pt-1">POLICY #: GN-8839-XZY</p>
          </div>
          <button className="px-3.5 py-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-mono text-[10px] font-bold rounded-lg cursor-pointer">
            VIEW PDF
          </button>
        </div>
      </section>

      {/* Dynamic Uploader Card Panel */}
      <section className="glass-panel rounded-2xl p-5 border border-[#ffd700]/10 bg-gradient-to-br from-[#1c1b1b] to-black space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffd700] text-xl">upload_file</span>
          <h3 className="font-display text-sm font-bold text-white">Upload Traveler Information & Credentials</h3>
        </div>
        <p className="text-gray-400 text-xs leading-snug">
          Securely submit your passport scans, entry permits, visa applications, vaccines, or travel insurance certificates. Files are encrypted client-side using advanced security keys.
        </p>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">Document Category</label>
          <div className="glass-input rounded-lg flex items-center px-3.5 py-2.5">
            <span className="material-symbols-outlined text-gray-500 mr-2">category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-white text-xs sm:text-sm focus:ring-0 p-0"
            >
              <option value="Passport Scan">Passport Scan</option>
              <option value="Visa Entry Permit">Visa Entry Permit</option>
              <option value="Yellow Fever Card">Yellow Fever Card</option>
              <option value="Travel Insurance Policy">Travel Insurance Policy</option>
              <option value="Ghana Resident Card">Ghana Resident Card</option>
            </select>
          </div>
        </div>

        <FileUploader
          key={uploaderKey}
          label="Drop your documentation file"
          accept="image/*,application/pdf"
          description="Drag & drop or click to upload PNG, JPG, or PDF (Max 10MB)"
          onFileSelect={handleFileUploaded}
        />
      </section>

      {/* Uploaded Documents List */}
      {uploadedDocs.length > 0 && (
        <section className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffd700] text-xl">folder_shared</span>
              <h3 className="font-display text-sm font-bold text-white">Your Submitted Documents ({uploadedDocs.length})</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Secure Store</span>
          </div>
          
          <div className="space-y-2.5">
            {uploadedDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-[#1c1b1b]/70 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-gray-400 p-1.5 bg-white/5 rounded-lg select-none">
                    {doc.category.includes('Passport') ? 'import_contacts' : doc.category.includes('Visa') ? 'bookmark_added' : doc.category.includes('Fever') ? 'vaccines' : 'description'}
                  </span>
                  <div className="text-left overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                        {doc.category}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{doc.date}</span>
                    </div>
                    <p className="font-medium text-white text-xs truncate mt-1">{doc.fileName}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">{doc.fileSize}</p>
                  </div>
                </div>

                <div className="relative shrink-0 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${doc.status === 'Verified SECURE' ? 'bg-[#94ecb4]' : 'bg-red-400 animate-pulse'}`}></span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${doc.status === 'Verified SECURE' ? 'text-[#94ecb4]' : 'text-red-400'}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 11. REFER A FRIEND - SIMFINITY
export function ReferFriendScreen({
  referralCode,
  onNavigate,
}: {
  referralCode: string;
  onNavigate: (s: ScreenId, t: 'none' | 'push' | 'push_back') => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(referralCode);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="anim-push px-4 sm:px-6 max-w-2xl mx-auto py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate(ScreenId.MY_ESIMS, 'push_back')}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#4d4732]/30 text-[#ffd700] cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-base">arrow_back</span>
        </button>
        <span className="font-display text-xs font-extrabold tracking-wider text-[#ffd700]">SIMFINITY REWARD</span>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 select-none">
          <img className="w-full h-full object-cover" src={HERITAGE_IMAGES.avatarRefer} alt="Refer portal" />
        </div>
      </div>

      {/* Hero display block */}
      <div className="text-center space-y-3 relative">
        <div className="w-full aspect-video rounded-2xl overflow-hidden relative border border-[#ffd700]/10 shadow-xl shadow-[#ffd700]/5 select-none">
          <img className="w-full h-full object-cover" src={HERITAGE_IMAGES.networkGrid} alt="Kente Net" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
        </div>
        <h2 className="font-display text-2xl font-black text-white">Share the Gift of Global Soul</h2>
        <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto">
          Give a friend 1GB data to start their exploration journey, and earn 3GB for yourself of global high-speed value.
        </p>
      </div>

      {/* Unique referral Code Section */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#ffd700] font-bold">Your Unique Code</span>
        
        <div className="bg-[#0e0e0e] border border-[#ffd700]/25 rounded-xl p-3 flex justify-between items-center">
          <span id="referral-code" className="font-display font-extrabold text-[#ffd700] text-sm tracking-widest pl-2">
            {referralCode}
          </span>
          <button 
            onClick={handleCopy}
            className="bg-[#ffd700] hover:bg-[#e6c200] text-black font-semibold font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button onClick={handleCopy} className="glass-panel rounded-lg py-2.5 text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer font-mono text-xs">
            <span className="material-symbols-outlined text-sm">share</span>
            <span>Share Link</span>
          </button>
          <button onClick={handleCopy} className="glass-panel rounded-lg py-2.5 text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer font-mono text-xs">
            <span className="material-symbols-outlined text-sm">mail</span>
            <span>Email Code</span>
          </button>
        </div>
      </div>

      {/* Steps Status Row tracker */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs uppercase text-gray-400 tracking-wider font-bold">Referral Status</h3>
        
        <div className="glass-panel rounded-2xl p-5 relative">
          <div className="absolute left-[39px] top-6 bottom-6 w-[1.5px] bg-[#4d4732]/35"></div>
          
          <div className="space-y-6 text-xs text-left">
            {/* Step 1 */}
            <div className="relative flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-[#ffd700] flex items-center justify-center text-black shrink-0 z-10 font-bold shadow-md shadow-[#ffd700]/20">
                <span className="material-symbols-outlined text-base">check_circle</span>
              </span>
              <div className="pt-1.5">
                <h4 className="font-bold text-white text-sm">Invited (3)</h4>
                <p className="text-gray-400">Ama, Kofi, and 1 other are review. Codes sent.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-950 border border-[#ffd700]/50 flex items-center justify-center text-[#ffd700] shrink-0 z-10 font-bold">
                <span className="material-symbols-outlined text-sm">person_add</span>
              </span>
              <div className="pt-1.5">
                <h4 className="font-bold text-gray-300 text-sm">Signed Up (1)</h4>
                <p className="text-gray-500">Kwesi created an account. Setup pending.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-600 shrink-0 z-10 font-bold">
                <span className="material-symbols-outlined text-sm">sim_card</span>
              </span>
              <div className="pt-1.5">
                <h4 className="font-bold text-gray-500 text-sm">Activated (0)</h4>
                <p className="text-gray-600">Both parties receive 3GB data once scanned and used.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wisdom quote */}
      <div className="p-4 rounded-xl border border-[#ffd700]/10 bg-[#ffd700]/5 relative overflow-hidden flex items-start gap-3">
        <span className="material-symbols-outlined text-[#ffd700] text-xl shrink-0 mt-0.5">auto_awesome</span>
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#ffd700] font-bold">Wisdom of the Ancients</p>
          <p className="text-xs text-gray-400 italic font-medium leading-relaxed">
            "Obi nkyerɛ abofra Nyame" — Nobody points out God to a child; goodness is self-evident. Share the goodness of Simfinity.
          </p>
        </div>
      </div>
    </div>
  );
}
