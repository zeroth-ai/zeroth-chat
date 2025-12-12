/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        animation: {
          bounce: 'bounce 1s infinite',
          spin: 'spin 1s linear infinite',
        },
        keyframes: {
          bounce: {
            '0%, 100%': {
              transform: 'translateY(-25%)',
              animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
            },
            '50%': {
              transform: 'translateY(0)',
              animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
            },
          },
          spin: {
            from: {
              transform: 'rotate(0deg)',
            },
            to: {
              transform: 'rotate(360deg)',
            },
          },
        },
      },
    },
    plugins: [],
  }