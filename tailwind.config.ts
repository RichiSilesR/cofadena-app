// tailwind.config.js

import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'flow-animation': { 
          '0%': { backgroundPosition: '0% 50%', transform: 'translateX(0%)' },
          '100%': { backgroundPosition: '100% 50%', transform: 'translateX(100%)' },
        },
        'drop': {
          '0%': { transform: 'translateY(-10px) scale(0.7)', opacity: '0' },
          '50%': { transform: 'translateY(150px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(250px) scale(0.5)', opacity: '0' },
        },
        // KEYFRAME DE PARPADEO RÁPIDO (1.0s) -> PARA FLECHAS (animation-name: pulse-slow)
        'pulse-slow': {
          '0%, 100%': { opacity: '0.9' }, 
          '50%': { opacity: '0.1' },   
        },
        // KEYFRAME DE PARPADEO LENTO (2.0s) -> PARA CINTAS (animation-name: pulse-slower)
        'pulse-slower': {
          '0%, 100%': { opacity: '0.9' }, 
          '50%': { opacity: '0.2' },  
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'flow-animation': 'flow-animation 4s linear infinite', 
        'drop': 'drop 1s ease-in-out forwards', 
        // CLASE DE ANIMACIÓN RÁPIDA (1.0s) -> PARA FLECHAS
        'pulse-slow': 'pulse-slow 1s linear infinite',
        // CLASE DE ANIMACIÓN LENTA (2.0s) -> PARA CINTAS
        'pulse-slower': 'pulse-slower 2s linear infinite',
      },
    },
  },
  
  plugins: [require('tailwindcss-animate')],
} satisfies Config;