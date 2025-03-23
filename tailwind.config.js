/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", "./src/**/*.{js,jsx}"], // Охватывает все файлы в public и src
  theme: {
    extend: {
      colors: {
        "boodai-orange": "#F5A623", // Оранжевый цвет из скриншота
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out', // Анимация для появления элементов
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};