import { DEFAULT_SPEED_OPTIONS } from './constants';
import { getActiveSpeedOptions, getPlaybackSpeed, savePlaybackSpeed } from './storage';

let currentPlayingMedia: HTMLMediaElement | null = null;

export function getCurrentPlayingMedia(): HTMLMediaElement | null {
  return currentPlayingMedia;
}

export function setCurrentPlayingMedia(mediaElement: HTMLMediaElement | null): void {
  currentPlayingMedia = mediaElement;
}

export function getMediaElements(): HTMLMediaElement[] {
  return Array.from(document.querySelectorAll<HTMLMediaElement>('video, audio'));
}

export function applyPlaybackSpeed(speed: number, mediaElement?: HTMLMediaElement): void {
  if (mediaElement) {
    mediaElement.playbackRate = speed;
  } else {
    for (const element of getMediaElements()) {
      element.playbackRate = speed;
    }
  }

  savePlaybackSpeed(speed);
}

export function getShortcutSpeedOptions(): number[] {
  const options = [...getActiveSpeedOptions()];
  const currentSpeed = getPlaybackSpeed();

  if (!options.includes(currentSpeed)) {
    options.push(currentSpeed);
  }

  if (!options.includes(1) && DEFAULT_SPEED_OPTIONS.includes(1)) {
    options.push(1);
  }

  return options.sort((left, right) => left - right);
}

export function getNextSpeed(direction: 'increase' | 'decrease'): number | null {
  const currentSpeed = getPlaybackSpeed();
  const options = getShortcutSpeedOptions();

  if (direction === 'increase') {
    return options.find((speed) => speed > currentSpeed) ?? null;
  }

  return [...options].reverse().find((speed) => speed < currentSpeed) ?? null;
}
