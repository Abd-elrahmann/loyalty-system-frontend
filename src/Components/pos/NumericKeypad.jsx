import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NumericKeypad = ({ onNumberClick, onModeChange, selectedMode, selectedItemId, setValue, onPhoneInput }) => {
  const { t } = useTranslation();

  const handleButtonClick = (value) => {
    if (value === t("PointOfSale.quantity") || value === t("PointOfSale.price") || value === t("PointOfSale.phone")) {
      if (value === t("PointOfSale.quantity")) {
        onModeChange('Qty');
      } else if (value === t("PointOfSale.price")) {
        onModeChange('Price');
      } else if (value === t("PointOfSale.phone")) {
        onModeChange('Phone');
      }
      setValue('');
    } else if (value === t("PointOfSale.back")) {
      setValue(prev => prev.slice(0, -1));
      if (selectedMode === 'Phone') {
        onPhoneInput('back');
      } else if (selectedItemId) {
        onNumberClick(value);
      }
    } else if (value === '.' || value === '+' || value === '-' || value === '*' || value === '/') {
      if (selectedItemId && selectedMode !== 'Phone') {
        onNumberClick(value);
      }
    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
      if (selectedMode === 'Phone') {
        onPhoneInput(value);
      } else if (selectedItemId) {
        onNumberClick(value);
      }
    } else if (!selectedItemId && selectedMode !== 'Phone') {
      setValue('');
    }
  };

  const buttons = [
    ['1', '2', '3', '+'],
    ['4', '5', '6', '-'],
    ['7', '8', '9', '*'],
    ['.', '0', '/', t("PointOfSale.back")],
    [t("PointOfSale.quantity"), t("PointOfSale.price"), t("PointOfSale.phone")]
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        mt: 2
      }}
    >
      {buttons.map((row, rowIndex) =>
        row.map((button, colIndex) => (
          <Button
            key={`${rowIndex}-${colIndex}`}
            variant={button === selectedMode ? 'contained' : 'outlined'}
            onClick={() => handleButtonClick(button)}
            sx={{
              height: '48px',
              backgroundColor: button === selectedMode ? 'primary.main' : '#fff',
              color: button === selectedMode ? '#fff' : '#333',
              '&:hover': {
                backgroundColor: button === selectedMode ? '#600060' : '#f0f0f0'
              }
            }}
          >
            <Typography variant="button">{button}</Typography>
          </Button>
        ))
      )}
    </Box>
  );
};

export default NumericKeypad;