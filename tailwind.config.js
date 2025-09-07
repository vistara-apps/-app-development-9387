/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 11%, 95%)',
        accent: 'hsl(17, 98%, 58%)',
        primary: 'hsl(218, 98%, 48%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(220, 15%, 25%)',
        'text-secondary': 'hsl(220, 15%, 45%)',
        dark: {
          bg: 'hsl(230, 20%, 9%)',
          surface: 'hsl(230, 15%, 15%)',
          'surface-light': 'hsl(230, 15%, 20%)',
          text: 'hsl(0, 0%, 95%)',
          'text-secondary': 'hsl(0, 0%, 70%)',
        }
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0,0%,0%,0.08)',
        'card-dark': '0 4px 12px hsla(0,0%,0%,0.3)',
      }
    },
  },
  plugins: [],
}