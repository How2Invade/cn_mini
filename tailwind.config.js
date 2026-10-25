/** @type {import('tailwindcss').Config} */
export default {
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
