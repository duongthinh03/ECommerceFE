import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variant-based styling. Dùng buttonVariants() để style cả <Link> (vd: <Link className={buttonVariants()}>).
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:shadow-md",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
