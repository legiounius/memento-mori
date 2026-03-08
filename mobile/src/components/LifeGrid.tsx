import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Circle, Text as SvgText, G, Line } from 'react-native-svg';
import { differenceInMonths } from 'date-fns';
import { COLORS, FONT_FAMILY, typography } from '../theme';
import { LifeEvent, EventType, EVENT_TYPES, MONTH_ABBREVS } from '../types';

interface LifeGridProps {
  birthdate: Date;
  targetAge: number;
  events: LifeEvent[];
  bornLabel?: string;
  deadLabel?: string;
}

const MONTHS_PER_YEAR = 12;

interface YearEvent {
  monthInYear: number;
  labels: string[];
  types: EventType[];
}

export default function LifeGrid({ birthdate, targetAge, events, bornLabel, deadLabel }: LifeGridProps) {
  const [popover, setPopover] = useState<{ text: string; color?: string } | null>(null);
  const totalMonths = targetAge * MONTHS_PER_YEAR;
  const screenWidth = Dimensions.get('window').width;

  const monthsLived = useMemo(() => {
    const today = new Date();
    return Math.min(totalMonths, Math.max(0, differenceInMonths(today, birthdate)));
  }, [birthdate, totalMonths]);

  const currentYearIndex = Math.floor((monthsLived - 1) / MONTHS_PER_YEAR);
  const currentMonthInYear = (monthsLived - 1) % MONTHS_PER_YEAR;

  const eventsByYear = useMemo(() => {
    const map = new Map<number, YearEvent[]>();
    for (const event of events) {
      const eventDate = new Date(event.date);
      const monthIndex = differenceInMonths(eventDate, birthdate);
      if (monthIndex >= 0 && monthIndex < totalMonths) {
        const yearIdx = Math.floor(monthIndex / MONTHS_PER_YEAR);
        const monthInYear = monthIndex % MONTHS_PER_YEAR;
        const existing = map.get(yearIdx);
        const eventType = event.type || 'OTHER';
        const yearEvent: YearEvent = { monthInYear, labels: [event.label], types: [eventType as EventType] };
        if (existing) {
          const found = existing.find(e => e.monthInYear === monthInYear);
          if (found) {
            found.labels.push(event.label);
            found.types.push(eventType as EventType);
          } else {
            existing.push(yearEvent);
          }
        } else {
          map.set(yearIdx, [yearEvent]);
        }
      }
    }
    return map;
  }, [birthdate, events, totalMonths]);

  const halfAge = Math.ceil(targetAge / 2);
  const leftYears = Array.from({ length: halfAge }, (_, i) => i);
  const rightYears = Array.from({ length: targetAge - halfAge }, (_, i) => halfAge + i);
  const lastFilledYear = Math.floor((monthsLived - 1) / MONTHS_PER_YEAR);

  const birthMonth = birthdate.getMonth();
  const monthLabels = Array.from({ length: 12 }, (_, i) => MONTH_ABBREVS[(birthMonth + i) % 12]);

  const dotSize = Math.min(6, (screenWidth - 100) / 30);
  const dotGap = dotSize * 0.6;
  const yearLabelWidth = 20;
  const colWidth = 12 * (dotSize + dotGap) + yearLabelWidth + 8;
  const headerHeight = 30;
  const rowHeight = dotSize + dotGap;

  function renderColumn(years: number[], side: 'left' | 'right') {
    const colX = 0;

    return (
      <View>
        <View style={styles.monthLabelsRow}>
          <View style={{ width: yearLabelWidth }} />
          {monthLabels.map((m, i) => (
            <Text
              key={i}
              style={[styles.monthLabel, { width: dotSize + dotGap, fontSize: Math.min(5, dotSize * 0.7) }]}
            >
              {i === 0 || i === 11 ? m : ''}
            </Text>
          ))}
        </View>

        {years.map((yearIdx) => {
          const yearEvents = eventsByYear.get(yearIdx) || [];

          return (
            <View key={yearIdx} style={[styles.yearRow, { height: rowHeight + 2 }]}>
              <Text style={[styles.yearLabel, { width: yearLabelWidth, fontSize: Math.min(7, dotSize) }]}>
                {yearIdx === 0 ? 'B' : yearIdx}
              </Text>
              {Array.from({ length: 12 }, (_, monthIdx) => {
                const globalMonth = yearIdx * 12 + monthIdx;
                const isLived = globalMonth < monthsLived;
                const isCurrent = yearIdx === currentYearIndex && monthIdx === currentMonthInYear;
                const yearEvent = yearEvents.find(e => e.monthInYear === monthIdx);

                let bgColor = 'transparent';
                let borderColor = '#a1a1aa';
                let borderWidth = 1;

                if (yearEvent) {
                  bgColor = EVENT_TYPES[yearEvent.types[0]]?.color || '#7c3aed';
                  borderColor = bgColor;
                  borderWidth = 0;
                } else if (isCurrent) {
                  const progress = lastFilledYear > 0 ? yearIdx / lastFilledYear : 0;
                  const lightness = Math.round(75 - (75 * Math.min(1, progress)));
                  bgColor = `hsl(0, 0%, ${lightness}%)`;
                  borderColor = COLORS.red;
                  borderWidth = 2;
                } else if (isLived) {
                  const progress = lastFilledYear > 0 ? yearIdx / lastFilledYear : 0;
                  const lightness = Math.round(75 - (75 * Math.min(1, progress)));
                  bgColor = `hsl(0, 0%, ${lightness}%)`;
                  borderColor = bgColor;
                  borderWidth = 0;
                }

                return (
                  <TouchableOpacity
                    key={monthIdx}
                    onPress={() => {
                      if (yearEvent) {
                        setPopover({ text: yearEvent.labels.join(', '), color: EVENT_TYPES[yearEvent.types[0]]?.color });
                      } else if (isCurrent) {
                        setPopover({ text: 'You are here' });
                      }
                    }}
                    style={[
                      styles.dot,
                      {
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: bgColor,
                        borderWidth,
                        borderColor,
                        marginRight: dotGap,
                      },
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bornLabel && (
        <Text style={[typography.small, { textAlign: 'center', marginBottom: 4 }]}>Born: {bornLabel}</Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          <View style={styles.columnContainer}>
            <Text style={[styles.columnHeader, { fontSize: Math.min(8, dotSize) }]}>1st Half Of Your Life</Text>
            {renderColumn(leftYears, 'left')}
          </View>

          <View style={styles.yearsLabel}>
            <Text style={[styles.yearsLabelText, { fontSize: Math.min(7, dotSize) }]}>Y</Text>
            <Text style={[styles.yearsLabelText, { fontSize: Math.min(7, dotSize) }]}>E</Text>
            <Text style={[styles.yearsLabelText, { fontSize: Math.min(7, dotSize) }]}>A</Text>
            <Text style={[styles.yearsLabelText, { fontSize: Math.min(7, dotSize) }]}>R</Text>
            <Text style={[styles.yearsLabelText, { fontSize: Math.min(7, dotSize) }]}>S</Text>
          </View>

          <View style={styles.columnContainer}>
            <Text style={[styles.columnHeader, { fontSize: Math.min(8, dotSize) }]}>2nd Half Of Your Life</Text>
            {renderColumn(rightYears, 'right')}
          </View>
        </View>
      </ScrollView>

      {deadLabel && (
        <Text style={[typography.small, { textAlign: 'center', marginTop: 4 }]}>Target: {deadLabel}</Text>
      )}

      <Modal visible={!!popover} transparent animationType="fade" onRequestClose={() => setPopover(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setPopover(null)} activeOpacity={1}>
          <View style={[styles.modalContent, popover?.color ? { borderLeftColor: popover.color, borderLeftWidth: 3 } : {}]}>
            <Text style={[typography.body, { fontSize: 13 }]}>{popover?.text}</Text>
            <TouchableOpacity onPress={() => setPopover(null)}>
              <Text style={[typography.small, { marginTop: 8 }]}>TAP TO CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  columnContainer: {
    alignItems: 'center',
  },
  columnHeader: {
    fontFamily: FONT_FAMILY,
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  yearsLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 30,
  },
  yearsLabelText: {
    fontFamily: FONT_FAMILY,
    color: COLORS.muted,
    letterSpacing: 2,
  },
  monthLabelsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  monthLabel: {
    fontFamily: FONT_FAMILY,
    color: COLORS.muted,
    textAlign: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearLabel: {
    fontFamily: FONT_FAMILY,
    color: COLORS.muted,
    textAlign: 'right',
    marginRight: 4,
  },
  dot: {},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
