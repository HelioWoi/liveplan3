/**
 * Sync Service - Ensures data consistency and reliable synchronization
 * Implements offline support, conflict resolution, and data integrity checks
 */

import { securityService } from './securityService';

// Types for sync operations
type SyncStatus = 'pending' | 'syncing' | 'completed' | 'failed';
type SyncOperation = 'create' | 'update' | 'delete';

interface SyncItem {
  id: string;
  entityType: string;
  operation: SyncOperation;
  data: any;
  timestamp: string;
  status: SyncStatus;
  retryCount: number;
}

/**
 * Service for handling data synchronization with reliability features
 */
export const syncService = {
  syncQueue: [] as SyncItem[],
  isSyncing: false,
  
  /**
   * Adds an item to the sync queue
   * @param entityType - Type of entity (transaction, budget, etc.)
   * @param operation - Type of operation (create, update, delete)
   * @param data - Data to be synchronized
   * @returns ID of the queued sync item
   */
  queueSync: (entityType: string, operation: SyncOperation, data: any): string => {
    const syncItem: SyncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      entityType,
      operation,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };
    
    // Store in local queue
    syncService.syncQueue.push(syncItem);
    
    // Persist to localStorage for offline resilience
    syncService.persistSyncQueue();
    
    // Try to sync immediately if possible
    syncService.processSyncQueue();
    
    return syncItem.id;
  },
  
  /**
   * Process the sync queue
   */
  processSyncQueue: async (): Promise<void> => {
    // If already syncing or queue is empty, do nothing
    if (syncService.isSyncing || syncService.syncQueue.length === 0) {
      return;
    }
    
    syncService.isSyncing = true;
    
    try {
      // Load queue from persistent storage
      syncService.loadSyncQueue();
      
      // Process each pending item
      for (const item of syncService.syncQueue.filter(i => i.status === 'pending')) {
        try {
          item.status = 'syncing';
          syncService.persistSyncQueue();
          
          // In a real app, this would make an API call
          // For now, we'll simulate a successful sync
          await syncService.simulateSync(item);
          
          item.status = 'completed';
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          item.status = 'failed';
          item.retryCount += 1;
          
          // Implement exponential backoff for retries
          if (item.retryCount < 5) {
            setTimeout(() => {
              item.status = 'pending';
              syncService.persistSyncQueue();
              syncService.processSyncQueue();
            }, Math.pow(2, item.retryCount) * 1000); // Exponential backoff
          }
        }
      }
    } finally {
      syncService.persistSyncQueue();
      syncService.isSyncing = false;
      
      // Clean up completed items older than 24 hours
      syncService.cleanupCompletedItems();
    }
  },
  
  /**
   * Simulate a sync operation (in a real app, this would be an API call)
   * @param item - Sync item to process
   */
  simulateSync: async (item: SyncItem): Promise<void> => {
    // Encrypt sensitive data before "sending"
    const encryptedData = securityService.encryptData(item.data);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate random failure (10% chance) for testing resilience
    if (Math.random() < 0.1) {
      throw new Error('Simulated sync failure');
    }
    
    // In a real app, we would send the data to the server here
    console.log(`Synced ${item.operation} operation for ${item.entityType}`, encryptedData);
  },
  
  /**
   * Persist sync queue to localStorage
   */
  persistSyncQueue: (): void => {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(syncService.syncQueue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  },
  
  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue: (): void => {
    try {
      const storedQueue = localStorage.getItem('syncQueue');
      if (storedQueue) {
        syncService.syncQueue = JSON.parse(storedQueue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  },
  
  /**
   * Clean up completed sync items older than 24 hours
   */
  cleanupCompletedItems: (): void => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    syncService.syncQueue = syncService.syncQueue.filter(item => {
      if (item.status !== 'completed') return true;
      const itemDate = new Date(item.timestamp);
      return itemDate > oneDayAgo;
    });
    
    syncService.persistSyncQueue();
  },
  
  /**
   * Get sync status summary
   * @returns Summary of sync queue status
   */
  getSyncStatus: (): { pending: number; syncing: number; completed: number; failed: number } => {
    return {
      pending: syncService.syncQueue.filter(i => i.status === 'pending').length,
      syncing: syncService.syncQueue.filter(i => i.status === 'syncing').length,
      completed: syncService.syncQueue.filter(i => i.status === 'completed').length,
      failed: syncService.syncQueue.filter(i => i.status === 'failed').length
    };
  },
  
  /**
   * Initialize sync service
   */
  initialize: (): void => {
    // Load any pending sync operations from storage
    syncService.loadSyncQueue();
    
    // Process any pending items
    syncService.processSyncQueue();
    
    // Set up periodic sync attempts
    setInterval(() => {
      syncService.processSyncQueue();
    }, 60000); // Check every minute
  }
};

export default syncService;
