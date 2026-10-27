/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // RecruitBot brand
        primary: '#6366f1',
        accent: '#ec4899',
        
        // Backgrounds
        'bg-base': '#0f0f13',
        'bg-surface': '#18181f',
        'bg-card': '#1e1e28',
        
        // Text
        'text-primary': '#f1f1f5',
        'text-muted': '#8b8ba0',
        
        // Search mode scores
        'score-vector': '#818cf8',
        'score-bm25': '#f472b6',
        'score-hybrid': '#34d399',
        
        // Semantic colors
        border: 'rgba(255, 255, 255, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'status-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'dot-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200%' },
          '100%': { backgroundPosition: '200%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
        'dot-bounce': 'dot-bounce 0.6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
