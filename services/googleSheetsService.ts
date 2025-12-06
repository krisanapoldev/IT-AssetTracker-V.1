
import { Asset, BorrowRecord } from '../types';

// --- CONFIGURATION ---
// You can paste your Web App URL here to hardcode it into the application.
// This is useful if you want to deploy the app for others without asking them to enter the URL.
const DEFAULT_SHEET_URL = ''; 

export const getSheetUrl = () => {
  // 1. Check LocalStorage (User entered)
  const localUrl = localStorage.getItem('google-sheet-url');
  if (localUrl) return localUrl;
  
  // 2. Check Environment Variable (Build time)
  if (process.env.REACT_APP_GOOGLE_SHEET_URL) return process.env.REACT_APP_GOOGLE_SHEET_URL;

  // 3. Check Hardcoded Default
  return DEFAULT_SHEET_URL;
};

export const saveSheetUrl = (url: string) => localStorage.setItem('google-sheet-url', url);

export const syncToGoogleSheets = async (assets: Asset[], history: BorrowRecord[]): Promise<void> => {
  const url = getSheetUrl();
  if (!url) throw new Error("Google Sheet URL not configured");

  // Format payload
  const payload = {
    assets,
    history
  };

  try {
    // We use 'no-cors' to prevent CORS errors. 
    // Limitation: We cannot read the response (it will be opaque), but the request usually succeeds.
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Send as text to avoid preflight issues in some cases
      },
    });
    
  } catch (error) {
    console.error("GS Sync Error:", error);
    throw error;
  }
};

export const loadFromGoogleSheets = async (): Promise<{ assets: Asset[], history: BorrowRecord[] }> => {
  const url = getSheetUrl();
  if (!url) throw new Error("Google Sheet URL not configured");

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      assets: data.assets || [],
      history: data.history || []
    };
  } catch (error) {
    console.error("GS Load Error:", error);
    throw error;
  }
};
