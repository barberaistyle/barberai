import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // PRIORITY: Check system process.env first (Netlify), then loaded env file
  const apiKey = process.env.API_KEY || env.API_KEY;
  
  // Log during build so you can check Netlify "Deploy Logs" to see if it worked
  if (!apiKey) {
    console.warn("⚠️ WARNING: API_KEY is missing in the build environment!");
  } else {
    console.log("✅ API_KEY successfully detected during build.");
  }

  return {
    plugins: [react()],
    define: {
      // Inject the key securely
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});