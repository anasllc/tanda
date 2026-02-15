import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  phone: string;
  avatar_url?: string;
}

interface SearchResponse {
  users: SearchResult[];
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: () => api.searchUsers(query) as Promise<SearchResponse>,
    enabled: query.length >= 2,
  });
}

export function useSyncContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumbers: string[]) => api.syncContacts(phoneNumbers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export type { SearchResult };
