/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',     // Indigo
          secondary: '#8B5CF6',   // Purple
          accent: '#EC4899',      // Pink
          highlight: '#06B6D4',   // Cyan
          success: '#10B981',     // Emerald
          warning: '#F59E0B',     // Amber
          danger: '#EF4444',      // Rose/Red
          info: '#3B82F6',        // Blue
          dark: '#0F172A',        // Dark Background
          darkSurface: '#1E293B', // Dark Card/Surface
          darkBorder: '#334155',  // Dark Border
          light: '#F8FAFC',       // Light Background
          lightSurface: '#FFFFFF',
          lightBorder: '#E2E8F0',
        },
        category: {
          electronics: '#06B6D4',
          fashion: '#EC4899',
          gaming: '#8B5CF6',
          home: '#F59E0B',
          beauty: '#F43F5E',
          sports: '#10B981',
          books: '#6366F1',
          accessories: '#3B82F6'
        }
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        'gradient-premium': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-card-dark': 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.8) 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        'floating': '0 20px 40px -15px rgba(99, 102, 241, 0.25)',
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-accent': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'glow-success': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
