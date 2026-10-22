import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { JournalEntry, Question } from '../../types';
import { formatDate } from '../../utils/dates';
import { getCategoryLabel } from '../../utils/formatters';
import { NavLink } from 'react-router-dom';
import { AlertCircle, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RecentIssuesCardProps {
  issues: JournalEntry[];
  questions: Question[];
  onAddIssue: () => void;
  onAddQuestion: () => void;
}

export const RecentIssuesCard: React.FC<RecentIssuesCardProps> = ({
  issues,
  questions,
  onAddIssue,
  onAddQuestion,
}) => {
  const unresolvedIssues = issues.filter((i) => i.isOngoing).slice(0, 3);
  const unansweredQuestions = questions.filter((q) => !q.isCompleted).slice(0, 3);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#292747] text-base">To Discuss With Doctor</h3>
          <span className="text-xs text-[#8885A5]">
            {unresolvedIssues.length} issues • {unansweredQuestions.length} questions
          </span>
        </div>

        {/* Tabular or list summary */}
        <div className="space-y-3">
          {unresolvedIssues.length === 0 && unansweredQuestions.length === 0 ? (
            <div className="p-6 text-center bg-[#F8F7FF] rounded-2xl border border-dashed border-[#E9E3FF]">
              <CheckCircle2 className="mx-auto text-[#00875A] mb-2" size={24} />
              <p className="text-xs text-[#8885A5]">
                No ongoing issues or pending questions logged. Everything looks smooth!
              </p>
            </div>
          ) : (
            <>
              {unresolvedIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-3 bg-[#F8F7FF] rounded-xl border border-[#E9E3FF] flex items-start gap-2.5"
                >
                  <AlertCircle size={15} className="text-[#DE350B] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#292747] truncate">
                        {getCategoryLabel(issue.category)}
                      </span>
                      <Badge variant="coral" className="text-[10px] px-2 py-0">
                        {issue.severity || 'Mild'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#8885A5] line-clamp-1">{issue.description}</p>
                  </div>
                </div>
              ))}

              {unansweredQuestions.map((q) => (
                <div
                  key={q._id}
                  className="p-3 bg-[#F8F7FF] rounded-xl border border-[#E9E3FF] flex items-start gap-2.5"
                >
                  <HelpCircle size={15} className="text-[#7775E8] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#292747] line-clamp-2">{q.text}</p>
                    <span className="text-[10px] text-[#8885A5] uppercase font-semibold">
                      {q.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E9E3FF]/60 flex items-center justify-between">
        <button onClick={onAddIssue} className="text-xs font-semibold text-[#7775E8] hover:underline">
          + Log Symptom
        </button>
        <NavLink to="/questions" className="text-xs font-semibold text-[#7775E8] hover:underline flex items-center gap-1">
          All Questions <ArrowRight size={13} />
        </NavLink>
      </div>
    </Card>
  );
};
