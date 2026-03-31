import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'splash' | 'grid';

interface UserData {
  birthYear: number;
  birthMonth: number; // 1-12
  targetAge: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKS_PER_YEAR = 52;
const MIN_AGE = 60;
const MAX_AGE = 100;
const CURRENT_DATE = new Date();

// ─── Dot Grid ─────────────────────────────────────────────────────────────────

function LifeGrid({ data }: { data: UserData }) {
  const totalMonths = data.targetAge * 12;
  const birthDate = new Date(data.birthYear, data.birthMonth - 1, 1);
  const monthsLived = Math.floor(
    (CURRENT_DATE.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  const { width } = Dimensions.get('window');
  // Two columns, 12 dots per row (one per month per year)
  const COLS = 12;
  const DOT_SIZE = Math.floor((width - 64) / COLS) - 2;

  const dots = Array.from({ length: totalMonths }, (_, i) => {
    const lived = i < monthsLived;
    const current = i === monthsLived;
    const age = Math.floor(i / 12);
    // Progressive darkening for lived months
    const opacity = lived ? Math.min(0.3 + (age / data.targetAge) * 0.7, 1) : 1;
    return { lived, current, opacity, index: i };
  });

  return (
    <ScrollView style={styles.gridContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.gridTitle}>Your Life in Months</Text>
      <Text style={styles.gridSubtitle}>
        Age {Math.floor(monthsLived / 12)} — {monthsLived} months lived of {totalMonths}
      </Text>
      <View style={styles.dotsWrapper}>
        {dots.map((dot) => (
          <View
            key={dot.index}
            style={[
              styles.dot,
              { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
              dot.lived && { backgroundColor: `rgba(0,0,0,${dot.opacity})` },
              dot.current && styles.dotCurrent,
              !dot.lived && !dot.current && styles.dotFuture,
            ]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Splash / Entry Screen ────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const currentYear = CURRENT_DATE.getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

function SplashScreen({ onContinue }: { onContinue: (data: UserData) => void }) {
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthYear, setBirthYear] = useState(currentYear - 30);
  const [targetAge, setTargetAge] = useState(80);
  const [yearText, setYearText] = useState(String(currentYear - 30));

  function handleContinue() {
    const year = parseInt(yearText, 10);
    if (isNaN(year) || year < 1900 || year > currentYear) {
      return;
    }
    onContinue({ birthYear: year, birthMonth, targetAge });
  }

  return (
    <ScrollView contentContainerStyle={styles.splashContent}>
      <Text style={styles.skull}>☠</Text>
      <Text style={styles.title}>MEMENTO MORI</Text>
      <Text style={styles.subtitle}>Remember that you will die.</Text>

      {/* Birth month */}
      <Text style={styles.label}>Birth Month</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picker}>
        {MONTHS.map((m, i) => (
          <TouchableOpacity
            key={m}
            onPress={() => setBirthMonth(i + 1)}
            style={[styles.pickerItem, birthMonth === i + 1 && styles.pickerItemSelected]}
          >
            <Text style={[styles.pickerText, birthMonth === i + 1 && styles.pickerTextSelected]}>
              {m.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Birth year */}
      <Text style={styles.label}>Birth Year</Text>
      <TextInput
        style={styles.input}
        value={yearText}
        onChangeText={setYearText}
        keyboardType="number-pad"
        maxLength={4}
        placeholder="e.g. 1985"
        placeholderTextColor="#888"
      />

      {/* Target age */}
      <Text style={styles.label}>Target Age: {targetAge}</Text>
      <View style={styles.ageRow}>
        {[60, 70, 75, 80, 85, 90, 95, 100].map((age) => (
          <TouchableOpacity
            key={age}
            onPress={() => setTargetAge(age)}
            style={[styles.ageBtn, targetAge === age && styles.ageBtnSelected]}
          >
            <Text style={[styles.ageBtnText, targetAge === age && styles.ageBtnTextSelected]}>
              {age}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueBtnText}>See Your Life</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [userData, setUserData] = useState<UserData | null>(null);

  function handleContinue(data: UserData) {
    setUserData(data);
    setScreen('grid');
  }

  return (
    <SafeAreaView style={styles.root}>
      {screen === 'splash' && (
        <SplashScreen onContinue={handleContinue} />
      )}
      {screen === 'grid' && userData && (
        <>
          <LifeGrid data={userData} />
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('splash')}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashContent: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  skull: {
    fontSize: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 36,
    letterSpacing: 1,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#aaa',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  picker: {
    flexGrow: 0,
    alignSelf: 'stretch',
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerItemSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pickerText: {
    color: '#aaa',
    fontSize: 13,
  },
  pickerTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  ageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  ageBtnSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  ageBtnText: {
    color: '#aaa',
    fontSize: 14,
  },
  ageBtnTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  continueBtn: {
    marginTop: 36,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Grid
  gridContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
  },
  gridTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridSubtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 20,
  },
  dotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dot: {
    backgroundColor: '#222',
  },
  dotCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  dotFuture: {
    backgroundColor: '#222',
  },
  backBtn: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#111',
  },
  backBtnText: {
    color: '#aaa',
    fontSize: 14,
  },
});
