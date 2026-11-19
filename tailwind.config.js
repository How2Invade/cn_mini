/** @type {import('tailwindcss').Config} */

// Palette notes
// slate   -> warm graphite neutrals (used for both paper light mode and graphite dark mode)
// blue    -> muted cobalt, used for routing / primary route lines
// indigo, violet, purple -> one muted plum, used for EtherChannel and VLAN 20
// emerald -> sage green, reserved for "healthy" state
// signal  -> the single brand accent (orange), used for the main actions and selection
const graphite = {
  50: '#F7F6F3',
  100: '#EFEDE8',
  200: '#E0DDD5',
  300: '#C9C5BB',
  400: '#9C978D',
  500: '#75716A',
  600: '#57544F',
  700: '#3A3936',
  800: '#26272A',
  850: '#1D1E21',
  900: '#18191B',
  950: '#0F1011',
};

const cobalt = {
  50: '#EEF3FB',
  100: '#DCE6F6',
  200: '#B9CDEC',
  300: '#8FAEDD',
  400: '#6E95D2',
  500: '#4C78C0',
  600: '#3D62A3',
  700: '#324F84',
  800: '#29406A',
  900: '#223554',
  950: '#151F33',
};

const plum = {
  50: '#F6F1F7',
  100: '#EBE0EE',
  200: '#D7C2DC',
  300: '#BC9CC4',
  400: '#A27DAD',
  500: '#875D93',
  600: '#6F4A79',
  700: '#5A3C63',
  800: '#47304E',
  900: '#382740',
  950: '#221726',
};

const sage = {
  50: '#EFF6F0',
  100: '#D9EBDD',
  200: '#B4D8BD',
  300: '#88BF97',
  400: '#62A775',
  500: '#468F5C',
  600: '#37764A',
  700: '#2D5E3C',
  800: '#254B31',
  900: '#1E3D28',
  950: '#0F2216',
};

const teal = {
  50: '#ECF6F8',
  100: '#D3EAF0',
  200: '#A9D5E1',
  300: '#77BCCE',
  400: '#4FA5BC',
  500: '#2E8BA4',
  600: '#257189',
  700: '#215C6F',
  800: '#1F4B5B',
  900: '#1C3E4B',
  950: '#0E242D',
};

const brick = {
  50: '#FBF0EF',
  100: '#F6DCDA',
  200: '#EDB8B4',
  300: '#E08E88',
  400: '#D2665F',
  500: '#C04840',
  600: '#A33933',
  700: '#852F2B',
  800: '#6C2826',
  900: '#592321',
  950: '#2F100F',
};

const signal = {
  50: '#FDF2EB',
  100: '#FADFCD',
  200: '#F5BE9B',
  300: '#F29C68',
  400: '#EE7F40',
  500: '#E2621E',
  600: '#C45015',
  700: '#9C3F12',
  800: '#7A3313',
  900: '#5E2913',
  950: '#2C1207',
};

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: graphite,
        gray: graphite,
        blue: cobalt,
        indigo: plum,
        violet: plum,
        purple: plum,
        emerald: sage,
        green: sage,
        sky: teal,
        cyan: teal,
        teal,
        rose: brick,
        red: brick,
        signal,
        paper: {
          DEFAULT: '#F3F1EA',
          raised: '#FBFAF6',
          line: '#DFDBD0',
        },
        ink: {
          DEFAULT: '#0F1011',
          raised: '#17181A',
          line: '#2A2C30',
        },
        // legacy tokens kept so nothing references a missing colour
        'lab-bg': '#FBFAF6',
        'lab-surface': '#F3F1EA',
        'lab-surface-subtle': '#EFEDE8',
        'lab-text': '#1B1B1A',
        'lab-muted': '#75716A',
        'lab-border': '#DFDBD0',
        'lab-primary': '#E2621E',
        'lab-healthy': '#468F5C',
        'lab-warning': '#C9861A',
        'lab-failure': '#C8423B',
        'lab-packet': '#2E9BB8',
        'lab-purple': '#875D93',
        'dark-bg': '#0F1011',
        'dark-surface': '#17181A',
        'dark-card': '#17181A',
        'dark-card-hover': '#1E1F22',
        'dark-border': '#2A2C30',
        'dark-border-subtle': '#34363B',
        'neon-green': '#468F5C',
        'neon-lime': '#8BA63B',
        'neon-sky': '#2E9BB8',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-green': 'none',
        'glow-blue': 'none',
        'glow-sky': 'none',
        bento: '0 1px 0 rgba(0,0,0,0.03)',
        'bento-dark': '0 1px 0 rgba(0,0,0,0.3)',
        '2xs': '0 1px 0 0 rgba(0, 0, 0, 0.04)',
        xs: '0 1px 0 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        lg: '6px',
        xl: '7px',
        '2xl': '8px',
        '3xl': '10px',
        '4xl': '12px',
      },
      spacing: {
        7.5: '1.875rem',
        8.5: '2.125rem',
        13.5: '3.375rem',
        88: '22rem',
      },
    },
  },
  plugins: [],
};
