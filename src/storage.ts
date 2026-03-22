import { GM_deleteValue, GM_getValue, GM_setValue } from '$';
import {
  DEFAULT_SPEED_OPTIONS,
  GLOBAL_STORAGE_KEY,
  LOCAL_STORAGE_KEY,
  SITE_STORAGE_KEY_PREFIX,
} from './constants';

export type SpeedOptionsScope = 'global' | 'site';

function parseSpeedValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function normalizeSpeedOptions(options: unknown): number[] {
  if (!Array.isArray(options)) {
    return [...DEFAULT_SPEED_OPTIONS];
  }

  const normalized = options
    .map(parseSpeedValue)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);

  return normalized.length > 0 ? Array.from(new Set(normalized)) : [...DEFAULT_SPEED_OPTIONS];
}

export function parseSpeedOptionsPrompt(input: string): number[] | null {
  const normalized = input
    .split(',')
    .map(parseSpeedValue)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);

  if (normalized.length === 0) {
    return null;
  }

  return Array.from(new Set(normalized));
}

export function getSiteStorageKey(hostname = window.location.hostname): string {
  return `${SITE_STORAGE_KEY_PREFIX}${hostname}`;
}

export function getStoredSpeedOptions(scope: SpeedOptionsScope): number[] | null {
  const storageKey = scope === 'global' ? GLOBAL_STORAGE_KEY : getSiteStorageKey();
  const storedValue = GM_getValue(storageKey);

  if (typeof storedValue === 'undefined') {
    return null;
  }

  return normalizeSpeedOptions(storedValue);
}

export function getActiveSpeedOptions(): number[] {
  return getStoredSpeedOptions('site') ?? getStoredSpeedOptions('global') ?? [...DEFAULT_SPEED_OPTIONS];
}

export function getPlaybackSpeed(): number {
  return parseSpeedValue(window.localStorage.getItem(LOCAL_STORAGE_KEY)) ?? 1;
}

export function savePlaybackSpeed(speed: number): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, String(speed));
}

export function saveSpeedOptions(scope: SpeedOptionsScope, options: number[]): void {
  const storageKey = scope === 'global' ? GLOBAL_STORAGE_KEY : getSiteStorageKey();
  GM_setValue(storageKey, normalizeSpeedOptions(options));
}

export function resetSpeedOptions(scope: SpeedOptionsScope): void {
  const storageKey = scope === 'global' ? GLOBAL_STORAGE_KEY : getSiteStorageKey();
  GM_deleteValue(storageKey);
}

export function hasStoredSpeedOptions(scope: SpeedOptionsScope): boolean {
  return getStoredSpeedOptions(scope) !== null;
}
