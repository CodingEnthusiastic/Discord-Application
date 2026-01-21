/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                discord: {
                    'dark': '#36393f',
                    'darker': '#2f3136',
                    'darkest': '#202225',
                    'light': '#dcddde',
                    'brand': '#5865f2',
                    'brand-hover': '#4752c4',
                    'server-hover': '#36393f',
                },
                glass: {
                    'overlay': 'rgba(0, 0, 0, 0.4)',
                    'border': 'rgba(255, 255, 255, 0.08)',
                    'highlight': 'rgba(255, 255, 255, 0.1)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Ensure a clean sans-serif is used
            }
        },
    },
    plugins: [],
}
