
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  className = '', 
  ...props 
}) => {
  const base = "inline-flex items-center justify-center font-medium transition-all rounded-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props} 
    className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 ${props.className || ''}`} 
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: { label: string; value: string }[] }> = ({ options, ...props }) => (
  <select 
    {...props} 
    className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${props.className || ''}`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    {...props} 
    className={`w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 min-h-[100px] resize-y ${props.className || ''}`}
  />
);

export const Badge: React.FC<{ label: string; colorClass?: string }> = ({ label, colorClass = 'bg-blue-100 text-blue-700' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
    {label}
  </span>
);
