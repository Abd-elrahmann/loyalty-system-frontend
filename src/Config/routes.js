import {
  Dashboard as DashboardIcon,
  People as PeopleIcon, 
  Inventory as ProductsIcon,
  CardGiftcard as RewardsIcon,
  Settings as SettingsIcon,
  ReceiptLong as ReceiptLongIcon,
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
    name: 'Settings',
    arName: 'الإعدادات',
    path: '/settings',
    icon: SettingsIcon,
    role: ['ADMIN', 'USER'],
    
  }
];

export default routes;
