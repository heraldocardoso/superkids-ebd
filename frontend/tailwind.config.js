/**
 * Super Kids EBD — Tailwind configuration (igual à da Escola de Louvor).
 *
 * Colours are never hard-coded here: every entry points at a CSS custom
 * property declared in `src/theme/main.theme.scss`, in HSL channel form, so
 * `<alpha-value>` keeps working (`bg-primary/20`, `text-accent/80`, ...).
 * Change a brand colour there and it propagates everywhere.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./src/**/*.{html,ts}'],

  /**
   * PrimeNG ships its own reset. Tailwind's preflight would fight it (buttons,
   * inputs and headings lose their theme), so base styles live in
   * `src/theme/main.theme.scss` instead.
   */
  corePlugins: {
    preflight: false
  },

  theme: {
    /* Mobile-first breakpoints. `xs` covers small phones. */
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },

    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: 'hsl(var(--ui--color-gray-lightest) / <alpha-value>)',

      /* Deep navy — #131B2D */
      primary: {
        darkest: 'hsl(var(--ui--color-primary-darkest) / <alpha-value>)',
        darker: 'hsl(var(--ui--color-primary-darker) / <alpha-value>)',
        dark: 'hsl(var(--ui--color-primary-dark) / <alpha-value>)',
        DEFAULT: 'hsl(var(--ui--color-primary) / <alpha-value>)',
        medium: 'hsl(var(--ui--color-primary-medium) / <alpha-value>)',
        light: 'hsl(var(--ui--color-primary-light) / <alpha-value>)',
        lightest: 'hsl(var(--ui--color-primary-lightest) / <alpha-value>)'
      },

      /* Sky blue — #4FA5E0 */
      secondary: {
        darkest: 'hsl(var(--ui--color-secondary-darkest) / <alpha-value>)',
        dark: 'hsl(var(--ui--color-secondary-dark) / <alpha-value>)',
        DEFAULT: 'hsl(var(--ui--color-secondary) / <alpha-value>)',
        medium: 'hsl(var(--ui--color-secondary-medium) / <alpha-value>)',
        light: 'hsl(var(--ui--color-secondary-light) / <alpha-value>)',
        lightest: 'hsl(var(--ui--color-secondary-lightest) / <alpha-value>)'
      },

      /* Yellow — #FFD123 */
      accent: {
        darkest: 'hsl(var(--ui--color-accent-darkest) / <alpha-value>)',
        dark: 'hsl(var(--ui--color-accent-dark) / <alpha-value>)',
        DEFAULT: 'hsl(var(--ui--color-accent) / <alpha-value>)',
        medium: 'hsl(var(--ui--color-accent-medium) / <alpha-value>)',
        light: 'hsl(var(--ui--color-accent-light) / <alpha-value>)',
        lightest: 'hsl(var(--ui--color-accent-lightest) / <alpha-value>)'
      },

      gray: {
        darkest: 'hsl(var(--ui--color-gray-darkest) / <alpha-value>)',
        darker: 'hsl(var(--ui--color-gray-darker) / <alpha-value>)',
        dark: 'hsl(var(--ui--color-gray-dark) / <alpha-value>)',
        'medium-dark': 'hsl(var(--ui--color-gray-medium-dark) / <alpha-value>)',
        medium: 'hsl(var(--ui--color-gray-medium) / <alpha-value>)',
        light: 'hsl(var(--ui--color-gray-light) / <alpha-value>)',
        lighter: 'hsl(var(--ui--color-gray-lighter) / <alpha-value>)',
        lightest: 'hsl(var(--ui--color-gray-lightest) / <alpha-value>)'
      },

      status: {
        success: {
          DEFAULT: 'hsl(var(--ui--color-status-success) / <alpha-value>)',
          faded: 'hsl(var(--ui--color-status-success-faded) / <alpha-value>)'
        },
        danger: {
          DEFAULT: 'hsl(var(--ui--color-status-danger) / <alpha-value>)',
          faded: 'hsl(var(--ui--color-status-danger-faded) / <alpha-value>)'
        },
        warning: {
          DEFAULT: 'hsl(var(--ui--color-status-warning) / <alpha-value>)',
          faded: 'hsl(var(--ui--color-status-warning-faded) / <alpha-value>)'
        },
        info: {
          DEFAULT: 'hsl(var(--ui--color-status-info) / <alpha-value>)',
          faded: 'hsl(var(--ui--color-status-info-faded) / <alpha-value>)'
        }
      },

      /* Ícone de medicação (roxo) — o único tom fora da paleta, só nesse ícone */
      care: {
        medication: 'hsl(var(--ui--color-care-medication) / <alpha-value>)'
      },

      /* Semantic aliases — prefer these in templates */
      surface: {
        DEFAULT: 'hsl(var(--ui--color-surface) / <alpha-value>)',
        sunken: 'hsl(var(--ui--color-surface-sunken) / <alpha-value>)',
        raised: 'hsl(var(--ui--color-surface-raised) / <alpha-value>)',
        inverse: 'hsl(var(--ui--color-surface-inverse) / <alpha-value>)'
      },
      border: {
        DEFAULT: 'hsl(var(--ui--color-border) / <alpha-value>)',
        strong: 'hsl(var(--ui--color-border-strong) / <alpha-value>)'
      },
      ink: {
        DEFAULT: 'hsl(var(--ui--color-ink) / <alpha-value>)',
        muted: 'hsl(var(--ui--color-ink-muted) / <alpha-value>)',
        inverse: 'hsl(var(--ui--color-ink-inverse) / <alpha-value>)',
        'on-primary': 'hsl(var(--ui--color-ink-on-primary) / <alpha-value>)',
        'on-accent': 'hsl(var(--ui--color-ink-on-accent) / <alpha-value>)'
      }
    },

    extend: {
      fontFamily: {
        sans: ['var(--ui--font-family-base)'],
        heading: ['var(--ui--font-family-heading)']
      },

      borderRadius: {
        sm: 'var(--ui--radius-sm)',
        md: 'var(--ui--radius-md)',
        lg: 'var(--ui--radius-lg)',
        full: 'var(--ui--radius-full)'
      },

      boxShadow: {
        sm: 'var(--ui--shadow-sm)',
        md: 'var(--ui--shadow-md)',
        lg: 'var(--ui--shadow-lg)'
      },

      spacing: {
        header: 'var(--ui--header-height)',
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        'safe-t': 'env(safe-area-inset-top, 0px)'
      },

      maxWidth: {
        content: '75rem'
      }
    }
  },

  plugins: []
};
