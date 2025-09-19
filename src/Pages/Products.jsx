import React, { useState, useCallback } from 'react';
import { Box, Tabs, Tab, Button, Card, CardContent, CardMedia, Typography, Grid, TextField, InputAdornment, IconButton, Pagination, useMediaQuery, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddProductModal from '../Components/Modals/AddProductsModal';
import AddCategoryModal from '../Components/Modals/AddCategoryModal';
import Api, { handleApiError } from '../Config/Api';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import RedeemIcon from '@mui/icons-material/Redeem';
import DeleteModal from '../Components/Modals/DeleteModal';
import Swal from 'sweetalert2';
import { useUser, updateUserProfile } from '../utilities/user';
import { Helmet } from 'react-helmet-async';
import { Spin } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { FaDollarSign } from 'react-icons/fa';
import { FaCoins } from 'react-icons/fa';

const Products = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('cafe');
  const [searchFilters, setSearchFilters] = useState({
    enName: '',
    arName: '',
    categoryId: ''
  });
  const [openModal, setOpenModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productId, setProductId] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [scannedProduct, setScannedProduct] = useState('');
  const isMobile = useMediaQuery('(max-width: 400px)');
  const profile = useUser();
  const queryClient = useQueryClient();

  // Fetch categories based on active tab
  const { data: categories } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: async () => {
      const response = await Api.get(`/api/categories/${activeTab}`);
      return response.data;
    },
    enabled: true,
  });

  const fetchProducts = async () => {
    const endpoint = activeTab === 'cafe' 
      ? `/api/cafe-products/${currentPage}` 
      : `/api/restaurant-products/${currentPage}`;
    
    const queryParams = new URLSearchParams();
    if (searchFilters.categoryId) {
      queryParams.append('categoryId', searchFilters.categoryId);
    }
    
    const response = await Api.get(`${endpoint}?${queryParams}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', activeTab, currentPage, searchFilters.categoryId],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 30000
  });

  const products = data?.products || [];
  const totalItems = data?.totalPages || 0;

  const filteredProducts = products.filter(product => 
    product.enName.toLowerCase().includes(searchFilters.enName.toLowerCase()) ||
    product.arName.toLowerCase().includes(searchFilters.arName.toLowerCase())
  );

  const addProductMutation = useMutation({
    mutationFn: (productData) => {
      const endpoint = activeTab === 'cafe' 
        ? '/api/cafe-products' 
        : '/api/restaurant-products';
      return Api.post(endpoint, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      handleCloseModal();
      notifySuccess(t('Products.ProductAdded'));
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: (productData) => {
      const endpoint = activeTab === 'cafe' 
        ? `/api/cafe-products/${productData.id}` 
        : `/api/restaurant-products/${productData.id}`;
      return Api.patch(endpoint, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      notifySuccess(t('Products.ProductUpdated'));
      handleCloseModal();
    },
    onError: (error) => {
      handleApiError(error);
      notifyError(t('Products.ProductNotUpdated'));
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => {
      const endpoint = activeTab === 'cafe' 
        ? `/api/cafe-products/${id}` 
        : `/api/restaurant-products/${id}`;
      return Api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      notifySuccess(t('Products.ProductDeleted'));
      setOpenDeleteModal(false);
      setProductId(null);
    },
    onError: (error) => {
      handleApiError(error);
      notifyError(t('Products.ProductNotDeleted'));
    }
  });

  const redeemProductMutation = useMutation({
    mutationFn: (productId) => {
      return Api.post('/api/redeem', {
        productId,
        type: activeTab
      });
    },
    onSuccess: async () => {
      const profileResponse = await Api.get('/api/auth/profile');
      localStorage.setItem('profile', JSON.stringify(profileResponse.data));
      updateUserProfile();
      notifySuccess(t('Products.ProductRedeemed'));
    },
    onError: (error) => {
      handleApiError(error);
      notifyError(t('Products.ProductNotRedeemed'));
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: (categoryData) => {
      const endpoint = activeTab === 'cafe' 
        ? '/api/categories/cafe' 
        : '/api/categories/restaurant';
      return Api.post(endpoint, categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setOpenCategoryModal(false);
      notifySuccess(t('Products.CategoryAdded'));
    },
    onError: (error) => {
      handleApiError(error);
      notifyError(t('Products.CategoryNotAdded'));
    }
  });

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchFilters({
      enName: '',
      arName: '',
      categoryId: ''
    });
    setCurrentPage(1);
  };

  const handleOpenModal = (product) => {
    setOpenModal(true);
    setProductToEdit(product);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddProduct = (productData) => {
    addProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData) => {
    updateProductMutation.mutate(productData);
  };

  const handleDeleteProduct = (id) => {
    setOpenDeleteModal(true);
    setProductId(id);
    setOpenDeleteModal(true);
  };
  
  const confirmDeleteProduct = () => {
    deleteProductMutation.mutate(productId);
  };

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
    setScannedProduct("");
    setCurrentPage(1);
  }, 800), []);

  const handleCategoryChange = (event) => {
    setSearchFilters(prev => ({
      ...prev,
      categoryId: event.target.value
    }));
    setCurrentPage(1);
  };

  const handleClearCategory = () => {
    setSearchFilters(prev => ({
      ...prev,
      categoryId: ''
    }));
    setCurrentPage(1);
  };

  const handleRedeemProduct = (productId) => {
    redeemProductMutation.mutate(productId);
  };

  const handleOpenCategoryModal = () => {
    setOpenCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
  };

  const handleAddCategory = (categoryData) => {
    addCategoryMutation.mutate(categoryData);
  };

  return (
      <Box sx={{ p: isMobile ? 1 : 3, mt: isMobile ? 6 : 0 }}>
        <Helmet>
          <title>{t('Products.Products')}</title>
          <meta name="description" content={t('Products.ProductsDescription')} />
        </Helmet>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{
          '& .MuiTabs-flexContainer': {
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
          },
        }}>
          <Tab label={t('Products.Cafe')} value="cafe"  />
          <Tab label={t('Products.Restaurant')} value="restaurant" />
        </Tabs>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: isMobile ? 'center' : 'space-between', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', 
        mb: isMobile ? 1 : 3,
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 2, 
          width: isMobile ? '100%' : 'auto',
          alignItems: isMobile ? 'center' : 'flex-start'
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
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearCategory}
              sx={{ height: '40px' }}
            >
              {t('Products.ClearFilter')}
            </Button>
          )}

          {profile.role === 'ADMIN' && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenCategoryModal}
              sx={{ 
                height: '40px',
                minWidth: isMobile ? '100%' : '120px',
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              <PlusOutlined style={{marginRight: '4px'}} />
              {t('Products.AddCategory')}
            </Button>
          )}
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => handleOpenModal()}
          sx={{
            flexShrink: 0,
            width: isMobile && activeTab === 'cafe' ? '100%' : '210px',
            height: '43px',
            fontSize: isMobile ? '12px' : '13px',
            borderRadius: isMobile ? '5px' : '10px',
            display: profile.role === 'ADMIN' ? '' : 'none',
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
            },
          }}
        >
          <PlusOutlined style={{marginRight: '1px'}} />
          {activeTab === 'cafe' ? t('Products.AddCafeProduct') : t('Products.AddRestaurantProduct')}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" />
        </Box>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                {t('Products.NoProducts')}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4} sx={{
              justifyContent: 'center', 
              mt: isMobile ? 2 : 0,
            }}>
              {filteredProducts.map((product) => (
                <Grid item key={product.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
                    width: 250,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      loading="eager"
                      image={product.image}
                      alt={product.enName}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                        {i18n.language === 'ar' ? product.arName : product.enName}
                      </Typography>
      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <FaCoins style={{ color: '#ED6C02' }} /> 
                        <Typography variant="body1">
                          {t('Products.Points')}: {product.points}
                        </Typography>
                        <FaDollarSign style={{ color: '#00A300' }} /> 
                        <Typography variant="body1">
                          {t('Products.Price')}: {product.price}
                        </Typography>
                      </Box>
                      
                      {product.category && (
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                          {t('Products.Category')}: {i18n.language === 'ar' ? product.category.arName : product.category.enName}
                        </Typography>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: profile.role === 'ADMIN' ? 'space-between' : 'center' }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        startIcon={<RedeemIcon />}
                        onClick={() => {
                          Swal.fire({
                            title: t('Products.RedeemProduct'),
                            text: t('Products.RedeemProductText'),
                            icon: 'warning',
                            confirmButtonText: t('Products.Redeem'),
                            cancelButtonText: t('Products.RedeemProductTextCancel'),
                            showCancelButton: true,
                            confirmButtonColor: '#800080',
                            cancelButtonColor: '#D91656',
                            reverseButtons: i18n.language === 'ar' ? false : true,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleRedeemProduct(product.id);
                            }
                          });
                        }}
                        sx={{
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        {t('Products.Redeem')}
                      </Button>
                      <Box sx={{
                         display: profile.role === 'ADMIN' ? 'flex' : 'none',
                       alignItems: 'center',
                       gap: 1,
                       justifyContent: 'center'
                       }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal(product)}
                        aria-label="edit"
                      >
                        <EditOutlined sx={{ color: 'green' }} />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => {
                          handleDeleteProduct(product.id);
                        }}
                        aria-label="delete"
                        >
                          <DeleteOutlined sx={{ color: 'red' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination 
              count={totalItems}
              page={currentPage - 1}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </>
      )}

      <AddProductModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddProduct}
        type={activeTab}
        handleUpdateProduct={handleUpdateProduct}
        productToEdit={productToEdit} 
        fetchProducts={fetchProducts}
        categories={categories}
        onOpenCategoryModal={handleOpenCategoryModal}
      />
      
      <AddCategoryModal
        open={openCategoryModal}
        onClose={handleCloseCategoryModal}
        onSubmit={handleAddCategory}
        type={activeTab}
      />
      
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)} 
        onConfirm={confirmDeleteProduct}
        message={t('Products.DeleteProductMessage')}
        isLoading={deleteProductMutation.isLoading}
      />
    </Box>
  );
};

export default Products;