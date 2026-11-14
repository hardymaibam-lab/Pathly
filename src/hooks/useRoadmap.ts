import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '../services/roadmapService';
import { RoadmapData } from '../types/roadmap';

export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapService.getRoadmap(),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) =>
      roadmapService.toggleTaskCompletion(taskId, isCompleted),
    onSuccess: (data) => {
      // Update roadmap cache directly
      queryClient.setQueryData(['roadmap'], data.roadmap);
      // Invalidate dashboard summary so progress percentage stays in sync
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
