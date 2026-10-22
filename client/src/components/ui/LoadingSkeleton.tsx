import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = 'h-24',
}) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-[#E9E3FF]/40 rounded-2xl sm:rounded-3xl ${className}`} />
      ))}
    </div>
  );
};
