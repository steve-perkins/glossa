import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { VocabItem } from '@glossa/shared';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

type LessonStatus = 'in_progress' | 'done';
type SrsResult = 'wrong' | 'correct' | 'easy';

export function useLessonProgress() {
  const { accessToken } = useAuth();
  return useQuery<Record<string, LessonStatus>>({
    queryKey: ['lesson-progress'],
    queryFn: () => apiFetch<Record<string, LessonStatus>>('/me/progress/lessons', { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });
}

export function useStoryProgress() {
  const { accessToken } = useAuth();
  return useQuery<string[]>({
    queryKey: ['story-progress'],
    queryFn: () => apiFetch<string[]>('/me/progress/stories', { token: accessToken ?? undefined }),
    enabled: !!accessToken,
  });
}

export function useSrsDue(langId: string, limit = 20) {
  const { accessToken } = useAuth();
  return useQuery<VocabItem[]>({
    queryKey: ['srs-due', langId, limit],
    queryFn: () =>
      apiFetch<VocabItem[]>(`/me/srs/due?langId=${langId}&limit=${limit}`, { token: accessToken ?? undefined }),
    enabled: !!accessToken && !!langId,
  });
}

export function useSrsSummary(langId: string) {
  const { accessToken } = useAuth();
  return useQuery<{ mastered: number; due: number }>({
    queryKey: ['srs-summary', langId],
    queryFn: () =>
      apiFetch<{ mastered: number; due: number }>(`/me/srs/summary?langId=${langId}`, { token: accessToken ?? undefined }),
    enabled: !!accessToken && !!langId,
  });
}

export function useLessonProgressMutation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      status,
      lastSlideOrdinal,
    }: {
      lessonId: string;
      status: LessonStatus;
      lastSlideOrdinal?: number;
    }) =>
      apiFetch(`/me/progress/lessons/${lessonId}`, {
        method: 'POST',
        body: { status, lastSlideOrdinal },
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
}

export function useStoryProgressMutation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) =>
      apiFetch(`/me/progress/stories/${storyId}`, {
        method: 'POST',
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-progress'] });
    },
  });
}

export function useSrsAnswerMutation(langId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vocabItemId, result }: { vocabItemId: string; result: SrsResult }) =>
      apiFetch(`/me/srs/${vocabItemId}/answer`, {
        method: 'POST',
        body: { result },
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srs-due', langId] });
      queryClient.invalidateQueries({ queryKey: ['srs-summary', langId] });
    },
  });
}
