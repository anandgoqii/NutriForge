import React from 'react';
import { Colors, Typography, Layout, GlobalStyles } from '../theme/goqiiDesignSystem';

export const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled }) => {
  const baseStyles = `font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 px-6 py-4`;
  
  const variants = {
    primary: `${Layout.fullRadius} bg-[#39C101] text-white ${Typography.Medium} ${Typography.h4} hover:bg-[#32aa01] shadow-none`,
    secondary: `${Layout.fullRadius} bg-[#007AFF] text-white ${Typography.Medium} ${Typography.h4} shadow-none`,
    outline: `${Layout.radius} border border-[#F1F5F9] bg-white text-[#0F172A] ${Typography.SemiBold} ${Typography.h6} hover:bg-slate-50`,
    ghost: "text-[#A5B3C1] dark:text-[#64748B] hover:bg-slate-50 dark:hover:bg-slate-800/50",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const BackButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`p-2.5 bg-slate-50 dark:bg-slate-800 ${Layout.radius10} border border-[#F1F5F9] dark:border-slate-700 transition-colors flex items-center justify-center ${className}`}
    aria-label="Go back"
  >
    <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`${GlobalStyles.card} ${onClick ? 'cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const ProgressBar: React.FC<{
  progress: number;
  color?: string;
  height?: string;
  label?: string;
  target?: string;
  secondaryProgress?: number;
  secondaryColor?: string;
}> = ({ progress, color = 'bg-[#39C101]', height = 'h-1.5', label, target, secondaryProgress, secondaryColor = 'bg-indigo-400' }) => (
  <div className="w-full space-y-2">
    {(label || target) && (
      <div className={`flex justify-between ${Typography.caption} text-[#A5B3C1]`}>
        <span>{label}</span>
        <span>{target}</span>
      </div>
    )}
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative ${height}`}>
      {secondaryProgress !== undefined && (
        <div 
          className={`${secondaryColor} h-full absolute top-0 left-0 transition-all duration-700 ease-out opacity-30`}
          style={{ width: `${Math.min(secondaryProgress, 100)}%` }}
        />
      )}
      <div 
        className={`${color} h-full relative transition-all duration-1000 ease-out shadow-sm`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  </div>
);

export const BadgeItem: React.FC<{ icon: string; name: string; earned: boolean }> = ({ icon, name, earned }) => (
  <div className={`flex flex-col items-center gap-2 ${earned ? 'opacity-100' : 'opacity-30 grayscale'}`}>
    <div className={`w-14 h-14 bg-slate-50 dark:bg-slate-800 ${Layout.radius} flex items-center justify-center text-2xl shadow-inner border border-[#F1F5F9] dark:border-slate-700`}>
      {icon}
    </div>
    <span className={`${Typography.label} text-[8px] text-center`}>{name}</span>
  </div>
);