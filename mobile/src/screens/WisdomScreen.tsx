import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Share, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONT_FAMILY, typography } from '../theme';
import { WisdomEntry } from '../types';
import { parseCSV } from '../csv';
import { getFavorites, setFavorites, getSeenMap, setSeenMap } from '../storage';
import GravestoneBanner from '../components/GravestoneBanner';
import { RootStackParamList } from '../navigation';

const skullIcon = require('../../assets/images/skull_bg.jpg');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const WISDOM_TYPES = [
  { key: 'Stoic Wisdom', icon: '🏛' },
  { key: 'Religious Wisdom', icon: '✝' },
  { key: 'Existentialist Wisdom', icon: '🤔' },
  { key: 'Literary Wisdom', icon: '📜' },
  { key: 'Movie Wisdom', icon: '🎬' },
];

export default function WisdomScreen() {
  const navigation = useNavigation<NavProp>();
  const [entries, setEntries] = useState<WisdomEntry[]>([]);
  const [currentQuote, setCurrentQuote] = useState<WisdomEntry | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [favorites, setFavoritesState] = useState<number[]>([]);
  const [seenMap, setSeenMapState] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const asset = Asset.fromModule(require('../../assets/peace_archive.csv'));
        await asset.downloadAsync();
        if (asset.localUri) {
          const csvText = await FileSystem.readAsStringAsync(asset.localUri);
          const parsed = parseCSV(csvText);
          setEntries(parsed);
        }
      } catch (err) {
        console.log('Failed to load CSV:', err);
      }

      const favs = await getFavorites();
      const seen = await getSeenMap();
      setFavoritesState(favs);
      setSeenMapState(seen);
    }
    loadData();
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [entries]);

  const totalQuotes = entries.length;

  const handleFindWisdom = useCallback((type: string) => {
    let pool: { entry: WisdomEntry; index: number }[] = [];

    if (type === 'My Favorites') {
      pool = favorites.map(i => ({ entry: entries[i], index: i })).filter(p => p.entry);
    } else {
      pool = entries.map((e, i) => ({ entry: e, index: i })).filter(p => p.entry.type === type);
    }

    if (pool.length === 0) return;

    const seen = seenMap[type] || [];
    let unseen = pool.filter(p => !seen.includes(p.index));

    if (unseen.length === 0) {
      const newMap = { ...seenMap, [type]: [] };
      setSeenMapState(newMap);
      setSeenMap(newMap);
      unseen = pool;
    }

    const pick = unseen[Math.floor(Math.random() * unseen.length)];
    setCurrentQuote(pick.entry);
    setCurrentIndex(pick.index);

    const updatedSeen = [...(seenMap[type] || []), pick.index];
    const newMap = { ...seenMap, [type]: updatedSeen };
    setSeenMapState(newMap);
    setSeenMap(newMap);
  }, [entries, favorites, seenMap]);

  const toggleFavorite = useCallback(async () => {
    if (currentIndex < 0) return;
    let updated: number[];
    if (favorites.includes(currentIndex)) {
      updated = favorites.filter(i => i !== currentIndex);
    } else {
      updated = [...favorites, currentIndex];
    }
    setFavoritesState(updated);
    await setFavorites(updated);
  }, [currentIndex, favorites]);

  const handleShare = useCallback(async () => {
    if (!currentQuote) return;
    const text = `"${currentQuote.text}"\n\n— ${currentQuote.author}${currentQuote.source ? `, ${currentQuote.source}` : ''}\n\nShared from Memento Mori — todieisto.live`;
    try {
      await Share.share({ message: text, title: 'Wisdom — Memento Mori' });
    } catch {}
  }, [currentQuote]);

  const isFav = currentIndex >= 0 && favorites.includes(currentIndex);

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
          <TouchableOpacity onPress={() => navigation.navigate('SuggestQuote')}>
            <Text style={[typography.small, styles.underline, { marginTop: 8 }]}>Suggest A Quote</Text>
          </TouchableOpacity>
        </View>

        <GravestoneBanner />

        <View style={styles.categories}>
          <Text style={[typography.caption, { marginBottom: 12, textAlign: 'center' }]}>Get Wisdom</Text>

          <View style={styles.categoryGrid}>
            {WISDOM_TYPES.map(wt => (
              <TouchableOpacity
                key={wt.key}
                style={styles.categoryBtn}
                onPress={() => handleFindWisdom(wt.key)}
              >
                <Text style={styles.categoryIcon}>{wt.icon}</Text>
                <Text style={styles.categoryLabel}>{wt.key.replace(' Wisdom', '')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {favorites.length > 0 && (
            <TouchableOpacity style={styles.favoritesBtn} onPress={() => handleFindWisdom('My Favorites')}>
              <Text style={styles.favoritesBtnText}>♥ My Favorites ({favorites.length})</Text>
            </TouchableOpacity>
          )}

          <Text style={[typography.small, { textAlign: 'center', marginTop: 8 }]}>
            {totalQuotes} wise thoughts and counting
          </Text>
        </View>

        {currentQuote && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
            {currentQuote.source ? (
              <Text style={styles.quoteSource}>{currentQuote.source}</Text>
            ) : null}

            <View style={styles.quoteActions}>
              <TouchableOpacity onPress={toggleFavorite}>
                <Text style={[styles.actionBtn, isFav && { color: COLORS.red }]}>
                  {isFav ? '♥' : '♡'} {isFav ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare}>
                <Text style={styles.actionBtn}>↗ Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Philosophy')}>
              <Text style={typography.small}>The Philosophy</Text>
            </TouchableOpacity>
            <Text style={typography.small}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <Text style={typography.small}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={typography.small}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={typography.small}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  underline: { textDecorationLine: 'underline' },
  categories: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  categoryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    width: 90,
  },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  categoryLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.foreground,
    textAlign: 'center',
  },
  favoritesBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 6,
    alignItems: 'center',
  },
  favoritesBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.red,
  },
  quoteCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  quoteText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.foreground,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: COLORS.foreground,
    marginTop: 12,
    fontWeight: '700',
  },
  quoteSource: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    justifyContent: 'center',
  },
  actionBtn: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.foreground,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
