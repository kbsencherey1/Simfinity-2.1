import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { INITIAL_PLANS } from '../data';

const API_BASE = '';

export default function CheckoutScreen() {
  const { checkoutPlan, user, addSubscription, setProvisionedEsim } = useApp();
  const plan = checkoutPlan ?? INITIAL_PLANS[2];

  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const startPayment = async () => {
    setIsInitializing(true);
    setPayError(null);
    try {
      const res = await fetch(`${API_BASE}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amountGhs: plan.priceGhs,
          planId: plan.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentUrl(data.authorization_url);
        setReference(data.reference);
        Linking.openURL(data.authorization_url);
      } else {
        setPayError(data.error || 'Failed to initialize payment.');
      }
    } catch {
      setPayError('Network error. Make sure the server is running.');
    } finally {
      setIsInitializing(false);
    }
  };

  const verifyPayment = async () => {
    if (!reference) return;
    setIsVerifying(true);
    setPayError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/paystack/verify/${reference}?planId=${plan.id}&email=${encodeURIComponent(user.email)}&dataGb=${parseInt(plan.dataGb)}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setProvisionedEsim(data.esim);
        addSubscription(plan);
        router.push('/activate-esim');
      } else {
        setPayError(data.error || 'Verification failed. Complete the transaction first.');
      }
    } catch {
      setPayError('Verification error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>SECURE CHECKOUT</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Checkout Summary</Text>
        <Text style={styles.sub}>Verify your eSIM details and complete your secure transaction.</Text>

        {/* Plan card */}
        <View style={[glass.panel, styles.planCard]}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planTier}>PREMIUM TIER</Text>
              <Text style={styles.planName}>{plan.name}</Text>
            </View>
            <View style={styles.planPriceBox}>
              <Text style={styles.planPrice}>GHS {plan.priceGhs}</Text>
              <Text style={styles.planPriceAlt}>~ ${plan.priceUsd} USD</Text>
            </View>
          </View>

          <View style={styles.planStatsRow}>
            <View style={styles.planStat}>
              <Text style={styles.planStatIcon}>🗄️</Text>
              <Text style={styles.planStatValue}>{plan.dataGb}</Text>
              <Text style={styles.planStatLabel}>Data</Text>
            </View>
            <View style={styles.planStat}>
              <Text style={styles.planStatIcon}>📅</Text>
              <Text style={styles.planStatValue}>{plan.validityDays}d</Text>
              <Text style={styles.planStatLabel}>Validity</Text>
            </View>
            <View style={styles.planStat}>
              <Text style={styles.planStatIcon}>📶</Text>
              <Text style={styles.planStatValue}>{plan.speed}</Text>
              <Text style={styles.planStatLabel}>Speed</Text>
            </View>
          </View>
        </View>

        {/* Specs bento */}
        <View style={styles.bentoRow}>
          {[
            { icon: '📡', text: plan.speed },
            { icon: '🎧', text: '24/7 Support' },
            { icon: '⚡', text: 'Instant Setup' },
          ].map(s => (
            <View key={s.text} style={[glass.panel, styles.bento]}>
              <Text style={styles.bentoIcon}>{s.icon}</Text>
              <Text style={styles.bentoText}>{s.text}</Text>
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
            <Text style={styles.paymentTitle}>🔑 Paystack Gateway Active</Text>
            <Text style={styles.paymentSub}>
              A payment page opened for <Text style={{ color: '#fff', fontWeight: '700' }}>GHS {plan.priceGhs}</Text>.
              Complete it, then tap Verify.
            </Text>
            <View style={styles.paymentBtns}>
              <TouchableOpacity
                style={styles.reopenBtn}
                onPress={() => paymentUrl && Linking.openURL(paymentUrl)}
              >
                <Text style={styles.reopenBtnText}>Reopen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.verifyBtn, isVerifying && { opacity: 0.6 }]}
                onPress={verifyPayment}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {payError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {payError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      {!reference && (
        <View style={styles.stickyBar}>
          <TouchableOpacity
            style={[styles.payBtn, isInitializing && { opacity: 0.6 }]}
            onPress={startPayment}
            disabled={isInitializing}
            activeOpacity={0.85}
          >
            {isInitializing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.payBtnText}>Pay GHS {plan.priceGhs} via Paystack</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  scroll: { padding: 16, gap: 14, paddingBottom: 100 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  planCard: { padding: 18, gap: 16 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planTier: { color: '#cc4e3c', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  planName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  planPriceBox: { alignItems: 'flex-end' },
  planPrice: { color: COLORS.gold, fontSize: 20, fontWeight: '800' },
  planPriceAlt: { color: COLORS.textDim, fontSize: 10 },
  planStatsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 14 },
  planStat: { alignItems: 'center', gap: 4 },
  planStatIcon: { fontSize: 20 },
  planStatValue: { color: '#fff', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  planStatLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '600' },
  bentoRow: { flexDirection: 'row', gap: 10 },
  bento: { flex: 1, padding: 12, alignItems: 'center', gap: 4 },
  bentoIcon: { fontSize: 20 },
  bentoText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  culturalCard: { padding: 16, gap: 6, borderLeftWidth: 3, borderLeftColor: COLORS.gold },
  culturalLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  culturalTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  culturalDesc: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17 },
  paymentBox: { padding: 16, gap: 10 },
  paymentTitle: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
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
    backgroundColor: 'rgba(19,19,19,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,71,50,0.3)',
  },
  payBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
