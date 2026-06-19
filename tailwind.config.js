export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C63FF',
          dark:    '#4A43CC',
          light:   '#9B94FF'
        },
        surface: {
          DEFAULT: '#13131a',
          card:    '#1c1c26',
          border:  '#2a2a35'
        }
      }
    }
  },
  plugins: []
}
