import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId } from '../types';

interface TutorialStep {
  title: string;
  subtitle: string;
  description: string;
  screenId: ScreenId;
  iconName: string;
  accentTitle: string;
  culturalInsight: string;
  adinkraSymbol: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Akwaaba to Simfinity! 🌟',
    subtitle: 'Connecting Tradition with 5G Technology',
    description: 'Welcome to your premium eSIM container companion! Simfinity bridges advanced 5G mobile roaming with rich West African heritage. Let\'s take a brief tour of the key features that will help you stay seamlessly connected.',
    screenId: ScreenId.HOME,
    iconName: 'home_pin',
    accentTitle: 'Personalized Travel Dashboard',
    culturalInsight: 'In Ghana, "Akwaaba" represents unconditional welcoming. Our dashboard is designed to welcome you with a clear view of your connectivity, documents, and rewards.',
    adinkraSymbol: 'Mpatapo (Knot of Peace)'
  },
  {
    title: 'Interactive Connected Map 🗺️',
    subtitle: 'Explore High-Speed Coverage Across Landmarks',
    description: 'We\'ve integrated a live network map covering historic cultural sites like the Cape Coast Castles, Mole National Park, Kumasi, and Accra. Click different regions on the map to inspect carrier latency, view local bandwidth speeds, and pull recommended eSIM profiles instantly.',
    screenId: ScreenId.GHANA_PLANS,
    iconName: 'map',
    accentTitle: 'Local Heritage Coverage',
    culturalInsight: 'Select any cultural site on the map to explore custom packages and learn about ancient Adinkra symbols representing each geographic sovereign domain.',
    adinkraSymbol: 'Sankofa (Retrieve the Past)'
  },
  {
    title: 'Instant eSIM Container 📶',
    subtitle: 'Track Data Balance & Activate Subscriptions',
    description: 'Manage active cellular sims and view precise data metrics in real-time. Generate network profiles, inspect QR installation codes, and toggle cellular nodes with zero physical card swapping.',
    screenId: ScreenId.MY_ESIMS,
    iconName: 'tap_and_play',
    accentTitle: 'Virtual SIM Manager',
    culturalInsight: 'Seamless switching keeps you in continuous communication. Our telemetry ensures double-gateway fallback lines along high-risk transport corridors.',
    adinkraSymbol: 'Gye Nyame (Faith & Supremacy)'
  },
  {
    title: 'Secure Travel Documents Vault 📁',
    subtitle: 'Double-Encrypted Client Travel Credentials',
    description: 'Avoid carrying vulnerable paper documents. Upload, capture, and safely view copies of your passport data page, biometric visas, and Ghana Card in a secure local, offline-accessible storage vault.',
    screenId: ScreenId.TRAVEL_DOCS,
    iconName: 'admin_panel_settings',
    accentTitle: 'Privacy-First Wallet',
    culturalInsight: 'Your sensitive document identifiers are protected locally with private keys. Safe passage and physical integrity are sacred.',
    adinkraSymbol: 'Okodee Mmowere (Strength & Eagle\'s Claw)'
  },
  {
    title: 'Refer & Earn Rewards 💰',
    subtitle: 'Share Cellular Hotspots & Save Roaming Tariffs',
    description: 'Traveling with family, collaborators, or friends? Copy your personal Gold Sim key and share it. Give friends up to $10 off standard 5G activations while earning free gigabytes directly into your active card balance.',
    screenId: ScreenId.REFER_FRIEND,
    iconName: 'volunteer_activism',
    accentTitle: 'Communal Sharing Network',
    culturalInsight: 'Sharing of abundance is a core tenet of West African communities. Build a network of connected paths together with friend referrals.',
    adinkraSymbol: 'Boa Me Na Me Mmo Wo (Cooperation & Mutuality)'
  }
];

interface FeatureTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId, transition: 'none' | 'push' | 'push_back') => void;
  isLoggedIn?: boolean;
}

export function FeatureTutorial({ isOpen, onClose, onNavigate, isLoggedIn = false }: FeatureTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sync background screen layout as we step through
  useEffect(() => {
    if (isOpen) {
      const activeStep = TUTORIAL_STEPS[currentStepIndex];
      // If logged in, they can view full screens. If not logged in, we keep them on SPLASH with the tutorial overlay to display local landmarks correctly without violating login bounds.
      if (isLoggedIn) {
        onNavigate(activeStep.screenId, 'none');
      }
    }
  }, [currentStepIndex, isOpen, isLoggedIn]);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      if (!isLoggedIn) {
        onNavigate(ScreenId.SIGN_UP, 'push');
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="tutorial-overlay" 
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-end md:justify-center p-4 bg-black/65 backdrop-blur-[1.5px]"
      >
        {/* Step-specific highlighting boundary layout */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-full relative">
            {/* Visual pulse indicator to guide attention to screen features */}
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute w-36 h-36 rounded-full border-2 border-dashed border-[#ffd700] bg-[#ffd700]/5 pointer-events-none"
              style={{
                // General focal positions matching the target features 
                left: step.screenId === ScreenId.GHANA_PLANS ? '50%' : step.screenId === ScreenId.MY_ESIMS ? '50%' : '50%',
                top: step.screenId === ScreenId.GHANA_PLANS ? '40%' : step.screenId === ScreenId.MY_ESIMS ? '35%' : '15%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>

        {/* Floating Modal Tutorial Dialog Box */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xl glass-panel border border-[#ffd700]/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(255,215,0,0.15)] bg-slate-950/95 overflow-hidden"
        >
          {/* Subtle watermark */}
          <div className="absolute -bottom-8 -right-8 opacity-[0.03] select-none pointer-events-none font-bold text-9xl text-white">
            {currentStepIndex + 1}
          </div>

          {/* Top Progress bar and counter */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider font-extrabold text-[#ffd700] bg-[#ffd700]/15 px-2.5 py-1 rounded">
              Simfinity Tour • Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition duration-150 p-1 rounded-full hover:bg-gray-900 cursor-pointer flex items-center justify-center"
              title="Skip Tour"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Stepper Dots visual bar */}
          <div className="h-1 bg-gray-900 rounded-full overflow-hidden flex gap-0.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  idx <= currentStepIndex ? 'bg-[#ffd700]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffd700]/10 border border-[#ffd700]/20 flex items-center justify-center text-[#ffd700] shrink-0">
                <span className="material-symbols-outlined text-2xl">{step.iconName}</span>
              </div>
              <div>
                <h3 className="font-display font-extrabold text-white text-lg tracking-tight leading-tight">
                  {step.title}
                </h3>
                <p className="font-sans text-gray-400 text-xs mt-0.5 font-medium">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Focal highlight description */}
            <div className="bg-black/40 border border-gray-900 rounded-xl p-4 space-y-2">
              <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                Feature Focus: {step.accentTitle}
              </h4>
              <p className="text-gray-300 font-sans text-xs sm:text-[13px] leading-relaxed antialiased">
                {step.description}
              </p>
            </div>

            {/* Cultural Insights Tab */}
            <div className="border border-amber-900/10 bg-amber-500/[0.03] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-[#ffd700] font-mono text-[9px] uppercase tracking-wider font-extrabold">
                <span className="material-symbols-outlined text-xs">local_library</span>
                <span>Cultural Association: {step.adinkraSymbol}</span>
              </div>
              <p className="text-gray-400 font-sans italic text-xs leading-relaxed">
                "{step.culturalInsight}"
              </p>
            </div>
          </div>

          {/* Interaction Navigation Footer button block */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-900/60">
            <button
              onClick={() => {
                onClose();
                if (!isLoggedIn) {
                  onNavigate(ScreenId.SIGN_UP, 'push');
                } else {
                  onNavigate(ScreenId.HOME, 'push_back');
                }
              }}
              className="text-gray-400 hover:text-white font-mono text-xs font-bold transition duration-150 cursor-pointer"
            >
              Skip Walkthrough
            </button>

            <div className="flex items-center gap-3">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-950 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-bold transition duration-150 cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Prev</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#ffd700] hover:bg-[#ffe240] text-black rounded-lg text-xs font-mono font-black shadow-[0_4px_14px_rgba(255,215,0,0.15)] transition duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{isLast ? 'Enter Simfinity' : 'Next Screen'}</span>
                <span className="material-symbols-outlined text-[14px] font-black">
                  {isLast ? 'rocket_launch' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
