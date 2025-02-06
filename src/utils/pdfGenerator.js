import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice, companySettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  // Add company logo
  if (companySettings.logo) {
    doc.addImage(companySettings.logo, 'JPEG', margin, margin, 50, 20);
  }

  // Company Details
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'Company Name', margin + 60, margin + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const companyDetails = [
    companySettings.address,
    `Phone: ${companySettings.phone}`,
    `Email: ${companySettings.email}`,
  ].filter(Boolean);
  
  companyDetails.forEach((detail, index) => {
    doc.text(detail, margin + 60, margin + 15 + (index * 5));
  });

  // Invoice Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 40, margin + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin - 40, margin + 20);
  doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, pageWidth - margin - 40, margin + 25);

  // Customer Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, margin + 45);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const customerDetails = [
    invoice.customerName,
    invoice.customerAddress,
    `Phone: ${invoice.customerPhone}`,
    `Email: ${invoice.customerEmail}`,
    `vehicle Number: ${invoice.vehicleNumber}`,
  ].filter(Boolean);
  
  customerDetails.forEach((detail, index) => {
    doc.text(detail, margin, margin + 55 + (index * 5));
  });

  

  // Service Items Table
  const tableStartY = margin + 85;
  doc.autoTable({
    startY: tableStartY,
    head: [[ 'Service', 'Qty', 'Price', 'Amount']],
    body: invoice.items.map(item => [
      item.service,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `₹${(item.quantity * item.price).toFixed(2)}`
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [69, 69, 69] },
    margin: { left: margin, right: margin },
  });

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoice.tax) / 100;
  const discountAmount = (subtotal * invoice.discount) / 100;
  const total = subtotal + taxAmount - discountAmount;

  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  
  doc.text('Subtotal:', pageWidth - margin - 80, finalY);
  doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin - 20, finalY, { align: 'right' });
  
  if (invoice.tax > 0) {
    doc.text(`Tax (${invoice.tax}%):`, pageWidth - margin - 80, finalY + 5);
    doc.text(`₹${taxAmount.toFixed(2)}`, pageWidth - margin - 20, finalY + 5, { align: 'right' });
  }
  
  if (invoice.discount > 0) {
    doc.text(`Discount (${invoice.discount}%):`, pageWidth - margin - 80, finalY + 10);
    doc.text(`₹${discountAmount.toFixed(2)}`, pageWidth - margin - 20, finalY + 10, { align: 'right' });
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - margin - 80, finalY + 15);
  doc.text(`₹${total.toFixed(2)}`, pageWidth - margin - 20, finalY + 15, { align: 'right' });

  // Add QR Code if exists
  if (companySettings.qrCode) {
    doc.addImage(companySettings.qrCode, 'PNG', margin, finalY - 5, 30, 30);
  }

  // Add Terms and Conditions
  if (companySettings.termsAndConditions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms and Conditions:', margin, pageHeight - margin - 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(companySettings.termsAndConditions, margin, pageHeight - margin - 25, {
      maxWidth: pageWidth - (2 * margin),
    });
  }

  return doc;
};
