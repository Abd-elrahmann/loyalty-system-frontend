import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  DatePicker,
  Select,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportFilters = ({
  reportType,
  selectedCustomer,
  onCustomerChange,
  customers,
  dateRange,
  onDateRangeChange,
  type,
  onTypeChange,
  onGenerateReport,
  onCancel,
  previewLoading,
  i18n
}) => {
  const { t } = useTranslation();

  if (!reportType) return null;

  return (
    <Card
      style={{
        marginBottom: 20,
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}
      styles={{
        body: { padding: 10 }
      }}
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
                onCustomerChange(value);
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
                  onChange={onTypeChange}
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
                onChange={onDateRangeChange}
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
              onClick={onGenerateReport}
              loading={previewLoading}
              style={{
                backgroundColor: '#0074BA',
                borderColor: '#0074BA',
                width: 140,
                fontSize: '15px'
              }}
            >
              {t('report.preview')}
            </Button>
            <Button
              onClick={onCancel}
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

export default ReportFilters;