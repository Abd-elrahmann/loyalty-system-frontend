// services/reportsApi.js
import Api from "../../Config/Api";

export const reportsApi = {
  // Managers & Customers
  getManagers: () => Api.get('/api/managers'),
  getCustomers: () => Api.get('/api/users/all-users'),
  getIndividualCustomer: (phone) => Api.get(`/api/reports/customers/search?phone=${phone}`),
  
  // Financial Reports
  getTransactions: (params) => Api.get('/api/reports/transactions', { params }),
  getInvoices: (params) => Api.get('/api/reports/invoices', { params }),
  getRewards: (params) => Api.get('/api/reports/rewards', { params }),
  
  // Product Reports
  getProducts: (params) => Api.get('/api/reports/products', { params }),
  
  // General reports
  getCustomersReport: (params) => Api.get('/api/reports/customers', { params }),
  getManagersReport: () => Api.get('/api/reports/managers')
};

export const reportsKeys = {
  all: ["reports"],
  managers: () => [...reportsKeys.all, 'managers'],
  customers: () => [...reportsKeys.all, 'customers'],
  individualCustomer: (phone) => [...reportsKeys.all, 'individual-customer', phone],
  transactions: (params) => [...reportsKeys.all, 'transactions', params],
  invoices: (params) => [...reportsKeys.all, 'invoices', params],
  rewards: (params) => [...reportsKeys.all, 'rewards', params],
  products: (params) => [...reportsKeys.all, 'products', params],
};