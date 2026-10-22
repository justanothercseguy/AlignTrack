import React from 'react';
import { AlignerSet } from '../../types';
import { AlignerSetCard } from './AlignerSetCard';

interface AlignerTimelineProps {
  sets: AlignerSet[];
  onEdit: (set: AlignerSet) => void;
  onConfirmChange: (set: AlignerSet) => void;
  onMakeActive?: (set: AlignerSet) => void;
}

export const AlignerTimeline: React.FC<AlignerTimelineProps> = ({
  sets,
  onEdit,
  onConfirmChange,
  onMakeActive,
}) => {
  // Sort sets chronologically by setNumber
  const sortedSets = [...sets].sort((a, b) => a.setNumber - b.setNumber);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedSets.map((set) => (
          <AlignerSetCard
            key={set._id}
            set={set}
            onEdit={onEdit}
            onConfirmChange={set.status === 'current' ? onConfirmChange : undefined}
            onMakeActive={set.status !== 'current' ? onMakeActive : undefined}
          />
        ))}
      </div>
    </div>
  );
};
