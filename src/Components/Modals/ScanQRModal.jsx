import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useMediaQuery } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
import { Modal, Typography, Space, Row, Col } from 'antd';

const ScanQRModal = ({ open, onClose, onScanSuccess }) => {
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
          notifyError(t("Customers.invalidQRCode"));
          onClose();
          return;
        }

        if (qrData.email) {
          onScanSuccess(qrData.email);
          notifySuccess(t("Customers.qrScanSuccess"));
          onClose();
        } else {
          notifyError(t("Customers.invalidQRCode"));
          onClose();
        }
      } catch (error) {
        console.log(error);
        notifyError(t("Customers.invalidQRCode"));
        onClose();
      }
    }
  };

  const handleError = (error) => {
    if (!hasScanned) {
      console.log(error);
      notifyError(t("Customers.qrScanError"));
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
      title={t("Customers.ScanQRCode")}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={isMobile ? 320 : 400}
      centered
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row justify="center">
          <Col>
            <div style={{
              width: isMobile ? 250 : 200,
              height: isMobile ? 250 : 200,
              position: 'relative',
              overflow: 'hidden'
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
                    width: isMobile ? 300 : 200,
                    height: isMobile ? 300 : 200,
                    border: '2px solid #4AB814',
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
    </Modal>
  );
};

export default ScanQRModal;
