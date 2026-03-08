import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, typography } from '../theme';
import { LifeEvent, EventType, EVENT_TYPES } from '../types';
import DatePicker from './DatePicker';

interface EventFormProps {
  onAdd: (event: LifeEvent) => void;
}

export default function EventForm({ onAdd }: EventFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<EventType>('OTHER');

  const handleSubmit = () => {
    if (!label.trim() || !date) return;
    const event: LifeEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: date.toISOString(),
      label: label.trim(),
      type,
    };
    onAdd(event);
    setLabel('');
    setDate(undefined);
    setType('OTHER');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.addButton} onPress={() => setExpanded(true)}>
        <Text style={styles.addButtonText}>+ Add Life Event</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { textAlign: 'center', marginBottom: 12 }]}>Add A Life Event</Text>

      <TextInput
        style={styles.input}
        placeholder="Event name (e.g., Graduated College)"
        placeholderTextColor={COLORS.muted}
        value={label}
        onChangeText={setLabel}
      />

      <DatePicker date={date} setDate={setDate} />

      <View style={styles.typeRow}>
        {(Object.entries(EVENT_TYPES) as [EventType, { label: string; color: string }][]).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setType(key)}
            style={[styles.typeChip, { borderColor: val.color }, type === key && { backgroundColor: val.color }]}
          >
            <Text style={[styles.typeText, type === key && { color: COLORS.white }]}>{val.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Add Event</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExpanded(false)}>
          <Text style={[typography.small, { marginTop: 8 }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
  },
  addButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.foreground,
  },
  input: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: COLORS.foreground,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    justifyContent: 'center',
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
  typeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.foreground,
  },
  actions: {
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.foreground,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  submitBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.white,
  },
});
