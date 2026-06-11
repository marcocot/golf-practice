import { useQuery } from '@tanstack/react-query';
import type { ReferenceData } from '@/domain/reference';

// Static rule/definition texts (randa.org), shipped with the app and loaded once.
async function loadReference(): Promise<ReferenceData> {
  const res = await fetch('/quiz/reference.json');
  if (!res.ok) throw new Error('failed to load reference data');
  return res.json();
}

export function useReference() {
  return useQuery({ queryKey: ['quiz-reference'], queryFn: loadReference, staleTime: Infinity });
}
