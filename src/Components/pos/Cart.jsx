import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Refresh as ResetIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import NumericKeypad from './NumericKeypad';
import ScanQRModal from '../Modals/ScanQRModal';
import { useCurrencyManager } from '../../Config/globalCurrencyManager';

const Cart = ({
  cart,
  selectedProductId,
  setSelectedProductId,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
  onClearAll,
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  discount,
  setDiscount,
  selectedMode,
  setSelectedMode,
  // eslint-disable-next-line no-unused-vars
  inputValue,
  setInputValue,
  onKeypadNumberClick,
  onPhoneInput,
  onCheckout,
  settings
}) => {
  const { t, i18n } = useTranslation();
  const [verificationMethod, setVerificationMethod] = useState('phone');
  const [scanQRModalOpen, setScanQRModalOpen] = useState(false);
  const { formatAmount, convertAmount, currentCurrency } = useCurrencyManager();

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return formatAmount(parseFloat(price));
  };

  // Calculate total in display currency
  const calculateDisplayTotalPrice = () => {
    return cart.reduce((total, item) => {
      const displayPrice = convertAmount(item.price, 'USD', currentCurrency);
      return total + (displayPrice * item.quantity);
    }, 0);
  };

  const calculateTotalPoints = () => {
    if (!settings) return 0;
    
    const displayTotalPrice = calculateDisplayTotalPrice();
    
    // Use currentCurrency from the currency manager
    const pointsMultiplier = currentCurrency === 'USD' ? 
      settings.pointsPerDollar : 
      settings.pointsPerIQD;

    return Math.floor(displayTotalPrice * pointsMultiplier);
  };


  const calculateDiscountedTotal = () => {
    const total = calculateTotalPrice();
    if (discount) {
      const discountValue = parseFloat(discount.replace('%', ''));
      if (discount.includes('%')) {
        return total - (total * (discountValue / 100));
      } else {
        return total - discountValue;
      }
    }
    return total;
  };

  const handleDiscountChange = (e) => {
    let value = e.target.value.replace('%', '');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDiscount(value ? `${value}%` : '');
    }
  };

  const handleQRScanSuccess = (qrData) => {
    try {
      console.log('QR Data received:', qrData); // Debug log
      
      // Always set verification method to QR when scanning
      setVerificationMethod('qr');
      
      // Fill email if available
      if (qrData.email) {
        setEmail(qrData.email);
        console.log('Email set to:', qrData.email); // Debug log
      }
      
      // Fill phone if available  
      if (qrData.phone) {
        setPhoneNumber(qrData.phone);
        console.log('Phone set to:', qrData.phone); // Debug log
      }
    } catch (error) {
      console.error('Error parsing QR data:', error);
    }
  };

  const handleVerificationMethodChange = (event) => {
    const newMethod = event.target.value;
    setVerificationMethod(newMethod);
    
    if (newMethod === 'qr') {
      // Clear phone when switching to QR method
      setPhoneNumber('');
      setScanQRModalOpen(true);
    } else if (newMethod === 'phone') {
      // Clear email when switching to phone method
      setEmail('');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            mb: 3,
            color: 'black'
          }}
        >
          {t('PointOfSale.review_your_cart')}
        </Typography>
        <IconButton variant="contained" color="error" onClick={onClearAll} sx={{ mb: 2 }}>
          <ResetIcon color='error' />
        </IconButton>
      </Box>
      
      {cart.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          color: 'black'
        }}>
          <ShoppingCartIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1">
            {t('PointOfSale.your_cart_is_empty')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t('PointOfSale.add_products_to_get_started')}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Cart Items Summary */}
          <Box sx={{ 
            mb: 3, 
            maxHeight: { xs: '40vh', sm: '30vh' }, 
            overflow: 'auto',
            px: { xs: 1, sm: 0 }
          }}>
            {cart.map((item) => (
              <Box 
                key={`${item.id}-${item.type}`}
                onClick={() => setSelectedProductId(
                  selectedProductId && selectedProductId.id === item.id && selectedProductId.type === item.type 
                    ? null 
                    : { id: item.id, type: item.type }
                )}
                sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  borderRadius: 1,
                  px: 1,
                  mx: -1,
                  backgroundColor: selectedProductId && selectedProductId.id === item.id && selectedProductId.type === item.type ? '#f8f4ff' : 'transparent',
                  border: selectedProductId && selectedProductId.id === item.id && selectedProductId.type === item.type ? '2px solid primary.main' : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: selectedProductId && selectedProductId.id === item.id && selectedProductId.type === item.type ? '#f8f4ff' : '#f9f9f9'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {i18n.language === 'ar' ? item.arName : item.enName}
                  </Typography>
                  {item.category && (
                    <Typography variant="caption" color="text.primary" sx={{ 
                      display: 'block',
                      fontStyle: 'italic',
                      fontSize: '0.75rem',
                      mb: 0.5
                    }}>
                      {i18n.language === 'ar' ? item.category.arName : item.category.enName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(item.price)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDecreaseQuantity(item.id, item.type);
                    }}
                    sx={{ 
                      color: 'black',
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="body1" sx={{ 
                    minWidth: '24px', 
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    {item.quantity}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onIncreaseQuantity(item.id, item.type);
                    }}
                    sx={{ 
                      color: 'black',
                      '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body1" sx={{ fontWeight: 600, minWidth: '80px', textAlign: 'right' }}>
                  {formatPrice((item.price * item.quantity).toFixed(2))}
                </Typography>
                
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item.id, item.type);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Totals */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography variant="body1">{t('PointOfSale.subtotal')}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatPrice(calculateTotalPrice().toFixed(2))}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography variant="body1">{t('PointOfSale.points_earned')}</Typography>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                color: 'green'
              }}>
                {calculateTotalPoints()} pts
              </Typography>
            </Box>

            {/* Discount Input */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={t('PointOfSale.discount')}
                value={discount}
                onChange={handleDiscountChange}
                placeholder="e.g. 10%"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        onClick={() => setDiscount('')}
                        sx={{ color: 'black' }}
                      >
                        {t('PointOfSale.clear')}
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'black',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black',
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('PointOfSale.total')}
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'blue'
              }}>
                {formatPrice(calculateDiscountedTotal().toFixed(2))}
              </Typography>
            </Box>
          </Box>

          {/* Customer Information */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 1,
                color: '#1a1a1a'
              }}
            >
              {t('PointOfSale.customer_information')}
            </Typography>
            
            {/* Verification Method Selection */}
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 2, color: '#1a1a1a', fontWeight: 500 }}>
                {t('PointOfSale.choose_verify_method')}
              </FormLabel>
              <RadioGroup
                row
                value={verificationMethod}
                onChange={handleVerificationMethodChange}
                sx={{ 
                  gap: 2,
                  '& .MuiFormControlLabel-root': {
                    '& .MuiRadio-root': {
                      color: '#1a1a1a',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    },
                  },
                }}
              >
                <FormControlLabel 
                  value="phone" 
                  control={<Radio />} 
                  label={t('PointOfSale.with_phone_number')} 
                />
                <FormControlLabel 
                  value="qr" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QrCodeScannerIcon sx={{ fontSize: 20 }} />
                      {t('PointOfSale.scan_qr_code')}
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>

            {/* Phone Number Field */}
            {verificationMethod === 'phone' && (
              <TextField
                fullWidth
                label={t('PointOfSale.phone_number')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                }}
              />
            )}

            {/* Email Field (shown when QR is scanned or method is QR) */}
            {(verificationMethod === 'qr' || email) && (
              <Box>
                <TextField
                  fullWidth
                  label={t('PointOfSale.email_address')}
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  disabled={!!email && verificationMethod === 'qr'}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.main',
                    },
                  }}
                />
                {email && verificationMethod === 'qr' && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'green',
                      display: 'block',
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    ✓ {t('PointOfSale.email_from_qr')}
                  </Typography>
                )}
                {!email && verificationMethod === 'qr' && (
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => setScanQRModalOpen(true)}
                    sx={{
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: '#600060',
                        backgroundColor: 'rgba(96, 0, 96, 0.04)'
                      }
                    }}
                  >
                    {t('PointOfSale.scan_qr_code')}
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Numeric Keypad */}
          {selectedMode && (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                p: 1, 
                backgroundColor: '#f3f4f6', 
                borderRadius: 1,
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              {selectedMode === 'Phone' 
                ? t('PointOfSale.phone_input_mode')
                : selectedMode === 'Qty'
                ? t('PointOfSale.quantity_input_mode')
                : t('PointOfSale.price_input_mode')
              }
            </Typography>
          )}
          <NumericKeypad
            onNumberClick={onKeypadNumberClick}
            onModeChange={setSelectedMode}
            selectedMode={selectedMode}
            selectedItemId={selectedProductId}
            setValue={setInputValue}
            onPhoneInput={onPhoneInput}
          />

          {/* Checkout Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={onCheckout}
            disabled={cart.length === 0}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: '#600060' },
              '&:disabled': { 
                backgroundColor: '#e5e7eb',
                color: '#9ca3af'
              },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              mt: 2
            }}
          >
            {t('PointOfSale.place_order')}
          </Button>
        </>
      )}

      {/* QR Scanner Modal */}
      <ScanQRModal
        open={scanQRModalOpen}
        onClose={() => setScanQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </Box>
  );
};

export default Cart;