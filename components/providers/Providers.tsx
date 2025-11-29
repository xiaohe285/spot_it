'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import CachedRecordSyncProvider from './CachedRecordSyncProvider';
import SyncSuccessProviderWrapper from './SyncSuccessProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncSuccessProviderWrapper>
        <CachedRecordSyncProvider />
        {children}
      </SyncSuccessProviderWrapper>
    </AuthProvider>
  );
}
