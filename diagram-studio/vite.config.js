import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Source diagrams live one directory above this viewer.
  server: { fs: { allow: ['..'] } },
  define: { 'process.env.IS_PREACT': JSON.stringify('false') },
});
