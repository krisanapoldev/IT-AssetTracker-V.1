
import { AssetStatus, AssetCondition } from '../types';

export type Language = 'th' | 'en';

export const translations = {
  th: {
    // Sidebar
    dashboard: "แดชบอร์ด",
    inventory: "คลังอุปกรณ์",
    history: "ประวัติการยืม-คืน",
    aiAssistant: "ผู้ช่วย AI",
    systemStatus: "สถานะระบบ",
    online: "ออนไลน์",
    menu: "เมนู",
    tools: "เครื่องมือ",
    dataManagement: "จัดการข้อมูล",
    exportData: "สำรองข้อมูลระบบ (JSON)",
    importData: "กู้คืนข้อมูลระบบ (JSON)",
    exportAssetsCSV: "ดาวน์โหลดรายการอุปกรณ์ (Excel)",
    exportHistoryCSV: "ดาวน์โหลดประวัติ (Excel)",
    syncSheet: "ซิงค์กับ Google Sheets",
    
    // Header
    addNew: "เพิ่มรายการใหม่",
    dashboardTitle: "ภาพรวมระบบ",
    inventoryTitle: "จัดการทรัพย์สิน",
    historyTitle: "ประวัติการยืม-คืน",
    aiTitle: "ผู้ช่วย AI",

    // Dashboard Stats
    totalAssets: "อุปกรณ์ทั้งหมด",
    available: "พร้อมใช้งาน",
    damagedRepair: "เสียหาย/ส่งซ่อม",
    vendorLoans: "ยืมจาก Vendor",
    statusDist: "สัดส่วนสถานะอุปกรณ์",
    locationDist: "อุปกรณ์แยกตามสถานที่",
    thisMonth: "ในเดือนนี้",

    // Asset List
    searchPlaceholder: "ค้นหาชื่อ, S/N, หรือผู้ยืม...",
    allStatus: "ทุกสถานะ",
    allConditions: "ทุกสภาพ",
    assetColumn: "อุปกรณ์ / S/N",
    statusCondition: "สถานะ & สภาพ",
    location: "สถานที่",
    holder: "ผู้ถือครอง / Vendor",
    actions: "จัดการ",
    noAssets: "ไม่พบรายการอุปกรณ์",
    tryAdjust: "ลองปรับตัวกรองหรือคำค้นหาใหม่",
    vendorLoanTag: "ของยืม Vendor",
    condition: "สภาพ",
    overdue: "เกินกำหนด!",
    due: "คืนภายใน:",
    emptyHolder: "- ว่าง -",
    
    // Expanded Detail
    datesWarranty: "วันที่ & การรับประกัน",
    purchaseDate: "วันที่ซื้อ",
    warrantyEnds: "หมดประกัน",
    warrantyExpired: "หมดประกันแล้ว",
    activeWarranty: "อยู่ในประกัน",
    custodyDetails: "รายละเอียดการถือครอง",
    currentUser: "ผู้ใช้งานปัจจุบัน",
    borrowedOn: "ยืมเมื่อ",
    returnDue: "กำหนดคืน",
    vendorInfo: "ข้อมูล Vendor",
    propertyOfVendor: "ทรัพย์สินของ Vendor (ยืมมาใช้งานชั่วคราว)",
    inStorage: "อยู่ในคลัง (ไม่มีผู้ถือครอง)",
    notes: "บันทึกเพิ่มเติม",
    noNotes: "- ไม่มีบันทึก -",
    editAsset: "แก้ไข",
    deleteAsset: "ลบ",

    // Asset Form
    editHeader: "แก้ไขข้อมูล",
    newHeader: "เพิ่มอุปกรณ์ใหม่",
    fillDetails: "กรอกข้อมูลอุปกรณ์ด้านล่าง",
    imageLabel: "รูปภาพอุปกรณ์",
    imageUrl: "ลิงก์รูปภาพ",
    uploadFile: "อัปโหลดไฟล์",
    uploadHint: "คลิกเพื่ออัปโหลด (สูงสุด 10MB)",
    assetName: "ชื่ออุปกรณ์",
    serialNumber: "Serial Number",
    category: "หมวดหมู่",
    currentStatus: "สถานะปัจจุบัน",
    isVendorLoan: "นี่คือของยืมจาก Vendor (Demo/Spare)",
    vendorName: "ชื่อ Vendor",
    borrowingDetails: "รายละเอียดการยืม",
    borrowerName: "ชื่อผู้ยืม",
    cancel: "ยกเลิก",
    save: "บันทึก",
    
    // History
    searchHistory: "ค้นหาประวัติ...",
    activity: "กิจกรรม",
    assetDetails: "รายละเอียดอุปกรณ์",
    borrower: "ผู้ยืม",
    borrowedDate: "วันที่ยืม",
    returnedDate: "วันที่คืน",
    statusBorrowed: "กำลังยืม",
    statusReturned: "คืนแล้ว",
    pending: "- ยังไม่คืน -",
    noHistory: "ไม่พบประวัติการยืม-คืน",

    // AI Chat
    aiIntro: "สวัสดีครับ! ผมคือผู้ช่วย AI สำหรับดูแลคลังทรัพย์สิน IT ของคุณ ถามผมได้เลย เช่น 'มี MacBook กี่เครื่อง?' หรือ 'ใครยืมโปรเจคเตอร์ไป?'",
    aiProcessing: "กำลังประมวลผล...",
    typeMessage: "พิมพ์คำถามของคุณที่นี่...",
    aiDisclaimer: "AI อาจมีข้อผิดพลาด โปรดตรวจสอบข้อมูลสำคัญอีกครั้ง",
    onlineReady: "พร้อมใช้งาน",

    // Toast & Modals
    confirmDelete: "ยืนยันการลบ?",
    deleteWarning: "การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลอุปกรณ์นี้จะถูกลบออกจากระบบถาวร",
    deleteSuccess: "ลบข้อมูลเรียบร้อยแล้ว",
    updateSuccess: "อัปเดตข้อมูลสำเร็จ",
    createSuccess: "เพิ่มรายการใหม่สำเร็จ",
    importSuccess: "กู้คืนข้อมูลสำเร็จ (รีเฟรชหน้าเว็บ...)",
    importError: "ไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ JSON ที่ Export จากระบบนี้",
    error: "เกิดข้อผิดพลาด",
    gsUrlLabel: "Google Apps Script Web App URL",
    gsUrlHint: "วาง URL ที่ได้จากการ Deploy Script (ขึ้นต้นด้วย script.google.com)",
    syncSuccess: "ซิงค์ข้อมูลกับ Google Sheet สำเร็จ!",
    syncError: "การซิงค์ล้มเหลว ตรวจสอบ URL หรือการตั้งค่า Script",
    saveToCloud: "บันทึกขึ้น Cloud (Sheet)",
    loadFromCloud: "โหลดจาก Cloud (Sheet)",
    
    // Settings - Auto Sync
    autoSyncSettings: "การซิงค์อัตโนมัติ (Real-time)",
    enableAutoSync: "เปิดใช้งาน Auto Sync",
    autoSyncDesc: "ระบบจะดึงข้อมูลล่าสุดจาก Google Sheet ทุกๆ 1 นาทีโดยอัตโนมัติ (จะหยุดทำงานขณะเปิดหน้าต่างแก้ไขข้อมูล)",
    autoSyncActive: "Auto Sync ทำงานอยู่",
  },
  en: {
    // Sidebar
    dashboard: "Dashboard",
    inventory: "Inventory",
    history: "History Log",
    aiAssistant: "AI Assistant",
    systemStatus: "System Status",
    online: "Online",
    menu: "MENU",
    tools: "AI TOOLS",
    dataManagement: "DATA MANAGEMENT",
    exportData: "Backup System (JSON)",
    importData: "Restore System (JSON)",
    exportAssetsCSV: "Export Assets (Excel)",
    exportHistoryCSV: "Export History (Excel)",
    syncSheet: "Sync Google Sheets",

    // Header
    addNew: "Add New Asset",
    dashboardTitle: "Dashboard Overview",
    inventoryTitle: "Asset Management",
    historyTitle: "Borrowing History",
    aiTitle: "AI Assistant",

    // Dashboard Stats
    totalAssets: "Total Assets",
    available: "Available",
    damagedRepair: "Damaged/Repair",
    vendorLoans: "Vendor Loans",
    statusDist: "Asset Status Distribution",
    locationDist: "Assets by Location",
    thisMonth: "this month",

    // Asset List
    searchPlaceholder: "Search assets, S/N, or borrower...",
    allStatus: "All Status",
    allConditions: "All Conditions",
    assetColumn: "Asset / S/N",
    statusCondition: "Status & Condition",
    location: "Location",
    holder: "Holder / Vendor",
    actions: "Actions",
    noAssets: "No assets found",
    tryAdjust: "Try adjusting your filters or search terms",
    vendorLoanTag: "Vendor Loan",
    condition: "Condition",
    overdue: "Overdue!",
    due: "Due:",
    emptyHolder: "- Empty -",

    // Expanded Detail
    datesWarranty: "Dates & Warranty",
    purchaseDate: "Purchase Date",
    warrantyEnds: "Warranty Ends",
    warrantyExpired: "Warranty Expired",
    activeWarranty: "Active Warranty",
    custodyDetails: "Custody Details",
    currentUser: "Current User",
    borrowedOn: "Borrowed On",
    returnDue: "Return Due",
    vendorInfo: "Vendor Information",
    propertyOfVendor: "Property of vendor. Loaned for temporary use.",
    inStorage: "Currently in storage (No active holder)",
    notes: "Notes",
    noNotes: "- No additional notes -",
    editAsset: "Edit Asset",
    deleteAsset: "Delete",

    // Asset Form
    editHeader: "Edit Asset",
    newHeader: "New Asset",
    fillDetails: "Fill in the details below",
    imageLabel: "Asset Image",
    imageUrl: "Image URL",
    uploadFile: "Upload File",
    uploadHint: "Click to upload (max 10MB)",
    assetName: "Asset Name",
    serialNumber: "Serial Number",
    category: "Category",
    currentStatus: "Current Status",
    isVendorLoan: "This is a Vendor Loan (Demo/Spare Unit)",
    vendorName: "Vendor Name",
    borrowingDetails: "Borrowing Details",
    borrowerName: "Borrower Name",
    cancel: "Cancel",
    save: "Save Asset",

    // History
    searchHistory: "Search history...",
    activity: "Activity",
    assetDetails: "Asset Details",
    borrower: "Borrower",
    borrowedDate: "Borrowed Date",
    returnedDate: "Returned Date",
    statusBorrowed: "Borrowed",
    statusReturned: "Returned",
    pending: "- Pending -",
    noHistory: "No history records found",

    // AI Chat
    aiIntro: "Hello! I am your AI Asset Assistant. You can ask me anything about your inventory, like \"How many MacBooks do we have?\" or \"Who has the projector?\"",
    aiProcessing: "Processing...",
    typeMessage: "Ask about your assets...",
    aiDisclaimer: "AI can make mistakes. Verify critical info.",
    onlineReady: "Online & Ready",

    // Toast & Modals
    confirmDelete: "Are you sure?",
    deleteWarning: "This action cannot be undone. This asset will be permanently removed from your inventory.",
    deleteSuccess: "Asset deleted successfully",
    updateSuccess: "Asset updated successfully",
    createSuccess: "New asset created successfully",
    importSuccess: "Data restored successfully (Reloading...)",
    importError: "Invalid file. Please use a JSON file exported from this system.",
    error: "An error occurred",
    gsUrlLabel: "Google Apps Script Web App URL",
    gsUrlHint: "Paste URL from Script Deployment (starts with script.google.com)",
    syncSuccess: "Synced with Google Sheets successfully!",
    syncError: "Sync failed. Check URL or Script setup.",
    saveToCloud: "Save to Cloud",
    loadFromCloud: "Load from Cloud",

    // Settings - Auto Sync
    autoSyncSettings: "Auto Sync (Real-time)",
    enableAutoSync: "Enable Auto Sync",
    autoSyncDesc: "Automatically fetches the latest data from Google Sheet every 1 minute. (Paused while editing forms)",
    autoSyncActive: "Auto Sync Active",
  }
};

// Maps for Enums (Data is stored in Thai, need to map to English for display)
export const statusMap: Record<string, string> = {
  [AssetStatus.AVAILABLE]: 'Available',
  [AssetStatus.IN_USE]: 'In Use',
  [AssetStatus.BORROWED]: 'Borrowed',
  [AssetStatus.REPAIR]: 'In Repair',
  [AssetStatus.BROKEN]: 'Broken',
  [AssetStatus.LOST]: 'Lost'
};

export const conditionMap: Record<string, string> = {
  [AssetCondition.NEW]: 'New',
  [AssetCondition.GOOD]: 'Good',
  [AssetCondition.FAIR]: 'Fair',
  [AssetCondition.POOR]: 'Poor',
  [AssetCondition.DAMAGED]: 'Damaged'
};

export const getStatusDisplay = (status: string, lang: Language) => {
  if (lang === 'th') return status;
  return statusMap[status] || status;
};

export const getConditionDisplay = (condition: string, lang: Language) => {
  if (lang === 'th') return condition;
  return conditionMap[condition] || condition;
};
