import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.IS_PREACT': 'false', // for Excalidraw v0.17 and later: https://github.com/excalidraw/excalidraw/releases/tag/v0.17.0
  },
});
