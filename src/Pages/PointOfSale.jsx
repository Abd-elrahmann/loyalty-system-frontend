/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import Api from "../Config/Api";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import { Spin } from "antd";
import { useTranslation } from 'react-i18next';

const NumericKeypad = ({ onNumberClick, onModeChange, selectedMode, selectedItemId, setValue, onPhoneInput }) => {
  const { t } = useTranslation();

  const handleButtonClick = (value) => {
    if (value === t("PointOfSale.quantity") || value === t("PointOfSale.price") || value === t("PointOfSale.phone")) {
      if (value === t("PointOfSale.quantity")) {
        onModeChange('Qty');
      } else if (value === t("PointOfSale.price")) {
        onModeChange('Price');
      } else if (value === t("PointOfSale.phone")) {
        onModeChange('Phone');
      }
      setValue('');
    } else if (value === t("PointOfSale.back")) {
      setValue(prev => prev.slice(0, -1));
      if (selectedMode === 'Phone') {
        onPhoneInput('back');
      } else if (selectedItemId) {
        onNumberClick(value);
      }
    } else if (value === '.' || value === '+' || value === '-' || value === '*' || value === '/') {
      if (selectedItemId && selectedMode !== 'Phone') {
        onNumberClick(value);
      }
    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
      if (selectedMode === 'Phone') {
        onPhoneInput(value);
      } else if (selectedItemId) {
        onNumberClick(value);
      }
    } else if (!selectedItemId && selectedMode !== 'Phone') {
      setValue('');
    }
  };

  const buttons = [
    ['1', '2', '3', '+'],
    ['4', '5', '6', '-'],
    ['7', '8', '9', '*'],
    ['.', '0', '/', t("PointOfSale.back")],
    [t("PointOfSale.quantity"), t("PointOfSale.price"), t("PointOfSale.phone")]
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        mt: 2
      }}
    >
      {buttons.map((row, rowIndex) =>
        row.map((button, colIndex) => (
          <Button
            key={`${rowIndex}-${colIndex}`}
            variant={button === selectedMode ? 'contained' : 'outlined'}
            onClick={() => handleButtonClick(button)}
            sx={{
              height: '48px',
              backgroundColor: button === selectedMode ? 'primary.main' : '#fff',
              color: button === selectedMode ? '#fff' : '#333',
              '&:hover': {
                backgroundColor: button === selectedMode ? '#600060' : '#f0f0f0'
              }
            }}
          >
            <Typography variant="button">{button}</Typography>
          </Button>
        ))
      )}
    </Box>
  );
};

const PointOfSale = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [cafeProducts, setCafeProducts] = useState([]);
  const [restaurantProducts, setRestaurantProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [inputValue, setInputValue] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const total = calculateTotalPrice();
    if (discount) {
      const discountValue = parseFloat(discount);
      if (discount.includes('%')) {
        setDiscountedTotal(total - (total * (discountValue / 100)));
      } else {
        setDiscountedTotal(total - discountValue);
      }
    } else {
      setDiscountedTotal(total);
    }
  }, [discount, cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [cafeResponse, restaurantResponse] = await Promise.all([
        Api.get('/api/cafe-products/1'),
        Api.get('/api/restaurant-products/1')
      ]);
      
      setCafeProducts(cafeResponse.data.products);
      setRestaurantProducts(restaurantResponse.data.products);
    } catch (error) {
      notifyError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleClearAll = () => {
    setCart([]);
    setPhoneNumber('');
    setDiscount('');
    setSelectedProductId(null);
    setSelectedMode(null);
    setInputValue('');
  };


  const handleIncreaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const handleDecreaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0));
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalPoints = () => {
    return cart.reduce((total, item) => total + (item.points * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      notifyError(t('PointOfSale.cart_empty'));
      return;
    }

    if (!phoneNumber) {
      notifyError(t('PointOfSale.please_enter_customer_phone_number'));
      return;
    }

    try {
      // Here you would implement your checkout API call
      // For now, we'll just simulate a successful checkout
      setCart([]);
      setPhoneNumber('');
      setDiscount('');
      notifySuccess(t('PointOfSale.order_placed_successfully'));
    } catch (error) {
      notifyError(t('PointOfSale.checkout_failed'));
      console.error('Checkout error:', error);
    }
  };

  const handleKeypadNumberClick = (number) => {
    if (!selectedProductId) return;
    
    const selectedItem = cart.find(item => item.id === selectedProductId);
    if (!selectedItem) return;
    
    if (selectedMode === 'Qty') {
      if (number === t("PointOfSale.back")) {
        // Handle backspace for quantity
        const currentQty = selectedItem.quantity.toString();
        const newQty = currentQty.slice(0, -1);
        const finalQty = newQty === '' ? 1 : parseInt(newQty);
        
        setCart(cart.map(item =>
          item.id === selectedProductId
            ? { ...item, quantity: Math.max(1, finalQty) }
            : item
        ));
      } else if (!isNaN(parseFloat(number)) && isFinite(number)) {
        // Handle number input for quantity
        const newQty = parseInt(number);
        if (newQty > 0) {
          setCart(cart.map(item =>
            item.id === selectedProductId
              ? { ...item, quantity: newQty }
              : item
          ));
        }
      }
    } else if (selectedMode === 'Price') {
      if (number === t("PointOfSale.back")) {
        // Handle backspace for price
        const currentPrice = selectedItem.price.toString();
        const newPrice = currentPrice.slice(0, -1);
        const finalPrice = newPrice === '' ? selectedItem.originalPrice || selectedItem.price : parseFloat(newPrice);
        
        setCart(cart.map(item =>
          item.id === selectedProductId
            ? { ...item, price: Math.max(0.01, finalPrice) }
            : item
        ));
      } else if (!isNaN(parseFloat(number)) && isFinite(number)) {
        // Handle number input for price
        const newPrice = parseFloat(number);
        if (newPrice > 0) {
          setCart(cart.map(item =>
            item.id === selectedProductId
              ? { ...item, price: newPrice, originalPrice: item.originalPrice || item.price }
              : item
          ));
        }
      }
    }
  };

  const handlePhoneInput = (value) => {
    if (value === 'back') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
      setPhoneNumber(prev => prev + value);
    }
  };

  const handleKeypadModeChange = (mode) => {
    setSelectedMode(mode);
  };

  const handleDiscountChange = (e) => {
    let value = e.target.value.replace('%', '');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDiscount(value ? `${value}%` : '');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      width: '100vw',
      p: 0
    }}>
      {/* Left Side - Checkout Information */}
      <Box sx={{ 
        width: '50vw',
        p: 3
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height:'100%',
            overflow: 'auto'
          }}
        >
            {/* Header */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                mb: 4,
                color: '#1a1a1a'
              }}
            >
              {t('PointOfSale.checkout')}
            </Typography>

            {/* Products Selection */}
            <Box sx={{ mb: 4 }}>
              {selectedProductId && cart.length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2, 
                    p: 1.5, 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: 1,
                    color: '#2e7d32',
                    border: '1px solid #c8e6c9'
                  }}
                >
                  {t('PointOfSale.cart_item_selected_hint')}
                </Typography>
              )}
              
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': { 
                    color: 'primary.main',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  },
                  '& .Mui-selected': { 
                    color: 'primary.main !important',
                    fontWeight: 600
                  },
                  '& .MuiTabs-indicator': { 
                    backgroundColor: 'primary.main',
                    height: 3
                  }
                }}
              >
                <Tab label={t('PointOfSale.cafe_products')} />
                <Tab label={t('PointOfSale.restaurant_products')} />
              </Tabs>
              
              <Box sx={{ 
                height:'100%', 
                overflow: 'auto',
                pr: 1
              }}>
                <Grid container spacing={2}>
                  {(activeTab === 0 ? cafeProducts : restaurantProducts).map((product) => {
                    return (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card 
                          sx={{ 
                            transition: 'all 0.2s ease',
                            border: '1px solid #e0e0e0',
                            backgroundColor: 'white',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              borderColor: 'primary.main',
                              cursor: 'pointer'
                            },
                            height: '100%',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={() => handleAddToCart(product)}
                        >
                          <CardMedia
                            component="img"
                            height="130"
                            width="130"
                            image={product.image}
                            alt={i18n.language === 'ar' ? product.arName : product.enName}
                          />
                          <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>
                              {i18n.language === 'ar' ? product.arName : product.enName}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, mt: 'auto' }}>
                              <Typography variant="caption" sx={{ color: 'black', fontWeight: 600 }}>
                                ${product.price}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'green', fontWeight: 500 }}>
                                {product.points} pts
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
        </Paper>
      </Box>

      {/* Right Side - Order Summary */}
      <Box sx={{ 
        width: '33vw',
        p: 3
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: '100%',
            overflow: 'auto'
          }}
        >
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
            <IconButton variant="contained" color="error" onClick={handleClearAll} sx={{ mb: 2 }}>
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
                <Box sx={{ mb: 3, maxHeight: '30vh', overflow: 'auto' }}>
                  {cart.map((item) => (
                    <Box 
                      key={item.id}
                      onClick={() => setSelectedProductId(selectedProductId === item.id ? null : item.id)}
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
                        backgroundColor: selectedProductId === item.id ? '#f8f4ff' : 'transparent',
                        border: selectedProductId === item.id ? '2px solid primary.main' : '2px solid transparent',
                        '&:hover': {
                          backgroundColor: selectedProductId === item.id ? '#f8f4ff' : '#f9f9f9'
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
                            handleDecreaseQuantity(item.id);
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
                            handleIncreaseQuantity(item.id);
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
                          handleRemoveFromCart(item.id);
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
                      ${discountedTotal.toFixed(2)}
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
                  onNumberClick={handleKeypadNumberClick}
                  onModeChange={handleKeypadModeChange}
                  selectedMode={selectedMode}
                  selectedItemId={selectedProductId}
                  setValue={setInputValue}
                  onPhoneInput={handlePhoneInput}
                />

                {/* Checkout Button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !phoneNumber}
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
        </Paper>
      </Box>
    </Box>
  );
};

export default PointOfSale;