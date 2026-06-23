/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ScreenId, ESimPlan, ESimSubscription, UserProfile, TransitionType } from './types';
import { INITIAL_USER, INITIAL_ESIMS, INITIAL_PAST_ESIMS, HERITAGE_IMAGES } from './data';
import { TouristBackground } from './components/TouristBackground';
import { FeatureTutorial } from './components/FeatureTutorial';
import { Splash } from './components/Splash';
import {
  NavigationWrapper,
  LoginScreen,
  SignUpScreen,
  HomeScreen,
  GhanaPlansScreen,
  CheckoutScreen,
  ActivateEsimScreen,
  MyEsimsScreen,
  AccountScreen,
  PersonalInfoScreen,
  TravelDocsScreen,
  ReferFriendScreen,
} from './components/Screens';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(ScreenId.SPLASH);
  const [transition, setTransition] = useState<TransitionType>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeString, setTimeString] = useState('12:45');
  
  // Real-time clock update loop
  useEffect(() => {
    const updateRealTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hh}:${mm}`);
    };
    updateRealTime();
    const intervalId = setInterval(updateRealTime, 10000);
    return () => clearInterval(intervalId);
  }, []);
  
  // High fidelity persistent prototype states
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeEsims, setActiveEsims] = useState<ESimSubscription[]>(INITIAL_ESIMS);
  const [pastEsims, setPastEsims] = useState<ESimSubscription[]>(INITIAL_PAST_ESIMS);
  const [checkoutPlan, setCheckoutPlan] = useState<ESimPlan | null>(null);
  const [provisionedEsim, setProvisionedEsim] = useState<any>(null);
  const referralCode = 'SIM-KWAME-2024';

  // Load real eSIM subscriptions from Zendit.io provider
  useEffect(() => {
    async function loadZenditEsims() {
      try {
        const res = await fetch("/api/zendit/esims");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.esims) {
            // Keep the real Zendit ones! If Zendit list contains entries, use them.
            // We can also merge them with standard initialized mocks to ensure pristine looks.
            const activeList = data.esims.filter((e: any) => e.status === 'active');
            const pastList = data.esims.filter((e: any) => e.status === 'completed');
            
            if (activeList.length > 0) {
              setActiveEsims(activeList);
            } else {
              // If none active, prepend our standard high fidelity prototype mock
              setActiveEsims(INITIAL_ESIMS);
            }
            if (pastList.length > 0) {
              setPastEsims(pastList);
            } else {
              setPastEsims(INITIAL_PAST_ESIMS);
            }
          }
        }
      } catch (err) {
        console.error("Failed loading real Zendit eSIMs:", err);
      }
    }
    loadZenditEsims();
  }, [provisionedEsim]);

  const navigate = (screen: ScreenId, transType: TransitionType) => {
    setTransition(transType);
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate(ScreenId.LOGIN, 'push_back');
  };

  // Dynamically simulated payment & activation eSIM generation handler
  const handleAddNewSubscription = (plan: ESimPlan) => {
    const isAlreadySubbed = activeEsims.some(e => e.planName === plan.name);
    if (!isAlreadySubbed) {
      const gbs = plan.dataGb.split(' ')[0];
      const leftValue = isNaN(parseFloat(gbs)) ? 50.0 : parseFloat(gbs);
      const newSub: ESimSubscription = {
        id: `#GH-2026-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        planName: plan.name,
        status: 'active',
        totalDataGb: plan.dataGb,
        leftDataGb: leftValue,
        expiresInDays: plan.validityDays,
      };
      setActiveEsims([newSub, ...activeEsims]);
    }
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  // Render the currently selected high-fidelity screen component 1-11
  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenId.SPLASH:
        return (
          <Splash 
            onNavigate={navigate} 
            onStartTutorial={() => setShowTutorial(true)}
          />
        );
      
      case ScreenId.LOGIN:
        return (
          <LoginScreen 
            onNavigate={navigate} 
            onLogin={handleLogin} 
          />
        );
      
      case ScreenId.SIGN_UP:
        return (
          <SignUpScreen 
            onNavigate={navigate} 
            onLogin={() => {
              handleLogin();
              setShowTutorial(true);
            }} 
          />
        );

      case ScreenId.HOME:
        return (
          <HomeScreen 
            onNavigate={navigate} 
            onStartTutorial={() => setShowTutorial(true)}
          />
        );

      case ScreenId.GHANA_PLANS:
        return (
          <GhanaPlansScreen 
            onNavigate={navigate} 
            onSelectPlan={(plan) => setCheckoutPlan(plan)} 
          />
        );

      case ScreenId.CHECKOUT:
        return (
          <CheckoutScreen 
            plan={checkoutPlan} 
            user={user}
            onNavigate={navigate} 
            onAddSub={handleAddNewSubscription} 
            onSetProvisionedEsim={setProvisionedEsim}
          />
        );

      case ScreenId.ACTIVATE_ESIM:
        return (
          <ActivateEsimScreen 
            checkoutPlan={checkoutPlan} 
            onNavigate={navigate} 
            provisionedEsim={provisionedEsim}
          />
        );

      case ScreenId.MY_ESIMS:
        return (
          <MyEsimsScreen 
            activeEsims={activeEsims} 
            pastEsims={pastEsims} 
            onNavigate={navigate} 
          />
        );

      case ScreenId.ACCOUNT:
        return (
          <AccountScreen 
            user={user} 
            onNavigate={navigate} 
            onLogout={handleLogout} 
          />
        );

      case ScreenId.PERSONAL_INFO:
        return (
          <PersonalInfoScreen 
            user={user} 
            onUpdateUser={updateProfile} 
            onNavigate={navigate} 
          />
        );

      case ScreenId.TRAVEL_DOCS:
        return (
          <TravelDocsScreen 
            user={user} 
            onNavigate={navigate} 
          />
        );

      case ScreenId.REFER_FRIEND:
        return (
          <ReferFriendScreen 
            referralCode={referralCode} 
            onNavigate={navigate} 
          />
        );

      default:
        return <HomeScreen onNavigate={navigate} onStartTutorial={() => setShowTutorial(true)} />;
    }
  };

  // Apply visual push animations as classes
  let animClass = 'anim-fade';
  if (transition === 'push') {
    animClass = 'anim-push';
  } else if (transition === 'push_back') {
    animClass = 'anim-push-back';
  }

  // Define screens that bypass the layout wrapper navigation tabs (Splash, Login & Sign Up screens)
  const isBypassedScreen = currentScreen === ScreenId.SPLASH || currentScreen === ScreenId.LOGIN || currentScreen === ScreenId.SIGN_UP;

  return (
    <div className={`min-h-screen text-[#e5e2e1] bg-transparent adinkra-pattern transition-all duration-300 ${animClass}`}>
      
      {/* Background slide sequences showing premium tourism locations in Ghana */}
      <TouristBackground currentScreen={currentScreen} />

      {isBypassedScreen ? (
        <div className="pt-4">{renderScreen()}</div>
      ) : (
        <NavigationWrapper 
          currentScreen={currentScreen} 
          onNavigate={navigate} 
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        >
          {renderScreen()}
        </NavigationWrapper>
      )}

      {/* Onboarding walk-thru feature overlay */}
      <FeatureTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
