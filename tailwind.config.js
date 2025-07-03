/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bacnet: {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
          }
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace']
      }
    },
  },
  plugins: [],
}