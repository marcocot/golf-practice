import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-border bg-transparent text-foreground active:bg-muted',
        ghost: 'bg-transparent text-foreground active:bg-muted',
        destructive: 'bg-destructive text-background',
      },
      size: {
        default: 'min-h-14 px-5 text-base',
        sm: 'min-h-10 px-3 text-sm',
        full: 'min-h-14 w-full px-5 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});
