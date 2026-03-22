import { UI_HOST_ATTRIBUTE } from './constants';

export type SpeedSelectHandler = (speed: number) => void;

type UiState = {
  host: HTMLDivElement;
  control: HTMLDivElement;
  title: HTMLButtonElement;
  options: HTMLDivElement;
};

let uiState: UiState | null = null;
let onSpeedSelect: SpeedSelectHandler | null = null;

function createOptionButton(speed: number, selectedSpeed: number): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'better-media-speed__option';
  button.dataset.speed = String(speed);
  button.textContent = String(speed);
  button.setAttribute('aria-pressed', String(speed === selectedSpeed));

  if (speed === selectedSpeed) {
    button.classList.add('is-selected');
  }

  button.addEventListener('click', () => {
    onSpeedSelect?.(speed);
  });

  return button;
}

function createUiState(): UiState | null {
  if (!document.body) {
    return null;
  }

  const existingHost = document.querySelector<HTMLDivElement>(`[${UI_HOST_ATTRIBUTE}="true"]`);
  if (existingHost) {
    const control = existingHost.querySelector<HTMLDivElement>('.better-media-speed');
    const title = existingHost.querySelector<HTMLButtonElement>('.better-media-speed__title');
    const options = existingHost.querySelector<HTMLDivElement>('.better-media-speed__options');

    if (control && title && options) {
      return { host: existingHost, control, title, options };
    }
  }

  const host = document.createElement('div');
  host.setAttribute(UI_HOST_ATTRIBUTE, 'true');
  const root = document.createElement('div');
  root.className = 'better-media-speed';

  const title = document.createElement('button');
  title.type = 'button';
  title.className = 'better-media-speed__title';
  title.setAttribute('aria-label', 'Current playback speed');

  const options = document.createElement('div');
  options.className = 'better-media-speed__options';

  root.append(title, options);
  host.append(root);
  document.body.append(host);

  return { host, control: root, title, options };
}

export function ensureUi(onSelect: SpeedSelectHandler): boolean {
  onSpeedSelect = onSelect;

  if (!uiState) {
    uiState = createUiState();
  }

  return uiState !== null;
}

export function renderUi(speedOptions: number[], selectedSpeed: number): void {
  if (!uiState) {
    return;
  }

  uiState.title.textContent = String(selectedSpeed);
  uiState.options.replaceChildren(
    ...speedOptions.map((speed) => createOptionButton(speed, selectedSpeed))
  );
}

export function updateSelectedSpeed(selectedSpeed: number): void {
  if (!uiState) {
    return;
  }

  uiState.title.textContent = String(selectedSpeed);

  for (const option of Array.from(uiState.options.querySelectorAll<HTMLButtonElement>('.better-media-speed__option'))) {
    const isSelected = option.dataset.speed === String(selectedSpeed);
    option.classList.toggle('is-selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  }
}

export function showNotification(speed: number): void {
  if (!uiState) {
    return;
  }

  const existingNotification = uiState.host.querySelector('.better-media-speed__notification');
  existingNotification?.remove();

  const notification = document.createElement('div');
  notification.className = 'better-media-speed__notification';
  notification.textContent = `x${speed}`;
  uiState.host.append(notification);

  window.setTimeout(() => {
    notification.classList.add('is-hiding');
  }, 1700);

  window.setTimeout(() => {
    notification.remove();
  }, 1900);
}
