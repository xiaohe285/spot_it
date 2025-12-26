import { GameStats } from '@/components/game/GameCanvas';

export interface CachedGameRecord {
  id: string;
  levelSlug: string;
  levelTitle: string;
  gameStats: GameStats;
  playedAt: string;
  challengeDate?: string; // For daily challenges
  isDaily?: boolean;
}

const CACHE_KEY = 'spot_it_cached_records';

export class GameRecordCache {
  // Save game record to localStorage
  static saveRecord(record: Omit<CachedGameRecord, 'id' | 'playedAt'>): void {
    try {
      const cachedRecords = this.getAllRecords();
      const newRecord: CachedGameRecord = {
        ...record,
        id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playedAt: new Date().toISOString(),
      };
      
      cachedRecords.push(newRecord);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedRecords));
      
      console.log('Game record cached:', newRecord);
    } catch (error) {
      console.error('Failed to cache game record:', error);
    }
  }

  // Get all cached records
  static getAllRecords(): CachedGameRecord[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached records:', error);
      return [];
    }
  }

  // Get count of cached records
  static getCachedCount(): number {
    return this.getAllRecords().length;
  }

  // Clear all cached records
  static clearAll(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('All cached records cleared');
    } catch (error) {
      console.error('Failed to clear cached records:', error);
    }
  }

  // Remove specific record
  static removeRecord(recordId: string): void {
    try {
      const cachedRecords = this.getAllRecords();
      const filtered = cachedRecords.filter(record => record.id !== recordId);
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove cached record:', error);
    }
  }

  // Check if localStorage is available
  static isAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Sync cached records to server (to be called after login)
  static async syncToServer(): Promise<{ success: boolean; synced: number; errors: number }> {
    const cachedRecords = this.getAllRecords();
    if (cachedRecords.length === 0) {
      return { success: true, synced: 0, errors: 0 };
    }

    let syncedCount = 0;
    let errorCount = 0;

    for (const record of cachedRecords) {
      try {
        // Here you would implement the API call to save the record
        // For now, we'll simulate the sync
        
        // Example API call (replace with actual implementation):
        /*
        const response = await fetch('/api/game-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            levelSlug: record.levelSlug,
            gameStats: record.gameStats,
            playedAt: record.playedAt,
            challengeDate: record.challengeDate,
            isDaily: record.isDaily,
          }),
        });

        if (response.ok) {
          syncedCount++;
          this.removeRecord(record.id);
        } else {
          errorCount++;
        }
        */

        // Simulate successful sync for now
        await new Promise(resolve => setTimeout(resolve, 100));
        syncedCount++;
        this.removeRecord(record.id);
      } catch (error) {
        console.error('Failed to sync record:', record.id, error);
        errorCount++;
      }
    }

    return { 
      success: errorCount === 0, 
      synced: syncedCount, 
      errors: errorCount 
    };
  }
}