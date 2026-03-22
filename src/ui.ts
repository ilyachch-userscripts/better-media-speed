import { UI_HOST_ATTRIBUTE } from './constants';

export type SpeedSelectHandler = (speed: number) => void;

type UiState = {
  host: HTMLDivElement;
  control: HTMLDivElement;
  title: HTMLButtonElement;
  titleValue: HTMLSpanElement;
  titleIcon: HTMLSpanElement;
  options: HTMLDivElement;
};

let uiState: UiState | null = null;
let onSpeedSelect: SpeedSelectHandler | null = null;
const viewportMargin = 8;

function updateDropdownPlacement(): void {
  if (!uiState || !uiState.control.classList.contains('is-open')) {
    return;
  }

  uiState.control.classList.remove('is-align-left', 'is-align-right', 'is-open-up', 'is-open-down');

  const controlRect = uiState.control.getBoundingClientRect();
  const optionsRect = uiState.options.getBoundingClientRect();

  const shouldAlignLeft = controlRect.left + optionsRect.width <= window.innerWidth - viewportMargin;
  const shouldOpenUp = controlRect.top >= optionsRect.height + viewportMargin;

  uiState.control.classList.add(shouldAlignLeft ? 'is-align-left' : 'is-align-right');
  uiState.control.classList.add(shouldOpenUp ? 'is-open-up' : 'is-open-down');
}

function closeOptions(): void {
  if (!uiState) {
    return;
  }

  uiState.control.classList.remove('is-open');
  uiState.title.setAttribute('aria-expanded', 'false');
}

function toggleOptions(): void {
  if (!uiState) {
    return;
  }

  const isOpen = uiState.control.classList.toggle('is-open');
  uiState.title.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    window.requestAnimationFrame(updateDropdownPlacement);
  }
}

function createOptionButton(speed: number, selectedSpeed: number): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'better-media-speed__option';
  button.dataset.speed = String(speed);
  button.textContent = `${speed}x`;
  button.setAttribute('aria-pressed', String(speed === selectedSpeed));

  if (speed === selectedSpeed) {
    button.classList.add('is-selected');
  }

  button.addEventListener('click', () => {
    closeOptions();
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
    const titleValue = existingHost.querySelector<HTMLSpanElement>('.better-media-speed__title-value');
    const titleIcon = existingHost.querySelector<HTMLSpanElement>('.better-media-speed__title-icon');
    const options = existingHost.querySelector<HTMLDivElement>('.better-media-speed__options');

    if (control && title && titleValue && titleIcon && options) {
      return { host: existingHost, control, title, titleValue, titleIcon, options };
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
  title.setAttribute('aria-haspopup', 'true');
  title.setAttribute('aria-expanded', 'false');

  const titleValue = document.createElement('span');
  titleValue.className = 'better-media-speed__title-value';

  const titleIcon = document.createElement('span');
  titleIcon.className = 'better-media-speed__title-icon';
  titleIcon.textContent = '▾';

  title.append(titleValue, titleIcon);
  title.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleOptions();
  });

  const options = document.createElement('div');
  options.className = 'better-media-speed__options';

  root.append(title, options);
  host.append(root);
  document.body.append(host);

  document.addEventListener('click', (event) => {
    if (!host.contains(event.target as Node)) {
      closeOptions();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOptions();
    }
  });

  window.addEventListener('resize', () => {
    updateDropdownPlacement();
  });

  return { host, control: root, title, titleValue, titleIcon, options };
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

  uiState.titleValue.textContent = `${selectedSpeed}x`;
  uiState.options.replaceChildren(
    ...speedOptions.map((speed) => createOptionButton(speed, selectedSpeed))
  );

  if (uiState.control.classList.contains('is-open')) {
    window.requestAnimationFrame(updateDropdownPlacement);
  }
}

export function updateSelectedSpeed(selectedSpeed: number): void {
  if (!uiState) {
    return;
  }

  uiState.titleValue.textContent = `${selectedSpeed}x`;

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
