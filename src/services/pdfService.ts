import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceData {
  order_id: string;
  date: string;
  user_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  shipping_address: string;
  shipping_carrier: string;
  shipping_mode: string;
  shipping_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  eta_min_days: number;
  eta_max_days: number;
}

export class PDFService {
  static async generateInvoicePDF(invoiceData: InvoiceData, productDetails: { [key: string]: any }): Promise<Blob> {
    const doc = new jsPDF();
    
    // Set up the PDF document
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 30);
    
    // Company details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Amrti Natural Products', 20, 45);
    doc.text('Premium Organic Powders & Kombucha', 20, 52);
    doc.text('Email: info@amrti.com', 20, 59);
    doc.text('Phone: +91-XXXXXXXXXX', 20, 66);
    
    // Invoice details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceData.order_id}`, 20, 87);
    doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 20, 94);
    doc.text(`Payment Method: ${invoiceData.payment_method.toUpperCase()}`, 20, 101);
    doc.text(`Payment Status: ${invoiceData.payment_status.toUpperCase()}`, 20, 108);
    
    // Shipping details
    doc.setFont('helvetica', 'bold');
    doc.text('Shipping Details:', 20, 125);
    doc.setFont('helvetica', 'normal');
    doc.text(`Carrier: ${invoiceData.shipping_carrier}`, 20, 132);
    doc.text(`Mode: ${invoiceData.shipping_mode}`, 20, 139);
    doc.text(`Address: ${invoiceData.shipping_address}`, 20, 146);
    
    // Items table header
    doc.setFont('helvetica', 'bold');
    doc.text('Items:', 20, 165);
    
    // Table headers
    const tableY = 175;
    doc.text('Product', 20, tableY);
    doc.text('Qty', 100, tableY);
    doc.text('Unit Price', 120, tableY);
    doc.text('Total', 160, tableY);
    
    // Draw line under headers
    doc.line(20, tableY + 2, 190, tableY + 2);
    
    // Items
    let currentY = tableY + 10;
    invoiceData.items.forEach((item, index) => {
      const productName = productDetails[item.product_id]?.name || `Product ${item.product_id}`;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(productName, 20, currentY);
      doc.text(item.quantity.toString(), 100, currentY);
      doc.text(`₹${item.unit_price}`, 120, currentY);
      doc.text(`₹${item.line_total}`, 160, currentY);
      
      currentY += 8;
    });
    
    // Totals
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 120, currentY);
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.line_total, 0);
    doc.text(`₹${subtotal.toFixed(2)}`, 160, currentY);
    
    currentY += 8;
    doc.text('Shipping:', 120, currentY);
    doc.text(`₹${invoiceData.shipping_charge.toFixed(2)}`, 160, currentY);
    
    currentY += 8;
    doc.setFontSize(12);
    doc.text('Total Amount:', 120, currentY);
    doc.text(`₹${invoiceData.total_amount.toFixed(2)}`, 160, currentY);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 20, 280);
    doc.text('For any queries, contact us at info@amrti.com', 20, 287);
    
    // Generate blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }
  
  static async downloadInvoice(invoiceData: InvoiceData, productDetails: { [key: string]: any }): Promise<void> {
    try {
      const pdfBlob = await this.generateInvoicePDF(invoiceData, productDetails);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.order_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Send PDF to backend for storage
      await this.sendInvoiceToBackend(invoiceData.order_id, pdfBlob);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }
  
  static async sendInvoiceToBackend(orderId: string, pdfBlob: Blob): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('invoice', pdfBlob, `invoice-${orderId}.pdf`);
      formData.append('order_id', orderId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/v1/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload invoice to backend');
      }
      
      console.log('Invoice uploaded to backend successfully');
    } catch (error) {
      console.error('Error uploading invoice to backend:', error);
      // Don't throw error here as PDF generation was successful
    }
  }
}
