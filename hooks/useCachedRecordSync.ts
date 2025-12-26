'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GameRecordCache } from '@/lib/gameRecordCache';
import { useSyncSuccess } from '@/contexts/SyncSuccessContext';

interface SyncStatus {
  isLoading: boolean;
  hasRecords: boolean;
  recordCount: number;
  syncCompleted: boolean;
  syncResult?: {
    success: boolean;
    synced: number;
    errors: number;
  };
}

export function useCachedRecordSync() {
  const { user } = useAuth();
  const { showSyncSuccess } = useSyncSuccess();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    hasRecords: false,
    recordCount: 0,
    syncCompleted: false,
  });

  // Check for cached records on mount and user change
  useEffect(() => {
    const recordCount = GameRecordCache.getCachedCount();
    setSyncStatus(prev => ({
      ...prev,
      hasRecords: recordCount > 0,
      recordCount,
    }));
  }, []);

  // Auto-sync when user logs in
  useEffect(() => {
    async function autoSync() {
      if (!user) return;
      
      const recordCount = GameRecordCache.getCachedCount();
      if (recordCount === 0) return;

      console.log(`User logged in with ${recordCount} cached records. Starting auto-sync...`);
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: true,
        hasRecords: true,
        recordCount,
      }));

      try {
        const result = await GameRecordCache.syncToServer();
        
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          syncCompleted: true,
          syncResult: result,
          hasRecords: GameRecordCache.getCachedCount() > 0,
          recordCount: GameRecordCache.getCachedCount(),
        }));

        if (result.success && result.synced > 0) {
          console.log(`Successfully synced ${result.synced} cached records`);
          
          // Show beautiful success modal instead of alert
          setTimeout(() => {
            showSyncSuccess(result.synced);
          }, 1500); // Small delay to ensure sync completion
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          syncResult: { success: false, synced: 0, errors: recordCount },
        }));
      }
    }

    // Delay auto-sync to ensure user auth is fully established
    const syncTimer = setTimeout(autoSync, 1000);
    
    return () => clearTimeout(syncTimer);
  }, [user]);

  // Manual sync function
  const manualSync = async (): Promise<{ success: boolean; synced: number; errors: number } | null> => {
    if (!user) {
      console.warn('Cannot sync: user not logged in');
      return null;
    }

    const recordCount = GameRecordCache.getCachedCount();
    if (recordCount === 0) {
      console.log('No cached records to sync');
      return { success: true, synced: 0, errors: 0 };
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await GameRecordCache.syncToServer();
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        syncCompleted: true,
        syncResult: result,
        hasRecords: GameRecordCache.getCachedCount() > 0,
        recordCount: GameRecordCache.getCachedCount(),
      }));

      return result;
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        syncResult: { success: false, synced: 0, errors: recordCount },
      }));
      return { success: false, synced: 0, errors: recordCount };
    }
  };

  return {
    syncStatus,
    manualSync,
    clearCache: () => {
      GameRecordCache.clearAll();
      setSyncStatus(prev => ({
        ...prev,
        hasRecords: false,
        recordCount: 0,
        syncCompleted: false,
        syncResult: undefined,
      }));
    },
  };
}