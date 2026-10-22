import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lavender' | 'mint' | 'peach' | 'coral' | 'neutral' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'lavender',
  className = '',
}) => {
  const variants = {
    lavender: 'bg-[#E9E3FF] text-[#5A54C7] border border-[#D4CCFF]',
    mint: 'bg-[#E6F7F0] text-[#00875A] border border-[#BDEBD9]',
    peach: 'bg-[#FFF0EB] text-[#DE350B] border border-[#FFD8CE]',
    coral: 'bg-[#FFE8E5] text-[#BF2600] border border-[#FFB3AB]',
    blue: 'bg-[#DCE9FF] text-[#0052CC] border border-[#C5DAFF]',
    neutral: 'bg-[#F8F7FF] text-[#8885A5] border border-[#E9E3FF]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
