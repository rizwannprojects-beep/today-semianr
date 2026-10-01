import { STATUS_COLORS } from '../utils/constants.js';

export const StatusBadge = ({ status = 'open', className = '' }) => {
  if (!status) return null;
  const style =
    STATUS_COLORS[status] ||
    STATUS_COLORS[status.toUpperCase()] ||
    STATUS_COLORS[status.toLowerCase()] || {
      bg: 'bg-slate-800',
      text: 'text-slate-300',
      border: 'border-slate-700'
    };

  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border uppercase whitespace-nowrap shrink-0 ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};

export default StatusBadge;
