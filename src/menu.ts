import { GM_registerMenuCommand } from '$';
import { openSettingsPanel } from './settingsPanel';

type MenuCallbacks = {
  onOptionsChanged: () => void;
};

export function registerMenuCommands({ onOptionsChanged }: MenuCallbacks): void {
  GM_registerMenuCommand('Edit Global Speed Options', () => {
    openSettingsPanel('global', { onOptionsChanged });
  });

  GM_registerMenuCommand('Edit Site Speed Options', () => {
    openSettingsPanel('site', { onOptionsChanged });
  });
}
