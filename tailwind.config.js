module.exports = {
  theme: {
    extend: {
      width: {
        '1/7': '14.2%',
        '1/8': '12.5%',
        '1/10': '10%'
      }
    }
  },
  variants: {
  },
  content: [
    './app/javascript/**/*.js'
  ],
  safelist: [
    'bg-blue-400',
    'bg-gray-400',
    'odd:bg-gray-200',
    'even:bg-white'
  ]
}
