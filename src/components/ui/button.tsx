import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
}

export const Button = ({ children, className, variant = 'default', ...props }: ButtonProps) => {
  let variantClasses = 'bg-primary text-primary-foreground'

  if (variant === 'destructive') {
    variantClasses = 'bg-destructive text-destructive-foreground'
  } else if (variant === 'outline') {
    variantClasses = 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }

  const combinedClasses = className ? `${variantClasses} ${className}` : variantClasses
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  )
}
