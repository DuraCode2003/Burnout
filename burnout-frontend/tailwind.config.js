/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          surface: '#111827',
          card: '#1a2235',
          elevated: '#1f2940',
        },
        accent: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
          admin: {
            light: '#0ea5e9',
            DEFAULT: '#0284c7',
            dark: '#0369a1',
          },
          cyan: {
            light: '#22d3ee',
            DEFAULT: '#06b6d4',
            dark: '#0891b2',
          },
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#475569',
          inverse: '#0a0e1a',
        },
        border: {
          subtle: 'rgba(148, 163, 184, 0.1)',
          default: 'rgba(148, 163, 184, 0.2)',
          strong: 'rgba(148, 163, 184, 0.3)',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-admin': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        'gradient-admin-hover': 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
        'glow-indigo': '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-indigo-lg': '0 0 60px rgba(99, 102, 241, 0.25)',
        'glow-admin': '0 0 40px rgba(14, 165, 233, 0.15)',
        'glow-admin-lg': '0 0 60px rgba(14, 165, 233, 0.25)',
      },
    },
  },
  plugins: [],
};
