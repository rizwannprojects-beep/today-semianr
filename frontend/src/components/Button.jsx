export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00695C] focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  const variantStyles = {
    primary:
      'bg-[#00695C] hover:bg-[#004D40] text-white font-semibold shadow-xs active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-[#E0F2F1] text-[#00695C] border border-[#00695C] font-semibold active:scale-[0.98]',
    accent:
      'bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold shadow-xs active:scale-[0.98]',
    outline:
      'bg-white border border-[#D9E2E8] text-[#16324F] hover:bg-[#F0F7F6] hover:border-[#00897B] font-medium active:scale-[0.98]',
    ghost:
      'text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] font-medium',
    danger:
      'bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold shadow-xs active:scale-[0.98]'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
