// services/logsApi.js
import Api from "../../Config/Api";

export const logsApi = {
  // Get logs with pagination and filters
  getLogs: (page, params) => 
    Api.get(`/api/logs/${page}`, { params }).then(response => response.data),
};

// Available actions for dropdown
export const LOG_ACTIONS = [
  { value: 'Login', label: 'Login' },
  { value: 'Create', label: 'Create' },
  { value: 'Update', label: 'Update' },
  { value: 'Delete', label: 'Delete' }
];

// Available screens for dropdown
export const LOG_SCREENS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'managers', label: 'Managers' },
  { value: 'pos', label: 'Point of Sale' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'customers', label: 'Customers' },
  { value: 'products', label: 'Products' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'reports', label: 'Reports' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'settings', label: 'Settings' }
];

// React Query keys
export const logsKeys = {
  all: ["logs"],
  lists: () => [...logsKeys.all, 'list'],
  list: (filters) => [...logsKeys.lists(), filters],
};