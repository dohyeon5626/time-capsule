import { AlertCircle } from 'lucide-react';

const InputGroup = ({
  label,
  icon: Icon,
  required,
  error,
  children,
  className,
  action,
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex justify-between items-end mb-1">
      <label className="flex items-center text-sm font-semibold text-slate-300">
        {Icon && <Icon className="w-4 h-4 mr-1.5 text-blue-400" />}
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {action}
    </div>
    {children}
    {error && (
      <p className="text-xs text-rose-500 flex items-center mt-1">
        <AlertCircle className="w-3 h-3 mr-1" /> {error}
      </p>
    )}
  </div>
);

export default InputGroup;
