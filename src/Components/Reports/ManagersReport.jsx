import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Select,
  Spin,
  message,
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Table, TableBody, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import { exportToExcel, exportManagersToPDF } from '../../utils/reportExporter';
import api from '../../services/api';
import { StyledTableRow, StyledTableCell } from '../../styles/TableLayout';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const ManagersReport = () => {
  const { t } = useTranslation();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { value: 'ADMIN', label: t('reports.roles.admin') },
    { value: 'ACCOUNTANT', label: t('reports.roles.accountant') },
    { value: 'CASHEIR', label: t('reports.roles.casheir') },
  ];

  const generateReport = async () => {
    setPreviewLoading(true);
    try {
      const params = {};
      if (selectedRole) {
        params.role = selectedRole;
      }

      const response = await api.get('/api/reports/managers', { params });
      setReportData(response.data || []);
      message.success(t('reports.generateSuccess'));
    } catch (error) {
      console.error('Error generating managers report:', error);
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
        exportToExcel(reportData, 'managers');
      } else if (format === 'pdf') {
        exportManagersToPDF(reportData);
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
                {t('reports.role')}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ backgroundColor: '#800080', color: 'white', fontWeight: 'bold' }}>
                {t('reports.createdAt')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((manager) => (
              <StyledTableRow key={manager.id}>
                <StyledTableCell align="center">{manager.id}</StyledTableCell>
                <StyledTableCell align="center">{manager.enName}</StyledTableCell>
                <StyledTableCell align="center">{manager.arName}</StyledTableCell>
                <StyledTableCell align="center">{manager.email}</StyledTableCell>
                <StyledTableCell align="center">{manager.phone}</StyledTableCell>
                <StyledTableCell align="center">
                  {roles.find(r => r.value === manager.role)?.label || manager.role}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {new Date(manager.createdAt).toLocaleDateString()}
                </StyledTableCell>
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
        {t('reports.managers')}
      </Title>

      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('reports.filterByRole')}
          </Text>
          <Select
            placeholder={t('reports.selectRole')}
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: '100%' }}
            allowClear
          >
            {roles.map(role => (
              <Option key={role.value} value={role.value}>
                {role.label}
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Space style={{ marginTop: 30 }}>
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

export default ManagersReport;