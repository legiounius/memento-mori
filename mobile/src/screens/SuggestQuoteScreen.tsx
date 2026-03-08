import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_FAMILY, typography } from '../theme';

const skullIcon = require('../../assets/images/skull_bg.jpg');

const typeOptions = ['Stoic Wisdom', 'Religious Wisdom', 'Existentialist Wisdom', 'Literary Wisdom', 'Movie Wisdom'];

export default function SuggestQuoteScreen() {
  const navigation = useNavigation();
  const [type, setType] = useState('');
  const [author, setAuthor] = useState('');
  const [place, setPlace] = useState('');
  const [quote, setQuote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!type || !author || !place || !quote) return;

    const subject = encodeURIComponent('Quote Suggestion — Memento Mori App');
    const body = encodeURIComponent(
      `Type of Wisdom: ${type}\nAuthor: ${author}\nSource / Place: ${place}\n\nQuote:\n"${quote}"`
    );

    setSubmitted(true);
    setTimeout(() => {
      Linking.openURL(`mailto:eric@legiounius.com?subject=${subject}&body=${body}`);
    }, 500);
    setTimeout(() => {
      navigation.goBack();
    }, 3500);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.thankYou}>
          <Text style={typography.h2}>Thank You</Text>
          <Text style={[typography.body, { marginTop: 12, textAlign: 'center' }]}>
            Your wisdom suggestion is being prepared. Redirecting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={[typography.small, styles.underline, { marginTop: 8 }]}>Back To Wisdom</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={[typography.caption, { textAlign: 'center', marginBottom: 16 }]}>Suggest A Quote</Text>

          <Text style={styles.label}>Type of Wisdom</Text>
          <View style={styles.typeRow}>
            {typeOptions.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                  {t.replace(' Wisdom', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Author</Text>
          <TextInput
            style={styles.input}
            placeholder="Who said it?"
            placeholderTextColor={COLORS.muted}
            value={author}
            onChangeText={setAuthor}
          />

          <Text style={styles.label}>Source / Place</Text>
          <TextInput
            style={styles.input}
            placeholder="Book, movie, speech, etc."
            placeholderTextColor={COLORS.muted}
            value={place}
            onChangeText={setPlace}
          />

          <Text style={styles.label}>The Quote</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter the quote..."
            placeholderTextColor={COLORS.muted}
            value={quote}
            onChangeText={setQuote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, (!type || !author || !place || !quote) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!type || !author || !place || !quote}
          >
            <Text style={styles.submitBtnText}>Submit Suggestion</Text>
          </TouchableOpacity>
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
  thankYou: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  form: { paddingHorizontal: 20, marginTop: 20 },
  label: { fontFamily: FONT_FAMILY, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.muted, marginTop: 16, marginBottom: 6 },
  input: {
    fontFamily: FONT_FAMILY, fontSize: 13, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 4, paddingVertical: 10, paddingHorizontal: 12, color: COLORS.foreground,
  },
  textArea: { minHeight: 100 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  typeChipActive: { backgroundColor: COLORS.foreground, borderColor: COLORS.foreground },
  typeChipText: { fontFamily: FONT_FAMILY, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.foreground },
  typeChipTextActive: { color: COLORS.white },
  submitBtn: { backgroundColor: COLORS.foreground, paddingVertical: 14, borderRadius: 6, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: FONT_FAMILY, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.white },
});
