import axios from 'axios';
import api from './api';
import { AdvisorResult } from './advisorService';

export type FieldProblemStatus = 'open' | 'needs_information' | 'advice_ready' | 'monitoring' | 'resolved' | 'reopened';

export interface FieldProblemResponse {
  id: string;
  turn_number: number;
  farmer_text: string;
  advice: AdvisorResult;
  created_at: string;
}

export interface FieldProblem {
  id: string;
  field_id: string;
  title: string;
  observation: string;
  status: FieldProblemStatus;
  advisor_turn_count: number;
  responses_remaining: number;
  crop: string;
  stage: string;
  latest_advice?: AdvisorResult;
  responses?: FieldProblemResponse[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_comment?: string;
}

const messageFromError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data === 'string') {
    return error.response.data.trim() || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const getFieldProblems = async (fieldId: string): Promise<FieldProblem[]> => {
  const response = await api.get<{ problems?: FieldProblem[] }>(`/api/fields/${encodeURIComponent(fieldId)}/problems`);
  return response.data.problems || [];
};

export const getFieldProblem = async (fieldId: string, problemId: string): Promise<FieldProblem> => {
  const response = await api.get<FieldProblem>(`/api/fields/${encodeURIComponent(fieldId)}/problems/${encodeURIComponent(problemId)}`);
  return response.data;
};

export const createFieldProblem = async (fieldId: string, observation: string): Promise<FieldProblem> => {
  try {
    const response = await api.post<FieldProblem>(`/api/fields/${encodeURIComponent(fieldId)}/problems`, { observation });
    return response.data;
  } catch (error) {
    throw new Error(messageFromError(error, 'Problem advice is unavailable right now.'));
  }
};

export const answerFieldProblem = async (fieldId: string, problemId: string, answer: string): Promise<FieldProblem> => {
  try {
    const response = await api.post<FieldProblem>(
      `/api/fields/${encodeURIComponent(fieldId)}/problems/${encodeURIComponent(problemId)}/responses`,
      { answer },
    );
    return response.data;
  } catch (error) {
    throw new Error(messageFromError(error, 'Could not update this problem.'));
  }
};

export const resolveFieldProblem = async (
  fieldId: string,
  problemId: string,
  helpful?: boolean,
  resolution_comment?: string,
): Promise<FieldProblem> => {
  const response = await api.post<FieldProblem>(
    `/api/fields/${encodeURIComponent(fieldId)}/problems/${encodeURIComponent(problemId)}/resolve`,
    { helpful, resolution_comment },
  );
  return response.data;
};
