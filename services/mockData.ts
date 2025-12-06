
import { Asset, AssetStatus, AssetCondition, BorrowRecord } from '../types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    name: 'MacBook Pro 14" M3',
    serialNumber: 'C02XY12345',
    category: 'Laptop',
    location: 'สำนักงานใหญ่ (HQ)',
    status: AssetStatus.IN_USE,
    condition: AssetCondition.GOOD,
    isVendorLoan: false,
    borrowerName: 'สมชาย ใจดี',
    purchaseDate: '2024-01-15',
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'AST-002',
    name: 'Dell Latitude 7420',
    serialNumber: 'DLL-998877',
    category: 'Laptop',
    location: 'สาขาเชียงใหม่',
    status: AssetStatus.AVAILABLE,
    condition: AssetCondition.GOOD,
    isVendorLoan: true,
    vendorName: 'Dell Thailand (Demo Unit)',
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'AST-003',
    name: 'Samsung Monitor 27"',
    serialNumber: 'SAMS-MON-001',
    category: 'Monitor',
    location: 'สำนักงานใหญ่ (HQ)',
    status: AssetStatus.REPAIR,
    condition: AssetCondition.DAMAGED,
    isVendorLoan: false,
    notes: 'หน้าจอมีเส้นสีเขียว ส่งซ่อมศูนย์เมื่อวาน',
    image: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'AST-004',
    name: 'iPhone 15 Pro Max',
    serialNumber: 'IP15-TEST-01',
    category: 'Mobile',
    location: 'แผนก IT',
    status: AssetStatus.BORROWED,
    condition: AssetCondition.NEW,
    isVendorLoan: false,
    borrowerName: 'ทีม Dev Mobile',
    borrowDate: '2024-05-01',
    returnDueDate: '2024-05-15',
    image: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: 'AST-005',
    name: 'Cisco Switch Catalyst',
    serialNumber: 'CSCO-SW-55',
    category: 'Network',
    location: 'Server Room B',
    status: AssetStatus.IN_USE,
    condition: AssetCondition.GOOD,
    isVendorLoan: false,
    image: 'https://picsum.photos/200/200?random=5'
  },
  {
    id: 'AST-006',
    name: 'Lenovo ThinkPad X1',
    serialNumber: 'LNV-TP-X1',
    category: 'Laptop',
    location: 'สาขาภูเก็ต',
    status: AssetStatus.BROKEN,
    condition: AssetCondition.DAMAGED,
    isVendorLoan: false,
    notes: 'เปิดไม่ติด รอแทงจำหน่าย',
    image: 'https://picsum.photos/200/200?random=6'
  }
];

export const INITIAL_HISTORY: BorrowRecord[] = [
  {
    id: 'LOG-001',
    assetId: 'AST-004',
    assetName: 'iPhone 15 Pro Max',
    serialNumber: 'IP15-TEST-01',
    borrowerName: 'นาย ก. (QA)',
    borrowDate: '2024-04-01',
    returnDate: '2024-04-05',
    status: 'RETURNED'
  },
  {
    id: 'LOG-002',
    assetId: 'AST-004',
    assetName: 'iPhone 15 Pro Max',
    serialNumber: 'IP15-TEST-01',
    borrowerName: 'ทีม Dev Mobile',
    borrowDate: '2024-05-01',
    status: 'BORROWED'
  },
  {
    id: 'LOG-003',
    assetId: 'AST-001',
    assetName: 'MacBook Pro 14" M3',
    serialNumber: 'C02XY12345',
    borrowerName: 'สมชาย ใจดี',
    borrowDate: '2024-02-10',
    status: 'BORROWED' // Current status matches app logic
  }
];

export const CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Mobile', 'Tablet', 'Network', 'Accessory', 'Other'];
export const LOCATIONS = ['สำนักงานใหญ่ (HQ)', 'สาขาเชียงใหม่', 'สาขาภูเก็ต', 'สาขาขอนแก่น', 'Server Room A', 'Server Room B', 'Remote'];
