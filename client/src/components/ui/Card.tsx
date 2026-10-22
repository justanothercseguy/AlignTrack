import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'glass' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(155,138,251,0.08)] border border-[#E9E3FF]/60 p-6',
    hero: 'bg-gradient-to-br from-[#9B8AFB] to-[#7775E8] text-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(119,117,232,0.3)]',
    glass: 'backdrop-blur-md bg-white/70 border border-white/60 shadow-[0_8px_32px_0_rgba(155,138,251,0.12)] rounded-2xl sm:rounded-3xl p-6',
    subtle: 'bg-[#F8F7FF] rounded-2xl border border-[#E9E3FF]/80 p-5',
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
