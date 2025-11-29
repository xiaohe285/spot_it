'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SyncSuccessContextType {
  showSyncSuccess: (syncedCount: number) => void;
  hideSyncSuccess: () => void;
  isVisible: boolean;
  syncedCount: number;
}

const SyncSuccessContext = createContext<SyncSuccessContextType | undefined>(undefined);

export function SyncSuccessProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const showSyncSuccess = (count: number) => {
    setSyncedCount(count);
    setIsVisible(true);
  };

  const hideSyncSuccess = () => {
    setIsVisible(false);
  };

  return (
    <SyncSuccessContext.Provider 
      value={{
        showSyncSuccess,
        hideSyncSuccess,
        isVisible,
        syncedCount,
      }}
    >
      {children}
    </SyncSuccessContext.Provider>
  );
}

export function useSyncSuccess() {
  const context = useContext(SyncSuccessContext);
  if (context === undefined) {
    throw new Error('useSyncSuccess must be used within a SyncSuccessProvider');
  }
  return context;
}