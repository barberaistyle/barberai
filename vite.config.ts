import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Sanity check for build logs
  if (!env.API_KEY) {
    console.warn("WARNING: API_KEY is not defined in the environment variables during build.");
  }

  return {
    plugins: [react()],
    define: {
      // JSON.stringify handles quotes correctly
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});