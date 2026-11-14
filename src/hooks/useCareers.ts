import { useQuery } from '@tanstack/react-query';
import { careerService } from '../services/careerService';

export function useCareers(readinessFilter?: string) {
  return useQuery({
    queryKey: ['careers', readinessFilter],
    queryFn: () => careerService.getCareers(readinessFilter),
  });
}

export function useCareerDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['career', id],
    queryFn: () => {
      if (!id) throw new Error('Career ID is required');
      return careerService.getCareerById(id);
    },
    enabled: !!id,
  });
}
