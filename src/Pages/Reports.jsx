import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Divider,
  Spin,
  message,
  Select,
  DatePicker,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  TransactionOutlined,
  CalendarOutlined,
  PrinterOutlined,
  ShopOutlined,
  GiftOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Table, TableBody, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import {
  exportToExcel,
  exportManagersToPDF,
  exportCustomersToPDF,
  exportIndividualCustomerToPDF,
  exportTransactionsToPDF,
  exportProductsToPDF,
  exportRewardsToPDF,
  exportInvoicesToPDF,
} from '../utilities/reportExporter';
import Api from '../Config/Api';
import { Helmet } from "react-helmet-async";
import {useSettings} from '../hooks/useSettings'; 

import { StyledTableRow, StyledTableCell } from '../Components/Shared/tableLayout';
import { useTranslation } from 'react-i18next';
import { notifyError } from '../utilities/Toastify';
import { formatCurrency } from '../Config/globalCurrencyManager';
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const Reports = () => {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSettings();
  const [reportType, setReportType] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [managers, setManagers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [type, setType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const printRef = useRef();

  const formatPrice = (price, currency) => {
    return formatCurrency(price, currency);
  };

  useEffect(() => {
    fetchManagers();
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setReportData([]);
    setSelectedCustomer(null);
    setDateRange([]);
    setType('');
  }, [reportType]);

  const fetchManagers = async () => {
    try {
      const response = await Api.get('/api/managers');
      setManagers(response.data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      notifyError(t('error.fetchingManagers'));
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await Api.get('/api/users/all-users');
      setCustomers(response.data?.users || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      notifyError(t('error.fetchingCustomers'));
    }
  };

  const generateReport = async () => {
    setPreviewLoading(true);
    try {
      let url = '';
      const params = {};

      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (reportType === 'transactions' && type) {
        params.type = type;
      }

      switch (reportType) {
        case 'managers':
          url = '/api/reports/managers';
          break;
        case 'customers':
          url = '/api/reports/customers';
          break;
        case 'individual-customer':
          if (!selectedCustomer) {
            notifyError(t('error.selectCustomer'));
            setPreviewLoading(false);
            return;
          }
          url = `/api/reports/customers/search?phone=${selectedCustomer.phone}`;
          break;
        case 'transactions':
          url = '/api/reports/transactions';
          break;
        case 'products':
          url = '/api/reports/products';
          break;
        case 'rewards':
          url = '/api/reports/rewards';
          break;
        case 'invoices':
          url = '/api/reports/invoices';
          break;
        default:
          break;
      }

      const response = await Api.get(url, { params });
      setReportData(response.data || []);
    } catch (error) {
      console.error('Error generating report:', error);
      notifyError(t('error.generateReport'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportReport = (format) => {
    if (
      !reportData ||
      (Array.isArray(reportData) && reportData.length === 0) ||
      (typeof reportData === 'object' && Object.keys(reportData).length === 0)
    ) {
      notifyError(t('error.exportReport'));
      return;
    }

    try {
      switch (format) {
        case 'excel':
          exportToExcel(reportData, reportType);
          break;
        case 'pdf':
          switch (reportType) {
            case 'managers':
              exportManagersToPDF(reportData);
              break;
            case 'customers':
              exportCustomersToPDF(reportData);
              break;
            case 'individual-customer':
              exportIndividualCustomerToPDF(reportData);
              break;
            case 'transactions':
              exportTransactionsToPDF(reportData);
              break;
            case 'products':
              exportProductsToPDF(reportData);
              break;
            case 'rewards':
              exportRewardsToPDF(reportData);
              break;
            case 'invoices':
              exportInvoicesToPDF(reportData);
              break;
            default:
              message.warning('التصدير إلى PDF غير متاح لهذا النوع من التقارير');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      notifyError(t('error.exportReport'));
    }
  };

  const printReport = () => {
    if (
      !reportData ||
      (Array.isArray(reportData) && reportData.length === 0) ||
      (typeof reportData === 'object' && Object.keys(reportData).length === 0)
    ) {
      notifyError(t('error.printReport'));
      return;
    }

    const printContent = printRef.current;
    if (!printContent) {
      notifyError(t('error.printReport'));
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        notifyError(t('error.printReport'));
      return;
    }

    let reportTitle = 'تقرير';
    switch (reportType) {
      case 'managers':
        reportTitle = 'تقرير المديرين';
        break;
      case 'customers':
        reportTitle = 'تقرير العملاء';
        break;
      case 'individual-customer':
        reportTitle = `تقرير العميل - ${reportData.arName || ''}`;
        break;
      case 'transactions':
        reportTitle = 'تقرير المعاملات';
        break;
      case 'products':
        reportTitle = 'تقرير المنتجات';
        break;
      case 'rewards':
        reportTitle = 'تقرير المكافآت';
        break;
      case 'invoices':
        reportTitle = 'تقرير الفواتير';
        break;
      default:
        break;
    }

    const printHTML = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #800080;
            padding-bottom: 10px;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #800080;
          }
          .print-date {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #800080;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 10px;
            color: #800080;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">${reportTitle}</div>
          <div class="print-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        ${printContent.innerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  const renderReportPreview = () => {
    if (previewLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (
      !reportData ||
      (Array.isArray(reportData) && reportData.length === 0) ||
      (typeof reportData === 'object' && Object.keys(reportData).length === 0)
    ) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Text>{t('error.noData')}</Text>
        </div>
      );
    }

    switch (reportType) {
      case 'managers':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 650, marginTop: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('manager.managerName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('manager.email')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('manager.phone')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('manager.role')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((manager) => (
                  <StyledTableRow key={manager.id}>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? manager.arName : manager.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{manager.email}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{manager.phone}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                      <span style={{ 
                        fontSize: i18n.language === 'ar' ? '16px' : '14px',
                        color:  manager.role ===  'ADMIN' ? 'green' : 
                               manager.role === 'ACCOUNTANT' ? 'blue' :
                               manager.role === 'CASHIER' ? 'black' : 'black'
                      }}>
                        {i18n.language === 'ar' ? 
                          manager.role === 'ADMIN' ? 'مدير عام' :
                          manager.role === 'ACCOUNTANT' ? 'محاسب' :
                          manager.role === 'CASHIER' ? 'كاشير' :
                          manager.role
                          : manager.role}
                      </span>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'customers':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 650, marginTop: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('customer.customerName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('customer.email')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('customer.phone')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.points')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('customer.transactions')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('customer.rewards')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((customer) => (
                  <StyledTableRow key={customer.id}>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? customer.arName : customer.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{customer.email}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{customer.phone}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{customer.points}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{customer._count?.transactions || 0}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{customer._count?.myRewards || 0}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'individual-customer':
        return (
          <div>
            <Divider orientation="left" dashed>
              {t('customer.information')}
            </Divider>
            <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                      <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.customerName')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.email')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.phone')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.points')}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? reportData.arName : reportData.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reportData.email}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reportData.phone}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reportData.points}</StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {reportData.transactions && reportData.transactions.length > 0 && (
              <>
                <Divider orientation="left" dashed>
                  {t('customer.transactions')}
                </Divider>
                <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                          <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.transactionId')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.type')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                            {t('customer.points')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.currency')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.date')}
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.transactions.map((transaction) => (
                        <StyledTableRow key={transaction.id}>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{transaction.id}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                              {transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type}
                          </StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{transaction.points}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? transaction.currency?.arCurrency : transaction.currency?.enCurrency}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{new Date(transaction.date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace(',','')}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {reportData.myRewards && reportData.myRewards.length > 0 && (
              <>
                <Divider orientation="left" dashed>
                  {t('customer.rewards')}
                </Divider>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.rewardId')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.type')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.points')}
                        </StyledTableCell>
                        <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                          {t('customer.date')}
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.myRewards.map((reward) => (
                        <StyledTableRow key={reward.id}>
                            <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.id}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.type}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.points}</StyledTableCell>
                          <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{new Date(reward.date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace(',','')}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </div>
        );

      case 'transactions':
        return (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                    <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.transactionId')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.customerName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.type')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.points')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.currency')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('customer.date')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((transaction) => (
                  <StyledTableRow key={transaction.id}>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{transaction.id}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? transaction.user?.arName : transaction.user?.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                      {transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{transaction.points}</StyledTableCell>
                    <StyledTableCell align="center" style={{ fontSize: i18n.language === 'ar' ? '16px' : '14px', color: transaction.currency?.enCurrency === 'USD' ? '#008000' : transaction.currency?.enCurrency === 'IQD' ? '#0000FF' : 'inherit' }}>
                      {i18n.language === 'ar' ? transaction.currency?.arCurrency : transaction.currency?.enCurrency}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{new Date(transaction.date).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).replace(',','')}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'products':
        return (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('product.id')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('product.ProductName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('product.price')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                        {t('product.points')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('product.type')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('product.category')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((product) => (
                  <StyledTableRow key={product.id}>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{product.id}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? product.arName : product.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{product.price ? formatPrice(product.price, i18n.language === 'ar' ? settings?.arCurrency : settings?.enCurrency) : '-'}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{product.points}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                      {product.type}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? product.category?.arName : product.category?.enName}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'rewards':
        return (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                      <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('reward.id')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('reward.rewardName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('reward.type')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('reward.points')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('reward.date')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((reward) => (
                  <StyledTableRow key={reward.id}>
                    <StyledTableCell align="center" style={{ fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.id}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? reward.user?.arName : reward.user?.enName}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.type}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{reward.points}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{new Date(reward.date).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).replace(',','')}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'invoices':
        return (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.id')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.InvoiceName')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                    {t('Invoice.phone')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.totalPrice')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.discount')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.points')}
                  </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.currency')}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ backgroundColor: '#800080', color: 'white' }}>
                      {t('Invoice.date')}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((invoice) => (
                  <StyledTableRow key={invoice.id}>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{invoice.id}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{i18n.language === 'ar' ? (invoice.user?.arName || 'Guest') : (invoice.user?.enName || 'Guest')}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{invoice.phone}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{formatPrice(invoice.totalPrice, i18n.language === 'ar' ? settings?.arCurrency : settings?.enCurrency)}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{invoice.discount}%</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{invoice.points}</StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                      {i18n.language === 'ar' ? 
                        invoice.currency === 'USD' ? 'دولار' : 'دينار' 
                        : invoice.currency}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>{new Date(invoice.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).replace(',','')}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  const renderReportOptions = () => {
    const cardStyle = (active) => ({
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: 12,
      boxShadow: active ? '0 0 10px #800080' : '0 2px 8px rgba(0,0,0,0.1)',
      border: active ? '2px solid #800080' : '1px solid #f0f0f0',
      transition: 'all 0.3s ease',
      padding: 16,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 120,
      fontWeight: 'bold',
      fontSize: '20px',
    });

    const sectionTitleStyle = {
      fontSize: '22px',
      fontWeight: 'bold',
      color: 'black',
      marginBottom: '16px',
      marginTop: '24px',
      textAlign: i18n.language === 'ar' ? 'right' : 'left',
      paddingBottom: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      borderBottom: '2px solid black',
      width: 'fit-content'
    };

    const iconStyle = { fontSize: 24, color: '#800080', marginBottom: 12 };

    return (
      <div style={{ marginBottom: 20 }}>
        {/* إدارة العملاء والمديرين */}
        <div style={sectionTitleStyle}>
          <TeamOutlined style={{ fontSize: 25, color: 'black' }} />
          {t('report.sections.customersManagement')}
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'managers')}
              onClick={() => setReportType('managers')}
            >
              <TeamOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.managers')}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'customers')}
              onClick={() => setReportType('customers')}
            >
              <UsergroupAddOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.customers')}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'individual-customer')}
              onClick={() => setReportType('individual-customer')}
            >
              <UserOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.individualCustomer')}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* التقارير المالية */}
        <div style={sectionTitleStyle}>
          <CalendarOutlined style={{ fontSize: 25, color: 'black' }} />
          {t('report.sections.financialReports')}
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'transactions')}
              onClick={() => setReportType('transactions')}
            >
              <TransactionOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.transactions')}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'invoices')}
              onClick={() => setReportType('invoices')}
            >
              <FileTextOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.invoices')}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'rewards')}
              onClick={() => setReportType('rewards')}
            >
              <GiftOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.rewards')}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* تقارير المنتجات */}
        <div style={sectionTitleStyle}>
          <ShopOutlined style={{ fontSize: 25, color: 'black' }} />
          {t('report.sections.productReports')}
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8} md={8}>
            <Card
              hoverable
              style={cardStyle(reportType === 'products')}
              onClick={() => setReportType('products')}
            >
              <ShopOutlined style={iconStyle} />
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {t('report.products')}
              </Title>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderReportFilters = () => {
    if (!reportType) return null;
  
    return (
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
        bodyStyle={{ padding: 10 }}
      >
        <Row gutter={[24, 24]} align="middle" justify="center">
          {reportType === 'individual-customer' && (
            <Col xs={24} sm={12} md={6}>
              <Text strong style={{ display: 'flex', marginBottom: 8 }}>
                {t('report.selectCustomer')}
              </Text>
              <Select
                showSearch
                placeholder={t('report.selectCustomer')}
                optionFilterProp="children"
                value={selectedCustomer?.id}
                onChange={(value) => {
                  const customer = customers.find((customer) => customer.id === value);
                  setSelectedCustomer(customer || null);
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: '100%' }}
                allowClear
              >
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {i18n.language === 'ar' 
                      ? `${customer.arName} - ${customer.phone}` 
                      : `${customer.enName || customer.arName} - ${customer.phone}`
                    }
                  </Option>
                ))}
              </Select>
            </Col>
          )}
  
          {(reportType === 'customers' || reportType === 'transactions' || 
            reportType === 'products' || reportType === 'rewards' || reportType === 'invoices') && (
            <>
              {reportType === 'transactions' && (
                <Col xs={24} sm={8} md={8}>
                  <Text strong style={{ display: 'flex', marginBottom: 8 }}>
                    {t('report.sections.selectType')}
                  </Text>
                  <Select
                    placeholder={t('report.sections.selectType')}
                    value={type}
                    onChange={(value) => setType(value)}
                    style={{ width: '60%' }}
                    allowClear
                  >
                    <Option value="earn">{t("Transactions.Earn")}</Option>
                    <Option value="redeem">{t("Transactions.Redeem")}</Option>
                  </Select>
                </Col>
              )}
              <Col xs={24} sm={16} md={8}>
                <Text strong style={{ display: 'flex', marginBottom: 8 }}>
                  {t('report.selectDateRange')}
                </Text>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates && dates.length === 2) {
                      setDateRange(dates);
                    } else {
                      setDateRange([]);
                    }
                  }}
                  placeholder={[t('report.selectStartDate'), t('report.selectEndDate')]}
                  allowClear
                />
              </Col>
            </>
          )}
  
          <Col xs={24} sm={24} md={reportType === 'individual-customer' ? 6 : 8}>
            <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 25 }}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={generateReport}
                loading={previewLoading}
                style={{
                  backgroundColor: '#800080',
                  borderColor: '#800080',
                  width: 140,
                  fontSize: '15px'
                }}
              >
                {t('report.preview')}
              </Button>
              <Button
                onClick={() => {
                  setReportType('');
                  setReportData([]);
                  setSelectedCustomer(null);
                  setDateRange([]);
                  setType('');
                }}
                style={{ width: 80, fontSize: '15px' }}
              >
                {t('report.cancel')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Helmet>
        <title>{t('report.title')}</title>
        <meta name="description" content="التقارير في نظام إدارة الولاء" />
      </Helmet>
   

      {renderReportOptions()}
      {renderReportFilters()}

      {reportData &&
        (Array.isArray(reportData) ? reportData.length > 0 : Object.keys(reportData).length > 0) && (
          <>
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={printReport}
                  style={{
                    color: '#800080',
                    borderColor: '#800080',
                    fontSize: '15px'
                  }}
                >
                  {t('report.print')}
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => exportReport('excel')}
                  style={{
                    color: '#800080',
                    borderColor: '#800080',
                    fontSize: '15px'
                  }}
                >
                  {t('report.exportExcel')}
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => exportReport('pdf')}
                  style={{
                    color: '#800080',
                    borderColor: '#800080',
                    fontSize: '15px'
                  }}
                >
                  {t('report.exportPdf')}
                </Button>
              </Space>
            </Row>

            <Card
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            >
              <div ref={printRef}>
                {renderReportPreview()}
              </div>
            </Card>
          </>
        )}
    </div>
  );
};

export default Reports;