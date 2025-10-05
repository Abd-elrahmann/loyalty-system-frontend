import React from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  TransactionOutlined,
  FileTextOutlined,
  GiftOutlined,
  ShopOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const ReportOptions = ({ reportType, setReportType, setReportData }) => {
  const { t, i18n } = useTranslation();

  const cardStyle = (active) => ({
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: 12,
    boxShadow: active ? '0 0 10px #0074BA' : '0 2px 8px rgba(0,0,0,0.1)',
    border: active ? '2px solid #0074BA' : '1px solid #f0f0f0',
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

  const iconStyle = { fontSize: 24, color: '#0074BA', marginBottom: 12 };

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
            onClick={() => {
              setReportType('managers');
              setReportData([]);
            }}
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
            onClick={() => {
              setReportType('individual-customer');
              setReportData([]);
            }}
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

export default ReportOptions;