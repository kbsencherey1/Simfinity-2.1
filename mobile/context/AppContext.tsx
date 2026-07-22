import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ESimPlan, ESimSubscription, PaymentRecord, ProvisionedEsim, UserProfile } from '../types';
import { INITIAL_USER } from '../data';
import { API_BASE } from '../config';
import { registerPushToken } from '../hooks/usePushNotifications';

export const CURRENCIES = [
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function formatCurrencyPrice(priceGhs: number, currencyCode: string, rates: Record<string, number>): string {
  if (currencyCode === 'GHS') return `GH₵ ${priceGhs.toFixed(2)}`;
  const rate = rates[currencyCode];
  if (!rate) return `GH₵ ${priceGhs.toFixed(2)}`;
  const c = CURRENCIES.find(x => x.code === currencyCode);
  const converted = priceGhs * rate;
  return currencyCode === 'JPY'
    ? `${c?.symbol ?? currencyCode} ${Math.round(converted)}`
    : `${c?.symbol ?? currencyCode} ${converted.toFixed(2)}`;
}

// Fallback rates (1 GHS = X currency) — used until the live fetch resolves.
// Kept in sync with ExchangeRateService.getFallback() in the backend.
const FALLBACK_RATES: Record<string, number> = {
  GHS: 1.0,
  USD: 0.065,
  EUR: 0.059,
  GBP: 0.051,
  NGN: 102.0,
  KES: 8.4,
  ZAR: 1.18,
  JPY: 9.7,
  CAD: 0.088,
  AUD: 0.10,
};

// Sensitive credentials → encrypted SecureStore (iOS Keychain / Android Keystore)
const SECURE_TOKEN_KEY = 'simfinity_token';
const SECURE_USER_ID_KEY = 'simfinity_user_id';
// Non-sensitive preferences → AsyncStorage
const USER_KEY = '@simfinity_user';
const CURRENCY_KEY = '@simfinity_currency';

interface AppContextType {
  authReady: boolean;
  isLoggedIn: boolean;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  token: string | null;
  userId: number | null;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  loginWithToken: (token: string, email: string, fullName: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;
  activeEsims: ESimSubscription[];
  setActiveEsims: (e: ESimSubscription[]) => void;
  pastEsims: ESimSubscription[];
  setPastEsims: (e: ESimSubscription[]) => void;
  checkoutPlan: ESimPlan | null;
  setCheckoutPlan: (p: ESimPlan | null) => void;
  provisionedEsim: ProvisionedEsim | null;
  setProvisionedEsim: (e: ProvisionedEsim | null) => void;
  topUpEsim: ESimSubscription | null;
  setTopUpEsim: (e: ESimSubscription | null) => void;
  addSubscription: (plan: ESimPlan) => void;
  fetchEsims: (tok: string) => Promise<void>;
  payments: PaymentRecord[];
  fetchPayments: (tok: string) => Promise<void>;
  referralCode: string;
  currency: string;
  setCurrency: (c: string) => void;
  exchangeRates: Record<string, number>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeEsims, setActiveEsims] = useState<ESimSubscription[]>([]);
  const [pastEsims, setPastEsims] = useState<ESimSubscription[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<ESimPlan | null>(null);
  const [provisionedEsim, setProvisionedEsim] = useState<ProvisionedEsim | null>(null);
  const [topUpEsim, setTopUpEsim] = useState<ESimSubscription | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [currency, setCurrencyState] = useState<string>('GHS');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    AsyncStorage.setItem(CURRENCY_KEY, c).catch(() => {});
  };

  const fetchReferralCode = useCallback(async (tok: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/referrals`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code) setReferralCode(data.code);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchEsims = useCallback(async (tok: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/esims`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data: ESimSubscription[] = await res.json();
        setActiveEsims(data.filter(e => e.status === 'active'));
        setPastEsims(data.filter(e => e.status !== 'active'));
      }
    } catch {
      // Network unavailable — keep current state
    }
  }, []);

  const fetchPayments = useCallback(async (tok: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/payments`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.ok) {
        const data: PaymentRecord[] = await res.json();
        setPayments(data);
      }
    } catch {
      // Network unavailable — keep current state
    }
  }, []);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      const [savedToken, savedUserId, savedUser, savedCurrency] = await Promise.all([
        SecureStore.getItemAsync(SECURE_TOKEN_KEY),
        SecureStore.getItemAsync(SECURE_USER_ID_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
      ]);
      if (savedToken) {
        setToken(savedToken);
        setIsLoggedIn(true);
        fetchEsims(savedToken);
        fetchPayments(savedToken);
        fetchReferralCode(savedToken);
      }
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { /* ignore corrupt data */ }
      }
      if (savedUserId) {
        const uid = Number(savedUserId);
        setUserId(uid);
        setAvatarUrl(`${API_BASE}/api/user/avatar/${uid}?t=${Date.now()}`);
      }
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
      setAuthReady(true);
    })();
    // Fetch exchange rates once on startup (1-hour server cache)
    fetch(`${API_BASE}/api/exchange-rates`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setExchangeRates(data); })
      .catch(() => {});
  }, [fetchEsims, fetchPayments, fetchReferralCode]);

  const loginWithToken = async (tok: string, email: string, fullName: string, uid: number) => {
    const updatedUser: UserProfile = { ...INITIAL_USER, email, fullName };
    setToken(tok);
    setUserId(uid);
    setAvatarUrl(`${API_BASE}/api/user/avatar/${uid}?t=${Date.now()}`);
    setUser(updatedUser);
    setIsLoggedIn(true);
    await Promise.all([
      SecureStore.setItemAsync(SECURE_TOKEN_KEY, tok),
      SecureStore.setItemAsync(SECURE_USER_ID_KEY, String(uid)),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser)),
    ]);
    await Promise.all([fetchEsims(tok), fetchPayments(tok)]);
    fetchReferralCode(tok); // best-effort, no await
    registerPushToken(tok); // best-effort, no await
  };

  const logout = async () => {
    setToken(null);
    setUserId(null);
    setAvatarUrl(null);
    setIsLoggedIn(false);
    setUser(INITIAL_USER);
    setActiveEsims([]);
    setPastEsims([]);
    setPayments([]);
    setTopUpEsim(null);
    setReferralCode('');
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_TOKEN_KEY),
      SecureStore.deleteItemAsync(SECURE_USER_ID_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  };

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
    if (token) fetchEsims(token);
  };

  return (
    <AppContext.Provider
      value={{
        authReady,
        isLoggedIn,
        user,
        setUser,
        token,
        userId,
        avatarUrl,
        setAvatarUrl,
        loginWithToken,
        logout,
        activeEsims,
        setActiveEsims,
        pastEsims,
        setPastEsims,
        checkoutPlan,
        setCheckoutPlan,
        provisionedEsim,
        setProvisionedEsim,
        topUpEsim,
        setTopUpEsim,
        addSubscription,
        fetchEsims,
        payments,
        fetchPayments,
        referralCode,
        currency,
        setCurrency,
        exchangeRates,
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
