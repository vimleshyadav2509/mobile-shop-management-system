/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Deep Trust Navy Blue
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706', // Warm Gold/Amber for EMI
          700: '#b45309',
        },
        whatsapp: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a', // Clean WhatsApp Emerald Green
          700: '#15803d',
        },
        space: {
          950: '#060A13', // Deep Luxury Space Navy
          900: '#0B1120',
          800: '#111827',
          700: '#1F2937',
        },
        brand: {
          blue: '#1264F5',
          darkBlue: '#12315B',
          navy: '#102A43',
          lightBlue: '#EAF3FF',
          veryLightBlue: '#F5F9FF',
          green: '#20B26B',
          yellow: '#F4B400',
          red: '#EF4444',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#102A43',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Noto Sans Devanagari', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 2px 6px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 35px -5px rgba(37, 99, 235, 0.2), 0 8px 16px -3px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 40px -10px rgba(37, 99, 235, 0.45)',
        'glow-gold': '0 0 35px -8px rgba(245, 158, 11, 0.4)',
        'glow-whatsapp': '0 0 30px -8px rgba(22, 163, 74, 0.4)',
      }
    },
  },
  plugins: [],
}
