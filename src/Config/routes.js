import {
  Dashboard as DashboardIcon,
  People as PeopleIcon, 
  Inventory as ProductsIcon,
  CardGiftcard as RewardsIcon,
  Settings as SettingsIcon,
  ReceiptLong as ReceiptLongIcon,
  PointOfSale as PointOfSaleIcon,
  Receipt as InvoiceIcon,
  BarChart as BarChartIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const routes = [
  {
    name: 'Dashboard',
    arName: 'لوحة التحكم',
    path: '/dashboard',
    icon: DashboardIcon,
    role: ['ADMIN', 'USER'],
  },
  {
    name: 'Permissions',
    arName: 'الصلاحيات',
    path: '/permissions',
    icon: SecurityIcon,
    role: ['ADMIN'],
  },
  {
    name: 'Customers',
    arName: 'العملاء', 
    path: '/customers',
    icon: PeopleIcon,
    role: ['ADMIN'],
    
  },
  {
    name: 'Transactions',
    arName: 'المعاملات', 
    path: '/transactions',
    icon: ReceiptLongIcon,
    role: ['ADMIN', 'USER'],
    
  },
  {
    name: 'Products',
    arName: 'المنتجات',
    path: '/products', 
    icon: ProductsIcon,
    role: ['ADMIN', 'USER'],
    
  },
  {
    name: 'Rewards',
    arName: 'المكافآت',
    path: '/rewards',
    icon: RewardsIcon,
    role: ['ADMIN', 'USER'],
    
  },
  {
    name: 'Point Of Sale',
    arName: 'النقطة المباشرة',
    path: '/point-of-sale',
    icon: PointOfSaleIcon,
    role: ['ADMIN'],
  },
  {
    name: 'Invoice',
    arName: 'الفواتير',
    path: '/invoice',
    icon: ReceiptLongIcon,
    role: ['ADMIN'],
  },
  {
    name: 'Reports',
    arName: 'التقارير',
    path: '/reports',
    icon: BarChartIcon,
    role: ['ADMIN'],
  },
  {
    name: 'Settings',
    arName: 'الإعدادات',
    path: '/settings',
    icon: SettingsIcon,
    role: ['ADMIN', 'USER'],
    
  }
];

export default routes;
