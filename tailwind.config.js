module.exports = {
  theme: {
    extend: {
      width: {
        '1/7': '14.2%',
        '1/8': '12.5%',
        '1/10': '10%',
        '2/10': '20%',
        '3/10': '30%',
        '4/10': '40%',
        '5/10': '50%',
        '6/10': '60%',
        '7/10': '70%',
        '8/10': '80%',
        '9/10': '90%',
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
