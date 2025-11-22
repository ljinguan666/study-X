import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Safely define the specific env var string for browser usage
      // Support VITE_API_KEY, GEMINI_API_KEY, and API_KEY (in order of priority)
      'process.env.API_KEY': JSON.stringify(
        env.VITE_API_KEY || 
        env.GEMINI_API_KEY || 
        env.API_KEY || 
        ''
      ),
    },
    server: {
      port: 3000
    }
  };
});