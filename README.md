# Better Media Speed

Userscript for controlling audio and video playback speed on any website.

## Features

- Floating speed switcher for any `video` or `audio` element.
- Global and site-specific speed presets via the userscript menu.
- Keyboard shortcuts for speed changes and quick seeking.
- Persistent playback speed and preset storage between visits.
- Speed change toast so the current rate is always visible.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. [Click here to install](https://github.com/ilyachch-userscripts/better-media-speed/releases/latest/download/better-media-speed.user.js).

## Shortcuts

- `Ctrl` + `Alt` + `.` - increase playback speed.
- `Ctrl` + `Alt` + `,` - decrease playback speed.
- `Shift` + `ArrowRight` / `ArrowLeft` - large seek.
- `Ctrl` + `ArrowRight` / `ArrowLeft` - medium seek.

## Usage

- Start playing any media file and the control appears in the bottom-left corner.
- Hover the badge to reveal all configured speed presets.
- Open the userscript manager menu to edit or reset global and per-site presets.

## Development

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Build for production
npm run build
```

Built with [Vite](https://vitejs.dev/) and [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey).

## License

Distributed under the MIT License. See `LICENSE` for more information.
