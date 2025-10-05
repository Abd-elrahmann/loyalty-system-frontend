import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Row,
  Button,
  Typography,
  Space,
  Spin,
  message,
  Card,
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Helmet } from "react-helmet-async";

// Components
import ReportOptions from '../../Components/Reports/ReportOptions';
import ReportFilters from '../../Components/Reports/ReportFilters';
import CustomersManagersReport from '../../Components/Reports/CustomersManagersReport';
import FinancialReports from '../../Components/Reports/FinancialReports';
import ProductReports from '../../Components/Reports/ProductReports';

// Services & Utilities
import { reportsApi } from './reportsApi';
import {
  exportToExcel,
  exportManagersToPDF,
  exportCustomersToPDF,
  exportIndividualCustomerToPDF,
  exportTransactionsToPDF,
  exportProductsToPDF,
  exportRewardsToPDF,
  exportInvoicesToPDF,
} from '../../utilities/reportExporter';
import { useTranslation } from 'react-i18next';
import { notifyError } from '../../utilities/Toastify';
import { useCurrencyManager } from '../../Config/globalCurrencyManager';

const { Title, Text } = Typography;

const Reports = () => {
  const { t, i18n } = useTranslation();
  const { formatAmount } = useCurrencyManager();
  
  // State
  const [reportType, setReportType] = useState('');
  const [managers, setManagers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [type, setType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const printRef = useRef();

  // Data fetching
  const fetchManagers = useCallback(async () => {
    try {
      const response = await reportsApi.getManagers();
      setManagers(response.data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      notifyError(t('error.fetchingManagers'));
    }
  }, [t]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await reportsApi.getCustomers();
      setCustomers(response.data?.users || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      notifyError(t('error.fetchingCustomers'));
    }
  }, [t]);

  useEffect(() => {
    if (reportType === 'managers' && managers.length === 0) {
      fetchManagers();
    }
  }, [reportType, managers.length, fetchManagers]);

  useEffect(() => {
    if (reportType === 'individual-customer' && customers.length === 0) {
      fetchCustomers();
    }
  }, [reportType, customers.length, fetchCustomers]);

  useEffect(() => {
    setReportData([]);
    setSelectedCustomer(null);
    setDateRange([]);
    setType('');
  }, [reportType]);

  // Report generation
  const generateReport = async () => {
    setPreviewLoading(true);
    try {
      let response;
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
          response = await reportsApi.getManagersReport();
          break;
        case 'customers':
          response = await reportsApi.getCustomersReport(params);
          break;
        case 'individual-customer':
          if (!selectedCustomer) {
            notifyError(t('error.selectCustomer'));
            setPreviewLoading(false);
            return;
          }
          response = await reportsApi.getIndividualCustomer(selectedCustomer.phone);
          break;
        case 'transactions':
          response = await reportsApi.getTransactions(params);
          break;
        case 'products':
          response = await reportsApi.getProducts(params);
          break;
        case 'rewards':
          response = await reportsApi.getRewards(params);
          break;
        case 'invoices':
          response = await reportsApi.getInvoices(params);
          break;
        default:
          break;
      }

      setReportData(response?.data || []);
    } catch (error) {
      console.error('Error generating report:', error);
      notifyError(t('error.generateReport'));
    } finally {
      setPreviewLoading(false);
    }
  };

  // Export functions
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
            border-bottom: 2px solid #0074BA;
            padding-bottom: 10px;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #0074BA;
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
            background-color: #0074BA;
            color: white;
            fontWeight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 10px;
            color: #0074BA;
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

  // Event handlers
  const handleCustomerChange = (customerId) => {
    const customer = customers.find((customer) => customer.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    } else {
      setDateRange([]);
    }
  };

  const handleCancel = () => {
    setReportType('');
    setReportData([]);
    setSelectedCustomer(null);
    setDateRange([]);
    setType('');
  };

  // Render preview
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

    // Determine which report component to render
    if (['managers', 'customers', 'individual-customer'].includes(reportType)) {
      return (
        <CustomersManagersReport
          reportData={reportData}
          reportType={reportType}
          i18n={i18n}
        />
      );
    } else if (['transactions', 'invoices', 'rewards'].includes(reportType)) {
      return (
        <FinancialReports
          reportData={reportData}
          reportType={reportType}
          formatAmount={formatAmount}
          i18n={i18n}
        />
      );
    } else if (reportType === 'products') {
      return (
        <ProductReports
          reportData={reportData}
          formatAmount={formatAmount}
          i18n={i18n}
        />
      );
    }

    return null;
  };

  const hasReportData = reportData && 
    (Array.isArray(reportData) ? reportData.length > 0 : Object.keys(reportData).length > 0);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Helmet>
        <title>{t('report.title')}</title>
        <meta name="description" content="التقارير في نظام إدارة الولاء" />
      </Helmet>

      <ReportOptions
        reportType={reportType}
        setReportType={setReportType}
        setReportData={setReportData}
      />

      <ReportFilters
        reportType={reportType}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
        customers={customers}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        type={type}
        onTypeChange={setType}
        onGenerateReport={generateReport}
        onCancel={handleCancel}
        previewLoading={previewLoading}
        i18n={i18n}
      />

      {hasReportData && (
        <>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={printReport}
                style={{
                  color: '#0074BA',
                  borderColor: '#0074BA',
                  fontSize: '15px'
                }}
              >
                {t('report.print')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('excel')}
                style={{
                  color: '#0074BA',
                  borderColor: '#0074BA',
                  fontSize: '15px'
                }}
              >
                {t('report.exportExcel')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('pdf')}
                style={{
                  color: '#0074BA',
                  borderColor: '#0074BA',
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