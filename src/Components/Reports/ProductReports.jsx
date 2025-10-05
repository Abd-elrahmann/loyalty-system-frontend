import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { StyledTableRow, StyledTableCell } from '../../Components/Shared/tableLayout';
import { useTranslation } from 'react-i18next';

const ProductReports = ({ 
  reportData, 
  formatAmount,
  i18n 
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.id')}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.ProductName')}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.price')}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.points')}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.type')}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
              {t('product.category')}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(reportData) && reportData.map((product) => (
            <StyledTableRow key={product.id}>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {product.id}
              </StyledTableCell>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {i18n.language === 'ar' ? product.arName : product.enName}
              </StyledTableCell>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {product.price ? formatAmount(product.price, product.currency) : '-'}
              </StyledTableCell>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {product.points}
              </StyledTableCell>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {i18n.language === 'ar' ? product.type === 'cafe' ? 'كافيه' : 'مطعم' : product.type === 'cafe' ? 'cafe' : 'restaurant'}
              </StyledTableCell>
              <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                {i18n.language === 'ar' ? product.category?.arName : product.category?.enName}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductReports;