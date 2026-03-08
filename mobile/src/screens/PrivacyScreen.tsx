import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_FAMILY, typography } from '../theme';

const skullIcon = require('../../assets/images/skull_bg.jpg');

export default function PrivacyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={typography.caption}>Live</Text>
            <Image source={skullIcon} style={styles.headerIcon} />
            <Text style={typography.caption}>Aware</Text>
          </View>
          <Text style={typography.h2}>Memento Mori</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[typography.small, styles.underline, { marginTop: 8 }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Effective Date: January 1, 2026</Text>

          <Text style={styles.bodyText}>
            Memento Mori ("the App") is committed to protecting your privacy. This Privacy Policy explains how the App handles your information.
          </Text>

          <Text style={styles.subTitle}>Data Storage</Text>
          <Text style={styles.bodyText}>
            All personal data — including your birthdate, target age, life events, and wisdom favorites — is stored exclusively on your device. The App does not collect, transmit, or store any personal data on external servers.
          </Text>

          <Text style={styles.subTitle}>No Account Required</Text>
          <Text style={styles.bodyText}>
            The App does not require you to create an account, provide an email address, or share any personal information to use its features.
          </Text>

          <Text style={styles.subTitle}>Analytics</Text>
          <Text style={styles.bodyText}>
            The App does not use any third-party analytics, tracking, or advertising services.
          </Text>

          <Text style={styles.subTitle}>Contact</Text>
          <Text style={styles.bodyText}>
            If you have questions about this Privacy Policy, contact us at eric@legiounius.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIcon: { width: 30, height: 30, borderRadius: 15 },
  underline: { textDecorationLine: 'underline' },
  content: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '700', color: COLORS.foreground, textAlign: 'center', marginBottom: 4 },
  effectiveDate: { fontFamily: FONT_FAMILY, fontSize: 10, color: COLORS.muted, textAlign: 'center', marginBottom: 16 },
  subTitle: { fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '700', color: COLORS.foreground, marginTop: 16, marginBottom: 6 },
  bodyText: { fontFamily: FONT_FAMILY, fontSize: 13, lineHeight: 22, color: COLORS.foreground, marginBottom: 8 },
});
