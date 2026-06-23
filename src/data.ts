/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESimPlan, ESimSubscription, UserProfile } from './types';

export const INITIAL_PLANS: ESimPlan[] = [
  {
    id: 'oseikrom_daily',
    name: 'The Oseikrom Daily',
    tag: 'Popular',
    priceGhs: 25,
    priceUsd: 1.85,
    speed: '5G Super Speed',
    dataGb: '2GB Data',
    validityDays: 1,
    culturalInsightTitle: 'Gye Nyame Reliable',
    culturalInsightSymbolName: 'verified',
    culturalInsightDesc: 'Represents "Except God" (supremacy). This plan ensures you stay connected trustfully with ultimate network uptime across Kumasi and beyond.',
  },
  {
    id: 'accra_unlimited',
    name: 'Greater Accra Unlimited',
    tag: 'Best Value',
    priceGhs: 150,
    priceUsd: 11.10,
    speed: 'Infinite Connectivity',
    dataGb: 'Unlimited Data',
    validityDays: 7,
    culturalInsightTitle: 'Mpatapo Security',
    culturalInsightSymbolName: 'all_inclusive',
    culturalInsightDesc: 'A knot of pacification and harmony. Mpatapo secure connections bind people together in perfect safety, encrypting all your communications.',
  },
  {
    id: 'gold_coast_monthly',
    name: 'Gold Coast Monthly',
    tag: 'Nomad Tier',
    priceGhs: 450,
    priceUsd: 33.30,
    speed: 'Regional Roaming',
    dataGb: '50GB Data',
    validityDays: 30,
    culturalInsightTitle: "Okodee Mmowere (Eagle's Claw)",
    culturalInsightSymbolName: 'local_fire_department',
    culturalInsightDesc: 'Represents strength and bravery. Just as the eagle\'s claw holds firm, this premium plan provides the strongest, most unyielding connection across Ghana\'s diverse terrain.',
  },
];

export const INITIAL_USER: UserProfile = {
  fullName: 'Kwame Mensah',
  email: 'kwame@example.com',
  phoneNumber: '+233 24 555 0123',
  dateOfBirth: '14 May 1992',
  ghanaCardId: 'GHA-7123***-0',
  passportNo: 'A***8923',
  passportExpiry: '12 Oct 2028',
};

export const INITIAL_ESIMS: ESimSubscription[] = [
  {
    id: '#GH-2024-X99',
    planName: 'West Africa Travel',
    status: 'active',
    totalDataGb: '10 GB',
    leftDataGb: 7.2,
    expiresInDays: 14,
  },
];

export const INITIAL_PAST_ESIMS: ESimSubscription[] = [
  {
    id: '#GH-2023-P88',
    planName: 'Global Explorer Monthly',
    status: 'completed',
    totalDataGb: '20GB/20GB',
    leftDataGb: 0,
    expiresInDays: 0,
    completedDate: 'Oct 12, 2023',
  },
  {
    id: '#GH-2023-P45',
    planName: 'Accra City Pack',
    status: 'completed',
    totalDataGb: '5GB/5GB',
    leftDataGb: 0,
    expiresInDays: 0,
    completedDate: 'Sep 05, 2023',
  },
];

// Reusable premium image assets from user context
export const HERITAGE_IMAGES = {
  loginPattern: 'https://lh3.googleusercontent.com/aida/AP1WRLsOV2T0bOS0_vSwCBuagWksrgBkCenJMPcvdR5ZkfsBwNZmCvRMFDBLso4tvWEgyW3bRrKkUkbCZn7T0V23QidZqg7e0PkL8XzqiMrOKq4cjWTuISWWHzZJg4lANcb2pjWRpaYq7mw7Hd5CRb9wImyTfOnrnPJOfeNq9a1WFeNBhIHkwiYsQz6q6pwuIlBwqFB2uYnRtZQ2JRLf6nl6bwHecorRBX2rJPq53ztZE8MUF2PyYA2YKEHA',
  landscapeAccra: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKAgHdr7Aek080O7mpHjLxr10PvPsdrSW9nPVhulVxYbPefhiiRHG3FvHIqsy4Luqs7WwAeMcbGjcV9t1enPlP1cc5a9NzADU800kbIzeofdGcKj4_5AjF--mKaGtkGKTwgW_gjwfyz0HapB-MKjk_K2gm2ni_tQABT3djTl6pk4qaamOVfC6kt0i-oDqXtDo7eqqB8mhOBzUdSdQmK5RYH3wTG8xjZ26LF67VhBESivOdZGoQtRBiwLqNzsdiY91npCu5hyHYZw',
  avatarKwame: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd8FteZjJr8DzQ6tVu436AMM09Tz1VvaI41D2DU1orvYmOiOfuUlG_C6NTp6q9kCP5uOSCc3pUgnHkLCZrAUyhlYPu-dkA2qpfKJGyfDsu1rk4tBWqEWUAPHkhIt9lYaDWnVq0oRGzbM3NSsFRu7yb3i3ORhHehmesxamsTnq1mecL3ojjAGrDTwbu3TifOsOI9nYZcorEL9qiiWAs3XTGSi8C66reKETCOI5QMAAUFkPVNhA5K2rciD6E1KevXxjil-9CrsJHKQ',
  avatarRefer: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS51HhfAuWxN2KHHANqs6iB6B99vOvbyv26ZvgalddJM8k1CuiGO3GbAUaT1k5G_FhCIVHely5yIFpeDGWvYA_z8T87xZoshh2Eit2JRrsAWM5-dL3etP-LW3WM5F8uBCSZ_p_Yza8u9w0zpboMpXU2KDXiw0jCCYCLI1dRoy0C1P6XWjNl65qe2Tx7f2rt7fUk4YKlhbR0qy7UFgUjb4d-m29-Ej3KV8bbs5cX2V9V7nHOzbg0EzrlzIy2rYSsWmKDkeoOTuA0g',
  networkGrid: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1cpKgrM_IBuaqSw6sxmPkWXAc9ur2sG7fn2mRwTdMkTl-pDEcOcRrrZijHGqVnOi9dyHj9PVYpyNqg1KMxfnCLtAhptaScJ4uMpIi_ndsYviSgf1QdvfcH0sEpXD4fQJ8tCGQ3ZTy_jYaDOm95vvp0Y37836A0S_P-pKbAlqUmmEVpeB8kBq0_LWGqXjKUVYI9LE5mx-A9-qYNjf3bV9VWcCNFD-GNVUugJpV2k0EJLHc9JaLav3RIrNmi0tvDLDElMfTi8pgw',
};
