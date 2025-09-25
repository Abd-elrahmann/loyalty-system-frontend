import React, { useState, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from "@ant-design/icons";
import { RestartAltOutlined } from '@mui/icons-material';
import { FaCoins } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import Api from '../../Config/Api';
import debounce from 'lodash.debounce';
import { Spin } from "antd";
import { useCurrencyManager } from '../../Config/globalCurrencyManager';

const ProductGrid = ({ 
  activeTab, 
  setActiveTab, 
  cafeProducts, 
  restaurantProducts, 
  onAddToCart 
}) => {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [searchFilters, setSearchFilters] = useState({
    enName: '',
    arName: '',
    category: '',
    categoryId: ''
  });
  const [searchValue, setSearchValue] = useState('');
  
  // Use currency manager hook
  const { formatAmount } = useCurrencyManager();

  // Fetch categories based on active tab
  const { data: categories } = useQuery({
    queryKey: ['categories', activeTab === 0 ? 'cafe' : 'restaurant'],
    queryFn: async () => {
      const type = activeTab === 0 ? 'cafe' : 'restaurant';
      const response = await Api.get(`/api/categories/${type}`);
      return response.data;
    },
    enabled: true,
  });

  // Fetch products with category filter
  const { data: filteredProductsData, isLoading } = useQuery({
    queryKey: ['pos-products', activeTab === 0 ? 'cafe' : 'restaurant', searchFilters.category],
    queryFn: async () => {
      const type = activeTab === 0 ? 'cafe' : 'restaurant';
      const endpoint = type === 'cafe' ? '/api/cafe-products/1' : '/api/restaurant-products/1';
      
      const queryParams = new URLSearchParams();
      if (searchFilters.category) {
        queryParams.append('category', searchFilters.category);
      }
      
      const response = await Api.get(`${endpoint}?${queryParams}`);
      return response.data;
    },
    enabled: true,
  });

  // Use API filtered products if category filter is applied, otherwise use props
  const apiProducts = filteredProductsData?.products || [];
  const currentProducts = searchFilters.category ? apiProducts : (activeTab === 0 ? cafeProducts : restaurantProducts);
  
  // Apply search filter on frontend (for name search)
  const filteredProducts = currentProducts.filter(product => 
    product.enName.toLowerCase().includes(searchFilters.enName.toLowerCase()) ||
    product.arName.toLowerCase().includes(searchFilters.arName.toLowerCase())
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
    setSearchValue(e.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((value) => {
    setSearchFilters(prev => ({
      ...prev,
      enName: value,
      arName: value
    }));
  }, 800), []);

  const handleCategoryChange = (event) => {
    const selectedCategory = categories.find(cat => cat.id === event.target.value);
    const categoryName = selectedCategory ? (i18n.language === 'ar' ? selectedCategory.arName : selectedCategory.enName) : '';
    
    setSearchFilters(prev => ({
      ...prev,
      category: categoryName,
      categoryId: event.target.value // Keep ID for UI selection
    }));
  };

  const handleClearCategory = () => {
    setSearchFilters(prev => ({
      ...prev,
      category: '',
      categoryId: ''
    }));
  };

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    setSearchFilters({
      enName: '',
      arName: '',
      category: '',
      categoryId: ''
    });
    setSearchValue('');
  };

  return (
    <Box sx={{ mb: 4,height:'100vh',overflow:'auto'}}>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
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

      {/* Search and Filter Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: 2, 
        mb: 3,
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('Products.Search')}
          value={searchValue} 
          onChange={handleSearch}
          sx={{
            flexGrow: 1,
            maxWidth: isMobile ? '100%' : '250px',
            backgroundColor: 'transparent',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              '& fieldset': {
                borderColor: 'none',
              },
              '&:hover fieldset': {
                borderColor: 'none',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'none',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined color="primary" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
          <InputLabel>{t('Products.Category')}</InputLabel>
          <Select
            value={searchFilters.categoryId}
            label={t('Products.Category')}
            onChange={handleCategoryChange}
          >
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {i18n.language === 'ar' ? category.arName : category.enName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                {t('Products.NoCategories')}
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {searchFilters.categoryId && (
          <IconButton
            size="small"
            onClick={handleClearCategory}
            sx={{ height: '40px' }}
          >
            <RestartAltOutlined />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ 
        height:'100%', 
        overflow: 'auto',
        px: { xs: 1, sm: 2 },
        width: '100%'
      }}>
        {isLoading && searchFilters.category ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Spin size="large" />
          </Box>
        ) : (
          <Grid 
            container 
            spacing={3} 
            justifyContent={isMobile ? 'center' : 'flex-start'}
            sx={{
              width: '100%',
              margin: '0 auto'
            }}
          >
            {filteredProducts.map((product) => (
            <Grid 
              item 
              key={product.id}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: '20px',
                  border: 'none',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  width: 240,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    '& .product-image': {
                      transform: 'scale(1.1)',
                    },
                    '& .product-overlay': {
                      opacity: 1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    zIndex: 1
                  }
                }}
                onClick={() => onAddToCart(product)}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    loading="eager"
                    image={product.image}
                    alt={product.enName}
                    className="product-image"
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      borderRadius: '20px 20px 0 0'
                    }}
                  />
                  <Box 
                    className="product-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 2
                    }}
                  >
                    {product.category && (
                      <Box sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        padding: '4px 12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: '#333',
                          fontSize: '0.7rem'
                        }}>
                          {i18n.language === 'ar' ? product.category.arName : product.category.enName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ 
                  flexGrow: 1, 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2
                }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#2c3e50',
                      lineHeight: 1.3,
                      mb: 1.2
                    }}
                  >
                    {i18n.language === 'ar' ? product.arName : product.enName}
                  </Typography>
  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    gap: 0.8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {product.points && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: '#fff3cd',
                        borderRadius: '18px',
                        padding: '5px 10px',
                        border: '2px solid #ffeaa7',
                        minWidth: '80px',
                        justifyContent: 'center'
                      }}>
                        <FaCoins style={{ color: '#f39c12', fontSize: '14px' }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: '#e67e22',
                          fontSize: '0.8rem'
                        }}>
                          {product.points}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: '#d4edda',
                      borderRadius: '18px',
                      padding: '5px 10px',
                      border: '2px solid #c3e6cb',
                      minWidth: '80px',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: '#27ae60',
                        fontSize: '0.8rem'
                      }}>
                        {formatAmount(product.price)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ProductGrid;