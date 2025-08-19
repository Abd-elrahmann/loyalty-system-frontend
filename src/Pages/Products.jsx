import React, { useState, useEffect } from 'react';
const Box = React.lazy(() => import('@mui/material/Box'));
const Tabs = React.lazy(() => import('@mui/material/Tabs'));
const Tab = React.lazy(() => import('@mui/material/Tab'));
const Button = React.lazy(() => import('@mui/material/Button'));
const Card = React.lazy(() => import('@mui/material/Card'));
const CardContent = React.lazy(() => import('@mui/material/CardContent'));
const CardMedia = React.lazy(() => import('@mui/material/CardMedia'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
const Grid = React.lazy(() => import('@mui/material/Grid'));
const TextField = React.lazy(() => import('@mui/material/TextField'));
const InputAdornment = React.lazy(() => import('@mui/material/InputAdornment'));
const IconButton = React.lazy(() => import('@mui/material/IconButton'));
const CircularProgress = React.lazy(() => import('@mui/material/CircularProgress'));
const Pagination = React.lazy(() => import('@mui/material/Pagination'));
import SearchIcon from '@mui/icons-material/Search';
import AddProductModal from '../Components/Modals/AddProductsModal';
import Api, { handleApiError } from '../Config/Api';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RedeemIcon from '@mui/icons-material/Redeem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteModal from '../Components/Modals/DeleteModal';
import { useMediaQuery } from '@mui/material';
import Swal from 'sweetalert2';

const Products = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('cafe');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productId, setProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const isMobile = useMediaQuery('(max-width: 400px)');

  useEffect(() => {
    setProducts([]);
    setFilteredProducts([]);
    setLoading(true);
    setCurrentPage(1);
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.enName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.arName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const endpoint = activeTab === 'cafe' 
        ? `/api/cafe-products/${currentPage}` 
        : `/api/restaurant-products/${currentPage}`;
      
      const response = await Api.get(endpoint);
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      handleApiError(error);
      setProducts([]); 
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenModal = (product) => {
    setOpenModal(true);
    setProductToEdit(product);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddProduct = async (productData) => {
    try {
      const endpoint = activeTab === 'cafe' 
        ? '/api/cafe-products' 
        : '/api/restaurant-products';
      
      await Api.post(endpoint, productData);
      fetchProducts();
      handleCloseModal();
      notifySuccess(t('Products.ProductAdded'));
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProduct = async (productData) => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'cafe' 
        ? `/api/cafe-products/${productData.id}` 
        : `/api/restaurant-products/${productData.id}`;
      await Api.patch(endpoint, productData);
      fetchProducts();
      notifySuccess(t('Products.ProductUpdated'));
      handleCloseModal();
    } catch (error) {
      handleApiError(error);
      notifyError(t('Products.ProductNotUpdated'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setIsLoading(true);
    setProductId(id);
    setOpenDeleteModal(true);
    try {
      const endpoint = activeTab === 'cafe' 
        ? `/api/cafe-products/${id}` 
        : `/api/restaurant-products/${id}`;
      
      await Api.delete(endpoint);
      fetchProducts();
      notifySuccess(t('Products.ProductDeleted'));
    } catch (error) {
      handleApiError(error);
      notifyError(t('Products.ProductNotDeleted'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRedeemProduct = async (productId) => {
    try {
      await Api.post('/api/redeem', {
        productId,
        type: activeTab
      });
  
      notifySuccess(t('Products.ProductRedeemed'));
    } catch (error) {
      handleApiError(error);
      notifyError(t('Products.ProductNotRedeemed'));
    }
  };

  return (
      <Box sx={{ p: isMobile ? 1 : 3,mt:isMobile ? 6 : 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{
          '& .MuiTabs-flexContainer': {
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
          },
        }}>
          <Tab label={t('Products.Cafe')} value="cafe" />
          <Tab label={t('Products.Restaurant')} value="restaurant" />
        </Tabs>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 1 : 3,
        gap: 2
      }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('Products.Search')}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            flexGrow: 1,
            maxWidth: isMobile ? '60%' : '250px',
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
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenModal}
          sx={{
            flexShrink: 0,
            width: isMobile ? '50%' : '220px',
            height:  '40px',
            fontSize: isMobile ? '14px' : '16px',
            borderRadius: isMobile ? '5px' : '10px',
          }}
        >
          {activeTab === 'cafe' ? t('Products.AddCafeProduct') : t('Products.AddRestaurantProduct')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{
            justifyContent: isMobile ? 'center' : 'flex-start',
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
                  width: 300,
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
                    <Typography gutterBottom variant="h6" component="div">
                      {i18n.language === 'ar' ? product.arName : product.enName}
                    </Typography>
    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOnIcon sx={{ color: 'gold' }} />
                      <Typography variant="body1">
                        {t('Products.Points')}: {product.points}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="contained" 
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
                    >
                      {t('Products.Redeem')}
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(product)}
                      aria-label="edit"
                    >
                      <EditIcon sx={{ color: 'green' }} />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => setOpenDeleteModal(true)}
                      aria-label="delete"
                      >
                        <DeleteIcon sx={{ color: 'red' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

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
      />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title={t('Products.DeleteProduct')}
        message={t('Products.DeleteProductMessage')}
        onConfirm={() => handleDeleteProduct(productId)}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Products;