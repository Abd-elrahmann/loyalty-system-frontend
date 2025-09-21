import React, { useState, useEffect, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useMediaQuery } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
import { Modal, Typography, Space, Row, Col, Input, Button } from 'antd';

const ScanQRModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  const handleScannerInput = useCallback((input) => {
    if (hasScanned) return;
    
    try {
      let qrData;
      try {
        qrData = JSON.parse(input);
      } catch {
        // If not JSON, treat as plain text
        notifyError(t("Customers.invalidQRCode"));
        return;
      }

      if (qrData.email || qrData.id) {
        setHasScanned(true);
        onScanSuccess(qrData);
        notifySuccess(t("Customers.qrScanSuccess"));
        onClose();
      } else {
        notifyError(t("Customers.invalidQRCode"));
      }
    } catch (error) {
      console.log(error);
      notifyError(t("Customers.invalidQRCode"));
    }
  }, [hasScanned, onScanSuccess, onClose, t]);

  // Listen for scanner input (keyboard events from barcode/QR scanner)
  useEffect(() => {
    if (!open) return;

    let scannerBuffer = '';
    let scannerTimeout;

    const handleKeyPress = (event) => {
      // Prevent default behavior for scanner input
      if (event.target.tagName === 'INPUT') return;

      // Clear previous timeout
      if (scannerTimeout) {
        clearTimeout(scannerTimeout);
      }

      // Add character to buffer
      if (event.key.length === 1) {
        scannerBuffer += event.key;
      }

      // Set timeout to process buffer
      scannerTimeout = setTimeout(() => {
        if (scannerBuffer.length > 10) { // Typical QR codes are longer
          setScannerInput(scannerBuffer);
          handleScannerInput(scannerBuffer);
          scannerBuffer = '';
        } else {
          scannerBuffer = '';
        }
      }, 100);

      // Handle Enter key (common scanner behavior)
      if (event.key === 'Enter' && scannerBuffer.length > 0) {
        clearTimeout(scannerTimeout);
        setScannerInput(scannerBuffer);
        handleScannerInput(scannerBuffer);
        scannerBuffer = '';
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (scannerTimeout) {
        clearTimeout(scannerTimeout);
      }
    };
  }, [open, handleScannerInput]);

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

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    
    try {
      let qrData;
      try {
        qrData = JSON.parse(manualInput);
      } catch {
        notifyError(t("Customers.invalidQRCode"));
        return;
      }

      if (qrData.email || qrData.id) {
        onScanSuccess(qrData);
        notifySuccess(t("Customers.qrScanSuccess"));
        onClose();
      } else {
        notifyError(t("Customers.invalidQRCode"));
      }
    } catch (error) {
      console.log(error);
      notifyError(t("Customers.invalidQRCode"));
    }
  };

  React.useEffect(() => {
    if (open) {
      setHasScanned(false);
      setManualInput('');
      setScannerInput('');
      setUseCamera(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("Customers.ScanQRCode")}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={isMobile ? 350 : 450}
      centered
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Scanner Options */}
        <Row justify="center" gutter={[8, 8]}>
          <Col>
            <Button 
              type={!useCamera ? "primary" : "default"}
              onClick={() => setUseCamera(false)}
              size="small"
            >
              Scanner Device
            </Button>
          </Col>
          <Col>
            <Button 
              type={useCamera ? "primary" : "default"}
              onClick={() => setUseCamera(true)}
              size="small"
            >
              Camera
            </Button>
          </Col>
        </Row>

        {/* Scanner Input Display */}
        {scannerInput && (
          <div>
            <Typography.Text strong>Scanner detected:</Typography.Text>
            <Input.TextArea
              value={scannerInput}
              readOnly
              rows={2}
              style={{ marginTop: 8, fontSize: 12 }}
            />
          </div>
        )}

        {/* Instructions */}
        {!useCamera && (
          <Typography.Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Point your QR scanner at the QR code and scan, or enter manually below
          </Typography.Text>
        )}

        {/* Camera Scanner */}
        {useCamera && (
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
        )}

        {/* Manual Input */}
        {!useCamera && (
          <div>
            <Typography.Text strong>Or enter QR code data manually:</Typography.Text>
            <Input.TextArea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='{"id": "123", "email": "user@example.com"}'
              rows={3}
              style={{ marginTop: 8 }}
            />
            <Button 
              type="primary" 
              onClick={handleManualSubmit}
              style={{ marginTop: 8, width: '100%' }}
              disabled={!manualInput.trim()}
            >
              Submit
            </Button>
          </div>
        )}

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
