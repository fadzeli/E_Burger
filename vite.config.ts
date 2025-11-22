import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: './', // Ensures assets are relative, essential for GitHub Pages
    define: {
      // Polyfill process.env for the Gemini SDK usage
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});