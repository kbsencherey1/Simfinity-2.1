import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';

// Placeholder contact address — swap in the real one before launch.
const PRIVACY_EMAIL = 'privacy@simfinity.app';
const LAST_UPDATED = 'July 2026';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Information We Collect',
    body:
      'When you create an account, we collect your full name, email address, phone number, and date of birth. ' +
      'When you make a purchase, our payment processor (Paystack) handles your card or mobile money details directly — ' +
      'we never see or store your full payment credentials. When you use the coverage map, we access your device’s ' +
      'GPS location, only while the screen is open, to center the map and show nearby cell tower signal data.',
  },
  {
    title: '2. Location Data',
    body:
      'Location access is optional and only requested when you tap "Use My Location" on the coverage map. You can deny ' +
      'or revoke this permission at any time in your device settings — the app will simply fall back to a country-level ' +
      'view. We do not store your GPS coordinates on our servers or use them for any purpose beyond displaying nearby ' +
      'coverage on that screen.',
  },
  {
    title: '3. How We Use Your Information',
    body:
      'We use your information to create and secure your account, process eSIM purchases and top-ups, activate and ' +
      'manage your eSIM profiles, send purchase confirmations and service notifications, apply referral rewards, and ' +
      'improve app performance and reliability.',
  },
  {
    title: '4. Third-Party Services',
    body:
      'We share the minimum necessary data with trusted providers to operate Simfinity: Paystack (payment processing), ' +
      'Zendit (eSIM provisioning and data top-ups), OpenCellID (crowd-sourced cell tower coverage data), and Expo/EAS ' +
      '(app infrastructure and push notifications). Each provider only receives the data required to perform its function ' +
      'and is bound by its own privacy and security obligations.',
  },
  {
    title: '5. Data Sharing & Disclosure',
    body:
      'We do not sell your personal information. We only disclose it to the third parties listed above, or when required ' +
      'by law, to protect our legal rights, or to prevent fraud or abuse of the platform.',
  },
  {
    title: '6. Data Security',
    body:
      'Account credentials are encrypted at rest, and all traffic between the app and our servers is encrypted in transit. ' +
      'Access to personal data is restricted to systems and personnel that need it to operate the service.',
  },
  {
    title: '7. Your Rights & Choices',
    body:
      'You can view and edit your personal information at any time from the Personal Information screen. You may request ' +
      'deletion of your account and associated data, or ask what data we hold about you, by contacting us using the ' +
      'details below.',
  },
  {
    title: '8. Children’s Privacy',
    body:
      'Simfinity is not directed at children under 16, and we do not knowingly collect personal information from them. ' +
      'If you believe a child has provided us with personal data, please contact us so we can remove it.',
  },
  {
    title: '9. Changes to This Policy',
    body:
      'We may update this policy from time to time to reflect changes in our practices or for legal reasons. Material ' +
      'changes will be reflected by updating the date below.',
  },
  {
    title: '10. Contact Us',
    body: `Questions about this policy or your data can be sent to ${PRIVACY_EMAIL}.`,
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerLabel}>PRIVACY POLICY</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.titleSub}>Last updated: {LAST_UPDATED}</Text>
        </View>

        <View style={[glass.panel, styles.card]}>
          {SECTIONS.map(section => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => Linking.openURL(`mailto:${PRIVACY_EMAIL}`)}>
          <Text style={styles.contactLink}>{PRIVACY_EMAIL}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.clay, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  titleBlock: { gap: 4, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  titleSub: { color: COLORS.textMuted, fontSize: 12 },
  card: { padding: 16, gap: 16 },
  section: { gap: 6 },
  sectionTitle: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  sectionBody: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  contactLink: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
