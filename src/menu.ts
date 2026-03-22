import { GM_registerMenuCommand } from '$';
import {
  getActiveSpeedOptions,
  getStoredSpeedOptions,
  hasStoredSpeedOptions,
  parseSpeedOptionsPrompt,
  resetSpeedOptions,
  saveSpeedOptions,
  type SpeedOptionsScope,
} from './storage';

type MenuCallbacks = {
  onOptionsChanged: () => void;
};

function promptForOptions(scope: SpeedOptionsScope, onOptionsChanged: () => void): void {
  const currentOptions = getStoredSpeedOptions(scope) ?? getActiveSpeedOptions();
  const input = window.prompt(
    `Enter ${scope} speed options (comma separated)`,
    currentOptions.join(',')
  );

  if (input === null) {
    return;
  }

  const options = parseSpeedOptionsPrompt(input);
  if (!options) {
    window.alert('Please enter at least one valid positive number.');
    return;
  }

  saveSpeedOptions(scope, options);
  onOptionsChanged();
}

export function registerMenuCommands({ onOptionsChanged }: MenuCallbacks): void {
  GM_registerMenuCommand('Set Global Speed Options', () => {
    promptForOptions('global', onOptionsChanged);
  });

  GM_registerMenuCommand('Set Site Speed Options', () => {
    promptForOptions('site', onOptionsChanged);
  });

  if (hasStoredSpeedOptions('global')) {
    GM_registerMenuCommand('Reset Global Speed Options', () => {
      resetSpeedOptions('global');
      onOptionsChanged();
    });
  }

  if (hasStoredSpeedOptions('site')) {
    GM_registerMenuCommand('Reset Site Speed Options', () => {
      resetSpeedOptions('site');
      onOptionsChanged();
    });
  }
}
