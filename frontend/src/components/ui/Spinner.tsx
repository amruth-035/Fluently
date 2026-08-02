interface SpinnerProps {
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeStyles[size]} ${className}`}
    />
  )
}
