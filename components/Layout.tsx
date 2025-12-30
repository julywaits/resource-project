
import React from 'react';

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const Card: React.FC<{ title?: string; children: React.ReactNode; headerAction?: React.ReactNode; className?: string }> = ({ 
  title, 
  children, 
  headerAction, 
  className = '' 
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {(title || headerAction) && (
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        {title && <h3 className="font-bold text-slate-800 flex items-center gap-2">{title}</h3>}
        {headerAction}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);
