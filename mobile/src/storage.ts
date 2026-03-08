import AsyncStorage from '@react-native-async-storage/async-storage';
import { LifeEvent } from './types';

const KEYS = {
  birthdate: 'memento-birthdate',
  targetAge: 'memento-target-age',
  events: 'memento-events',
  favorites: 'peace_favorites',
  seenMap: 'peace_seen',
  trackerSent: 'memento-tracker-sent',
};

export async function getBirthdate(): Promise<Date | null> {
  const val = await AsyncStorage.getItem(KEYS.birthdate);
  if (val) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export async function setBirthdate(date: Date): Promise<void> {
  await AsyncStorage.setItem(KEYS.birthdate, date.toISOString());
}

export async function getTargetAge(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.targetAge);
  return val ? parseInt(val) : 80;
}

export async function setTargetAge(age: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.targetAge, String(age));
}

export async function getEvents(): Promise<LifeEvent[]> {
  const val = await AsyncStorage.getItem(KEYS.events);
  if (val) {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

export async function setEvents(events: LifeEvent[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.events, JSON.stringify(events));
}

export async function getFavorites(): Promise<number[]> {
  const val = await AsyncStorage.getItem(KEYS.favorites);
  if (val) {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

export async function setFavorites(favs: number[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(favs));
}

export async function getSeenMap(): Promise<Record<string, number[]>> {
  const val = await AsyncStorage.getItem(KEYS.seenMap);
  if (val) {
    try { return JSON.parse(val); } catch { return {}; }
  }
  return {};
}

export async function setSeenMap(map: Record<string, number[]>): Promise<void> {
  await AsyncStorage.setItem(KEYS.seenMap, JSON.stringify(map));
}
