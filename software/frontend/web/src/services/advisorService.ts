import api from './api';
import axios from 'axios';

export type AdvisorContextUsed = {
  crop: string;
  growth_stage: string;
  recent_sensor_data?: boolean;
  current_weather?: boolean;
  crop_reference_entries: number;
  recent_field_problems?: number;
  decision_support_only?: boolean;
  evidence_score?: number;
  confidence_reason?: string;
  data_limitations?: string[];
};

export type AdvisorResult = {
  status: string;
  headline?: string;
  what_may_be_happening?: string;
  do_now?: string[];
  check_next?: string[];
  why_this_advice?: string[];
  avoid_for_now?: string[];
  recheck_after?: string;
  get_help_if?: string[];
  tell_us_next?: string;
  safety_note?: string;
  confidence: string;
  evidence?: string[];
  sources?: string[];
  // Older saved recommendations remain readable during the transition.
  summary?: string;
  possible_causes?: string[];
  actions_now?: string[];
  monitor_next?: string[];
  recheck?: string;
  follow_up_question?: string;
  urgent_warning?: string;
  context_used?: AdvisorContextUsed;
};
export type AdvisorRecommendation = { id: string; observation: string; advice: AdvisorResult; created_at?: string };

export const requestFieldAdvice = async (fieldId: string, observation: string) => {
  try {
    const response = await api.post<{ id: string; crop: string; stage: string; observation: string; advice: AdvisorResult }>(`/api/fields/${encodeURIComponent(fieldId)}/advisor/recommendations`, { observation });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = typeof error.response?.data === 'string'
        ? error.response.data.trim()
        : 'AI Advisor is temporarily unavailable.';
      throw new Error(message || 'AI Advisor is temporarily unavailable.');
    }
    throw error;
  }
};

export const getFieldAdvice = async (fieldId: string): Promise<AdvisorRecommendation[]> => {
  const response = await api.get<{ recommendations?: AdvisorRecommendation[] }>(`/api/fields/${encodeURIComponent(fieldId)}/advisor/recommendations`);
  return response.data.recommendations || [];
};
