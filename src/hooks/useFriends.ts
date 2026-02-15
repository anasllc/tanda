import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: string;
}

interface FriendsResponse {
  friends: Friend[];
  has_more: boolean;
}

export function useFriends(status?: string) {
  return useQuery({
    queryKey: ['friends', status],
    queryFn: () => api.getFriends(status) as Promise<FriendsResponse>,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.sendFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; action: 'accept' | 'decline' }) =>
      api.respondToFriendRequest(params.userId, params.action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.unfriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export type { Friend };
