import React, { createContext, useContext, useState, useEffect } from 'react';
import { ESimPlan, ESimSubscription, UserProfile } from '../types';
import { INITIAL_USER, INITIAL_ESIMS, INITIAL_PAST_ESIMS } from '../data';

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  activeEsims: ESimSubscription[];
  setActiveEsims: (e: ESimSubscription[]) => void;
  pastEsims: ESimSubscription[];
  setPastEsims: (e: ESimSubscription[]) => void;
  checkoutPlan: ESimPlan | null;
  setCheckoutPlan: (p: ESimPlan | null) => void;
  provisionedEsim: any;
  setProvisionedEsim: (e: any) => void;
  addSubscription: (plan: ESimPlan) => void;
  referralCode: string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeEsims, setActiveEsims] = useState<ESimSubscription[]>(INITIAL_ESIMS);
  const [pastEsims, setPastEsims] = useState<ESimSubscription[]>(INITIAL_PAST_ESIMS);
  const [checkoutPlan, setCheckoutPlan] = useState<ESimPlan | null>(null);
  const [provisionedEsim, setProvisionedEsim] = useState<any>(null);
  const referralCode = 'SIM-KWAME-2024';

  const addSubscription = (plan: ESimPlan) => {
    const already = activeEsims.some(e => e.planName === plan.name);
    if (!already) {
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
      setActiveEsims(prev => [newSub, ...prev]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        activeEsims,
        setActiveEsims,
        pastEsims,
        setPastEsims,
        checkoutPlan,
        setCheckoutPlan,
        provisionedEsim,
        setProvisionedEsim,
        addSubscription,
        referralCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
