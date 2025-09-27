import * as XLSX from 'xlsx';
import i18n from '../Config/translationConfig';
import dayjs from 'dayjs';
import globalCurrencyManager from '../Config/globalCurrencyManager';
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16), 
    parseInt(result[3], 16)
  ] : [128, 0, 128]; // Default to #800080 (purple)
};

const headerColor = hexToRgb('#800080');


// Translation helper function
const t = (key) => {
  return i18n.t(key);
};

// Get current language direction
const isRTL = () => i18n.language === 'ar';

// Get appropriate font settings
const getFontSettings = () => {
  return isRTL() ? {
    font: 'Amiri',
    align: 'right'
  } : {
    font: 'helvetica',
    align: 'left'
  };
};

export const exportManagersToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.managers'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('manager.managerName'),
      t('manager.email'), 
      t('manager.phone'),
      t('manager.role')
    ];
    
    const rows = data.map(manager => [
      isRTL() ? manager.arName : manager.enName,
      manager.email,
      manager.phone,
      isRTL() ? 
        manager.role === 'ADMIN' ? 'مدير عام' :
        manager.role === 'ACCOUNTANT' ? 'محاسب' :
        manager.role === 'CASHIER' ? 'كاشير' :
        manager.role
        : manager.role
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: headerColor,
        textColor: 255,
        font: fontSettings.font,
        fontStyle: 'bold',
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: fontSettings.align,
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-المديرين.pdf' : 'managers-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportCustomersToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.customers'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('customer.customerName'),
      t('customer.email'),
      t('customer.phone'),
      t('customer.points'),
      t('customer.transactions'),
      t('customer.rewards')
    ];
    
    const rows = data.map(customer => [
      isRTL() ? customer.arName : customer.enName,
      customer.email,
      customer.phone,
      customer.points,
      customer._count?.transactions || 0,
      customer._count?.myRewards || 0
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-العملاء.pdf' : 'customers-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportIndividualCustomerToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.individualCustomer'), doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    const customerLabel = isRTL() ? `العميل: ${data.arName}` : `Customer: ${data.enName || data.arName}`;
    doc.text(customerLabel, doc.internal.pageSize.width / 2, 30, { align: 'center' });

    let startY = 40;

    // Customer Info
    const infoHeaders = [
      t('customer.customerName'),
      t('customer.email'),
      t('customer.phone'),
      t('customer.points')
    ];
    const infoRows = [[
      isRTL() ? data.arName : data.enName,
      data.email,
      data.phone,
      data.points
    ]];

    autoTableModule.default(doc, {
      head: [infoHeaders],
      body: infoRows,
      startY: startY,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    // Transactions
    if (data.transactions && data.transactions.length > 0) {
      startY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text(t('customer.transactions'), doc.internal.pageSize.width / 2, startY, { align: 'center' });
      startY += 10;

      const transHeaders = [
        t('customer.transactionId'),
        t('customer.type'),
        t('customer.points'),
        t('customer.currency'),
        t('customer.date')
      ];
      const transRows = data.transactions.map(transaction => [
        transaction.id,
        transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type,
        transaction.points,
        isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,
        new Date(transaction.date).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',','')
      ]);

      autoTableModule.default(doc, {
        head: [transHeaders],
        body: transRows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: '#800080',
          textColor: 'white',
          font: fontSettings.font,
          fontStyle: 'bold',
          fontSize: isRTL() ? 16 : 14
        },
        bodyStyles: {
          font: fontSettings.font,
          fontSize: isRTL() ? 16 : 14
        },
        styles: {
          halign: 'center',
          font: fontSettings.font
        }
      });
    }

    // Rewards
    if (data.myRewards && data.myRewards.length > 0) {
      startY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text(t('customer.rewards'), doc.internal.pageSize.width / 2, startY, { align: 'center' });
      startY += 10;

      const rewardHeaders = [
        t('customer.rewardId'),
        t('customer.type'),
        t('customer.points'),
        t('customer.date')
      ];
      const rewardRows = data.myRewards.map(reward => [
        reward.id,
        isRTL() ? reward.type === 'cafe' ? 'كافيه' : 'مطعم' : reward.type === 'cafe' ? 'cafe' : 'restaurant',
        reward.points,
        new Date(reward.date).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',','')
      ]);

      autoTableModule.default(doc, {
        head: [rewardHeaders],
        body: rewardRows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: '#800080',
          textColor: 'white',
          font: fontSettings.font,
          fontStyle: 'bold',
          fontSize: isRTL() ? 16 : 14
        },
        bodyStyles: {
          font: fontSettings.font,
          fontSize: isRTL() ? 16 : 14
        },
        styles: {
          halign: 'center',
          font: fontSettings.font
        }
      });
    }

    const customerName = data.arName || data.enName || 'customer';
    const filename = isRTL() 
      ? `تقرير-العميل-${customerName.replace(/\s+/g, '-')}.pdf`
      : `individual-customer-${customerName.replace(/\s+/g, '-')}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportTransactionsToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.transactions'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('customer.transactionId'),
      t('customer.customerName'),
      t('customer.type'),
      t('customer.points'),
      t('customer.currency'),
      t('customer.date')
    ];
    const rows = data.map(transaction => [
      transaction.id,
      isRTL() ? transaction.user?.arName : transaction.user?.enName,
      transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type,
      transaction.points,
      isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,
      new Date(transaction.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',','')
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-المعاملات.pdf' : 'transactions-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportProductsToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.products'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('product.id'),
      t('product.ProductName'),
      t('product.price'),
      t('product.points'),
      t('product.type'),
      t('product.category')
    ];
    const rows = data.map(product => [
      product.id,
      isRTL() ? product.arName : product.enName,
      product.price ? globalCurrencyManager.formatAmount(product.price, product.currency) : '-',
      product.points,
      isRTL() ? product.type === 'cafe' ? 'كافيه' : 'مطعم' : product.type === 'cafe' ? 'cafe' : 'restaurant',
      isRTL() ? product.category?.arName : product.category?.enName
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-المنتجات.pdf' : 'products-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportRewardsToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.rewards'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('reward.id'),
      t('reward.rewardName'),
      t('reward.type'),
      t('reward.points'),
      t('reward.date')
    ];
    const rows = data.map(reward => [
      reward.id,
      isRTL() ? reward.user?.arName : reward.user?.enName,
      isRTL() ? reward.type === 'cafe' ? 'كافيه' : 'مطعم' : reward.type === 'cafe' ? 'cafe' : 'restaurant',
      reward.points,
      new Date(reward.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',','')
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-المكافآت.pdf' : 'rewards-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportInvoicesToPDF = async (data) => {
  try {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDFModule.default();
    const fontSettings = getFontSettings();

    // Add Arabic fonts if RTL
    if (isRTL()) {
      doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    }
    doc.setFont(fontSettings.font);

    doc.setFontSize(18);
    doc.text(t('report.invoices'), doc.internal.pageSize.width / 2, 20, { align: 'center' });

    const headers = [
      t('Invoice.id'),
      t('Invoice.CustomerName'),
      t('Invoice.phone'),
      t('Invoice.totalPrice'),
      t('Invoice.discount'),
      t('Invoice.points'),
      t('Invoice.currency'),
      t('Invoice.date')
    ];
    const rows = data.map(invoice => [
      invoice.id,
      isRTL() ? invoice.user?.arName || 'Guest' : invoice.user?.enName || 'Guest',
      invoice.phone,
      globalCurrencyManager.formatAmount(invoice.totalPrice, invoice.currency),
      `${invoice.discount}%`,
      invoice.points,
      isRTL() ? invoice.currency === 'USD' ? 'دولار' : 'دينار' : invoice.currency,
      new Date(invoice.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',','')
    ]);

    autoTableModule.default(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: '#800080',
        textColor: 'white',
        font: fontSettings.font,
        fontStyle: 'bold',
        fontSize: isRTL() ? 16 : 14
      },
      bodyStyles: {
        font: fontSettings.font,
        fontSize: isRTL() ? 16 : 14
      },
      styles: {
        halign: 'center',
        font: fontSettings.font
      }
    });

    const filename = isRTL() ? 'تقرير-الفواتير.pdf' : 'invoices-report.pdf';
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportToExcel = (data, reportType) => {
  let worksheetData = [];
  let filename = '';

  const createStyledHeader = (headers) => {
    return headers.map(header => ({
      v: header,
      s: {
        fill: {
          patternType: 'solid',
          fgColor: { rgb: '800080' }
        },
        font: {
          color: { rgb: 'FFFFFF' },
          bold: true
        },
        alignment: {
          horizontal: isRTL() ? 'right' : 'left',
          direction: isRTL() ? 'rtl' : 'ltr'
        }
      }
    }));
  };

  switch (reportType) {
    case 'managers':
      filename = isRTL() ? 'تقرير-المديرين.xlsx' : 'managers-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('manager.managerName'),
          t('manager.email'),
          t('manager.phone'),
          t('manager.role'),
          t('manager.createdAt')
        ]),
        ...data.map(manager => [
          manager.managerName,
          manager.email,
          manager.phone,
          manager.role,
          manager.createdAt ? dayjs(manager.createdAt).format("DD/MM/YYYY hh:mm A") : ''
        ])
      ];
      break;

    case 'customers':
      filename = isRTL() ? 'تقرير-العملاء.xlsx' : 'customers-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('customer.customerName'),
          t('customer.email'),
          t('customer.phone'),
          t('customer.points'),
          t('customer.transactions'),
          t('customer.rewards')
        ]),
        ...data.map(customer => [
          customer.customerName,
          customer.email,
          customer.phone,
          customer.points,
          customer._count?.transactions || 0,
          customer._count?.myRewards || 0
        ])
      ];
      break;

    case 'individual-customer': {
      const customerName = isRTL() ? data.arName : data.enName || 'customer';
      filename = isRTL() 
        ? `تقرير-العميل-${customerName.replace(/\s+/g, '-')}.xlsx`
        : `individual-customer-${customerName.replace(/\s+/g, '-')}.xlsx`;

      // Customer Info
      worksheetData = [
        createStyledHeader([
          t('customer.customerName'),
          t('customer.email'),
          t('customer.phone'),
          t('customer.points')
        ]),
        [
          isRTL() ? data.arName : data.enName,
          data.email,
          data.phone,
          data.points
        ]
      ];

      // Add transactions if they exist
      if (data.transactions && data.transactions.length > 0) {
        worksheetData.push(
          [], // Empty row for spacing
          [{ v: t('customer.transactions'), s: { font: { bold: true } } }],
          createStyledHeader([
            t('customer.transactionId'),
            isRTL() ? t('customer.type') === 'earn' ? 'ربح نقاط' : t('customer.type') === 'redeem' ? 'مستبدل ب نقاط' : t('customer.type') : t('customer.type'),
            t('customer.points'),
            t('customer.currency'),
            t('customer.date')
          ]),
          ...data.transactions.map(transaction => [
            transaction.id,
            transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type,
            transaction.points,
            isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,
            dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")
          ])
        );
      }

      // Add rewards if they exist
      if (data.myRewards && data.myRewards.length > 0) {
        worksheetData.push(
          [], // Empty row for spacing
          [{ v: t('customer.rewards'), s: { font: { bold: true } } }],
          createStyledHeader([
            t('customer.rewardId'),
            isRTL() ? t('customer.type') === 'cafe' ? 'كافيه' : t('customer.type') === 'restaurant' ? 'مطعم' : t('customer.type') : t('customer.type'),
            t('customer.points'),
            t('customer.date')
          ]),
          ...data.myRewards.map(reward => [
            reward.id,
            isRTL() ? reward.type === 'cafe' ? 'كافيه' : 'مطعم' : reward.type === 'cafe' ? 'cafe' : 'restaurant',
            reward.points,
            dayjs(reward.date).format("DD/MM/YYYY hh:mm A"),
          ])
        );
      }
      break;
    }

    case 'transactions':
      filename = isRTL() ? 'تقرير-المعاملات.xlsx' : 'transactions-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('customer.transactionId'),
          t('customer.customerName'),
          t('customer.type'),
          t('customer.points'),
          t('customer.currency'),
          t('customer.date')
        ]),
        ...data.map(transaction => [
          transaction.id,
          isRTL() ? transaction.user?.arName : transaction.user?.enName,
          transaction.type === 'earn' ? t('Transactions.earn') : transaction.type === 'redeem' ? t('Transactions.redeem') : transaction.type,
          transaction.points,
          isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,
          dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")  
        ])
      ];
      break;

    case 'products':
      filename = isRTL() ? 'تقرير-المنتجات.xlsx' : 'products-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('product.id'),
          t('product.ProductName'),
          t('product.price'),
          t('product.points'),
          t('product.type'),
          t('product.category')
        ]),
        ...data.map(product => [
          product.id,
          isRTL() ? product.arName : product.enName || 'product',
          globalCurrencyManager.formatAmount(product.price, product.currency),
          product.points,
          product.type,
          isRTL() ? product.category?.arName : product.category?.enName
        ])
      ];
      break;

    case 'rewards':
      filename = isRTL() ? 'تقرير-المكافآت.xlsx' : 'rewards-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('reward.id'),
          t('reward.rewardName'),
          t('reward.type'),
          t('reward.points'),
          t('reward.date')
        ]),
        ...data.map(reward => [
          reward.id,
          isRTL() ? reward.user?.arName : reward.user?.enName,
          isRTL() ? reward.type === 'cafe' ? 'كافيه' : 'مطعم' : reward.type === 'cafe' ? 'cafe' : 'restaurant',
          reward.points,
          dayjs(reward.date).format("DD/MM/YYYY hh:mm A"),
        ])
      ];
      break;

    case 'invoices':
      filename = isRTL() ? 'تقرير-الفواتير.xlsx' : 'invoices-report.xlsx';
      worksheetData = [
        createStyledHeader([
          t('Invoice.id'),
          t('Invoice.CustomerName'),
          t('Invoice.phone'),
          t('Invoice.totalPrice'),
          t('Invoice.discount'),
          t('Invoice.points'),
          t('Invoice.currency'),
          t('Invoice.date')
        ]),
        ...data.map(invoice => [
          invoice.id,
          isRTL() ? invoice.user?.arName || 'Guest' : invoice.user?.enName || 'Guest',
          invoice.phone,
          globalCurrencyManager.formatAmount(invoice.totalPrice, invoice.currency),
          invoice.discount,
          invoice.points,
          isRTL() ? invoice.currency==='USD' ? 'دولار' : 'دينار' : invoice.currency,
          dayjs(invoice.createdAt).format("DD/MM/YYYY hh:mm A")
        ])
      ];
      break;

    default:
      filename = isRTL() ? 'تقرير.xlsx' : 'report.xlsx';
      worksheetData = data;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  if (!worksheet['!fullCells']) worksheet['!fullCells'] = [];
  for (const cell in worksheet) {
    if (cell[0] === '!') continue;
    if (!worksheet[cell].s) worksheet[cell].s = {};
    if (!worksheet[cell].s.alignment) worksheet[cell].s.alignment = {};
    worksheet[cell].s.alignment.horizontal = isRTL() ? 'right' : 'left';
  }

  const sheetName = isRTL() ? 'التقرير' : 'Report';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};