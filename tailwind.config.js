/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#141F17',
        'ink-light': '#1E2C22',
        'ink-lighter': '#28392C',
        leaf: '#6FA85A',
        'leaf-light': '#9CCB84',
        'leaf-dark': '#3F6B33',
        wheat: '#E8A33D',
        rust: '#C1502E',
        sky: '#4A90A4',
        paper: '#F6F3EA',
        'paper-dim': '#EDE7D6',
        soil: '#2B2015'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
