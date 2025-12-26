/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Modern Design Palette
                "brand": {
                    "green": "#00fb73",
                    "green-dark": "#00d161",
                    "green-light": "#e6fff1",
                },
                "ui": {
                    "bg": "#f8f9fa",
                    "surface": "#ffffff",
                    "text": "#111111",
                    "text-muted": "#666666",
                    "border": "#eeeeee",
                }
            },
            boxShadow: {
                'modern-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'modern-md': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'modern-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
                'brand-glow': '0 0 20px rgba(0, 251, 115, 0.3)',
            },
            fontFamily: {
                "display": ["Outfit", "Inter", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"]
            },
        },
    },
    plugins: [],
}
