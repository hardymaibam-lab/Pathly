import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '../services/assessmentService';
import { OnboardingState } from '../types/assessment';
import { useAuth } from './useAuth';

export function useRIASECQuestions() {
  return useQuery({
    queryKey: ['riasec-questions'],
    queryFn: () => assessmentService.getRIASECQuestions(),
    staleTime: Infinity, // Questions do not change often
  });
}

export function useAssessmentStatus() {
  return useQuery({
    queryKey: ['assessment-status'],
    queryFn: () => assessmentService.getStatus(),
  });
}

export function useSaveDraft() {
  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: Partial<OnboardingState> }) =>
      assessmentService.saveDraft(step, data),
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (state: OnboardingState) => assessmentService.submitAssessment(state),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['assessment-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
