import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import NumericKeypad from './NumericKeypad';

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

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalPoints = () => {
    const totalPrice = calculateTotalPrice();
    if (!settings) return 0;
    
    const pointsMultiplier = settings.enCurrency === 'USD' ? 
      settings.pointsPerDollar : 
      settings.pointsPerIQD;

    return Math.floor(totalPrice * pointsMultiplier);
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
                key={`${item.id}-${item.category}`}
                onClick={() => setSelectedProductId(
                  selectedProductId && selectedProductId.id === item.id && selectedProductId.category === item.category 
                    ? null 
                    : { id: item.id, category: item.category }
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
                  backgroundColor: selectedProductId && selectedProductId.id === item.id && selectedProductId.category === item.category ? '#f8f4ff' : 'transparent',
                  border: selectedProductId && selectedProductId.id === item.id && selectedProductId.category === item.category ? '2px solid primary.main' : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: selectedProductId && selectedProductId.id === item.id && selectedProductId.category === item.category ? '#f8f4ff' : '#f9f9f9'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {i18n.language === 'ar' ? item.arName : item.enName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.price}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDecreaseQuantity(item.id, item.category);
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
                      onIncreaseQuantity(item.id, item.category);
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
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
                
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item.id, item.category);
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
                ${calculateTotalPrice().toFixed(2)}
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
                ${calculateDiscountedTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Customer Information */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 2,
                color: '#1a1a1a'
              }}
            >
              {t('PointOfSale.customer_information')}
            </Typography>
            
            <TextField
              fullWidth
              label={t('PointOfSale.phone_number')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              variant="outlined"
              sx={{
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
    </Box>
  );
};

export default Cart;