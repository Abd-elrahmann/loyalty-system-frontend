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

const FinancialReports = ({ 
  reportData, 
  reportType, 
  formatAmount,
  i18n 
}) => {
  const { t } = useTranslation();

  if (reportType === 'transactions') {
    return (
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.transactionId')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.CustomerName')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {i18n.language === 'ar' ? t('customer.type') === 'earn' ? 'ربح نقاط' : t('customer.type') === 'redeem' ? 'مستبدل ب نقاط' : t('customer.type') : t('customer.type')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.points')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.currency')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.date')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData) && reportData.map((transaction) => (
              <StyledTableRow key={transaction.id}>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {transaction.id}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? transaction.user?.arName : transaction.user?.enName}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {transaction.points}
                </StyledTableCell>
                <StyledTableCell align="center" style={{ fontSize: i18n.language === 'ar' ? '16px' : '14px', color: transaction.currency?.enCurrency === 'USD' ? '#008000' : transaction.currency?.enCurrency === 'IQD' ? '#0000FF' : 'inherit' }}>
                  {i18n.language === 'ar' ? transaction.currency?.arCurrency : transaction.currency?.enCurrency}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {new Date(transaction.date).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(',','')}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (reportType === 'invoices') {
    return (
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.id')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.CustomerName')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.phone')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.totalPrice')}
              </StyledTableCell>
              {reportData.discount && (
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                  {t('Invoice.discount')}
                </StyledTableCell>
              )}
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.points')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.currency')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('Invoice.date')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData) && reportData.map((invoice) => (
              <StyledTableRow key={invoice.id}>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {invoice.id}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? (invoice.user?.arName || 'Guest') : (invoice.user?.enName || 'Guest')}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {invoice.phone}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {formatAmount(invoice.totalPrice, invoice.currency)}
                </StyledTableCell>
                {reportData.discount && (
                  <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                    {invoice.discount}%
                  </StyledTableCell>
                )}
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {invoice.points}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? 
                    invoice.currency === 'USD' ? 'دولار' : invoice.currency === 'IQD' ? 'دينار' : invoice.currency
                    : invoice.currency}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {new Date(invoice.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(',','')}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (reportType === 'rewards') {
    return (
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('reward.id')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('reward.rewardName')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {i18n.language === 'ar' ? t('reward.type') === 'cafe' ? 'كافيه' : 'مطعم' : t('reward.type') === 'cafe' ? 'cafe' : 'restaurant'}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('reward.points')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('reward.date')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData) && reportData.map((reward) => (
              <StyledTableRow key={reward.id}>
                <StyledTableCell align="center" style={{ fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {reward.id}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? reward.user?.arName : reward.user?.enName}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' 
                    ? reward.type === 'cafe' ? 'كافيه' : 'مطعم'
                    : reward.type === 'cafe' ? 'cafe' : 'restaurant'
                  }
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {reward.points}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {new Date(reward.date).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(',','')}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return null;
};

export default FinancialReports;