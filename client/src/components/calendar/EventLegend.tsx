import React from 'react';

export const EventLegend: React.FC = () => {
  const items = [
    { label: 'Planned Start / Change', color: 'bg-[#9B8AFB]' },
    { label: 'Actual Aligner Change', color: 'bg-[#7775E8]' },
    { label: 'Orthodontist Visit', color: 'bg-[#FFD8CE]' },
    { label: 'Wear Target Met', color: 'bg-[#BDEBD9]' },
    { label: 'Flagged Issue', color: 'bg-[#FFB3AB]' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-white rounded-2xl border border-[#E9E3FF] text-xs">
      <span className="font-semibold text-[#292747]">Event Legend:</span>
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${it.color}`} />
          <span className="text-[#8885A5]">{it.label}</span>
        </div>
      ))}
    </div>
  );
};
