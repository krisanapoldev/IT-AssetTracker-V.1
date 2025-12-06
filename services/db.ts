
import { Asset, BorrowRecord } from '../types';
import { INITIAL_ASSETS, INITIAL_HISTORY } from './mockData';

const ASSET_KEY = 'it-tracker-assets';
const HISTORY_KEY = 'it-tracker-history';

// Helper to simulate network delay for realism (optional)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  
  // --- ASSETS OPERATIONS ---

  async getAssets(): Promise<Asset[]> {
    await delay(300); // Simulate API latency
    const data = localStorage.getItem(ASSET_KEY);
    if (!data) {
      // Seed initial data if empty
      this.saveAssetsToStorage(INITIAL_ASSETS);
      return INITIAL_ASSETS;
    }
    return JSON.parse(data);
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const assets = await this.getAssets();
    return assets.find(a => a.id === id);
  }

  async saveAsset(asset: Asset): Promise<Asset> {
    await delay(200);
    const assets = await this.getAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    
    let newAssets;
    if (index >= 0) {
      // Update existing
      newAssets = [...assets];
      newAssets[index] = asset;
    } else {
      // Create new
      newAssets = [asset, ...assets];
    }
    
    this.saveAssetsToStorage(newAssets);
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    await delay(200);
    const assets = await this.getAssets();
    const newAssets = assets.filter(a => a.id !== id);
    this.saveAssetsToStorage(newAssets);
  }

  private saveAssetsToStorage(assets: Asset[]) {
    localStorage.setItem(ASSET_KEY, JSON.stringify(assets));
  }

  // --- HISTORY OPERATIONS ---

  async getHistory(): Promise<BorrowRecord[]> {
    await delay(300);
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) {
      this.saveHistoryToStorage(INITIAL_HISTORY);
      return INITIAL_HISTORY;
    }
    return JSON.parse(data);
  }

  async addHistoryLog(log: BorrowRecord): Promise<void> {
    const logs = await this.getHistory();
    const newLogs = [...logs, log];
    this.saveHistoryToStorage(newLogs);
  }

  async updateHistoryLog(log: BorrowRecord): Promise<void> {
    const logs = await this.getHistory();
    const index = logs.findIndex(l => l.id === log.id);
    if (index >= 0) {
      const newLogs = [...logs];
      newLogs[index] = log;
      this.saveHistoryToStorage(newLogs);
    }
  }

  async updateHistoryLogs(logs: BorrowRecord[]): Promise<void> {
    this.saveHistoryToStorage(logs);
  }

  private saveHistoryToStorage(logs: BorrowRecord[]) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(logs));
  }

  // --- BACKUP & RESTORE OPERATIONS ---

  async getBackupData(): Promise<any> {
    const assets = await this.getAssets();
    const history = await this.getHistory();
    
    // Get Configuration
    const sheetUrl = localStorage.getItem('google-sheet-url');
    const autoSync = localStorage.getItem('auto-sync-enabled');

    return { 
      assets, 
      history,
      config: {
        sheetUrl,
        autoSync: autoSync === 'true'
      }
    };
  }

  async restoreBackup(data: any): Promise<void> {
    if (!Array.isArray(data.assets) || !Array.isArray(data.history)) {
      throw new Error("Invalid backup format");
    }
    
    this.saveAssetsToStorage(data.assets);
    this.saveHistoryToStorage(data.history);

    // Restore Configuration if present
    if (data.config) {
      if (data.config.sheetUrl) {
        localStorage.setItem('google-sheet-url', data.config.sheetUrl);
      }
      if (typeof data.config.autoSync !== 'undefined') {
        localStorage.setItem('auto-sync-enabled', String(data.config.autoSync));
      }
    }
  }
}

export const db = new DatabaseService();
