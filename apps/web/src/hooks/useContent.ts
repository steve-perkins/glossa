import { useQuery } from '@tanstack/react-query';
import type { ContentPayload, LessonWithSlides } from '@glossa/shared';
import { apiFetch } from '../api/client';

export function useLanguageContent(langId: string) {
  return useQuery<ContentPayload>({
    queryKey: ['content', langId],
    queryFn: () => apiFetch<ContentPayload>(`/content/${langId}`),
    enabled: !!langId,
  });
}

export function useLessonContent(langId: string, lessonId: string) {
  return useQuery<LessonWithSlides>({
    queryKey: ['lesson', langId, lessonId],
    queryFn: () => apiFetch<LessonWithSlides>(`/content/${langId}/lessons/${lessonId}`),
    enabled: !!langId && !!lessonId,
  });
}
