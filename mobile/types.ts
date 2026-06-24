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
