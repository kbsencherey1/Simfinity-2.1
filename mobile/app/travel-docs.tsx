import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';

type DocStatus = 'Pending Verification' | 'Verified SECURE';

interface UploadedDoc {
  id: string;
  category: string;
  fileName: string;
  fileSize: string;
  date: string;
  status: DocStatus;
}

const DOC_CATEGORIES = [
  'Passport Scan',
  'Visa Entry Permit',
  'Yellow Fever Card',
  'Travel Insurance Policy',
  'Ghana Resident Card',
];

export default function TravelDocsScreen() {
  const { user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('Passport Scan');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([
    {
      id: 'doc-1',
      category: 'Yellow Fever Card',
      fileName: 'intl_yellow_fever_vaccine_certificate.pdf',
      fileSize: '1.24 MB',
      date: '2026-06-21',
      status: 'Verified SECURE',
    },
  ]);

  const handleSimulateUpload = () => {
    const newDoc: UploadedDoc = {
      id: `doc-${Date.now()}`,
      category: selectedCategory,
      fileName: `${selectedCategory.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      fileSize: '0.98 MB',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
    };

    setUploadedDocs(prev => [newDoc, ...prev]);

    setTimeout(() => {
      setUploadedDocs(prev =>
        prev.map(d => d.id === newDoc.id ? { ...d, status: 'Verified SECURE' } : d)
      );
    }, 2500);
  };

  const getDocIcon = (category: string) => {
    if (category.includes('Passport')) return 'P';
    if (category.includes('Visa')) return 'V';
    if (category.includes('Fever') || category.includes('Yellow')) return 'YF';
    if (category.includes('Insurance')) return 'I';
    return 'D';
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
        <Text style={styles.headerLabel}>TRAVEL DOCS</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Travel Documents</Text>
          <Text style={styles.titleSub}>Electronic Verification Log entries</Text>
        </View>

        {/* Passport Certificate */}
        <View style={[glass.panel, styles.section]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
              <Text style={styles.sectionIconText}>P</Text>
            </View>
            <Text style={styles.sectionTitle}>Passport Certificate</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.passportGrid}>
            <View>
              <Text style={styles.metaLabel}>DOCUMENT NO.</Text>
              <Text style={styles.metaValue}>{user.passportNo}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>EXPIRY DATE</Text>
              <Text style={styles.metaValue}>{user.passportExpiry}</Text>
              <Text style={styles.daysRemaining}>1452 days remaining</Text>
            </View>
          </View>
        </View>

        {/* Active Visitor Visas */}
        <View style={[glass.panel, styles.section]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(148,236,180,0.1)' }]}>
              <Text style={[styles.sectionIconText, { color: COLORS.greenLight }]}>V</Text>
            </View>
            <Text style={styles.sectionTitle}>Active Visitor Visas</Text>
          </View>
          <View style={styles.visaList}>
            {[
              { code: 'GH', country: 'Ghana - Multi Entry', expiry: '01 JAN 2025' },
              { code: 'UK', country: 'UK - Standard Visitor', expiry: '15 MAR 2025' },
            ].map(v => (
              <View key={v.code} style={styles.visaRow}>
                <View style={styles.visaCode}>
                  <Text style={styles.visaCodeText}>{v.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visaName}>{v.country}</Text>
                  <Text style={styles.visaExpiry}>VALID TIL: {v.expiry}</Text>
                </View>
                <Text style={styles.visaChevron}>›</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health Verification */}
        <View style={[glass.panel, styles.section]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(204,78,60,0.1)' }]}>
              <Text style={[styles.sectionIconText, { color: '#cc4e3c' }]}>H</Text>
            </View>
            <Text style={styles.sectionTitle}>Health Verification Certificates</Text>
          </View>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View style={[styles.healthIcon, { backgroundColor: 'rgba(204,78,60,0.1)' }]}>
                <Text style={[styles.healthIconText, { color: '#cc4e3c' }]}>YF</Text>
              </View>
              <View>
                <Text style={styles.healthName}>Yellow Fever Card</Text>
                <Text style={[styles.healthStatus, { color: COLORS.greenLight }]}>Verified WHO</Text>
              </View>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIcon, { backgroundColor: 'rgba(100,100,100,0.1)' }]}>
                <Text style={[styles.healthIconText, { color: COLORS.textMuted }]}>CV</Text>
              </View>
              <View>
                <Text style={styles.healthName}>COVID-19 Cert</Text>
                <Text style={[styles.healthStatus, { color: COLORS.textDim }]}>Fully Vaccinated</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Travel Insurance */}
        <View style={[glass.panel, styles.insuranceCard]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.insuranceTitle}>Travel Insurance Coverage</Text>
            <Text style={styles.insuranceSub}>Global Nomad Secure Pro package active.</Text>
            <Text style={styles.insurancePolicy}>POLICY #: GN-8839-XZY</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.viewPdfBtn, pressed && { opacity: 0.7 }]}
            onPress={() => Alert.alert('Travel Insurance', 'PDF viewer not available in demo mode.')}
          >
            <Text style={styles.viewPdfText}>VIEW PDF</Text>
          </Pressable>
        </View>

        {/* Upload Card */}
        <View style={[glass.panel, styles.uploadCard]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
              <Text style={[styles.sectionIconText, { color: COLORS.gold }]}>U</Text>
            </View>
            <Text style={styles.sectionTitle}>Upload Traveler Credentials</Text>
          </View>
          <Text style={styles.uploadDesc}>
            Securely submit your passport scans, entry permits, visa applications, vaccines, or travel insurance certificates. Files are encrypted client-side.
          </Text>

          {/* Category selector */}
          <View style={{ gap: 6 }}>
            <Text style={styles.inputLabel}>DOCUMENT CATEGORY</Text>
            <Pressable
              style={({ pressed }) => [styles.categorySelector, pressed && { opacity: 0.8 }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.categorySelectorText}>{selectedCategory}</Text>
              <Text style={styles.categorySelectorArrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
            </Pressable>
            {showCategoryPicker && (
              <View style={styles.categoryDropdown}>
                {DOC_CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    style={({ pressed }) => [styles.categoryOption, selectedCategory === cat && styles.categoryOptionActive, pressed && { opacity: 0.7 }]}
                    onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                  >
                    <Text style={[styles.categoryOptionText, selectedCategory === cat && styles.categoryOptionTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Upload zone */}
          <Pressable
            style={({ pressed }) => [styles.uploadZone, pressed && styles.uploadZonePressed]}
            onPress={handleSimulateUpload}
          >
            <View style={styles.uploadZoneIcon}>
              <Text style={styles.uploadZoneIconText}>U</Text>
            </View>
            <Text style={styles.uploadZoneTitle}>Drop your documentation file</Text>
            <Text style={styles.uploadZoneSub}>Tap to simulate upload • PNG, JPG or PDF (Max 10MB)</Text>
          </Pressable>
        </View>

        {/* Uploaded Docs List */}
        {uploadedDocs.length > 0 && (
          <View style={[glass.panel, styles.section]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
                <Text style={[styles.sectionIconText, { color: COLORS.gold }]}>F</Text>
              </View>
              <Text style={styles.sectionTitle}>Your Submitted Documents ({uploadedDocs.length})</Text>
            </View>
            <View style={styles.docList}>
              {uploadedDocs.map(doc => (
                <View key={doc.id} style={styles.docRow}>
                  <View style={styles.docIconBox}>
                    <Text style={styles.docIconText}>{getDocIcon(doc.category)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.docMeta}>
                      <View style={styles.docCategoryBadge}>
                        <Text style={styles.docCategoryText}>{doc.category}</Text>
                      </View>
                      <Text style={styles.docDate}>{doc.date}</Text>
                    </View>
                    <Text style={styles.docFileName} numberOfLines={1}>{doc.fileName}</Text>
                    <Text style={styles.docFileSize}>{doc.fileSize}</Text>
                  </View>
                  <View style={styles.docStatusWrap}>
                    <View style={[styles.docStatusDot, { backgroundColor: doc.status === 'Verified SECURE' ? COLORS.greenLight : '#f87171' }]} />
                    <Text style={[styles.docStatusText, { color: doc.status === 'Verified SECURE' ? COLORS.greenLight : '#f87171' }]}>
                      {doc.status === 'Verified SECURE' ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  titleBlock: { gap: 4, alignItems: 'center', marginBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  titleSub: { color: COLORS.textMuted, fontSize: 12 },

  section: { padding: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: { color: COLORS.gold, fontSize: 11, fontWeight: '900' },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
  verifiedBadge: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  verifiedBadgeText: { color: COLORS.gold, fontSize: 9, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(77,71,50,0.3)' },

  passportGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', marginBottom: 3 },
  metaValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  daysRemaining: { color: COLORS.greenLight, fontSize: 9, marginTop: 2 },

  visaList: { gap: 10 },
  visaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(28,27,27,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(77,71,50,0.25)',
    borderRadius: 12,
    padding: 12,
  },
  visaCode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaCodeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  visaName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  visaExpiry: { color: COLORS.textDim, fontSize: 9, marginTop: 2 },
  visaChevron: { color: COLORS.textDim, fontSize: 20, fontWeight: '700' },

  healthGrid: { flexDirection: 'row', gap: 10 },
  healthItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(28,27,27,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(77,71,50,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  healthIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  healthIconText: { fontSize: 9, fontWeight: '900' },
  healthName: { color: '#fff', fontSize: 11, fontWeight: '700' },
  healthStatus: { fontSize: 9, marginTop: 2 },

  insuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#891d11',
  },
  insuranceTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  insuranceSub: { color: COLORS.textMuted, fontSize: 11 },
  insurancePolicy: { color: COLORS.textDim, fontSize: 9, marginTop: 4 },
  viewPdfBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  viewPdfText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  uploadCard: { padding: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  uploadDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  inputLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categorySelectorText: { color: '#fff', fontSize: 13 },
  categorySelectorArrow: { color: COLORS.textDim, fontSize: 11 },
  categoryDropdown: {
    backgroundColor: '#1c1b1b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  categoryOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(77,71,50,0.2)' },
  categoryOptionActive: { backgroundColor: 'rgba(255,215,0,0.08)' },
  categoryOptionText: { color: COLORS.textMuted, fontSize: 13 },
  categoryOptionTextActive: { color: COLORS.gold, fontWeight: '700' },

  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(77,71,50,0.4)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  uploadZonePressed: { borderColor: COLORS.gold, backgroundColor: 'rgba(255,215,0,0.04)' },
  uploadZoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadZoneIconText: { color: COLORS.gold, fontSize: 18, fontWeight: '900' },
  uploadZoneTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  uploadZoneSub: { color: COLORS.textDim, fontSize: 11, textAlign: 'center' },

  docList: { gap: 10 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(28,27,27,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docIconText: { color: COLORS.textDim, fontSize: 9, fontWeight: '900' },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docCategoryBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  docCategoryText: { color: '#fff', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  docDate: { color: COLORS.textDim, fontSize: 9 },
  docFileName: { color: '#fff', fontSize: 12, fontWeight: '500' },
  docFileSize: { color: COLORS.textDim, fontSize: 9 },
  docStatusWrap: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  docStatusDot: { width: 6, height: 6, borderRadius: 3 },
  docStatusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
});
