import { useQuery } from '@tanstack/react-query';
import type { QuizQuestion } from '@/domain/quiz';

// The question pool is a static asset shipped with the app; fetch it once and
// keep it. No network call ever leaves for the source site at runtime.
async function loadPool(): Promise<QuizQuestion[]> {
  const res = await fetch('/quiz/quiz.json');
  if (!res.ok) throw new Error('failed to load quiz pool');
  return res.json();
}

export function useQuizPool() {
  return useQuery({ queryKey: ['quiz-pool'], queryFn: loadPool, staleTime: Infinity });
}
