import React, { useState } from 'react';
import { Question } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { PRIORITY_LEVELS } from '../../utils/constants';

interface QuestionFormProps {
  initialData?: Question | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [text, setText] = useState(initialData?.text || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [answerNotes, setAnswerNotes] = useState(initialData?.answerNotes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      text,
      priority,
      answerNotes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Question to Ask"
        required
        placeholder="e.g. When can I switch to 7-day changes? Is the gap near my canine normal? Can I drink coffee with aligners in?..."
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as any)}
        options={PRIORITY_LEVELS}
      />

      {initialData && (
        <Textarea
          label="Doctor's Answer / Response Notes"
          placeholder="Notes taken during the appointment..."
          rows={3}
          value={answerNotes}
          onChange={(e) => setAnswerNotes(e.target.value)}
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {initialData ? 'Update Question' : 'Save Question'}
        </Button>
      </div>
    </form>
  );
};
