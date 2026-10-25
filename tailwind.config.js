/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lab-bg': '#FFFFFF',
        'lab-surface': '#F7F9FC',
        'lab-surface-subtle': '#EDF2F7',
        'lab-text': '#172033',
        'lab-muted': '#637083',
        'lab-border': '#E3E8EF',
        'lab-primary': '#2563EB',
        'lab-healthy': '#16A34A',
        'lab-warning': '#D97706',
        'lab-failure': '#DC2626',
        'lab-packet': '#0EA5E9',
        'lab-purple': '#7C3AED',
        // Dark Mode design tokens inspired by modern fintech/medical bento aesthetics
        'dark-bg': '#090D16',
        'dark-surface': '#0F172A',
        'dark-card': '#131B2E',
        'dark-card-hover': '#1A243B',
        'dark-border': '#1F293D',
        'dark-border-subtle': '#2B384E',
        'neon-green': '#10B981',
        'neon-lime': '#84CC16',
        'neon-sky': '#38BDF8',
        slate: { 850: '#172033' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 15px -3px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(37, 99, 235, 0.35)',
        'glow-sky': '0 0 15px -3px rgba(14, 165, 233, 0.35)',
        'bento': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'bento-dark': '0 4px 24px -2px rgba(0, 0, 0, 0.4)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '13.5': '3.375rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
