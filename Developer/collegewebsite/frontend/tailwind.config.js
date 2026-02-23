/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#b20000',
                    light: '#d43333',
                    dark: '#8a0000',
                },
                accent: {
                    DEFAULT: '#fead16',
                    light: '#ffc94d',
                    dark: '#ec9f10',
                },
                background: '#f8f8f8',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
}
