import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_FAMILY, typography } from '../theme';

const skullIcon = require('../../assets/images/skull_bg.jpg');

export default function TermsScreen() {
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
          <Text style={styles.sectionTitle}>Terms of Use</Text>
          <Text style={styles.effectiveDate}>Effective Date: January 1, 2026</Text>

          <Text style={styles.bodyText}>
            By using the Memento Mori app ("the App"), you agree to the following terms and conditions.
          </Text>

          <Text style={styles.subTitle}>Use of the App</Text>
          <Text style={styles.bodyText}>
            The App is provided for personal, non-commercial use. It is designed to help you visualize your life and reflect on mortality through the ancient practice of Memento Mori.
          </Text>

          <Text style={styles.subTitle}>Data</Text>
          <Text style={styles.bodyText}>
            All data you enter into the App (birthdate, life events, favorites) is stored locally on your device. We do not collect, store, or have access to your personal data. If you delete the App, your data will be permanently lost.
          </Text>

          <Text style={styles.subTitle}>Disclaimer</Text>
          <Text style={styles.bodyText}>
            The App is provided "as is" without warranties of any kind. Life expectancy calculations are for reflective purposes only and should not be taken as medical or actuarial advice.
          </Text>

          <Text style={styles.subTitle}>Intellectual Property</Text>
          <Text style={styles.bodyText}>
            All content, design, and code within the App are the property of Legio Unius. Wisdom quotes are attributed to their respective authors and sources.
          </Text>

          <Text style={styles.subTitle}>Contact</Text>
          <Text style={styles.bodyText}>
            For questions about these Terms, contact us at eric@legiounius.com.
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
