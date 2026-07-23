import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { INITIAL_PLANS } from '../data';

import { API_BASE } from '../config';

export default function CheckoutScreen() {
  const { checkoutPlan, user, token, addSubscription, setProvisionedEsim, topUpEsim, setTopUpEsim, fetchEsims } = useApp();
  const plan = checkoutPlan ?? INITIAL_PLANS[2];

  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const doVerify = async (ref: string) => {
    setIsVerifying(true);
    setPayError(null);
    try {
      const body: Record<string, unknown> = {
        planId: plan.id,
        planName: plan.name,
        dataGb: plan.dataGb,
        validityDays: plan.validityDays,
        amountGhs: plan.priceGhs,
      };
      if (topUpEsim?.iccid) {
        body.targetIccid = topUpEsim.iccid;
      }
      const res = await fetch(`${API_BASE}/api/paystack/verify/${ref}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        if (data.isTopUp) {
          setTopUpEsim(null);
          if (token) fetchEsims(token);
          Alert.alert(
            'Data Added',
            `Your data top-up for "${plan.name}" was successful!`,
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/my-esims') }]
          );
        } else {
          setProvisionedEsim(data.esim);
          addSubscription(plan);
          router.push('/activate-esim');
        }
      } else {
        setPayError(data?.error || `Payment not yet confirmed (status ${res.status}). Complete the transaction and try again.`);
      }
    } catch {
      setPayError('Verification error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const startPayment = async () => {
    setIsInitializing(true);
    setPayError(null);
    try {
      const res = await fetch(`${API_BASE}/api/paystack/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: user.email,
          amountGhs: plan.priceGhs,
          planId: plan.id,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const ref = data.reference;
        const authUrl = data.authorization_url;
        setPaymentUrl(authUrl);
        setReference(ref);
        // Open Paystack in in-app browser; auto-closes when Paystack redirects to simfinity://
        await WebBrowser.openAuthSessionAsync(authUrl, 'simfinity://');
        // Auto-verify once the browser closes (via redirect or manual close)
        await doVerify(ref);
      } else {
        setPayError(data?.error || `Failed to initialize payment (status ${res.status}).`);
      }
    } catch {
      setPayError('Cannot reach the server. Check your network or that the backend is running.');
    } finally {
      setIsInitializing(false);
    }
  };

  const verifyPayment = () => {
    if (reference) doVerify(reference);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerLabel}>{topUpEsim ? 'TOP UP DATA' : 'SECURE CHECKOUT'}</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Checkout Summary</Text>
        <Text style={styles.sub}>Verify your eSIM details and complete your secure transaction.</Text>

        {/* Plan card */}
        <View style={[glass.panel, styles.planCard]}>
          <View style={styles.planHeader}>
            <View style={styles.planNameCol}>
              <Text style={styles.planTier}>PREMIUM TIER</Text>
              <Text style={styles.planName}>{plan.name}</Text>
            </View>
            <View style={styles.planPriceBox}>
              <Text style={styles.planPrice} numberOfLines={1} adjustsFontSizeToFit>GHS {plan.priceGhs}</Text>
              <Text style={styles.planPriceAlt}>~ ${plan.priceUsd} USD</Text>
            </View>
          </View>

          <View style={styles.planStatsRow}>
            <View style={styles.planStat}>
              <Text style={styles.planStatValue}>{plan.dataGb}</Text>
              <Text style={styles.planStatLabel}>Data</Text>
            </View>
            <View style={styles.planStat}>
              <Text style={styles.planStatValue}>{plan.validityDays}d</Text>
              <Text style={styles.planStatLabel}>Validity</Text>
            </View>
            <View style={styles.planStat}>
              <Text style={styles.planStatValue} numberOfLines={2}>{plan.speed}</Text>
              <Text style={styles.planStatLabel}>Speed</Text>
            </View>
          </View>
        </View>

        {/* Specs bento */}
        <View style={styles.bentoRow}>
          {[plan.speed, '24/7 Priority Support', 'Instant Setup'].map(text => (
            <View key={text} style={[glass.panel, styles.bento]}>
              <Text style={styles.bentoText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Cultural insight */}
        <View style={[glass.panel, styles.culturalCard]}>
          <Text style={styles.culturalLabel}>CULTURAL INSIGHT</Text>
          <Text style={styles.culturalTitle}>{plan.culturalInsightTitle}</Text>
          <Text style={styles.culturalDesc}>{plan.culturalInsightDesc}</Text>
        </View>

        {/* Payment feedback */}
        {reference && (
          <View style={[glass.panel, styles.paymentBox]}>
            <View style={styles.paymentPingRow}>
              <View style={styles.paymentPingDot} />
              <Text style={styles.paymentTitle}>Paystack Secure Gateway Active</Text>
            </View>
            <Text style={styles.paymentSub}>
              A secure Paystack sandbox payment page opened for{' '}
              <Text style={{ color: '#fff', fontWeight: '700' }}>GHS {plan.priceGhs}</Text>.
              Complete it, then tap Verify.
            </Text>
            <View style={styles.paymentBtns}>
              <Pressable
                style={({ pressed }) => [styles.reopenBtn, pressed && { opacity: 0.7 }]}
                onPress={() => paymentUrl && WebBrowser.openAuthSessionAsync(paymentUrl, 'simfinity://')}
              >
                <Text style={styles.reopenBtnText}>Reopen Portal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.verifyBtn, isVerifying && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
                onPress={verifyPayment}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify Payment</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {payError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{payError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA — shows Pay when no reference, Verify when reference exists */}
      <View style={styles.stickyBar}>
        {!reference ? (
          <Pressable
            style={({ pressed }) => [styles.payBtn, isInitializing && { opacity: 0.6 }, pressed && styles.payBtnPressed]}
            onPress={startPayment}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.payBtnText}>{topUpEsim ? `Top Up GHS ${plan.priceGhs}` : `Secure Pay GHS ${plan.priceGhs}`}</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.payBtn, isVerifying && { opacity: 0.6 }, pressed && styles.payBtnPressed]}
            onPress={verifyPayment}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.payBtnText}>Verify Payment & Get eSIM</Text>
            )}
          </Pressable>
        )}
        <Text style={styles.stickyNote}>Encrypted & Secure checkout powered by Paystack</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(19,19,19,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 120 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  planCard: { padding: 18, gap: 16 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  planNameCol: { flex: 1 },
  planTier: { color: '#cc4e3c', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  planName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  planPriceBox: { alignItems: 'flex-end', flexShrink: 0, maxWidth: '42%' },
  planPrice: { color: COLORS.gold, fontSize: 20, fontWeight: '800' },
  planPriceAlt: { color: COLORS.textDim, fontSize: 10 },
  planStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14,
  },
  planStat: { alignItems: 'center', gap: 6, flex: 1 },
  planStatValue: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  planStatLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '600' },

  bentoRow: { flexDirection: 'row', gap: 10 },
  bento: { flex: 1, padding: 12, alignItems: 'center', gap: 6 },
  bentoText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },

  culturalCard: { padding: 16, gap: 10, borderLeftWidth: 3, borderLeftColor: COLORS.gold },
  culturalLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  culturalTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  culturalDesc: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17 },

  paymentBox: { padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  paymentPingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentPingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  paymentTitle: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  paymentSub: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  paymentBtns: { flexDirection: 'row', gap: 10 },
  reopenBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    alignItems: 'center',
  },
  reopenBtnText: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  verifyBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.gold, alignItems: 'center' },
  verifyBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },

  errorBox: {
    backgroundColor: 'rgba(204,78,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(204,78,60,0.3)',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: '#cc4e3c', fontSize: 12, lineHeight: 18 },

  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: 'rgba(19,19,19,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,71,50,0.3)',
    gap: 8,
    alignItems: 'center',
  },
  payBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  payBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.98 }] },
  payBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  stickyNote: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
});
