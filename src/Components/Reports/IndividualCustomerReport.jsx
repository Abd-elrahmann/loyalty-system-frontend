import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Input,
  Spin,
  message,
  Divider,
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Table, TableBody, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import { exportToExcel, exportIndividualCustomerToPDF } from '../../utils/reportExporter';
import api from '../../services/api';
import { StyledTableRow, StyledTableCell } from '../../styles/TableLayout';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Search } = Input;

const IndividualCustomerReport = () => {
  const { t } = useTranslation();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const generateReport = async () => {
    if (!phoneNumber.trim()) {
      message.warning(t('reports.enterPhoneNumber'));
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await api.get(`/api/reports/customers/search?phone=${phoneNumber}`);
      setReportData(response.data);
      message.success(t('reports.generateSuccess'));
    } catch (error) {
      console.error('Error generating individual customer report:', error);
      message.error(t('reports.generateError'));
      setReportData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportReport = (format) => {
    if (!reportData) {
      message.warning(t('reports.noData'));
      return;
    }

    try {
      if (format === 'excel') {
        exportToExcel(reportData, 'individualCustomer');
      } else if (format === 'pdf') {
        exportIndividualCustomerToPDF(reportData);
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

    if (!reportData) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Text>{t('reports.noData')}</Text>
        </div>
      );
    }

    return (
      <div>
        {/* Customer Information */}
        <Divider orientation="left">{t('reports.customerInfo')}</Divider>
        <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
          <Table>
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
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <StyledTableCell align="center">{reportData.id}</StyledTableCell>
                <StyledTableCell align="center">{reportData.enName}</StyledTableCell>
                <StyledTableCell align="center">{reportData.arName}</StyledTableCell>
                <StyledTableCell align="center">{reportData.email}</StyledTableCell>
                <StyledTableCell align="center">{reportData.phone}</StyledTableCell>
                <StyledTableCell align="center">{reportData.points}</StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Transactions */}
        <Divider orientation="left">{t('reports.transactions')}</Divider>
        <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.id')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.type')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.points')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.currency')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.status')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.date')}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.transactions?.map((transaction) => (
                <StyledTableRow key={transaction.id}>
                  <StyledTableCell align="center">{transaction.id}</StyledTableCell>
                  <StyledTableCell align="center">
                    {transaction.type === 'earn' ? t('reports.earn') : t('reports.redeem')}
                  </StyledTableCell>
                  <StyledTableCell align="center">{transaction.points}</StyledTableCell>
                  <StyledTableCell align="center">{transaction.currency?.enCurrency}</StyledTableCell>
                  <StyledTableCell align="center">{transaction.status}</StyledTableCell>
                  <StyledTableCell align="center">
                    {new Date(transaction.date).toLocaleDateString()}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Rewards */}
        <Divider orientation="left">{t('reports.rewards')}</Divider>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.id')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.type')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.points')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.status')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.date')}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                  {t('reports.note')}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.myRewards?.map((reward) => (
                <StyledTableRow key={reward.id}>
                  <StyledTableCell align="center">{reward.id}</StyledTableCell>
                  <StyledTableCell align="center">{reward.type}</StyledTableCell>
                  <StyledTableCell align="center">{reward.points}</StyledTableCell>
                  <StyledTableCell align="center">{reward.status}</StyledTableCell>
                  <StyledTableCell align="center">
                    {new Date(reward.date).toLocaleDateString()}
                  </StyledTableCell>
                  <StyledTableCell align="center">{reward.note || '-'}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return (
    <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <Title level={4} style={{ color: '#800080', marginBottom: 20 }}>
        {t('reports.individualCustomer')}
      </Title>

      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('reports.enterPhoneNumber')}
          </Text>
          <Search
            placeholder={t('reports.phonePlaceholder')}
            enterButton={<SearchOutlined />}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onSearch={generateReport}
            loading={previewLoading}
          />
        </Col>
        
        <Col xs={24} sm={12} md={4}>
          <Space>
            <Button onClick={() => {
              setReportData(null);
              setPhoneNumber('');
            }}>
              {t('reports.clear')}
            </Button>
          </Space>
        </Col>
      </Row>

      {reportData && (
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

export default IndividualCustomerReport;