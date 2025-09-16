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
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../Components/Shared/tableLayout';
import InvoiceSearch from '../Components/Modals/InvoiceSearch';
import {RestartAltOutlined} from '@mui/icons-material';
const Invoice = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const handleViewInvoice = (invoiceData) => {
    setSelectedInvoice(invoiceData);
    
    // If the invoice data contains items, use that
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
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {t('Invoice.title')}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <InvoiceSearch onViewInvoice={handleViewInvoice} />
            {selectedInvoice && (
              <IconButton 
                variant="outlined" 
                onClick={handleClearInvoice}
                sx={{
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                <RestartAltOutlined sx={{color: theme.palette.primary.main}} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ 
          mb: 3,
          opacity: 0.5
        }} />

        {selectedInvoice ? (
          <Box>
            {/* Invoice Header */}
            <Card 
              sx={{ 
                mb: 3, 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 2,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
              }}
            >
              <CardContent>
                <Grid container spacing={4} sx={{ justifyContent: 'space-around' }}>
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 3,
                        color: theme.palette.primary.main,
                        borderBottom: `2px solid ${theme.palette.primary.light}`,
                        paddingBottom: 1
                      }}
                    >
                      {t('Invoice.customerInfo')}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '100px'
                          }}
                        >
                          {t('Invoice.name')}:
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          }}
                        >
                          {selectedInvoice.user ? 
                            (i18n.language === 'ar' ? selectedInvoice.user.arName : selectedInvoice.user.enName) 
                            : t('Invoice.guest')}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '100px'
                          }}
                        >
                          {t('Invoice.phone')}:
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          }}
                        >
                          {selectedInvoice.phone || t('Invoice.notProvided')}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '100px'
                          }}
                        >
                          {t('Invoice.email')}:
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          }}
                        >
                          {selectedInvoice.email || t('Invoice.notProvided')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 3,
                        color: theme.palette.primary.main,
                        borderBottom: `2px solid ${theme.palette.primary.light}`,
                        paddingBottom: 1
                      }}
                    >
                      {t('Invoice.invoiceDetails')}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '120px'
                          }}
                        >
                          {t('Invoice.invoiceNumber')}:
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main
                          }}
                        >
                          #{selectedInvoice.id}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '120px'
                          }}
                        >
                          {t('Invoice.date')}:
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          }}
                        >
                          {dayjs(selectedInvoice.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '120px'
                          }}
                        >
                          {t('Invoice.totalPrice')}:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontSize: '1.1rem'
                          }}
                        >
                          ${selectedInvoice.totalPrice}
                        </Typography>
                      </Box>
                      {selectedInvoice.discount > 0 && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: theme.palette.text.secondary,
                              minWidth: '120px'
                            }}
                          >
                            {t('Invoice.discount')}:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700,
                              color: 'error.main',
                              fontSize: '1.1rem'
                            }}
                          >
                            {selectedInvoice.discount}%
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            minWidth: '120px'
                          }}
                        >
                          {t('Invoice.pointsEarned')}:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'success.main',
                            fontSize: '1.1rem'
                          }}
                        >
                          {selectedInvoice.points} {t('Invoice.points')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: theme.palette.primary.main,
                  paddingBottom: 1
                }}
              >
                {t('Invoice.items')}
              </Typography>
              
              {invoiceItems.length > 0 ? (
                <TableContainer 
                  component={Paper}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <Table>
                    <TableHead>
                      <StyledTableRow sx={{ 
                        background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
                      }}>
                        <StyledTableCell 
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.95rem',
                            borderBottom: `2px solid ${theme.palette.primary.light}`
                          }}
                        >
                          {t('Invoice.product')}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.95rem',
                            borderBottom: `2px solid ${theme.palette.primary.light}`
                          }}
                        >
                          {t('Invoice.type')}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.95rem',
                            borderBottom: `2px solid ${theme.palette.primary.light}`
                          }}
                        >
                          {t('Invoice.price')}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.95rem',
                            borderBottom: `2px solid ${theme.palette.primary.light}`
                          }}
                        >
                          {t('Invoice.quantity')}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.95rem',
                            borderBottom: `2px solid ${theme.palette.primary.light}`
                          }}
                        >
                          {t('Invoice.total')}
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceItems.map((item, index) => {
                        // Get product info from either cafeProduct or restaurantProduct
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
                            <StyledTableCell
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }}
                            >
                              {product ? (i18n.language === 'ar' ? product.arName : product.enName) : 'N/A'}
                            </StyledTableCell>
                            <StyledTableCell 
                              align="center"
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: item.cafeProduct ? 
                                    alpha(theme.palette.info.main, 0.1) : 
                                    alpha(theme.palette.warning.main, 0.1),
                                  color: item.cafeProduct ? 
                                    theme.palette.info.main : 
                                    theme.palette.warning.main,
                                  fontSize: '0.85rem',
                                  fontWeight: 600
                                }}
                              >
                                {t(`Invoice.${productType.toLowerCase()}`)}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell 
                              align="center"
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }}
                            >
                              ${item.price}
                            </StyledTableCell>
                            <StyledTableCell 
                              align="center"
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }}
                            >
                              {item.quantity}
                            </StyledTableCell>
                            <StyledTableCell 
                              align="center"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main
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
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                  >
                    {t('Invoice.noItemsAvailable')}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          <Paper
            sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 3,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.light, 0.05),
              border: `1px dashed ${theme.palette.primary.light}`
            }}
          >
            <Typography 
              variant="h6" 
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
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default Invoice;