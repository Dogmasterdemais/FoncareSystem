import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = "", ...props }) => {
  return (
    <div className={`w-full mb-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">{icon}</span>
        )}
        <input
          {...props}
          className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : 'border-zinc-300'}`}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};
