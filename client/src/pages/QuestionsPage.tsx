import React, { useState, useEffect } from 'react';
import { QuestionChecklist } from '../components/questions/QuestionChecklist';
import { QuestionForm } from '../components/questions/QuestionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  listQuestionsApi,
  createQuestionApi,
  updateQuestionApi,
  completeQuestionApi,
  deleteQuestionApi,
} from '../api/questions';
import { Question } from '../types';
import { Plus, HelpCircle, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const isCompleted = filter === 'all' ? undefined : filter === 'answered';
      const data = await listQuestionsApi({ isCompleted });
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const handleCreate = async (payload: any) => {
    try {
      await createQuestionApi(payload);
      toast.success('Question added');
      setIsAddOpen(false);
      await fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleUpdate = async (payload: any) => {
    if (!editingQuestion) return;
    try {
      await updateQuestionApi(editingQuestion._id, payload);
      toast.success('Question updated');
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update question');
    }
  };

  const handleToggleComplete = async (q: Question) => {
    try {
      if (q.isCompleted) {
        await updateQuestionApi(q._id, { isCompleted: false });
      } else {
        await completeQuestionApi(q._id);
      }
      await fetchQuestions();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestionApi(id);
      toast.success('Question removed');
      await fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Questions for Orthodontist</h2>
          <p className="text-xs text-[#8885A5]">
            Jot down questions as they arise so you never forget to ask during appointments
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} className="mr-1.5" /> Add Question
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'unanswered', 'answered'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-[#7775E8] text-white shadow-sm'
                : 'bg-white border border-[#E9E3FF] text-[#8885A5] hover:text-[#292747]'
            }`}
          >
            {tab === 'all' ? 'All Questions' : tab}
          </button>
        ))}
      </div>

      {/* Checklist View */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<HelpCircle size={28} />}
          title="No questions in this view"
          description="Write down any questions about tracking, attachments, or switching to 7-day changes."
          actionText="Add First Question"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <QuestionChecklist
          questions={questions}
          onToggleComplete={handleToggleComplete}
          onEdit={(q) => setEditingQuestion(q)}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Doctor Question">
        <QuestionForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingQuestion} onClose={() => setEditingQuestion(null)} title="Edit Question">
        <QuestionForm
          initialData={editingQuestion}
          onSubmit={handleUpdate}
          onCancel={() => setEditingQuestion(null)}
        />
      </Modal>
    </div>
  );
};
