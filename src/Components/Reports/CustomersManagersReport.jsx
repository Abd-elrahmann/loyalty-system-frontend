import React from "react";
import {
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { StyledTableRow, StyledTableCell } from '../../Components/Shared/tableLayout';
import { useTranslation } from 'react-i18next';

const CustomersManagersReport = ({ 
  reportData, 
  reportType, 
  i18n 
}) => {
  const { t } = useTranslation();

  if (reportType === 'managers') {
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 650, marginTop: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('manager.ManagerName')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('manager.email')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('manager.phone')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('manager.role')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData) && reportData.map((manager) => (
              <StyledTableRow key={manager.id}>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? manager.arName : manager.enName}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {manager.email}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {manager.phone}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  <span style={{ 
                    fontSize: i18n.language === 'ar' ? '16px' : '14px',
                    color:  manager.role ===  'ADMIN' ? 'green' : 
                           manager.role === 'ACCOUNTANT' ? 'blue' :
                           manager.role === 'CASHIER' ? 'black' : 'black'
                  }}>
                    {i18n.language === 'ar' ? 
                      manager.role === 'ADMIN' ? 'مدير عام' :
                      manager.role === 'ACCOUNTANT' ? 'محاسب' :
                      manager.role === 'CASHIER' ? 'كاشير' :
                      manager.role
                      : manager.role}
                  </span>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (reportType === 'customers') {
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 650, marginTop: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.CustomerName')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.email')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.phone')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.points')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.transactions')}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                {t('customer.rewards')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reportData) && reportData.map((customer) => (
              <StyledTableRow key={customer.id}>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? customer.arName : customer.enName}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {customer.email}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {customer.phone}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {customer.points}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {customer._count?.transactions || 0}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {customer._count?.myRewards || 0}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (reportType === 'individual-customer') {
    return (
      <div>
        <Divider orientation="left" dashed>
          {t('customer.information')}
        </Divider>
        <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                  {t('customer.CustomerName')}
                </StyledTableCell>
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                  {t('customer.email')}
                </StyledTableCell>
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                  {t('customer.phone')}
                </StyledTableCell>
                <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                  {t('customer.points')}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {i18n.language === 'ar' ? reportData.arName : reportData.enName}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {reportData.email}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {reportData.phone}
                </StyledTableCell>
                <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                  {reportData.points}
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {reportData.transactions && reportData.transactions.length > 0 && (
          <>
            <Divider orientation="left" dashed>
              {t('customer.transactions')}
            </Divider>
            <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                      <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {t('customer.transactionId')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {i18n.language === 'ar' ? t('customer.type') === 'cafe' ? 'كافيه' : 'مطعم' : t('customer.type') === 'cafe' ? 'cafe' : 'restaurant'}
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
                  {reportData.transactions.map((transaction) => (
                    <StyledTableRow key={transaction.id}>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                        {transaction.id}
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                        {transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type}
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                        {transaction.points}
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
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
          </>
        )}

        {reportData.myRewards && reportData.myRewards.length > 0 && (
          <>
            <Divider orientation="left" dashed>
              {t('customer.rewards')}
            </Divider>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {t('customer.rewardId')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {t('customer.type')}
                    </StyledTableCell>
                      <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {t('customer.points')}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ backgroundColor: '#0074BA', color: 'white' }}>
                      {t('customer.date')}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.myRewards.map((reward) => (
                    <StyledTableRow key={reward.id}>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                        {reward.id}
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{fontSize: i18n.language === 'ar' ? '16px' : '14px'}}>
                        {reward.type}
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
          </>
        )}
      </div>
    );
  }

  return null;
};

export default CustomersManagersReport;