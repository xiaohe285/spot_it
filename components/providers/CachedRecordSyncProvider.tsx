'use client';

import { useCachedRecordSync } from '@/hooks/useCachedRecordSync';

// This component initializes the cached record sync functionality
// It doesn't render any UI, just manages the sync process in the background
export default function CachedRecordSyncProvider() {
  // The hook handles all the sync logic automatically
  useCachedRecordSync();

  // This component doesn't render anything
  return null;
}