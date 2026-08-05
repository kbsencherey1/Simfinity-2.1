import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AvatarImage } from '../../components/AvatarImage';
import { SkeletonBox } from '../../components/Skeleton';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp, CURRENCIES } from '../../context/AppContext';
import { API_BASE } from '../../config';
import { TOURIST_SPOTS } from '../../data';
import { LANGUAGES } from '../../i18n/translations';

function formatPaymentDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatPlanLabel(planName: string | null, planId: string): string {
  if (planName) return planName;
  return planId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatAmount(amountGhs: number | null): string {
  if (amountGhs == null) return '—';
  return `GHS ${amountGhs.toFixed(2)}`;
}

function DropdownSection({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={[glass.panel, styles.dropdownCard]}>
      <Pressable style={styles.dropdownHeader} onPress={onToggle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownTitle}>{title}</Text>
          {subtitle && <Text style={styles.dropdownSub}>{subtitle}</Text>}
        </View>
        <Text style={styles.dropdownChevron}>{isOpen ? '⌃' : '⌄'}</Text>
      </Pressable>
      {isOpen && <View style={styles.dropdownBody}>{children}</View>}
    </View>
  );
}

export default function AccountScreen() {
  const {
    user, isLoggedIn, logout, token, userId, avatarUrl, setAvatarUrl, currency, setCurrency,
    pastEsims, payments, fetchEsims, fetchPayments, language, setLanguage, t,
  } = useApp();
  const [uploading, setUploading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [creditsVisible, setCreditsVisible] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [pastPlansOpen, setPastPlansOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllPastPlans, setShowAllPastPlans] = useState(false);

  useEffect(() => {
    if (token) {
      Promise.all([fetchEsims(token), fetchPayments(token)]).finally(() => setHistoryLoading(false));
    } else {
      setHistoryLoading(false);
    }
  }, [token, fetchEsims, fetchPayments]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setAvatarUrl(`${API_BASE}/api/user/avatar/${userId}?t=${Date.now()}`);
      } else {
        Alert.alert('Upload failed', 'Could not save photo. Please try again.');
      }
    } catch {
      Alert.alert('Upload failed', 'Network error. Make sure the server is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.centeredBox}>
          <View style={styles.lockPlaceholder}>
            <Text style={styles.lockPlaceholderText}>?</Text>
          </View>
          <Text style={styles.notLoggedTitle}>Sign in to access your account</Text>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && styles.signInBtnPressed]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.signInBtnText}>{t('common.signIn')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/signup')} style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <Text style={styles.createLink}>{t('common.createAccount')}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('account.title')}</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={[glass.panel, styles.profileCard]}>
          <Pressable onPress={handlePickImage} style={styles.avatarWrap} disabled={uploading}>
            <AvatarImage url={avatarUrl} size={64} />
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={COLORS.gold} />
              </View>
            ) : (
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✎</Text>
              </View>
            )}
            {user.emailVerified && (
              <View style={styles.verifiedDot}>
                <Text style={styles.verifiedDotIcon}>✓</Text>
              </View>
            )}
          </Pressable>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{user.fullName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1} ellipsizeMode="middle">{user.email}</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={[glass.panel, styles.menuCard]}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => router.push('/personal-info')}
          >
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>{t('account.personalInfo')}</Text>
              <Text style={styles.menuSub}>{t('account.personalInfoSub')}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => router.push('/privacy-policy')}
          >
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>{t('account.privacyPolicy')}</Text>
              <Text style={styles.menuSub}>{t('account.privacyPolicySub')}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>

        {/* Currency Preference */}
        <DropdownSection
          title={t('account.currency')}
          subtitle={`Currently ${currency} — tap to change`}
          isOpen={currencyOpen}
          onToggle={() => setCurrencyOpen(o => !o)}
        >
          <View style={styles.currencyGrid}>
            {CURRENCIES.map(c => (
              <Pressable
                key={c.code}
                style={({ pressed }) => [
                  styles.currencyChip,
                  currency === c.code && styles.currencyChipActive,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setCurrency(c.code)}
              >
                <Text style={[styles.currencyChipSym, currency === c.code && styles.currencyChipSymActive]}>
                  {c.symbol}
                </Text>
                <Text style={[styles.currencyChipCode, currency === c.code && styles.currencyChipCodeActive]}>
                  {c.code}
                </Text>
              </Pressable>
            ))}
          </View>
        </DropdownSection>

        {/* Language Preference */}
        <DropdownSection
          title={t('account.language')}
          subtitle={`Currently ${LANGUAGES.find(l => l.code === language)?.label ?? 'English'} — tap to change`}
          isOpen={languageOpen}
          onToggle={() => setLanguageOpen(o => !o)}
        >
          <View style={styles.currencyGrid}>
            {LANGUAGES.map(l => (
              <Pressable
                key={l.code}
                style={({ pressed }) => [
                  styles.currencyChip,
                  language === l.code && styles.currencyChipActive,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setLanguage(l.code)}
              >
                <Text style={[styles.currencyChipCode, language === l.code && styles.currencyChipCodeActive]}>
                  {l.nativeLabel}
                </Text>
              </Pressable>
            ))}
          </View>
        </DropdownSection>

        {/* Previous Plans */}
        <DropdownSection
          title={t('account.previousPlans')}
          subtitle={`${pastEsims.length} completed plan${pastEsims.length === 1 ? '' : 's'}`}
          isOpen={pastPlansOpen}
          onToggle={() => setPastPlansOpen(o => !o)}
        >
          {historyLoading ? (
            [0, 1].map(i => (
              <View key={i} style={[glass.panel, styles.pastSkeleton]}>
                <SkeletonBox width={160} height={13} />
                <SkeletonBox width={80} height={11} style={{ marginTop: 6 }} />
              </View>
            ))
          ) : pastEsims.length === 0 ? (
            <View style={[glass.panel, styles.emptyCard]}>
              <Text style={styles.emptyText}>No previous plan entries found.</Text>
            </View>
          ) : (
            <>
              {(showAllPastPlans ? pastEsims : pastEsims.slice(0, 2)).map(esim => (
                <View key={esim.id} style={[glass.panel, styles.pastCard]}>
                  <View style={styles.pastLeft}>
                    <View style={styles.pastDot} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.pastName} numberOfLines={2}>{esim.planName}</Text>
                      <Text style={styles.pastDate}>
                        {esim.completedDate ? `Completed on ${esim.completedDate}` : 'Completed'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pastRight}>
                    <Text style={styles.pastData}>{esim.totalDataGb}</Text>
                    <Text style={styles.pastStatus}>Usage Complete</Text>
                  </View>
                </View>
              ))}
              {pastEsims.length > 2 && (
                <Pressable
                  style={({ pressed }) => [styles.seeMoreBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => setShowAllPastPlans(s => !s)}
                >
                  <Text style={styles.seeMoreText}>
                    {showAllPastPlans
                      ? '↑ Show Less'
                      : `↓ See ${pastEsims.length - 2} more plan${pastEsims.length - 2 > 1 ? 's' : ''}`}
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </DropdownSection>

        {/* Payment History */}
        <DropdownSection
          title={t('account.paymentHistory')}
          subtitle={`${payments.length} payment${payments.length === 1 ? '' : 's'} on record`}
          isOpen={paymentsOpen}
          onToggle={() => setPaymentsOpen(o => !o)}
        >
          {historyLoading ? (
            [0, 1].map(i => (
              <View key={i} style={[glass.panel, styles.pastSkeleton]}>
                <SkeletonBox width={160} height={13} />
                <SkeletonBox width={80} height={11} style={{ marginTop: 6 }} />
              </View>
            ))
          ) : payments.length === 0 ? (
            <View style={[glass.panel, styles.emptyCard]}>
              <Text style={styles.emptyText}>No payment records found.</Text>
            </View>
          ) : (
            <>
              {(showAllPayments ? payments : payments.slice(0, 2)).map(payment => (
                <View key={payment.id} style={[glass.panel, styles.paymentCard]}>
                  <View style={styles.paymentLeft}>
                    <View style={styles.paymentIconCircle}>
                      <Text style={styles.paymentIconText}>₵</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentPlanName} numberOfLines={1}>
                        {formatPlanLabel(payment.planName, payment.planId)}
                      </Text>
                      <Text style={styles.paymentDate}>{formatPaymentDate(payment.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>{formatAmount(payment.amountGhs)}</Text>
                    <View style={styles.paymentStatusBadge}>
                      <Text style={styles.paymentStatusText}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {payments.length > 2 && (
                <Pressable
                  style={({ pressed }) => [styles.seeMoreBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => setShowAllPayments(s => !s)}
                >
                  <Text style={styles.seeMoreText}>
                    {showAllPayments
                      ? '↑ Show Less'
                      : `↓ See ${payments.length - 2} more payment${payments.length - 2 > 1 ? 's' : ''}`}
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </DropdownSection>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>{t('account.logOut')}</Text>
        </Pressable>

        <Pressable onPress={() => setCreditsVisible(true)} style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Text style={styles.creditsLink}>Photo Credits</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={creditsVisible} transparent animationType="fade" onRequestClose={() => setCreditsVisible(false)}>
        <Pressable style={styles.creditsBackdrop} onPress={() => setCreditsVisible(false)}>
          <Pressable style={styles.creditsSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.creditsTitle}>Photo Credits</Text>
            {TOURIST_SPOTS.filter(s => s.attribution).map(s => (
              <View key={s.id} style={styles.creditsRow}>
                <Text style={styles.creditsSpot}>{s.name}</Text>
                <Text style={styles.creditsAttribution}>{s.attribution}</Text>
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [styles.creditsCloseBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setCreditsVisible(false)}
            >
              <Text style={styles.creditsCloseBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  centeredBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  lockPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockPlaceholderText: { color: COLORS.gold, fontSize: 28, fontWeight: '700' },
  notLoggedTitle: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center' },
  signInBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  signInBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  signInBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  createLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  avatarWrap: { position: 'relative' },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeText: { color: COLORS.gold, fontSize: 10, fontWeight: '700' },
  verifiedDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedDotIcon: { color: '#000', fontSize: 9, fontWeight: '900' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileEmail: { color: COLORS.gold, fontSize: 12, fontWeight: '500' },

  menuCard: { overflow: 'hidden', padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemPressed: { backgroundColor: 'rgba(255,215,0,0.04)' },
  menuDivider: { height: 1, backgroundColor: 'rgba(77,71,50,0.25)' },
  menuItemText: { flex: 1 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuSub: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  menuArrow: { color: COLORS.textDim, fontSize: 22, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(204,78,60,0.4)',
    backgroundColor: 'rgba(204,78,60,0.1)',
  },
  logoutBtnPressed: { backgroundColor: 'rgba(204,78,60,0.22)', transform: [{ scale: 0.98 }] },
  logoutText: { color: '#cc4e3c', fontWeight: '700', fontSize: 15 },

  creditsLink: { color: COLORS.textDim, fontSize: 10, textAlign: 'center', marginTop: 4 },
  creditsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  creditsSheet: {
    backgroundColor: '#131313',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  creditsTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  creditsRow: { gap: 2 },
  creditsSpot: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  creditsAttribution: { color: COLORS.textMuted, fontSize: 11 },
  creditsCloseBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  creditsCloseBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },

  dropdownCard: { padding: 0, overflow: 'hidden' },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  dropdownTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dropdownSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  dropdownChevron: { color: COLORS.gold, fontSize: 16, fontWeight: '700' },
  dropdownBody: { padding: 16, paddingTop: 0, gap: 8 },

  pastSkeleton: { padding: 14, gap: 6 },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },

  pastCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  pastLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  pastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textDim },
  pastName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pastDate: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  pastRight: { alignItems: 'flex-end' },
  pastData: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  pastStatus: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  paymentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconText: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  paymentPlanName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paymentDate: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  paymentStatusBadge: {
    backgroundColor: 'rgba(0,107,63,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,107,63,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  paymentStatusText: { color: COLORS.greenLight, fontSize: 9, fontWeight: '800' },

  seeMoreBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.04)',
  },
  seeMoreText: { color: COLORS.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    minWidth: 56,
  },
  currencyChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,215,0,0.12)',
  },
  currencyChipSym: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  currencyChipSymActive: { color: COLORS.gold },
  currencyChipCode: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  currencyChipCodeActive: { color: COLORS.gold },
});
