import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { JournalEntry } from '../../types';
import { formatDate } from '../../utils/dates';
import { getCategoryLabel } from '../../utils/formatters';
import { CheckCircle, MessageSquare, Trash2, Edit2 } from 'lucide-react';

interface IssueCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  entry,
  onEdit,
  onResolve,
  onDelete,
}) => {
  const isResolved = !entry.isOngoing;

  const getSeverityBadge = () => {
    switch (entry.severity) {
      case 'Severe':
        return <Badge variant="coral">Severe</Badge>;
      case 'Moderate':
        return <Badge variant="peach">Moderate</Badge>;
      default:
        return <Badge variant="neutral">Mild</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#7775E8] uppercase tracking-wider">
            {getCategoryLabel(entry.category)}
          </span>
          <div className="flex items-center gap-1.5">
            {getSeverityBadge()}
            {isResolved ? (
              <Badge variant="mint">Resolved</Badge>
            ) : (
              <Badge variant="lavender">Active</Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-[#8885A5] mb-2">
          {formatDate(entry.date)} {entry.time && `at ${entry.time}`}
        </p>

        {entry.affectedArea && (
          <p className="text-xs font-semibold text-[#292747] mb-2 bg-[#F8F7FF] px-2.5 py-1 rounded-lg border border-[#E9E3FF] inline-block">
            Area: {entry.affectedArea}
          </p>
        )}

        <p className="text-sm text-[#292747] leading-relaxed mb-4">{entry.description}</p>

        {entry.needsDiscussion && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7775E8] bg-[#E9E3FF]/50 px-3 py-1.5 rounded-xl border border-[#D4CCFF] mb-3">
            <MessageSquare size={13} />
            Flagged for next doctor visit
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#E9E3FF]/60 flex items-center justify-between">
        {!isResolved ? (
          <button
            onClick={() => onResolve(entry._id)}
            className="text-xs font-semibold text-[#00875A] hover:underline flex items-center gap-1"
          >
            <CheckCircle size={14} /> Mark Resolved
          </button>
        ) : (
          <span className="text-xs text-[#8885A5]">Resolved {formatDate(entry.resolutionDate || entry.updatedAt)}</span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-[#8885A5] hover:text-[#7775E8] rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(entry._id)}
            className="p-1.5 text-[#8885A5] hover:text-[#D32F2F] rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
};
