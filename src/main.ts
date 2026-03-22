import './style.css';
import {
  DEFAULT_VIDEO_STEP,
  LARGE_VIDEO_STEP,
  MEDIUM_VIDEO_STEP,
} from './constants';
import {
  applyPlaybackSpeed,
  getCurrentPlayingMedia,
  getMediaElements,
  getNextSpeed,
  setCurrentPlayingMedia,
} from './media';
import { registerMenuCommands } from './menu';
import { getActiveSpeedOptions, getPlaybackSpeed } from './storage';
import { ensureUi, renderUi, showNotification, updateSelectedSpeed } from './ui';

function getRenderedSpeedOptions(): number[] {
  const options = [...getActiveSpeedOptions()];
  const currentSpeed = getPlaybackSpeed();

  if (!options.includes(currentSpeed)) {
    options.push(currentSpeed);
  }

  return options.sort((left, right) => left - right);
}

function refreshUi(): void {
  if (getMediaElements().length === 0 && !getCurrentPlayingMedia()) {
    return;
  }

  const rendered = getRenderedSpeedOptions();
  const currentSpeed = getPlaybackSpeed();

  if (!ensureUi(applySpeed)) {
    return;
  }

  renderUi(rendered, currentSpeed);
}

function applySpeed(speed: number, mediaElement?: HTMLMediaElement): void {
  applyPlaybackSpeed(speed, mediaElement);
  refreshUi();
  updateSelectedSpeed(speed);
  showNotification(speed);
}

function hasEditableFocus(): boolean {
  const activeElement = document.activeElement as HTMLElement | null;

  if (!activeElement) {
    return false;
  }

  if (activeElement.isContentEditable) {
    return true;
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
}

function seekPlayingMedia(offset: number): void {
  const mediaElement = getCurrentPlayingMedia();
  if (!mediaElement) {
    return;
  }

  mediaElement.currentTime = Math.max(0, mediaElement.currentTime + offset);
}

function setupMediaListeners(): void {
  document.addEventListener(
    'play',
    (event) => {
      const mediaElement = event.target instanceof HTMLMediaElement ? event.target : null;
      if (!mediaElement) {
        return;
      }

      setCurrentPlayingMedia(mediaElement);
      refreshUi();
      applyPlaybackSpeed(getPlaybackSpeed(), mediaElement);
      updateSelectedSpeed(getPlaybackSpeed());
    },
    true
  );
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event) => {
    if (hasEditableFocus()) {
      return;
    }

    const mediaElement = getCurrentPlayingMedia();
    if (!mediaElement) {
      return;
    }

    if (event.shiftKey && event.code === 'ArrowRight') {
      seekPlayingMedia(LARGE_VIDEO_STEP - DEFAULT_VIDEO_STEP);
      return;
    }

    if (event.shiftKey && event.code === 'ArrowLeft') {
      seekPlayingMedia(DEFAULT_VIDEO_STEP - LARGE_VIDEO_STEP);
      return;
    }

    if (event.ctrlKey && event.code === 'ArrowRight') {
      seekPlayingMedia(MEDIUM_VIDEO_STEP - DEFAULT_VIDEO_STEP);
      return;
    }

    if (event.ctrlKey && event.code === 'ArrowLeft') {
      seekPlayingMedia(DEFAULT_VIDEO_STEP - MEDIUM_VIDEO_STEP);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (hasEditableFocus() || !getCurrentPlayingMedia()) {
      return;
    }

    if (event.ctrlKey && event.altKey && event.code === 'Period') {
      const nextSpeed = getNextSpeed('increase');
      if (nextSpeed !== null) {
        applySpeed(nextSpeed);
      }
      return;
    }

    if (event.ctrlKey && event.altKey && event.code === 'Comma') {
      const previousSpeed = getNextSpeed('decrease');
      if (previousSpeed !== null) {
        applySpeed(previousSpeed);
      }
    }
  });
}

function initializeExistingMedia(): void {
  const mediaElements = getMediaElements();
  if (mediaElements.length === 0) {
    return;
  }

  setCurrentPlayingMedia(mediaElements[0]);
  applyPlaybackSpeed(getPlaybackSpeed());
  refreshUi();
}

function init(): void {
  setupMediaListeners();
  setupKeyboardShortcuts();
  registerMenuCommands({
    onOptionsChanged: () => {
      refreshUi();
    },
  });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        initializeExistingMedia();
      },
      { once: true }
    );
    return;
  }

  initializeExistingMedia();
}

init();
