/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        card: '#f8f8f8',
        'muted-foreground': '#666666',
        primary: '#000000',
        'primary-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
};
