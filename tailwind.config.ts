// FILE LOCATION: tailwind.config.ts (root of project)
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['var(--font-display)', 'monospace'],
                body: ['var(--font-body)', 'sans-serif'],
            },
            colors: {
                'space-deep': '#05050f',
                'space-surface': '#0d0d1a',
                'space-border': '#1a1a2e',
                'accent-gold': '#f5a623',
                'accent-teal': '#00d4aa',
                'text-primary': '#f0f0f0',
                'text-muted': '#8888aa',
            },
        },
    },
    plugins: [],
}
export default config