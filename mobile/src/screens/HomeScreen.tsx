import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Animated, Dimensions, Alert, Share, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
import { COLORS, FONT_FAMILY, typography } from '../theme';
import { LifeEvent, EVENT_TYPES, MONTHS_SHORT, EventType } from '../types';
import { getBirthdate, setBirthdate as saveBirthdate, getTargetAge, setTargetAge as saveTargetAge, getEvents, setEvents as saveEvents } from '../storage';
import LifeGrid from '../components/LifeGrid';
import DatePicker from '../components/DatePicker';
import EventForm from '../components/EventForm';
import GravestoneBanner from '../components/GravestoneBanner';
import { RootStackParamList } from '../navigation';

const skullImg = require('../../assets/images/skull_minimal.png');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [targetAge, setTargetAge] = useState(80);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashBirthdate, setSplashBirthdate] = useState<Date | undefined>(undefined);
  const [splashTargetAge, setSplashTargetAge] = useState(80);
  const [editingBirthdate, setEditingBirthdate] = useState(false);
  const [editingTargetAge, setEditingTargetAge] = useState(false);

  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(1.05)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      const bd = await getBirthdate();
      const ta = await getTargetAge();
      const ev = await getEvents();
      console.log('[HomeScreen] loaded birthdate:', bd, 'targetAge:', ta, 'events:', ev.length);
      setBirthdate(bd);
      setTargetAge(ta);
      setEvents(ev);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashOpacity, { toValue: 0.25, duration: 1500, useNativeDriver: true }),
      Animated.timing(splashScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 800, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (birthdate && showSplash && !loading) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [birthdate, showSplash, loading]);

  const handleBirthdateSet = useCallback(async (date: Date) => {
    setBirthdate(date);
    await saveBirthdate(date);
    setShowSplash(false);
  }, []);

  const handleTargetAgeChange = useCallback(async (age: number) => {
    setTargetAge(age);
    await saveTargetAge(age);
  }, []);

  const handleAddEvent = useCallback(async (event: LifeEvent) => {
    const updated = [...events, event];
    setEvents(updated);
    await saveEvents(updated);
  }, [events]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await saveEvents(updated);
  }, [events]);

  const weeksRemaining = useMemo(() => {
    if (!birthdate) return 0;
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    return Math.max(0, differenceInWeeks(targetDate, new Date()));
  }, [birthdate, targetAge]);

  const monthsRemaining = useMemo(() => {
    if (!birthdate) return 0;
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    return Math.max(0, differenceInMonths(targetDate, new Date()));
  }, [birthdate, targetAge]);

  const handleShare = useCallback(async (type: 'kind' | 'weekend' | 'notime') => {
    const weekends = Math.floor(weeksRemaining);
    let msg = '';
    if (type === 'kind') {
      msg = `Be kind to me, I only have ${weeksRemaining.toLocaleString()} weeks to live.\n\nCreated With\nMemento Mori App — todieisto.live\nLive Aware`;
    } else if (type === 'weekend') {
      msg = `Let's make it count, I only have ${weekends.toLocaleString()} more weekends until I die.\n\nCreated With\nMemento Mori App — todieisto.live\nLive Aware`;
    } else {
      msg = `I don't have time for this, I only have ${monthsRemaining.toLocaleString()} months left in my life.\n\nCreated With\nMemento Mori App — todieisto.live\nLive Aware`;
    }
    try {
      await Share.share({ message: msg, title: 'Memento Mori' });
    } catch {}
  }, [weeksRemaining, monthsRemaining]);

  if (loading) return <View style={styles.container} />;

  if (birthdate && showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={{ alignItems: 'center', opacity: splashOpacity, transform: [{ scale: splashScale }] }}>
          <Image source={skullImg} style={styles.splashSkull} />
        </Animated.View>
        <Animated.Text style={[typography.h1, styles.splashTitle, { opacity: titleOpacity }]}>
          Memento{'\n'}Mori
        </Animated.Text>
      </View>
    );
  }

  if (!birthdate) {
    console.log('[HomeScreen] rendering first-time splash with form');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <Image source={skullImg} style={styles.splashSkull} />

          <Text style={[typography.h1, styles.splashTitle]}>
            Memento{'\n'}Mori
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Philosophy')}>
            <Text style={[typography.caption, styles.underlineLink]}>Click To Understand</Text>
          </TouchableOpacity>

          <View style={styles.splashForm}>
            <Text style={[typography.caption, { marginBottom: 12 }]}>When Were You Born?</Text>
            <DatePicker date={splashBirthdate} setDate={setSplashBirthdate} />

            <Text style={[typography.caption, { marginTop: 20, marginBottom: 8 }]}>How Long Do You Expect To Live?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageScroller}>
              {Array.from({ length: 41 }, (_, i) => 60 + i).map(a => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setSplashTargetAge(a)}
                  style={[styles.ageChip, splashTargetAge === a && styles.ageChipActive]}
                >
                  <Text style={[styles.ageChipText, splashTargetAge === a && styles.ageChipTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {splashBirthdate && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  handleTargetAgeChange(splashTargetAge);
                  handleBirthdateSet(splashBirthdate);
                }}
              >
                <Text style={styles.startButtonText}>Start To Live</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const deadDate = new Date(birthdate);
  deadDate.setFullYear(deadDate.getFullYear() + targetAge);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={typography.caption}>Live</Text>
            <Image source={skullImg} style={styles.headerIcon} />
            <Text style={typography.caption}>Aware</Text>
          </View>
          <Text style={typography.h2}>Memento Mori</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Philosophy')}>
              <Text style={[typography.small, styles.underlineLink]}>The Philosophy</Text>
            </TouchableOpacity>
          </View>

          {!editingBirthdate ? (
            <View style={styles.infoRow}>
              <Text style={[typography.body, { fontWeight: '700' }]}>Born: {formatDate(birthdate)}</Text>
              <TouchableOpacity onPress={() => setEditingBirthdate(true)}>
                <Text style={[typography.small, { textDecorationLine: 'underline' }]}>change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editSection}>
              <DatePicker date={birthdate} setDate={(d) => { if (d) { handleBirthdateSet(d); setEditingBirthdate(false); }}} />
              <TouchableOpacity onPress={() => setEditingBirthdate(false)}>
                <Text style={[typography.small, { marginTop: 8 }]}>cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[typography.body, { fontWeight: '700' }]}>Target: {targetAge} years</Text>
            {!editingTargetAge ? (
              <TouchableOpacity onPress={() => setEditingTargetAge(true)}>
                <Text style={[typography.small, { textDecorationLine: 'underline' }]}>change</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => { handleTargetAgeChange(Math.max(60, targetAge - 1)); }}>
                  <Text style={typography.body}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { handleTargetAgeChange(Math.min(120, targetAge + 1)); }}>
                  <Text style={typography.body}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingTargetAge(false)}>
                  <Text style={[typography.small, { textDecorationLine: 'underline' }]}>done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <GravestoneBanner />

        <LifeGrid
          birthdate={birthdate}
          targetAge={targetAge}
          events={events}
          bornLabel={formatDate(birthdate)}
          deadLabel={formatDate(deadDate)}
        />

        <View style={styles.section}>
          <EventForm onAdd={handleAddEvent} />
        </View>

        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={[typography.caption, styles.sectionTitle]}>Key Events of My Life</Text>
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const monthIdx = differenceInMonths(eventDate, birthdate);
              const yearNum = Math.floor(monthIdx / 12);
              const weekInYear = differenceInWeeks(eventDate, new Date(birthdate.getFullYear() + yearNum, birthdate.getMonth(), birthdate.getDate()));
              const eventColor = EVENT_TYPES[event.type as EventType]?.color || '#7c3aed';
              return (
                <View key={event.id} style={styles.eventRow}>
                  <View style={[styles.eventDot, { backgroundColor: eventColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { fontSize: 12 }]}>{event.label}</Text>
                    <Text style={[typography.small, { fontSize: 7 }]}>
                      Year {yearNum}, Week {weekInYear} — {formatDate(eventDate)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
                    <Text style={{ color: COLORS.red, fontSize: 16 }}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.shareSection}>
          <Text style={[typography.caption, styles.sectionTitle]}>Send A Message</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('kind')}>
            <Text style={styles.shareBtnText}>Be Kind To Me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('weekend')}>
            <Text style={styles.shareBtnText}>Happy Hour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('notime')}>
            <Text style={styles.shareBtnText}>No Time For This</Text>
          </TouchableOpacity>
        </View>

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
          <Text style={[typography.small, { marginTop: 8 }]}>Copyright Legio Unius MMXXVI</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashSkull: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  splashScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  splashTitle: {
    textAlign: 'center',
    fontSize: 36,
    letterSpacing: 2,
  },
  splashForm: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginTop: 24,
  },
  underlineLink: {
    textDecorationLine: 'underline',
    marginTop: 12,
  },
  ageScroller: { maxHeight: 40 },
  ageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  ageChipActive: {
    backgroundColor: COLORS.foreground,
    borderColor: COLORS.foreground,
  },
  ageChipText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: COLORS.foreground,
  },
  ageChipTextActive: { color: COLORS.white },
  startButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: COLORS.foreground,
    borderRadius: 6,
  },
  startButtonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  editSection: { alignItems: 'center', marginTop: 8 },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    textAlign: 'center',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shareSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  shareBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginTop: 6,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 2,
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
