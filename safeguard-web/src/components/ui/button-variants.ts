import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex flex-row items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-md hover:shadow-lg',
        destructive: 'bg-critical-500 text-white hover:bg-critical-600 focus-visible:ring-critical-500 shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus-visible:ring-primary-500 bg-transparent',
        secondary: 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300 focus-visible:ring-neutral-400 shadow-sm hover:shadow-md',
        ghost: 'text-primary-500 hover:bg-primary-100 focus-visible:ring-primary-500 bg-transparent',
        link: 'text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500 bg-transparent shadow-none hover:shadow-none',
        purple: 'bg-lunes-purple text-white hover:bg-lunes-purple-dark focus-visible:ring-lunes-purple shadow-md hover:shadow-lg',
        'purple-outline': 'border-2 border-lunes-purple text-lunes-purple hover:bg-lunes-purple hover:text-white focus-visible:ring-lunes-purple bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base font-semibold',
        xl: 'h-14 rounded-xl px-10 text-lg font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)