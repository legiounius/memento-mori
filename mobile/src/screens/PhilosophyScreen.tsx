import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_FAMILY, typography } from '../theme';

const skullIcon = require('../../assets/images/skull_bg.jpg');

export default function PhilosophyScreen() {
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
          <Text style={styles.sectionTitle}>The Philosophy</Text>

          <Text style={styles.bodyText}>
            "Memento Mori" is a Latin phrase that translates to "Remember that you will die." Far from being morbid, this ancient practice has been used for thousands of years as a powerful tool for living a more intentional, grateful, and meaningful life.
          </Text>

          <Text style={styles.subTitle}>Ancient Origins</Text>
          <Text style={styles.bodyText}>
            In ancient Rome, when a general celebrated a triumph — a grand parade through the streets of Rome — a slave would stand behind him in the chariot, whispering "Memento Mori" into his ear. This was meant to remind the general that despite his great victory, he was still mortal.
          </Text>

          <Text style={styles.subTitle}>Stoic Philosophy</Text>
          <Text style={styles.bodyText}>
            The Stoics — including Marcus Aurelius, Seneca, and Epictetus — made the contemplation of death central to their philosophy. Marcus Aurelius wrote in his Meditations: "You could leave life right now. Let that determine what you do and say and think."
          </Text>
          <Text style={styles.bodyText}>
            Seneca urged his readers: "Let us prepare our minds as if we'd come to the very end of life. Let us postpone nothing. Let us balance life's books each day."
          </Text>

          <Text style={styles.subTitle}>Christian Tradition</Text>
          <Text style={styles.bodyText}>
            In medieval Christianity, Memento Mori became a major artistic and spiritual theme. Monks would greet each other with the phrase. Paintings featured skulls, hourglasses, and wilting flowers as reminders of life's brevity. The message was clear: focus on the eternal, not the temporary.
          </Text>

          <Text style={styles.subTitle}>Buddhist Practice</Text>
          <Text style={styles.bodyText}>
            The Buddha taught the Maranasati — mindfulness of death. The practice involves regularly reflecting on the fact that death can come at any time. This reflection is not meant to cause fear, but to inspire urgency in spiritual practice and to cultivate non-attachment.
          </Text>

          <Text style={styles.subTitle}>The Purpose</Text>
          <Text style={styles.bodyText}>
            The purpose of Memento Mori is not to be depressing or fatalistic. It is to sharpen your appreciation for the present moment. When you truly internalize that your time is limited, you naturally begin to:
          </Text>
          <Text style={styles.bodyText}>
            • Prioritize what truly matters{'\n'}
            • Let go of petty grievances{'\n'}
            • Express love and gratitude more freely{'\n'}
            • Stop postponing your dreams{'\n'}
            • Live with greater intentionality
          </Text>

          <Text style={styles.subTitle}>This App</Text>
          <Text style={styles.bodyText}>
            This app visualizes your life in months — each dot representing one month of your existence. The filled dots show the months you've already lived. The empty circles represent the months you have remaining (based on your target age). The goal is simple: to make the abstract concept of mortality concrete and personal.
          </Text>
          <Text style={styles.bodyText}>
            When you see your life laid out in dots, something shifts. The urgency becomes real. The preciousness of each remaining dot becomes undeniable. This is the gift of Memento Mori — not despair, but clarity.
          </Text>
          <Text style={[styles.bodyText, { fontStyle: 'italic', marginTop: 16, textAlign: 'center' }]}>
            Live Aware. Remember You Must Die.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIcon: { width: 30, height: 30, borderRadius: 15 },
  underline: { textDecorationLine: 'underline' },
  content: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: 16,
  },
  subTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.foreground,
    marginBottom: 8,
  },
});
