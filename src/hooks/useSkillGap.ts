import { useQuery } from '@tanstack/react-query';
import { skillService } from '../services/skillService';

export function useSkillGapAnalysis() {
  return useQuery({
    queryKey: ['skill-gap-analysis'],
    queryFn: () => skillService.getGapAnalysis(),
  });
}
