import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lunes Brand Colors
        'lunes-dark': '#0D0D0D',
        'lunes-light': '#F2F2F2',
        'lunes-purple': '#6C38FF',
        'lunes-purple-dark': '#5228DB',
        
        // Semantic Color System
        neutral: {
          "100": "#F2F2F2", 
          "200": "#E6E6E6", 
          "300": "#B6B6B6", 
          "400": "#6D6D6D", 
          "500": "#0D0D0D", 
          "600": "#0B0909", 
          "700": "#090607", 
          "800": "#070405", 
          "900": "#060203"
        },
        primary: {
          "100": "#E5D7FF", 
          "200": "#CAAFFF", 
          "300": "#AD87FF", 
          "400": "#9469FF", 
          "500": "#6C38FF", 
          "600": "#5228DB", 
          "700": "#3C1CB7", 
          "800": "#291193", 
          "900": "#1B0A7A"
        },
        success: {
          "100": "#D3FCD7", 
          "200": "#A8FAB9", 
          "300": "#7AF09E", 
          "400": "#57E290", 
          "500": "#26D07C", 
          "600": "#1BB277", 
          "700": "#13956F", 
          "800": "#0C7863", 
          "900": "#07635B"
        },
        warning: {
          "100": "#FEEBCB", 
          "200": "#FED198", 
          "300": "#FEB165", 
          "400": "#FE923F", 
          "500": "#FE5F00", 
          "600": "#DA4400", 
          "700": "#B62E00", 
          "800": "#931C00", 
          "900": "#790F00"
        },
        critical: {
          "100": "#FFDCD3", 
          "200": "#FFB2A9", 
          "300": "#FF807E", 
          "400": "#FF5D69", 
          "500": "#FF284C", 
          "600": "#DB1D4E", 
          "700": "#B7144E", 
          "800": "#930C49", 
          "900": "#7A0746"
        },
        secondary: {
          "100": "#E5D7FF", 
          "200": "#CAAFFF", 
          "300": "#AD87FF", 
          "400": "#9469FF", 
          "500": "#6C38FF", 
          "600": "#5228DB", 
          "700": "#3C1CB7", 
          "800": "#291193", 
          "900": "#1B0A7A"
        },
      },
      boxShadow: {
        'level-1': '0 4px 8px 0 rgba(0,0,0,0.08)',
        'level-2': '0 8px 24px 0 rgba(0,0,0,0.08)',
        'level-3': '0 16px 32px 0 rgba(0,0,0,0.08)',
        'level-4': '0 16px 48px 0 rgba(0,0,0,0.08)',
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"],
        ui: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"]
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '16px',
          sm: '16px',
          md: '20px',
          lg: '24px',
        },
        screens: {
          "xs": "100%", 
          "sm": "640px", 
          "md": "768px", 
          "lg": "1024px", 
          "xl": "1280px", 
          "2xl": "1440px"
        }
      },
      borderRadius: {
        "sm": "8px", 
        "md": "12px", 
        "lg": "16px", 
        "xl": "20px", 
        "2xl": "24px"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
