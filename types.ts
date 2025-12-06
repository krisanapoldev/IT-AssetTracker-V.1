
export enum AssetStatus {
  AVAILABLE = 'ว่าง',
  IN_USE = 'กำลังใช้งาน',
  BORROWED = 'ถูกยืม',
  REPAIR = 'ส่งซ่อม',
  BROKEN = 'เสียหาย/เสีย',
  LOST = 'สูญหาย'
}

export enum AssetCondition {
  NEW = 'ใหม่',
  GOOD = 'ดี',
  FAIR = 'พอใช้',
  POOR = 'แย่',
  DAMAGED = 'ชำรุด'
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: string; // Laptop, Monitor, Mobile, Accessory
  location: string; // HQ, Branch A, Branch B, Remote
  status: AssetStatus;
  condition: AssetCondition;
  isVendorLoan: boolean; // Is this a loaner from a vendor?
  vendorName?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  borrowerName?: string;
  borrowDate?: string;
  returnDueDate?: string;
  notes?: string;
  image?: string;
}

export interface BorrowRecord {
  id: string;
  assetId: string;
  assetName: string;
  serialNumber?: string; // Added to track specific unit
  assetImage?: string;
  borrowerName: string;
  borrowDate: string;
  returnDate?: string; // If undefined, it means not returned yet
  status: 'RETURNED' | 'BORROWED';
}

export interface ChartData {
  name: string;
  value: number;
}
