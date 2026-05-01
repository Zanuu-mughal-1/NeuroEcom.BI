/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'void': '#050508',
        'abyss': '#0a0a12',
        'surface': '#0f0f1a',
        'panel': '#141420',
        'border': '#1e1e2e',
        'border-bright': '#2a2a40',
        'text-dim': '#6b7280',
        'text-mid': '#9ca3af',
        'text-bright': '#e2e8f0',
        'text-white': '#f8fafc',
        'neo': '#6366f1',
        'neo-bright': '#818cf8',
        'neo-glow': '#4f46e5',
        'pulse': '#06b6d4',
        'pulse-bright': '#22d3ee',
        'ember': '#f59e0b',
        'ember-bright': '#fbbf24',
        'bloom': '#10b981',
        'bloom-bright': '#34d399',
        'danger': '#ef4444',
        'danger-bright': '#f87171',
        'royal': '#8b5cf6',
        'royal-bright': '#a78bfa',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'heading': ['"DM Sans"', 'sans-serif'],
        'body': ['"DM Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
        'glow-neo': 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)',
        'glow-pulse': 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 60%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse: { '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        fadeUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'neo': '0 0 30px rgba(99,102,241,0.2)',
        'neo-strong': '0 0 60px rgba(99,102,241,0.4)',
        'pulse': '0 0 30px rgba(6,182,212,0.2)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'card': '0 2px 12px rgba(0,0,0,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    }
  },
  plugins: []
}
