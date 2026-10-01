export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  icon: Icon,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-[#FF9800]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718096]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg bg-white border transition-colors text-[#16324F] placeholder:text-[#718096] text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] disabled:opacity-50 disabled:bg-[#F7FAFC] shadow-xs ${
            Icon ? 'pl-10' : ''
          } ${
            rightElement ? 'pr-10' : ''
          } ${
            error
              ? 'border-[#D32F2F] focus:border-[#D32F2F] focus:ring-[#D32F2F]/20'
              : 'border-[#D9E2E8] hover:border-[#00897B]'
          }`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#D32F2F]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#526579]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
