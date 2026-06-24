import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp } from '../../context/AppContext';
import { HERITAGE_IMAGES } from '../../data';

export default function AccountScreen() {
  const { user, isLoggedIn, setIsLoggedIn } = useApp();

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.replace('/login');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.centeredBox}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.notLoggedTitle}>Sign in to access your account</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.createLink}>Create Account</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={[glass.panel, styles.profileCard]}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: HERITAGE_IMAGES.avatarKwame }}
              style={styles.avatar}
            />
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedDotIcon}>✓</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.fullName}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.idVerifiedBadge}>
              <Text style={styles.idVerifiedText}>✓ Ghana ID Verified</Text>
            </View>
          </View>
        </View>

        {/* Menu List */}
        <View style={[glass.panel, styles.menuCard]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/personal-info')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>Personal Information</Text>
              <Text style={styles.menuSub}>Edit custom details and cellular configs</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/travel-docs')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📒</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>Travel Documents</Text>
              <Text style={styles.menuSub}>View passports, active entry visas, vaccine records</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuLabel}>Privacy & Security</Text>
              <Text style={styles.menuSub}>ENCRYPTED CODES: SHA-256 enabled</Text>
            </View>
            <Text style={styles.menuArrowGray}>✓</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  centeredBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  lockIcon: { fontSize: 48 },
  notLoggedTitle: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center' },
  signInBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  signInBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  createLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,19,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.clay,
  },
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
  menuDivider: { height: 1, backgroundColor: 'rgba(77,71,50,0.25)', marginHorizontal: 0 },
  menuIcon: { fontSize: 22 },
  menuItemText: { flex: 1 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuSub: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  menuArrow: { color: COLORS.textDim, fontSize: 22, fontWeight: '700' },
  menuArrowGray: { color: COLORS.greenLight, fontSize: 16, fontWeight: '700' },

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
  logoutIcon: { fontSize: 18 },
  logoutText: { color: '#cc4e3c', fontWeight: '700', fontSize: 15 },
});
