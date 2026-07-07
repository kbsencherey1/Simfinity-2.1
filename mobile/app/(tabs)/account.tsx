import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TouristBackground } from '../../components/TouristBackground';
import { AvatarImage } from '../../components/AvatarImage';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp, CURRENCIES } from '../../context/AppContext';
import { API_BASE } from '../../config';

export default function AccountScreen() {
  const { user, isLoggedIn, logout, token, userId, avatarUrl, setAvatarUrl, currency, setCurrency } = useApp();
  const [uploading, setUploading] = useState(false);

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
        <TouristBackground />
        <SafeAreaView style={styles.centeredBox}>
          <View style={styles.lockPlaceholder}>
            <Text style={styles.lockPlaceholderText}>?</Text>
          </View>
          <Text style={styles.notLoggedTitle}>Sign in to access your account</Text>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && styles.signInBtnPressed]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/signup')} style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <Text style={styles.createLink}>Create Account</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TouristBackground />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
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
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedDotIcon}>✓</Text>
            </View>
          </Pressable>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{user.fullName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1} ellipsizeMode="middle">{user.email}</Text>
            <View style={styles.idVerifiedBadge}>
              <Text style={styles.idVerifiedText}>✓ Ghana ID Verified</Text>
            </View>
          </View>
        </View>

        {/* Menu List */}
        <View style={[glass.panel, styles.menuCard]}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => router.push('/personal-info')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.25)' }]}>
              <Text style={[styles.menuIconLetter, { color: COLORS.gold }]}>P</Text>
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>Personal Information</Text>
              <Text style={styles.menuSub}>Edit custom details and cellular configs</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <View style={styles.menuDivider} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255,215,0,0.06)', borderColor: 'rgba(255,215,0,0.15)' }]}>
              <Text style={[styles.menuIconLetter, { color: COLORS.textDim }]}>S</Text>
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>Privacy & Security</Text>
              <Text style={styles.menuSub}>ENCRYPTED CODES: SHA-256 enabled</Text>
            </View>
            <Text style={styles.menuArrowGreen}>✓</Text>
          </View>
        </View>

        {/* Currency Preference */}
        <View style={[glass.panel, styles.currencyCard]}>
          <Text style={styles.currencyCardTitle}>CURRENCY PREFERENCE</Text>
          <Text style={styles.currencyCardSub}>Prices display in your selected currency</Text>
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
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
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
  idVerifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  idVerifiedText: { color: COLORS.gold, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  menuCard: { overflow: 'hidden', padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemPressed: { backgroundColor: 'rgba(255,215,0,0.04)' },
  menuDivider: { height: 1, backgroundColor: 'rgba(77,71,50,0.25)' },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconLetter: { fontSize: 13, fontWeight: '900' },
  menuItemText: { flex: 1 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuSub: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  menuArrow: { color: COLORS.textDim, fontSize: 22, fontWeight: '700' },
  menuArrowGreen: { color: COLORS.greenLight, fontSize: 16, fontWeight: '700' },

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

  currencyCard: { padding: 16, gap: 10 },
  currencyCardTitle: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  currencyCardSub: { color: COLORS.textDim, fontSize: 11, marginTop: -6 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
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
