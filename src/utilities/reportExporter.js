import * as XLSX from 'xlsx';
import i18n from '../Config/translationConfig';
import dayjs from 'dayjs';
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16), 
    parseInt(result[3], 16)
  ] : [128, 0, 128]; // Default to #800080 (purple)
};

const headerColor = hexToRgb('#800080');

const formatTransactionType = (type) => {
  switch (type) {
    case 'earn': return i18n.language === 'ar' ? 'كسب نقاط' : 'Earn Points';
    case 'redeem': return i18n.language === 'ar' ? 'استبدال نقاط' : 'Redeem Points';
    default: return type;
  }
};

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
      isRTL() ? t('manager.arName') : t('manager.enName'),
      t('manager.email'),
      t('manager.phone'),
      t('manager.role'),
      t('manager.createdAt')
    ];
    
    const rows = data.map(manager => [
      isRTL() ? manager.arName : manager.enName,
      manager.email,
      manager.phone,
      manager.role,
      manager.createdAt ? dayjs(manager.createdAt).format("DD/MM/YYYY hh:mm A") : ''
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
        font: fontSettings.font
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
      isRTL() ? t('customer.arName') : t('customer.enName'),
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
        fillColor: headerColor,
        textColor: 255,
        font: fontSettings.font,
        fontStyle: 'bold',
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
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
      isRTL() ? t('customer.arName') : t('customer.enName'),
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
        fillColor: headerColor,
        textColor: 255,
        font: fontSettings.font,
        fontStyle: 'bold'
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
        font: fontSettings.font
      }
    });

    // Transactions
    if (data.transactions && data.transactions.length > 0) {
      startY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text(t('customer.transactions'), 20, startY, { align: 'center' });
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
        formatTransactionType(transaction.type),
        transaction.points,
        isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,  
        dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")
      ]);

      autoTableModule.default(doc, {
        head: [transHeaders],
        body: transRows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: headerColor,
          textColor: 255,
          font: fontSettings.font,
          fontStyle: 'bold'
        },
        bodyStyles: {
          font: fontSettings.font
        },
        styles: {
          halign: fontSettings.align,
          font: fontSettings.font
        }
      });
    }

    // Rewards
    if (data.myRewards && data.myRewards.length > 0) {
      startY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text(t('customer.rewards'), 20, startY, { align: 'center' });
      startY += 10;

      const rewardHeaders = [
        t('customer.rewardId'),
        t('customer.type'),
        t('customer.points'),
        t('customer.status'),
        t('customer.date'),
      ];
      const rewardRows = data.myRewards.map(reward => [
        reward.id,
        reward.type,
        reward.points,
        reward.status,
        dayjs(reward.date).format("DD/MM/YYYY hh:mm A"),
      ]);

      autoTableModule.default(doc, {
        head: [rewardHeaders],
        body: rewardRows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: headerColor,
          textColor: 255,
          font: fontSettings.font,
          fontStyle: 'bold'
        },
        bodyStyles: {
          font: fontSettings.font
        },
        styles: {
          halign: fontSettings.align,
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
      isRTL() ? t('customer.arName') : t('customer.enName'),
      t('customer.type'),
      t('customer.points'),
      t('customer.currency'),
      t('customer.date')
    ];
    const rows = data.map(transaction => [
      transaction.id,
      isRTL() ? transaction.user?.arName : transaction.user?.enName,
      formatTransactionType(transaction.type),
      transaction.points,
      isRTL() ? transaction.currency?.arCurrency : transaction.currency?.enCurrency,
      dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")
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
        fontStyle: 'bold'
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
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
      isRTL() ? t('product.arName') : t('product.enName'),
      t('product.price'),
      t('product.points'),
      t('product.type'),
      t('product.category')
    ];
    const rows = data.map(product => [
      product.id,
      isRTL() ? product.arName : product.enName,
      product.price,
      product.points,
      product.type,
      isRTL() ? product.category?.arName : product.category?.enName
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
        fontStyle: 'bold'
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
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
      isRTL() ? t('reward.arName') : t('reward.enName'),
      t('reward.type'),
      t('reward.points'),
      t('reward.date')
    ];
    const rows = data.map(reward => [
      reward.id,
      isRTL() ? reward.user?.arName : reward.user?.enName,
      reward.type,
      reward.points,
      dayjs(reward.date).format("DD/MM/YYYY hh:mm A"),
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
        fontStyle: 'bold'
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
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
      isRTL() ? t('Invoice.arName') : t('Invoice.enName'),
      t('Invoice.phone'),
      t('Invoice.totalPrice'),
      t('Invoice.discount'),
      t('Invoice.points'),
      t('Invoice.currency'),
      t('Invoice.date')
    ];
    const rows = data.map(invoice => [
      invoice.id,
      isRTL() ? invoice.user?.arName : invoice.user?.enName||'Guest',
      invoice.phone,
      invoice.totalPrice,
      invoice.discount,
      invoice.points,
      isRTL() ? invoice.currency==='USD' ? 'دولار' : 'دينار' : invoice.currency,
      dayjs(invoice.createdAt).format("DD/MM/YYYY hh:mm A")
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
        fontStyle: 'bold'
      },
      bodyStyles: {
        font: fontSettings.font
      },
      styles: {
        halign: fontSettings.align,
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
          isRTL() ? t('manager.arName') : t('manager.enName'),
          t('manager.email'),
          t('manager.phone'),
          t('manager.role'),
          t('manager.createdAt')
        ]),
        ...data.map(manager => [
        isRTL() ? manager.arName : manager.enName,
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
          isRTL() ? t('customer.arName') : t('customer.enName'),
          t('customer.email'),
          t('customer.phone'),
          t('customer.points'),
          t('customer.transactions'),
          t('customer.rewards')
        ]),
        ...data.map(customer => [
          isRTL() ? customer.arName : customer.enName,
          customer.email,
          customer.phone,
          customer.points,
          customer._count?.transactions || 0,
          customer._count?.myRewards || 0
        ])
      ];
      break;

    case 'individual-customer': {
      const customerName = data.arName || data.enName || 'customer';
      filename = isRTL() 
        ? `تقرير-العميل-${customerName.replace(/\s+/g, '-')}.xlsx`
        : `individual-customer-${customerName.replace(/\s+/g, '-')}.xlsx`;

      // Customer Info
      worksheetData = [
        createStyledHeader([
          isRTL() ? t('customer.arName') : t('customer.enName'),
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
            t('customer.type'),
            t('customer.points'),
            t('customer.currency'),
            t('customer.date')
          ]),
          ...data.transactions.map(transaction => [
            transaction.id,
            formatTransactionType(transaction.type),
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
            t('customer.type'),
            t('customer.points'),
            t('customer.date')
          ]),
          ...data.myRewards.map(reward => [
            reward.id,
            reward.type,
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
          isRTL() ? t('customer.arName') : t('customer.enName'),
          t('customer.type'),
          t('customer.points'),
          t('customer.currency'),
          t('customer.date')
        ]),
        ...data.map(transaction => [
          transaction.id,
          isRTL() ? transaction.user?.arName : transaction.user?.enName,
          formatTransactionType(transaction.type),
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
          isRTL() ? t('product.arName') : t('product.enName'),
          t('product.price'),
          t('product.points'),
          t('product.type'),
          t('product.category')
        ]),
        ...data.map(product => [
          product.id,
          isRTL() ? product.arName : product.enName,
          product.price,
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
          isRTL() ? t('reward.arName') : t('reward.enName'),
          t('reward.type'),
          t('reward.points'),
          t('reward.date')
        ]),
        ...data.map(reward => [
          reward.id,
          isRTL() ? reward.user?.arName : reward.user?.enName,
          reward.type,
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
          isRTL() ? t('Invoice.arName') : t('Invoice.enName'),
          t('Invoice.phone'),
          t('Invoice.totalPrice'),
          t('Invoice.discount'),
          t('Invoice.points'),
          t('Invoice.currency'),
          t('Invoice.date')
        ]),
        ...data.map(invoice => [
          invoice.id,
          isRTL() ? invoice.user?.arName : invoice.user?.enName||'Guest',
          invoice.phone,
          invoice.totalPrice,
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