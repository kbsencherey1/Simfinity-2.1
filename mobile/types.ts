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
  /** Real carrier brand(s) this plan roams on (e.g. "MTN Ghana"), from Zendit — may be empty if unknown. */
  networks?: string[];
}

export interface ESimSubscription {
  id: string;
  dbId?: number;
  planId?: string;
  planName: string;
  status: 'active' | 'completed' | 'pending';
  totalDataGb: string;
  leftDataGb: number;
  expiresInDays: number;
  expiresInMinutes?: number;
  completedDate?: string;
  iccid?: string;
  activationCode?: string;
  smdpAddress?: string;
  qrCodeUrl?: string;
  giftToken?: string;
}

export interface UsageData {
  totalGb: number;
  usedGb: number;
  remainingGb: number;
  usedPercent: number;
  unlimited: boolean;
  source: 'live' | 'stored';
}

export interface PaymentRecord {
  id: number;
  reference: string;
  amountGhs: number | null;
  planId: string;
  planName: string | null;
  status: string;
  createdAt: string | null;
}

export interface ProvisionedEsim {
  iccid: string;
  qrCodeUrl: string;
  activationCode: string;
  smdpAddress: string;
  isRealEsim: boolean;
}

export interface GlobalHub {
  id: string;
  name: string;
  location: string;
  coverage: string;
  latency: string;
  speed: string;
  insight: string;
  symbol: string;
  localWisdomTitle: string;
  localWisdomMeaning: string;
  countryCode: string;
}
