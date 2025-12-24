/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Airport Terminal Palette
                "terminal-black": "#0c0c0c",      // Deep asphalt/carbon
                "terminal-gray": "#1a1a1a",       // Material for controls
                "terminal-metal": "#2a2a2a",      // Industrial border
                "terminal-gold": "#ffd700",       // Primary board yellow/gold
                "terminal-white": "#e0e0e0",       // Secondary text
                "terminal-eggshell": "#f0ead6",    // Warmer white for special actions
                "terminal-dim": "#404040",        // Muted labels/icons
                "terminal-accent": "#00aaff",     // Blue accent for some lights
                "primary": "#ffd700",             // Map to gold
                "surface-sepia": "#1a1a1a",       // Redefining old vars
                "accent-sepia": "#ffd700",
                "dark-sepia-ink": "#0c0c0c",
                "background-parchment": "#0c0c0c",
            },
            boxShadow: {
                'terminal-lg': '0 0 50px rgba(0, 0, 0, 0.5)',
                'terminal-sm': '0 0 15px rgba(255, 215, 0, 0.3)',
                'terminal': '0 0 20px rgba(255, 215, 0, 0.2)',
                'terminal-hover': '0 0 30px rgba(255, 215, 0, 0.4)',
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"]
            },
        },
    },
    plugins: [],
}
