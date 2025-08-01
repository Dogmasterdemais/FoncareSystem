import React from "react";
import { cn } from "@/lib/utils";
import { colorClasses } from "@/lib/colors";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants = {
  primary: colorClasses.buttonPrimary,
  secondary: colorClasses.buttonSecondary,
  accent: colorClasses.buttonAccent,
  outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
  ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:shadow-md transform hover:-translate-y-0.5',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
