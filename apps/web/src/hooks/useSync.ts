import { useMutation } from '@tanstack/react-query';
import { fullSync } from '@/lib/sync';

export function useSync() {
  return useMutation({ mutationKey: ['sync'], mutationFn: () => fullSync() });
}
