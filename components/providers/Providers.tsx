'use client';

import { PremiumProvider } from '@/contexts/PremiumContext';
import PremiumAwareAds from '@/components/ads/PremiumAwareAds';
import { AuthProvider } from '@/contexts/AuthContext';
import CachedRecordSyncProvider from './CachedRecordSyncProvider';
import SyncSuccessProviderWrapper from './SyncSuccessProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PremiumProvider>
        <PremiumAwareAds />
        <SyncSuccessProviderWrapper>
          <CachedRecordSyncProvider />
          {children}
        </SyncSuccessProviderWrapper>
      </PremiumProvider>
    </AuthProvider>
  );
}
