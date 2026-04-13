/** @type {import('tailwindcss').Config} */

export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    crimson: '#7B1818',
                    coral: '#C94040',
                    gold: '#C9961A',
                    green: '#4A7C3F',
                    teal: '#2A5C7A',
                    blush: '#F9EDED',
                    cream: '#FAF8F5',
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