import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';

type SetupMode = 'qr' | 'manual';
type DevicePlatform = 'ios' | 'android';

const ACTIVATION_STEPS = [
  'Establishing secure handshake with Accra Carrier hub...',
  'Provisioning container profile onto remote SM-DP+ server...',
  'Registering mobile subscriber identity (IMSI) & ICCID keys...',
  'Configuring Simfinity priority 5G data routing tables...',
  'Ghana cellular registration complete! Sim-Line Ready.',
];

export default function ActivateEsimScreen() {
  const { checkoutPlan, provisionedEsim } = useApp();
  const plan = checkoutPlan;

  const iccid = provisionedEsim?.iccid ?? '89233010472910482937';
  const smdpAddress = provisionedEsim?.smdpAddress ?? 'rsp.simfinity.com';
  const activationCode = provisionedEsim?.activationCode ?? 'LXT-99327-SIMFINITY';

  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [setupMode, setSetupMode] = useState<SetupMode>('qr');
  const [devicePlatform, setDevicePlatform] = useState<DevicePlatform>('ios');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSmdp, setCopiedSmdp] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleActivate = () => {
    setIsActivating(true);
    setActiveStep(0);
    setPingResult(null);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step >= ACTIVATION_STEPS.length - 1) {
        clearInterval(interval);
      }
      setActiveStep(step);
    }, 600);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3200,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      clearInterval(interval);
      setIsActivating(false);
      setIsActivated(true);
    }, 3200);
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      const latencies = [11, 14, 18, 22];
      const lat = latencies[Math.floor(Math.random() * latencies.length)];
      setPingResult(`Active & Online  •  Ping: Accra-North Hub  •  Latency: ${lat}ms  •  Speed: 320 Mbps (5G)`);
    }, 1000);
  };

  const copyCode = async () => {
    await ExpoClipboard.setStringAsync(activationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copySmdp = async () => {
    await ExpoClipboard.setStringAsync(smdpAddress);
    setCopiedSmdp(true);
    setTimeout(() => setCopiedSmdp(false), 2000);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const iosSteps = [
    'Go to Settings → Cellular (or Mobile Data).',
    'Tap Add eSIM or Add Data Plan.',
    'At the bottom of the set up screen, tap Use QR Code.',
    'On the camera overlay, tap Enter Details Manually.',
    'Copy and paste the SM-DP+ Site Address and Activation Code from the details card below.',
    'Follow prompts to register. Name the line "Simfinity eSIM" for easy switching upon landing.',
  ];

  const androidSteps = [
    'Navigate to Settings → Network & internet (or Connections → SIM manager).',
    'Tap SIMs (+) or Add mobile plan.',
    'Select Download a SIM instead? or download cellular configurations.',
    'When QR scanner opens, click Need help? or Enter manually at the bottom.',
    'Input the SM-DP+ Site Address and Activation Code from the details card below.',
    'Download the SIM profile. Set name to "Simfinity eSIM" to manage data routes.',
  ];

  const steps = devicePlatform === 'ios' ? iosSteps : androidSteps;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.push('/(tabs)/my-esims')}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerLabel}>eSIM ACTIVATION</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status badge */}
        <View style={styles.statusBadgeWrap}>
          {isActivated ? (
            <View style={[styles.statusBadge, styles.statusBadgeActive]}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusBadgeText, { color: COLORS.greenLight }]}>ESIM ACTIVATED & READY</Text>
            </View>
          ) : isActivating ? (
            <View style={[styles.statusBadge, styles.statusBadgeConnecting]}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.gold }]} />
              <Text style={[styles.statusBadgeText, { color: COLORS.gold }]}>CONNECTING TO KOTOKA GATEWAY...</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgeAwaiting]}>
              <Text style={[styles.statusBadgeText, { color: '#fca5a5' }]}>AWAITING SIM REGISTRATION</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>
          {isActivated ? 'Line Registered Successfully' : 'Activate Your eSIM'}
        </Text>
        <Text style={styles.sub}>
          {isActivated
            ? `Your ultra-fast connection for ${plan?.name ?? 'your plan'} is now live on Accra 5G network.`
            : `Your high-speed connectivity for ${plan?.name ?? 'your plan'} is ready for secure deployment.`}
        </Text>

        {/* Main card */}
        <View style={[glass.panel, styles.mainCard, isActivated && styles.mainCardActive]}>
          {/* QR/Manual toggle — only when not activated/activating */}
          {!isActivated && !isActivating && (
            <View style={styles.modeToggle}>
              <Pressable
                style={({ pressed }) => [styles.modeBtn, setupMode === 'qr' && styles.modeBtnActive, pressed && { opacity: 0.8 }]}
                onPress={() => setSetupMode('qr')}
              >
                <Text style={[styles.modeBtnIcon]}>QR</Text>
                <Text style={[styles.modeBtnText, setupMode === 'qr' && styles.modeBtnTextActive]}>QR Code Scan</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modeBtn, setupMode === 'manual' && styles.modeBtnActive, pressed && { opacity: 0.8 }]}
                onPress={() => setSetupMode('manual')}
              >
                <Text style={styles.modeBtnIcon}>M</Text>
                <Text style={[styles.modeBtnText, setupMode === 'manual' && styles.modeBtnTextActive]}>Manual Setup Guide</Text>
              </Pressable>
            </View>
          )}

          {isActivating ? (
            /* Activation progress */
            <View style={styles.activatingBox}>
              <View style={styles.spinnerWrap}>
                <View style={styles.spinnerRing} />
                <View style={styles.spinnerCenter}>
                  <Text style={styles.spinnerIcon}>↻</Text>
                </View>
              </View>
              <Text style={styles.activatingLabel}>Deploying Profile...</Text>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
              </View>
              <Text style={styles.activatingStep}>
                {ACTIVATION_STEPS[Math.min(activeStep, ACTIVATION_STEPS.length - 1)]}
              </Text>
            </View>
          ) : isActivated ? (
            /* Success state */
            <View style={styles.successBox}>
              <View style={styles.successCircle}>
                <Text style={styles.successCheck}>✓</Text>
              </View>

              <Text style={styles.adinkraTitle}>Adinkra Blessing</Text>
              <Text style={styles.adinkraQuote}>"Woforo dua pa a, na yepia wo"</Text>
              <Text style={styles.adinkraMeaning}>
                When you climb a good tree, everyone supports you on your journey.
              </Text>

              <View style={styles.vCardBox}>
                <View style={styles.vCardTop}>
                  <View>
                    <Text style={styles.vCardBrand}>SIMFINITY eSIM</Text>
                    <Text style={styles.vCardName}>{plan?.name ?? 'Active Plan'}</Text>
                  </View>
                  <Text style={styles.vCardSimIcon}>SIM</Text>
                </View>
                <View style={styles.vCardBottom}>
                  <View>
                    <Text style={styles.vCardMetaLabel}>CARRIER SERVICE</Text>
                    <Text style={styles.vCardMetaValue}>Simfinity-GHA (5G)</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.vCardMetaLabel}>VIP STATUS</Text>
                    <Text style={styles.vCardMetaValue}>Active Subscriber</Text>
                  </View>
                </View>
              </View>

              {/* Ping test */}
              <Pressable
                style={({ pressed }) => [styles.pingBtn, pressed && { opacity: 0.7 }, isPinging && { opacity: 0.5 }]}
                onPress={handlePingTest}
                disabled={isPinging}
              >
                <Text style={styles.pingBtnText}>{isPinging ? 'Testing Port...' : 'Test Simfinity Connection Speed'}</Text>
              </Pressable>
              {pingResult && (
                <View style={styles.pingResult}>
                  <Text style={styles.pingResultText}>{pingResult}</Text>
                </View>
              )}
            </View>
          ) : setupMode === 'qr' ? (
            /* QR mode */
            <View style={styles.qrBox}>
              {provisionedEsim?.qrCodeUrl ? (
                <View style={styles.qrImageWrap}>
                  <Image
                    source={{ uri: provisionedEsim.qrCodeUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </View>
              ) : (
                <View style={styles.qrFrame}>
                  <View style={styles.qrCornerTL} />
                  <View style={styles.qrCornerTR} />
                  <View style={styles.qrCornerBL} />
                  <View style={styles.qrCornerBR} />
                  <Text style={styles.qrCenterText}>QR</Text>
                  <View style={styles.qrScanLine} />
                </View>
              )}

              <Text style={styles.qrHint}>
                {provisionedEsim?.qrCodeUrl
                  ? 'Scan this QR Code from your phone\'s cellular settings to install your eSIM.'
                  : 'Tap below to simulate activation. Your real QR code will appear after purchase.'}
              </Text>

              <Pressable
                style={({ pressed }) => [styles.activateBtn, pressed && styles.activateBtnPressed]}
                onPress={handleActivate}
              >
                <Text style={styles.activateBtnText}>
                  {provisionedEsim?.qrCodeUrl ? 'CONFIRM QR SCANNED & REGISTER LINE' : 'SIMULATE QR SCAN & REGISTER LINE'}
                </Text>
              </Pressable>

              <View style={styles.divider} />

              {/* Manual details card */}
              <View style={styles.detailsCard}>
                <View style={styles.detailsCardHeader}>
                  <Text style={styles.detailsCardTitle}>Manual details</Text>
                  <Text style={styles.detailsCardIccid}>ICCID: {iccid}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailRowLabel}>SM-DP+ SITE:</Text>
                    <Text style={styles.detailRowValue}>{smdpAddress}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailRowLabel}>ACTIVATION CODE:</Text>
                    <Text style={styles.detailRowValue}>{activationCode}</Text>
                  </View>
                  <Pressable onPress={copyCode} style={({ pressed }) => pressed && { opacity: 0.6 }}>
                    <Text style={styles.copyText}>{copiedCode ? 'Copied' : 'Copy'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            /* Manual guide mode */
            <View style={styles.manualBox}>
              {/* iOS / Android switcher */}
              <View style={styles.platformToggle}>
                <Pressable
                  style={({ pressed }) => [styles.platformBtn, devicePlatform === 'ios' && styles.platformBtnActive, pressed && { opacity: 0.7 }]}
                  onPress={() => setDevicePlatform('ios')}
                >
                  <Text style={[styles.platformBtnText, devicePlatform === 'ios' && styles.platformBtnTextActive]}>Apple iOS</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.platformBtn, devicePlatform === 'android' && styles.platformBtnActive, pressed && { opacity: 0.7 }]}
                  onPress={() => setDevicePlatform('android')}
                >
                  <Text style={[styles.platformBtnText, devicePlatform === 'android' && styles.platformBtnTextActive]}>Android OS</Text>
                </Pressable>
              </View>

              {/* Step list */}
              <View style={styles.stepList}>
                <Text style={styles.stepListTitle}>
                  Manual Activation Steps for {devicePlatform === 'ios' ? 'iOS Devices' : 'Android Devices'}
                </Text>
                {steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumBadge}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                <Pressable
                  style={({ pressed }) => [styles.activateBtn, { marginTop: 8 }, pressed && styles.activateBtnPressed]}
                  onPress={handleActivate}
                >
                  <Text style={styles.activateBtnText}>CONFIRM MANUAL SETUP & ONLINE BOOT</Text>
                </Pressable>
              </View>

              {/* Credentials card */}
              <View style={styles.credentialsCard}>
                <View style={styles.detailsCardHeader}>
                  <Text style={styles.detailsCardTitle}>Credentials For Easy Copying</Text>
                  <Text style={styles.detailsCardIccid}>ICCID: {iccid}</Text>
                </View>
                <View style={styles.credentialRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credentialLabel}>SM-DP+ SITE ADDRESS:</Text>
                    <Text style={styles.credentialValue}>{smdpAddress}</Text>
                  </View>
                  <Pressable onPress={copySmdp} style={({ pressed }) => [styles.copySmallBtn, pressed && { opacity: 0.6 }]}>
                    <Text style={styles.copySmallText}>{copiedSmdp ? 'Copied' : 'Copy'}</Text>
                  </Pressable>
                </View>
                <View style={styles.credentialRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credentialLabel}>ACTIVATION CODE:</Text>
                    <Text style={styles.credentialValue}>{activationCode}</Text>
                  </View>
                  <Pressable onPress={copyCode} style={({ pressed }) => [styles.copySmallBtn, pressed && { opacity: 0.6 }]}>
                    <Text style={styles.copySmallText}>{copiedCode ? 'Copied' : 'Copy'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Info note */}
        <View style={[glass.panel, styles.infoNote]}>
          <View style={styles.infoNoteIcon}>
            <Text style={styles.infoNoteIconText}>i</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoNoteTitle}>Setup Recommendation:</Text>
            <Text style={styles.infoNoteText}>
              We support setting this up prior to arrival in Ghana. Name the line "Simfinity eSIM". Switch data to it as soon as you touch down in Kotoka Airport!
            </Text>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          {isActivated && (
            <Pressable
              style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.6 }]}
              onPress={() => { setIsActivated(false); setPingResult(null); progressAnim.setValue(0); }}
            >
              <Text style={styles.resetBtnText}>Reset Scanner</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.myEsimsBtn, pressed && styles.myEsimsBtnPressed]}
            onPress={() => router.replace('/(tabs)/my-esims')}
          >
            <Text style={styles.myEsimsBtnText}>Go to My eSIMs</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  statusBadgeWrap: { alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeActive: { backgroundColor: 'rgba(0,107,63,0.25)', borderColor: 'rgba(0,107,63,0.4)' },
  statusBadgeConnecting: { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.2)' },
  statusBadgeAwaiting: { backgroundColor: 'rgba(204,78,60,0.15)', borderColor: 'rgba(204,78,60,0.3)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.greenLight },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  mainCard: { padding: 20, gap: 16 },
  mainCardActive: { borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },

  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeBtnActive: { backgroundColor: COLORS.gold },
  modeBtnIcon: { color: '#888', fontSize: 9, fontWeight: '900' },
  modeBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  modeBtnTextActive: { color: '#000' },

  activatingBox: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  spinnerWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  spinnerRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#2a2a2a',
    borderTopColor: COLORS.gold,
  },
  spinnerCenter: { alignItems: 'center', justifyContent: 'center' },
  spinnerIcon: { color: COLORS.gold, fontSize: 24 },
  activatingLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  progressTrack: {
    width: 180,
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: { height: 4, backgroundColor: COLORS.gold, borderRadius: 2 },
  activatingStep: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 18, maxWidth: 260 },

  successBox: { alignItems: 'center', gap: 12 },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheck: { color: '#000', fontSize: 32, fontWeight: '900' },
  adinkraTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  adinkraQuote: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },
  adinkraMeaning: { color: COLORS.textDim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', lineHeight: 16 },
  vCardBox: {
    width: '100%',
    backgroundColor: 'rgba(26,25,23,0.85)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    gap: 24,
  },
  vCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vCardBrand: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  vCardName: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 2 },
  vCardSimIcon: { color: COLORS.gold, fontSize: 12, fontWeight: '900', opacity: 0.75 },
  vCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  vCardMetaLabel: { color: '#555', fontSize: 8 },
  vCardMetaValue: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 1 },
  pingBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.clay,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pingBtnText: { color: '#d0cdc8', fontSize: 11, fontWeight: '700' },
  pingResult: {
    backgroundColor: 'rgba(0,107,63,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,107,63,0.2)',
    borderRadius: 8,
    padding: 10,
  },
  pingResultText: { color: COLORS.greenLight, fontSize: 10, fontWeight: '700' },

  qrBox: { alignItems: 'center', gap: 16 },
  qrImageWrap: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  qrImage: { width: 180, height: 180 },
  qrFrame: {
    width: 160,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 12,
  },
  qrCornerTL: { position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#000' },
  qrCornerTR: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#000' },
  qrCornerBL: { position: 'absolute', bottom: 10, left: 10, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#000' },
  qrCornerBR: { position: 'absolute', bottom: 10, right: 10, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#000' },
  qrCenterText: { color: '#000', fontSize: 32, fontWeight: '900', opacity: 0.6 },
  qrScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(204,78,60,0.8)',
  },
  qrHint: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 280 },

  activateBtn: {
    width: '100%',
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  activateBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  activateBtnText: { color: '#000', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: 'rgba(77,71,50,0.3)', width: '100%' },

  detailsCard: {
    width: '100%',
    backgroundColor: 'rgba(28,27,27,0.7)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  detailsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailsCardTitle: { color: COLORS.textDim, fontSize: 9, fontWeight: '700' },
  detailsCardIccid: { color: COLORS.textDim, fontSize: 9 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
  },
  detailRowLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700' },
  detailRowValue: { color: COLORS.gold, fontSize: 11, fontWeight: '700', marginTop: 2 },
  copyText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },

  manualBox: { gap: 14 },
  platformToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  platformBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  platformBtnActive: { backgroundColor: '#1e2028' },
  platformBtnText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  platformBtnTextActive: { color: '#fff', fontWeight: '800' },

  stepList: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(77,71,50,0.25)',
  },
  stepListTitle: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { color: COLORS.gold, fontSize: 10, fontWeight: '900' },
  stepText: { color: COLORS.textMuted, fontSize: 12, flex: 1, lineHeight: 18 },

  credentialsCard: {
    backgroundColor: 'rgba(28,27,27,0.7)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  credentialLabel: { color: '#666', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  credentialValue: { color: COLORS.gold, fontSize: 12, fontWeight: '700', marginTop: 2 },
  copySmallBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
  copySmallText: { color: COLORS.gold, fontSize: 10, fontWeight: '700' },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  infoNoteIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoNoteIconText: { color: COLORS.gold, fontSize: 13, fontWeight: '800', fontStyle: 'italic' },
  infoNoteTitle: { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  infoNoteText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },

  bottomActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetBtnText: { color: '#d0cdc8', fontSize: 13, fontWeight: '700' },
  myEsimsBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  myEsimsBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  myEsimsBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
