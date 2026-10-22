import client from './client';
import { Question } from '../types';

export const listQuestionsApi = async (params?: {
  isCompleted?: boolean;
  appointmentId?: string;
  priority?: string;
}): Promise<Question[]> => {
  const res = await client.get('/questions', { params });
  return res.data.data;
};

export const createQuestionApi = async (data: Partial<Question>): Promise<Question> => {
  const res = await client.post('/questions', data);
  return res.data.data;
};

export const updateQuestionApi = async (id: string, data: Partial<Question>): Promise<Question> => {
  const res = await client.put(`/questions/${id}`, data);
  return res.data.data;
};

export const completeQuestionApi = async (id: string, answerNotes?: string): Promise<Question> => {
  const res = await client.put(`/questions/${id}/complete`, { answerNotes });
  return res.data.data;
};

export const deleteQuestionApi = async (id: string) => {
  const res = await client.delete(`/questions/${id}`);
  return res.data;
};

export const getUnansweredQuestionsApi = async (): Promise<Question[]> => {
  const res = await client.get('/questions/unanswered');
  return res.data.data;
};
