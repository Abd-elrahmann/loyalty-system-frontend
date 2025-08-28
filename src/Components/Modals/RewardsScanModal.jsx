import React, { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { Modal, Typography, Space, Row, Col, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const RewardsScanModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  const handleScan = async (result) => {
    if (result && !hasScanned) {
      setHasScanned(true);
      try {
        let qrData;
        try {
          qrData = JSON.parse(result.text);
        } catch {
          notifyError(t("Rewards.invalidQRCode"));
          onClose();
          return;
        }
  
        if (qrData.id) {
          onScanSuccess(qrData.id);
          notifySuccess(t("Rewards.qrScanSuccess"));
          onClose();
        } else {
          notifyError(t("Rewards.invalidQRCode"));
          onClose();
        }
      } catch (error) {
        console.log(error);
        notifyError(t("Rewards.qrScanError"));
        onClose();
      }
    }
  };

  const handleError = (error) => {
    if (!hasScanned) {
      console.log(error);
      notifyError(t("Rewards.qrScanError"));
      setHasScanned(true);
      onClose();
    }
  };

  React.useEffect(() => {
    if (open) {
      setHasScanned(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : 400}
      centered
      closeIcon={<CloseOutlined />}
      title={t("Rewards.ScanQRTitle")}
    >
      <Card bordered={false}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row justify="center" align="middle">
            <Col span={24}>
              <div style={{
                width: isMobile ? 250 : 200,
                height: isMobile ? 250 : 200,
                position: 'relative',
                overflow: 'hidden',
                margin: '0 auto',
                borderRadius: 8
              }}>
                <QrReader
                  constraints={{
                    facingMode: 'environment'
                  }}
                  onResult={handleScan}
                  onError={handleError}
                  style={{ width: '100%', height: '100%' }}
                  videoId="qr-video"
                  scanDelay={500}
                  ViewFinder={() => (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isMobile ? 200 : 160,
                      height: isMobile ? 200 : 160,
                      border: '2px solid #1890ff',
                      borderRadius: 8,
                      zIndex: 2
                    }} />
                  )}
                />
              </div>
            </Col>
          </Row>

          {error && (
            <Typography.Text type="danger">
              {error}
            </Typography.Text>
          )}
        </Space>
      </Card>
    </Modal>
  );
};

export default RewardsScanModal;