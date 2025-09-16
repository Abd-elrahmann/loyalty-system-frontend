import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import Api from "../Config/Api";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import { Spin } from "antd";
import { useTranslation } from 'react-i18next';
import { updateUserProfile } from "../utilities/user";
import ProductGrid from '../Components/pos/ProductGrid';
import Cart from '../Components/pos/Cart';

const PointOfSale = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [cafeProducts, setCafeProducts] = useState([]);
  const [restaurantProducts, setRestaurantProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await Api.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      notifyError('Failed to fetch settings');
      console.error('Error fetching settings:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await Api.get('/api/auth/profile');
      if (response.data) {
        localStorage.setItem('profile', JSON.stringify(response.data));
        updateUserProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
    const productWithCategory = {
      ...product,
      category: activeTab === 0 ? 'cafe' : 'restaurant'
    };
    
    const existingItem = cart.find(item => 
      item.id === product.id && item.category === productWithCategory.category
    );
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.category === productWithCategory.category
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...productWithCategory, quantity: 1 }]);
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

  const handleIncreaseQuantity = (id, category) => {
    setCart(cart.map(item =>
      item.id === id && item.category === category
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const handleDecreaseQuantity = (id, category) => {
    setCart(cart.map(item =>
      item.id === id && item.category === category && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0));
  };

  const handleRemoveFromCart = (id, category) => {
    setCart(cart.filter(item => !(item.id === id && item.category === category)));
  };

  const handleKeypadNumberClick = (number) => {
    if (!selectedProductId) return;
    
    const selectedItem = cart.find(item => 
      item.id === selectedProductId.id && item.category === selectedProductId.category
    );
    if (!selectedItem) return;
    
    if (selectedMode === 'Qty') {
      if (number === t("PointOfSale.back")) {
        const currentQty = selectedItem.quantity.toString();
        const newQty = currentQty.slice(0, -1);
        const finalQty = newQty === '' ? 1 : parseInt(newQty);
        
        setCart(cart.map(item =>
          item.id === selectedProductId.id && item.category === selectedProductId.category
            ? { ...item, quantity: Math.max(1, finalQty) }
            : item
        ));
      } else if (!isNaN(parseFloat(number)) && isFinite(number)) {
        const newQty = parseInt(number);
        if (newQty > 0) {
          setCart(cart.map(item =>
            item.id === selectedProductId.id && item.category === selectedProductId.category
              ? { ...item, quantity: newQty }
              : item
          ));
        }
      }
    } else if (selectedMode === 'Price') {
      if (number === t("PointOfSale.back")) {
        const currentPrice = selectedItem.price.toString();
        const newPrice = currentPrice.slice(0, -1);
        const finalPrice = newPrice === '' ? selectedItem.originalPrice || selectedItem.price : parseFloat(newPrice);
        
        setCart(cart.map(item =>
          item.id === selectedProductId.id && item.category === selectedProductId.category
            ? { ...item, price: Math.max(0.01, finalPrice) }
            : item
        ));
      } else if (!isNaN(parseFloat(number)) && isFinite(number)) {
        const newPrice = parseFloat(number);
        if (newPrice > 0) {
          setCart(cart.map(item =>
            item.id === selectedProductId.id && item.category === selectedProductId.category
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
      const items = cart.map(item => ({
        productId: item.id,
        type: item.category,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      let discountValue = 0;
      if (discount) {
        discountValue = parseFloat(discount.replace('%', ''));
      }

      const payload = {
        phone: phoneNumber.toString(),
        totalPrice: calculateDiscountedTotal(),
        discount: discountValue,
        items: items
      };

      await Api.post('/api/pos', payload);
      
      setCart([]);
      setPhoneNumber('');
      setDiscount('');
      notifySuccess(t('PointOfSale.order_placed_successfully'));
      fetchProfile();
      
    } catch (error) {
      notifyError(t('PointOfSale.checkout_failed'));
      console.error('Checkout error:', error);
    }
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Spin size="large" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      width: '100%',
      p: 0
    }}>
      {/* Left Side - Checkout Information */}
      <Box sx={{ 
        flex: 1,
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

          {selectedProductId && selectedProductId.id && cart.length > 0 && (
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

          <ProductGrid
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cafeProducts={cafeProducts}
            restaurantProducts={restaurantProducts}
            onAddToCart={handleAddToCart}
          />
        </Paper>
      </Box>

      {/* Right Side - Order Summary */}
      <Box sx={{ 
        width: '33%',
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
          <Cart
            cart={cart}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onClearAll={handleClearAll}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            discount={discount}
            setDiscount={setDiscount}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onKeypadNumberClick={handleKeypadNumberClick}
            onPhoneInput={handlePhoneInput}
            onCheckout={handleCheckout}
            settings={settings}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default PointOfSale;