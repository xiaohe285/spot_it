'use client';

import { SyncSuccessProvider, useSyncSuccess } from '@/contexts/SyncSuccessContext';
import SyncSuccessModal from '@/components/modals/SyncSuccessModal';

function GlobalSyncSuccessModal() {
  const { isVisible, syncedCount, hideSyncSuccess } = useSyncSuccess();

  return (
    <SyncSuccessModal
      isOpen={isVisible}
      onClose={hideSyncSuccess}
      syncedCount={syncedCount}
      autoCloseDelay={5000}
    />
  );
}

export default function SyncSuccessProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SyncSuccessProvider>
      {children}
      <GlobalSyncSuccessModal />
    </SyncSuccessProvider>
  );
}