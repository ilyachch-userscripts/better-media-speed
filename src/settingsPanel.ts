import { DEFAULT_SPEED_OPTIONS } from './constants';
import {
  getActiveSpeedOptions,
  getStoredSpeedOptions,
  parseSpeedValue,
  saveSpeedOptions,
  type SpeedOptionsScope,
} from './storage';

const panelRootId = 'better-media-speed-settings-root';

type SettingsPanelCallbacks = {
  onOptionsChanged: () => void;
};

type SettingsPanelState = {
  scope: SpeedOptionsScope;
  options: number[];
  callbacks: SettingsPanelCallbacks;
};

let panelState: SettingsPanelState | null = null;

function getScopeTitle(scope: SpeedOptionsScope): string {
  return scope === 'global' ? 'Global presets' : 'Site presets';
}

function getScopeDescription(scope: SpeedOptionsScope): string {
  return scope === 'global'
    ? 'Used everywhere unless a site-specific list overrides it.'
    : `Only used on ${window.location.hostname}.`;
}

function getInitialScopeOptions(scope: SpeedOptionsScope): number[] {
  return getStoredSpeedOptions(scope) ?? getActiveSpeedOptions();
}

function normalizePanelOptions(options: number[]): number[] {
  return Array.from(new Set(options)).sort((left, right) => left - right);
}

function closeSettingsPanel(): void {
  document.getElementById(panelRootId)?.remove();
  document.body.classList.remove('better-media-speed-settings-open');
  panelState = null;
}

function renderOptionItem(option: number): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'better-media-speed-settings__item';

  const value = document.createElement('span');
  value.className = 'better-media-speed-settings__item-value';
  value.textContent = `${option}x`;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'better-media-speed-settings__item-remove';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    if (!panelState) {
      return;
    }

    panelState.options = panelState.options.filter((value) => value !== option);

    if (panelState.options.length === 0) {
      panelState.options = [...DEFAULT_SPEED_OPTIONS];
    }

    saveSpeedOptions(panelState.scope, panelState.options);
    panelState.callbacks.onOptionsChanged();
    renderSettingsPanel();
  });

  item.append(value, removeButton);
  return item;
}

function buildSettingsPanel(): HTMLDivElement | null {
  if (!panelState) {
    return null;
  }

  const overlay = document.createElement('div');
  overlay.id = panelRootId;
  overlay.className = 'better-media-speed-settings';

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeSettingsPanel();
    }
  });

  const panel = document.createElement('div');
  panel.className = 'better-media-speed-settings__panel';

  const header = document.createElement('div');
  header.className = 'better-media-speed-settings__header';

  const headingGroup = document.createElement('div');

  const title = document.createElement('h2');
  title.className = 'better-media-speed-settings__title';
  title.textContent = getScopeTitle(panelState.scope);

  const description = document.createElement('p');
  description.className = 'better-media-speed-settings__description';
  description.textContent = getScopeDescription(panelState.scope);

  headingGroup.append(title, description);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'better-media-speed-settings__close';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeSettingsPanel);

  header.append(headingGroup, closeButton);

  const list = document.createElement('div');
  list.className = 'better-media-speed-settings__list';
  list.replaceChildren(...panelState.options.map((option) => renderOptionItem(option)));

  const addSection = document.createElement('div');
  addSection.className = 'better-media-speed-settings__add';

  const addInput = document.createElement('input');
  addInput.type = 'number';
  addInput.step = '0.05';
  addInput.min = '0.05';
  addInput.placeholder = 'Add speed, e.g. 2.5';
  addInput.className = 'better-media-speed-settings__input';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'better-media-speed-settings__button';
  addButton.textContent = 'Add preset';
  addButton.addEventListener('click', () => {
    if (!panelState) {
      return;
    }

    const parsedValue = parseSpeedValue(addInput.value);
    if (parsedValue === null) {
      addInput.setCustomValidity('Enter a positive number.');
      addInput.reportValidity();
      return;
    }

    addInput.setCustomValidity('');
    panelState.options = normalizePanelOptions([...panelState.options, parsedValue]);
    saveSpeedOptions(panelState.scope, panelState.options);
    panelState.callbacks.onOptionsChanged();
    renderSettingsPanel();
  });

  addInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addButton.click();
    }
  });

  addSection.append(addInput, addButton);

  const footer = document.createElement('div');
  footer.className = 'better-media-speed-settings__footer';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'better-media-speed-settings__button is-secondary';
  resetButton.textContent = 'Reset to defaults';
  resetButton.addEventListener('click', () => {
    if (!panelState) {
      return;
    }

    panelState.options = [...DEFAULT_SPEED_OPTIONS];
    saveSpeedOptions(panelState.scope, panelState.options);
    panelState.callbacks.onOptionsChanged();
    renderSettingsPanel();
  });

  footer.append(resetButton);
  panel.append(header, list, addSection, footer);
  overlay.append(panel);

  return overlay;
}

function renderSettingsPanel(): void {
  const existingRoot = document.getElementById(panelRootId);
  const panel = buildSettingsPanel();

  if (!panel) {
    return;
  }

  if (existingRoot) {
    existingRoot.replaceWith(panel);
  } else {
    document.body.append(panel);
  }

  document.body.classList.add('better-media-speed-settings-open');
}

export function openSettingsPanel(scope: SpeedOptionsScope, callbacks: SettingsPanelCallbacks): void {
  panelState = {
    scope,
    options: getInitialScopeOptions(scope),
    callbacks,
  };

  renderSettingsPanel();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && panelState) {
    closeSettingsPanel();
  }
});
