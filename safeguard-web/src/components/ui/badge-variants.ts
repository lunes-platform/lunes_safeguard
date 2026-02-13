import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white',
  secondary: 'border-transparent bg-secondary-500 text-white',
        destructive: 'border-transparent bg-critical-500 text-white',
        outline: 'text-primary-500 border-primary-500',
        success: 'border-transparent bg-success-500 text-white',
        warning: 'border-transparent bg-warning-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)