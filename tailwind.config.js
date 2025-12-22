/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                clinical: {
                    900: '#0f172a', // Deep background
                    800: '#1e293b', // Panel background
                    700: '#334155', // Border
                    100: '#f1f5f9', // Text
                    alert: {
                        critical: '#ef4444', // Red
                        urgent: '#f97316',   // Orange
                        warning: '#eab308',  // Yellow
                        normal: '#22c55e',   // Green
                    }
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
