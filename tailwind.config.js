/** @type {import('tailwindcss').Config} */
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // Scans all Vue/JS/TS files in src/
    ],
    theme: {
      extend: {},
    },
      optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
    plugins: [
          viteCommonjs(),

    ],
  }