/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF9F6',
          100: '#F5F3ED',
          200: '#ECE9E1',
          300: '#E0DCD1',
          400: '#CFCABF',
        },
        forest: {
          50: '#F0F4F2',
          100: '#E1EBE6',
          500: '#2A6355',
          600: '#1F4F43',
          700: '#173F35',
          800: '#12332B',
          900: '#0C241E',
        },
        sage: {
          50: '#F3F5F4',
          400: '#8A9E92',
          500: '#71877A',
          600: '#5A6E62',
        },
        olive: {
          400: '#A4AB82',
          500: '#8A916D',
          600: '#707755',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#F9E4DB',
          500: '#C66B4A',
          600: '#AB5737',
          700: '#8F4428',
        },
        ochre: {
          50: '#FCF8EE',
          100: '#F8EFDA',
          500: '#C69A52',
          600: '#AB803A',
        },
        charcoal: {
          DEFAULT: '#202522',
          secondary: '#68706B',
          muted: '#939B95',
          light: '#B2B8B4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(32, 37, 34, 0.05), 0 1px 2px rgba(32, 37, 34, 0.03)',
        'medium': '0 4px 6px -1px rgba(32, 37, 34, 0.06), 0 2px 4px -2px rgba(32, 37, 34, 0.04)',
      }
    },
  },
  plugins: [],
}
