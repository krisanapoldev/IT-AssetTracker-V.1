
import { Asset, BorrowRecord, AssetStatus, AssetCondition } from '../types';

// --- CONFIGURATION ---
// คุณต้องนำค่าเหล่านี้มาจาก SharePoint และ Azure AD ของคุณ
const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const SITE_ID = "YOUR_SITE_ID_HERE"; // e.g., contoso.sharepoint.com,abc-123-xyz,def-456
const ASSETS_LIST_ID = "YOUR_ASSETS_LIST_ID";
const HISTORY_LIST_ID = "YOUR_HISTORY_LIST_ID";

// Interface สำหรับข้อมูลที่รับ/ส่งกับ SharePoint (Graph API format)
interface SharePointItem {
  id: string;
  fields: {
    Title: string; // Map to 'name'
    AssetID: string; // Map to 'id'
    SerialNumber: string;
    Category: string;
    Location: string;
    Status: string;
    Condition: string;
    IsVendorLoan: boolean;
    VendorName?: string;
    BorrowerName?: string;
    ReturnDueDate?: string;
    Notes?: string;
    ImageURL?: string;
    // History specific fields
    ActivityType?: string;
    ReturnDate?: string;
  };
}

export class SharePointService {
  private accessToken: string;

  constructor(token: string) {
    this.accessToken = token;
  }

  // --- HELPER: HEADER ---
  private getHeaders() {
    return {
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly"
    };
  }

  // --- ASSETS OPERATIONS ---

  async getAssets(): Promise<Asset[]> {
    try {
      const response = await fetch(
        `${GRAPH_ENDPOINT}/sites/${SITE_ID}/lists/${ASSETS_LIST_ID}/items?expand=fields`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      
      // Convert SharePoint Items to App Assets
      return data.value.map((item: SharePointItem) => ({
        id: item.fields.AssetID, // Use our custom AssetID column, not SharePoint's internal integer ID
        name: item.fields.Title,
        serialNumber: item.fields.SerialNumber,
        category: item.fields.Category,
        location: item.fields.Location,
        status: item.fields.Status as AssetStatus,
        condition: item.fields.Condition as AssetCondition,
        isVendorLoan: item.fields.IsVendorLoan,
        vendorName: item.fields.VendorName,
        borrowerName: item.fields.BorrowerName,
        returnDueDate: item.fields.ReturnDueDate,
        notes: item.fields.Notes,
        image: item.fields.ImageURL || undefined,
        // _spId is useful for updates
        _spId: item.id 
      }));
    } catch (error) {
      console.error("SharePoint Get Assets Error:", error);
      return [];
    }
  }

  async saveAsset(asset: Asset): Promise<void> {
    // Check if exists to decide Create vs Update
    // ในการใช้งานจริง ควรเก็บ SharePoint Internal ID (item.id) ไว้ใน Asset state เพื่อใช้อ้างอิงตอน update
    // โค้ดนี้จำลองการทำงานเบื้องต้น
    
    const fields = {
      Title: asset.name,
      AssetID: asset.id,
      SerialNumber: asset.serialNumber,
      Category: asset.category,
      Location: asset.location,
      Status: asset.status,
      Condition: asset.condition,
      IsVendorLoan: asset.isVendorLoan,
      VendorName: asset.vendorName || "",
      BorrowerName: asset.borrowerName || "",
      ReturnDueDate: asset.returnDueDate || null,
      Notes: asset.notes || "",
      ImageURL: asset.image || ""
    };

    // Logic for Update vs Create would go here
    // For Demo: assume Create
    await fetch(`${GRAPH_ENDPOINT}/sites/${SITE_ID}/lists/${ASSETS_LIST_ID}/items`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ fields })
    });
  }

  // --- HISTORY OPERATIONS ---

  async getHistory(): Promise<BorrowRecord[]> {
    try {
      const response = await fetch(
        `${GRAPH_ENDPOINT}/sites/${SITE_ID}/lists/${HISTORY_LIST_ID}/items?expand=fields`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      return data.value.map((item: SharePointItem) => ({
        id: item.fields.AssetID, // Map Log ID
        assetId: item.fields.Title, // Assuming we store AssetID in Title for history
        assetName: item.fields.Category, // Reuse fields or create specific columns
        serialNumber: item.fields.SerialNumber,
        borrowerName: item.fields.BorrowerName || "",
        borrowDate: item.fields.ReturnDueDate || "", // Map appropriate date columns
        returnDate: item.fields.ReturnDate,
        status: item.fields.ActivityType as 'BORROWED' | 'RETURNED'
      }));
    } catch (error) {
      console.error("SharePoint Get History Error:", error);
      return [];
    }
  }

  async addHistoryLog(log: BorrowRecord): Promise<void> {
    const fields = {
      Title: log.assetId,
      AssetID: log.id,
      SerialNumber: log.serialNumber,
      Category: log.assetName, // Store Name in Category field or create new column
      BorrowerName: log.borrowerName,
      ReturnDueDate: log.borrowDate, // Borrow Date
      ReturnDate: log.returnDate || null,
      ActivityType: log.status
    };

    await fetch(`${GRAPH_ENDPOINT}/sites/${SITE_ID}/lists/${HISTORY_LIST_ID}/items`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ fields })
    });
  }
}
