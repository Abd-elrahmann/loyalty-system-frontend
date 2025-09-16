import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Card,
  CardContent,
  alpha,
  useTheme,
  Grid,
  IconButton,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../Components/Shared/tableLayout';
import InvoiceSearch from '../Components/Modals/InvoiceSearch';
import {
  RestartAltOutlined,
  ReceiptLongOutlined,
  PersonOutlined,
  PhoneOutlined,
  EmailOutlined,
  ReceiptOutlined,
  CalendarTodayOutlined,
  PaidOutlined,
  LocalOfferOutlined,
  StarsOutlined
} from '@mui/icons-material';

const Invoice = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewInvoice = (invoiceData) => {
    setSelectedInvoice(invoiceData);
    
    if (invoiceData.items) {
      setInvoiceItems(invoiceData.items);
    }
  };

  const handleClearInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceItems([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          textAlign: 'center'
        }}>
          <ReceiptLongOutlined 
            sx={{ 
              fontSize: 48, 
              color: theme.palette.primary.main,
              mb: 2 
            }} 
          />
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              mb: 1
            }}
          >
            {t('Invoice.title')}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            {t('Invoice.description')}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          mb: 4
        }}>
          <InvoiceSearch onViewInvoice={handleViewInvoice} />
          {selectedInvoice && (
            <IconButton 
              onClick={handleClearInvoice}
              sx={{
                border: `2px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <RestartAltOutlined sx={{color: theme.palette.primary.main}} />
            </IconButton>
          )}
        </Box>

        {selectedInvoice ? (
          <Box>
            <Grid container spacing={3} sx={{justifyContent:isMobile ? 'center' : 'space-around'}}>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 3,
                      gap: 1
                    }}>
                      <PersonOutlined sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t('Invoice.customerInfo')}
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.name')}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedInvoice.user ? 
                              (i18n.language === 'ar' ? selectedInvoice.user.arName : selectedInvoice.user.enName) 
                              : t('Invoice.guest')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PhoneOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.phone')}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedInvoice.phone || t('Invoice.notProvided')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <EmailOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.email')}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedInvoice.email || t('Invoice.notProvided')}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',                   
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 3,
                      gap: 1
                    }}>
                      <ReceiptOutlined sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t('Invoice.invoiceDetails')}
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ReceiptOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.invoiceNumber')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="primary.main">
                            #{selectedInvoice.id}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CalendarTodayOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.date')}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {dayjs(selectedInvoice.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PaidOutlined sx={{ color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.totalPrice')}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            ${selectedInvoice.totalPrice}
                          </Typography>
                        </Box>
                      </Box>

                      {selectedInvoice.discount > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LocalOfferOutlined sx={{ color: theme.palette.error.main }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('Invoice.discount')}
                            </Typography>
                            <Typography variant="body1" fontWeight={700} color="error.main">
                              {selectedInvoice.discount}%
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StarsOutlined sx={{ color: theme.palette.success.main }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('Invoice.pointsEarned')}
                          </Typography>
                          <Typography variant="body1" fontWeight={700} color="success.main">
                            {selectedInvoice.points} {t('Invoice.points')}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongOutlined sx={{ color: theme.palette.primary.main }} />
                {t('Invoice.items')}
              </Typography>
              
              {invoiceItems.length > 0 ? (
                isMobile ? (
                  <Stack spacing={2}>
                    {invoiceItems.map((item, index) => {
                      const product = item.cafeProduct || item.restaurantProduct;
                      const productType = item.cafeProduct ? 'Cafe' : 'Restaurant';
                      
                      return (
                        <Card key={index} sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {product ? (i18n.language === 'ar' ? product.arName : product.enName) : 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography color="text.secondary">{t('Invoice.type')}:</Typography>
                              <Typography>{t(`Invoice.${productType.toLowerCase()}`)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography color="text.secondary">{t('Invoice.price')}:</Typography>
                              <Typography>${item.price}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography color="text.secondary">{t('Invoice.quantity')}:</Typography>
                              <Typography>{item.quantity}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography color="text.secondary">{t('Invoice.total')}:</Typography>
                              <Typography color="primary.main" fontWeight={600}>${item.total}</Typography>
                            </Box>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer 
                    component={Paper}
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell sx={{ fontWeight: 600 }}>
                            {t('Invoice.product')}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 600 }}>
                            {t('Invoice.type')}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 600 }}>
                            {t('Invoice.price')}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 600 }}>
                            {t('Invoice.quantity')}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 600 }}>
                            {t('Invoice.total')}
                          </StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceItems.map((item, index) => {
                          const product = item.cafeProduct || item.restaurantProduct;
                          const productType = item.cafeProduct ? 'Cafe' : 'Restaurant';
                          
                          return (
                            <StyledTableRow 
                              key={index}
                              sx={{
                                '&:nth-of-type(odd)': {
                                  backgroundColor: alpha(theme.palette.primary.light, 0.05)
                                },
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.light, 0.1)
                                }
                              }}
                            >
                              <StyledTableCell>
                                {product ? (i18n.language === 'ar' ? product.arName : product.enName) : 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: item.cafeProduct ? 
                                      alpha(theme.palette.info.main, 0.1) : 
                                      alpha(theme.palette.warning.main, 0.1),
                                    color: item.cafeProduct ? 
                                      theme.palette.info.main : 
                                      theme.palette.warning.main
                                  }}
                                >
                                  {t(`Invoice.${productType.toLowerCase()}`)}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                ${item.price}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.quantity}
                              </StyledTableCell>
                              <StyledTableCell 
                                align="center"
                                sx={{
                                  fontWeight: 600,
                                  color: item.total > 100 ? 'error.main' : 'primary.main'
                                }}
                              >
                                ${item.total}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Paper
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    border: `1px dashed ${theme.palette.primary.light}`
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {t('Invoice.noItemsAvailable')}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{ 
              textAlign: 'center', 
              py: 8
            }}
          >
            <ReceiptLongOutlined 
              sx={{ 
                fontSize: 80, 
                color: alpha(theme.palette.primary.main, 0.3),
                mb: 3
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2,
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            >
              {t('Invoice.noInvoiceSelected')}
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              {t('Invoice.searchHint')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Invoice;