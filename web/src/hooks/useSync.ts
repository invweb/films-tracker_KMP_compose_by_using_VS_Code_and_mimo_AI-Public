import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncService } from '../services/sync';
import { useAuth } from '../contexts/AuthContext';

export function useSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      syncService.connect();
      return () => syncService.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = syncService.onUpdate((message) => {
      if (message.type === 'update' || message.type === 'delete') {
        queryClient.invalidateQueries({ queryKey: ['movies'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const notifyUpdate = useCallback((type: string, data: any) => {
    syncService.notifyUpdate(type, data);
  }, []);

  return { notifyUpdate };
}
