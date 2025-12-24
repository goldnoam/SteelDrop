
module.exports = {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        slate: {
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
