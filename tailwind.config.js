/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["selector", '[data-theme="dark"]'],
    content: [
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        extend: {
            colors: {
                // Shadcn base
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // App-specific custom colors using CSS variables
                surface: {
                    DEFAULT: "var(--surface)",
                    subtle: "var(--surface-subtle)",
                    hover: "var(--surface-hover)",
                    pressed: "var(--surface-pressed)",
                },
                text: {
                    DEFAULT: "var(--text)",
                    muted: "var(--text-muted)",
                    soft: "var(--text-soft)",
                },
                danger: {
                    DEFAULT: "var(--danger)",
                    soft: "var(--danger-soft)",
                },
                success: {
                    DEFAULT: "var(--success)",
                },
                "accent-app": {
                    DEFAULT: "var(--app-accent)",
                    soft: "var(--app-accent-soft)",
                    press: "var(--app-accent-press)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
