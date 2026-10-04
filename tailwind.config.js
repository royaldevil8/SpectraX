/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#07111F',
          deep: '#0A1424',
          surface: '#0D1B2A',
          elevated: '#122238',
          hover: '#16304E',
        },
        border: {
          DEFAULT: '#22344A',
          subtle: '#1A2A3E',
          strong: '#2D4366',
        },
        text: {
          primary: '#F4F7FA',
          secondary: '#8FA3B8',
          muted: '#5A6F84',
        },
        accent: {
          cyan: '#38D5FF',
          'cyan-dim': '#1B8FB8',
          'cyan-glow': 'rgba(56, 213, 255, 0.15)',
        },
        warning: {
          DEFAULT: '#F5B942',
          dim: '#B8862E',
        },
        danger: {
          DEFAULT: '#FF5C6C',
          dim: '#B8404E',
          glow: 'rgba(255, 92, 108, 0.15)',
        },
        success: {
          DEFAULT: '#43D19E',
          dim: '#2E9A73',
          glow: 'rgba(67, 209, 158, 0.15)',
        },
        review: '#F5B942',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', '1rem'],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'progress': 'progress 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progress: {
          '0%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
};
