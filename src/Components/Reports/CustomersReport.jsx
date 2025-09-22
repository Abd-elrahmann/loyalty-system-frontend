import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Spin,
  message,
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Table, TableBody, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import { exportToExcel, exportCustomersToPDF } from '../../utils/reportExporter';
import api from '../../services/api';   
import { StyledTableRow, StyledTableCell } from '../../styles/TableLayout';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const CustomersReport = () => {
  const { t } = useTranslation();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  const generateReport = async () => {
    setPreviewLoading(true);
    try {
      const response = await api.get('/api/reports/customers');
      setReportData(response.data || []);
      message.success(t('reports.generateSuccess'));
    } catch (error) {
      console.error('Error generating customers report:', error);
      message.error(t('reports.generateError'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportReport = (format) => {
    if (!reportData || reportData.length === 0) {
      message.warning(t('reports.noData'));
      return;
    }

    try {
      if (format === 'excel') {
        exportToExcel(reportData, 'customers');
      } else if (format === 'pdf') {
        exportCustomersToPDF(reportData);
      }
      message.success(t('reports.exportSuccess'));
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error(t('reports.exportError'));
    }
  };

  const renderReportPreview = () => {
    if (previewLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!reportData || reportData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Text>{t('reports.noData')}</Text>
        </div>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600, marginTop: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.id')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.englishName')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.arabicName')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.email')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.phone')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.points')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.transactionsCount')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.rewardsCount')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((customer) => (
              <StyledTableRow key={customer.id}>
                <StyledTableCell align="center">{customer.id}</StyledTableCell>
                <StyledTableCell align="center">{customer.enName}</StyledTableCell>
                <StyledTableCell align="center">{customer.arName}</StyledTableCell>
                <StyledTableCell align="center">{customer.email}</StyledTableCell>
                <StyledTableCell align="center">{customer.phone}</StyledTableCell>
                <StyledTableCell align="center">{customer.points}</StyledTableCell>
                <StyledTableCell align="center">{customer._count?.transactions || 0}</StyledTableCell>
                <StyledTableCell align="center">{customer._count?.myRewards || 0}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <Title level={4} style={{ color: '#800080', marginBottom: 20 }}>
        {t('reports.customers')}
      </Title>

      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Space>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={generateReport}
              loading={previewLoading}
              style={{ backgroundColor: '#800080', borderColor: '#800080' }}
            >
              {t('reports.preview')}
            </Button>
            <Button onClick={() => setReportData([])}>
              {t('reports.clear')}
            </Button>
          </Space>
        </Col>
      </Row>

      {reportData.length > 0 && (
        <>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                style={{ color: '#800080', borderColor: '#800080' }}
              >
                {t('reports.print')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('excel')}
                style={{ color: '#800080', borderColor: '#800080' }}
              >
                {t('reports.exportExcel')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('pdf')}
                style={{ color: '#800080', borderColor: '#800080' }}
              >
                {t('reports.exportPDF')}
              </Button>
            </Space>
          </Row>

          {renderReportPreview()}
        </>
      )}
    </Card>
  );
};

export default CustomersReport;