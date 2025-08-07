/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  // 🔥 다크모드 완전 비활성화 - 라이트모드만 사용
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [],
};
