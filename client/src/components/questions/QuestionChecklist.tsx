import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Question } from '../../types';
import { CheckSquare, Square, Trash2, Edit2, MessageCircle } from 'lucide-react';

interface QuestionChecklistProps {
  questions: Question[];
  onToggleComplete: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export const QuestionChecklist: React.FC<QuestionChecklistProps> = ({
  questions,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high':
        return <Badge variant="coral">High</Badge>;
      case 'medium':
        return <Badge variant="lavender">Medium</Badge>;
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-[#F8F7FF] rounded-3xl border border-dashed border-[#E9E3FF]">
        <MessageCircle className="mx-auto text-[#8885A5] mb-2" size={28} />
        <p className="text-sm text-[#8885A5]">No questions in this list.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <Card
          key={q._id}
          className={`transition-all duration-200 ${
            q.isCompleted ? 'opacity-60 bg-[#F8F7FF]' : 'hover:border-[#9B8AFB]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() => onToggleComplete(q)}
                className="mt-0.5 text-[#7775E8] hover:text-[#00875A] transition-colors"
                title={q.isCompleted ? 'Mark unanswered' : 'Mark answered'}
              >
                {q.isCompleted ? (
                  <CheckSquare size={20} className="text-[#00875A]" />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityBadge(q.priority)}
                  {q.isCompleted && <span className="text-xs text-[#00875A] font-semibold">Answered</span>}
                </div>
                <p className={`text-sm text-[#292747] font-medium ${q.isCompleted ? 'line-through text-[#8885A5]' : ''}`}>
                  {q.text}
                </p>

                {q.answerNotes && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#E6F7F0] border border-[#BDEBD9] text-xs text-[#00875A]">
                    <span className="font-bold block mb-0.5">Doctor's Answer:</span>
                    {q.answerNotes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(q)}
                className="p-1.5 text-[#8885A5] hover:text-[#7775E8] rounded-lg transition-colors"
                title="Edit / Add response"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => onDelete(q._id)}
                className="p-1.5 text-[#8885A5] hover:text-[#D32F2F] rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
