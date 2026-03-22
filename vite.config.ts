import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const SCRIPT_NAME = 'Better Media Speed';
const NAMESPACE = 'https://github.com/ilyachch';
const MATCH_URLS = ['*://*/*'];
const ICON_URL = 'https://cdn-icons-png.flaticon.com/512/4340/4340125.png';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: SCRIPT_NAME,
        namespace: NAMESPACE,
        match: MATCH_URLS,
        icon: ICON_URL,
        license: 'MIT',
        description: 'Change playback speed on any website',
        author: 'ilyachch',
        grant: [
          'GM_addStyle',
          'GM_registerMenuCommand',
          'GM_setValue',
          'GM_getValue',
          'GM_deleteValue',
        ],
        homepageURL: 'https://github.com/ilyachch-userscripts/better-media-speed',
        supportURL: 'https://github.com/ilyachch-userscripts/better-media-speed/issues',
        updateURL:
          'https://github.com/ilyachch-userscripts/better-media-speed/releases/latest/download/better-media-speed.user.js',
        downloadURL:
          'https://github.com/ilyachch-userscripts/better-media-speed/releases/latest/download/better-media-speed.user.js',
        fileName: 'better-media-speed.user.js',
        'run-at': 'document-start',
      },
    }),
  ],
});
