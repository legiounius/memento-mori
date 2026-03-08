export type EventType = 'BIRTHDAY' | 'DEATH' | 'MARRIAGE' | 'MOVE' | 'OTHER';

export interface LifeEvent {
  id: string;
  date: string;
  label: string;
  type: EventType;
}

export const EVENT_TYPES: Record<EventType, { label: string; color: string }> = {
  BIRTHDAY: { label: 'Birthday', color: '#ca8a04' },
  DEATH: { label: 'Death', color: '#2563eb' },
  MARRIAGE: { label: 'Marriage', color: '#db2777' },
  MOVE: { label: 'Move', color: '#16a34a' },
  OTHER: { label: 'Other', color: '#7c3aed' },
};

export interface WisdomEntry {
  type: string;
  author: string;
  source: string;
  text: string;
}

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_ABBREVS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
