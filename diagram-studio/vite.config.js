import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Source diagrams live one directory above this viewer.
  server: { fs: { allow: ['..'] } },
  define: { 'process.env.IS_PREACT': JSON.stringify('false') },
});
