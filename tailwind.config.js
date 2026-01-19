/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

function rem2px(input, fontSize = 16) {
  if (input == null) {
    return input;
  }

  switch (typeof input) {
    case 'object':
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      }
      const ret = {};
      for (const key in input) {
        ret[key] = rem2px(input[key]);
      }
      return ret;

    case 'string':
      return input.replace(
        /(\d*\.?\d+)rem$/,
        (_, val) => `${parseFloat(val) * fontSize}px`
      );
    default:
      return input;
  }
}

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,vue}',
    './business/**/*.{js,jsx,ts,tsx,vue}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    borderRadius: rem2px(defaultTheme.borderRadius),
    columns: rem2px(defaultTheme.columns),
    fontSize: rem2px(defaultTheme.fontSize),
    lineHeight: rem2px(defaultTheme.lineHeight),
    maxWidth: ({ theme, breakpoints }) => ({
      ...rem2px(defaultTheme.maxWidth({ theme, breakpoints })),
    }),
    spacing: rem2px(defaultTheme.spacing),
    extend: {
      colors: {
        primary: withOpacityValue('--color-primary'),
        secondary: withOpacityValue('--color-secondary'),
        accent: withOpacityValue('--color-accent'),
        gray: colors.zinc,
        orange: colors.orange,
        // 科技风格色彩
        'tech-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'tech-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        'tech-cyan': {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
        },
      },
      boxShadow: {
        'tech-glow': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)',
        'tech-glow-sm': '0 0 10px rgba(59, 130, 246, 0.3), 0 0 20px rgba(147, 51, 234, 0.2)',
        'tech-glow-lg': '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
      },
      backgroundImage: {
        'gradient-tech': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        'gradient-tech-dark': 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.15) 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(147, 51, 234, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
