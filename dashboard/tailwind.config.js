/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'border-color': 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'success': 'var(--color-success)',
        'error': 'var(--color-error)',
        'warning': 'var(--color-warning)',
        'info': 'var(--color-info)',
        'cost': 'var(--color-cost)',
      }
    }
  },
  plugins: [],
}
