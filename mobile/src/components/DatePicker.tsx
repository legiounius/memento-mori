import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT_FAMILY, typography } from '../theme';
import { MONTHS_FULL } from '../types';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const [month, setMonth] = useState(date ? date.getMonth() : -1);
  const [day, setDay] = useState(date ? date.getDate() : -1);
  const [year, setYear] = useState(date ? date.getFullYear() : -1);
  const [showMonths, setShowMonths] = useState(false);
  const [showDays, setShowDays] = useState(false);
  const [showYears, setShowYears] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const daysInMonth = month >= 0 && year > 0 ? new Date(year, month + 1, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (month >= 0 && day > 0 && year > 0) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) setDate(d);
    }
  }, [month, day, year]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.selector} onPress={() => { setShowMonths(!showMonths); setShowDays(false); setShowYears(false); }}>
          <Text style={styles.selectorText}>{month >= 0 ? MONTHS_FULL[month] : 'Month'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selector} onPress={() => { setShowDays(!showDays); setShowMonths(false); setShowYears(false); }}>
          <Text style={styles.selectorText}>{day > 0 ? day : 'Day'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selector} onPress={() => { setShowYears(!showYears); setShowMonths(false); setShowDays(false); }}>
          <Text style={styles.selectorText}>{year > 0 ? year : 'Year'}</Text>
        </TouchableOpacity>
      </View>

      {showMonths && (
        <ScrollView style={styles.dropdown} nestedScrollEnabled>
          {MONTHS_FULL.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dropdownItem, month === i && styles.dropdownItemActive]}
              onPress={() => { setMonth(i); setShowMonths(false); }}
            >
              <Text style={[styles.dropdownText, month === i && styles.dropdownTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showDays && (
        <ScrollView style={styles.dropdown} nestedScrollEnabled>
          {days.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dropdownItem, day === d && styles.dropdownItemActive]}
              onPress={() => { setDay(d); setShowDays(false); }}
            >
              <Text style={[styles.dropdownText, day === d && styles.dropdownTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showYears && (
        <ScrollView style={styles.dropdown} nestedScrollEnabled>
          {years.map(y => (
            <TouchableOpacity
              key={y}
              style={[styles.dropdownItem, year === y && styles.dropdownItemActive]}
              onPress={() => { setYear(y); setShowYears(false); }}
            >
              <Text style={[styles.dropdownText, year === y && styles.dropdownTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  selector: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  selectorText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: COLORS.foreground,
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: COLORS.white,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.foreground,
  },
  dropdownText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: COLORS.foreground,
  },
  dropdownTextActive: {
    color: COLORS.white,
  },
});
