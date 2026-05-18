/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'void': 'var(--bg-primary)',
        'abyss': 'var(--bg-secondary)',
        'surface': 'var(--bg-secondary)',
        'panel': 'var(--glass-bg)',
        'border': 'var(--border-color)',
        'border-bright': 'var(--glass-border)',
        'text-dim': 'var(--text-dim)',
        'text-mid': 'var(--text-mid)',
        'text-bright': 'var(--text-bright)',
        'text-white': 'var(--text-white)',
        'neo': 'var(--color-neo)',
        'neo-bright': 'var(--color-neo-bright)',
        'neo-glow': 'var(--color-neo-glow)',
        'pulse': 'var(--color-pulse)',
        'pulse-bright': 'var(--color-pulse-bright)',
        'ember': 'var(--color-ember)',
        'ember-bright': 'var(--color-ember-bright)',
        'bloom': 'var(--color-bloom)',
        'bloom-bright': 'var(--color-bloom-bright)',
        'danger': 'var(--color-danger)',
        'danger-bright': 'var(--color-danger-bright)',
        'royal': 'var(--color-royal)',
        'royal-bright': 'var(--color-royal-bright)',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'heading': ['"DM Sans"', 'sans-serif'],
        'body': ['"DM Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(34,211,238,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)',
        'glow-neo': 'radial-gradient(ellipse at 50% 0%, rgba(0,234,255,0.16) 0%, transparent 60%)',
        'glow-pulse': 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 60%)',
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
        glowPulse: { '0%, 100%': { boxShadow: '0 0 20px rgba(34,211,238,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(34,211,238,0.6)' } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        fadeUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'neo': '0 0 30px rgba(34,211,238,0.22)',
        'neo-strong': '0 0 60px rgba(34,211,238,0.38)',
        'pulse': '0 0 30px rgba(56,189,248,0.24)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'card': '0 2px 12px rgba(0,0,0,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    }
  },
  plugins: []
}
