import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Hardcoded API Key as requested
    'process.env.API_KEY': JSON.stringify("AIzaSyDAM00kK2CG_8_5WIY4Rd6veXlONy5yJ-4")
  }
});