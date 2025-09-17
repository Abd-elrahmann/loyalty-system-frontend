import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ProductGrid = ({ 
  activeTab, 
  setActiveTab, 
  cafeProducts, 
  restaurantProducts, 
  onAddToCart 
}) => {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 600px)');
  return (
    <Box sx={{ mb: 4,height:'100vh',overflow:'auto'}}>
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
        px: { xs: 1, sm: 2 },
        width: '100%'
      }}>
        <Grid 
          container 
          spacing={2} 
          justifyContent={isMobile ? 'center' : 'flex-start'}
          sx={{
            width: '100%',
            margin: '0 auto'
          }}
        >
          {(activeTab === 0 ? cafeProducts : restaurantProducts).map((product) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={product.id}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
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
                  height: { xs: '160px', sm: '200px', md: '200px' },
                  width: { xs: '100%', sm: '300px', md: '200px' },
                  maxWidth: { xs: '100%', sm: '300px', md: '400px' },
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 auto'
                }}
                onClick={() => onAddToCart(product)}
              >
                <CardMedia
                  component="img"
                  height="130"
                  width="130"
                  image={product.image}
                  alt={i18n.language === 'ar' ? product.arName : product.enName}
                />
                <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                    {i18n.language === 'ar' ? product.arName : product.enName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: 'green', fontWeight: 600, fontSize: '0.90rem' }}>
                      ${product.price}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductGrid;