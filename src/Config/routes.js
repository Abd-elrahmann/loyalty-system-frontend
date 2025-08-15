import {
  Dashboard as DashboardIcon,
  People as PeopleIcon, 
  Inventory as ProductsIcon,
  CardGiftcard as RewardsIcon,
  Settings as SettingsIcon,
  ReceiptLong as ReceiptLongIcon,
  Receipt as InvoiceIcon
} from '@mui/icons-material';

const routes = [
  {
    name: 'Dashboard',
    arName: 'لوحة التحكم',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    name: 'Customers',
    arName: 'العملاء', 
    path: '/customers',
    icon: PeopleIcon
  },
  {
    name: 'Transactions',
    arName: 'المعاملات', 
    path: '/transactions',
    icon: ReceiptLongIcon
  },
  {
    name: 'Products',
    arName: 'المنتجات',
    path: '/products', 
    icon: ProductsIcon
  },
  {
    name: 'Rewards',
    arName: 'المكافآت',
    path: '/rewards',
    icon: RewardsIcon
  },
  {
    name: 'Invoice',
    arName: 'الفواتير',
    path: '/invoice',
    icon: InvoiceIcon
  },
  {
    name: 'Settings',
    arName: 'الإعدادات',
    path: '/settings',
    icon: SettingsIcon
  }
];

export default routes;
