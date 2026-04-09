/** @type {import('tailwindcss').Config} */

export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    crimson: '#7B1818',
                    coral: '#C94040',
                    blush: '#F2D6D6',
                    gold: '#C9A227',  // from logo palette
                    teal: '#3A8C8C',
                },
            },
            fontFamily: {
                display: ['Georgia', 'serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: []
};