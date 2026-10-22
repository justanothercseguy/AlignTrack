import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#F8F7FF] rounded-3xl border border-dashed border-[#D4CCFF] my-4">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#E9E3FF] flex items-center justify-center text-[#7775E8] mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#292747] mb-1.5">{title}</h3>
      <p className="text-sm text-[#8885A5] max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
