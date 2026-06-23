/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ScreenId {
  SPLASH = 'splash',
  LOGIN = 'login',
  ACCOUNT = 'account',
  MY_ESIMS = 'my_esims',
  SIGN_UP = 'sign_up',
  ACTIVATE_ESIM = 'activate_esim',
  HOME = 'home',
  GHANA_PLANS = 'ghana_plans',
  CHECKOUT = 'checkout',
  PERSONAL_INFO = 'personal_info',
  TRAVEL_DOCS = 'travel_docs',
  REFER_FRIEND = 'refer_friend',
}

export type TransitionType = 'none' | 'push' | 'push_back';

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  ghanaCardId: string;
  passportNo: string;
  passportExpiry: string;
}

export interface ESimPlan {
  id: string;
  name: string;
  tag: string;
  priceGhs: number;
  priceUsd: number;
  speed: string;
  dataGb: string;
  validityDays: number;
  culturalInsightTitle: string;
  culturalInsightSymbolName: string;
  culturalInsightDesc: string;
}

export interface ESimSubscription {
  id: string;
  planName: string;
  status: 'active' | 'completed' | 'pending';
  totalDataGb: string;
  leftDataGb: number;
  expiresInDays: number;
  completedDate?: string;
  iccid?: string;
  activationCode?: string;
  smdpAddress?: string;
  qrCodeUrl?: string;
}

export interface AppState {
  currentScreen: ScreenId;
  transitionType: TransitionType;
  user: UserProfile;
  activeEsims: ESimSubscription[];
  pastEsims: ESimSubscription[];
  checkoutPlan: ESimPlan | null;
  referralCode: string;
}
