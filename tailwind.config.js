module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        dark: 'var(--dark)',
        hover: 'var(--hover)',
        selected: 'var(--selected)',
        text: 'var(--text)',
        'input-text': 'var(--input-text)',
        'input-bg': 'var(--input-bg)'
      }
    }
  },
  plugins: []
}
