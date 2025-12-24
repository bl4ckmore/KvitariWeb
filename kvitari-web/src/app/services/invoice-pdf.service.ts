// src/app/services/invoice-pdf.service.ts
// Install: npm install jspdf jspdf-autotable

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  id: string;
  amount: number;
  isPaid: boolean;
  createdAt: Date | string;
  invoiceNumber?: string;
  dueDate?: Date | string;
  
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    logo?: string;
  };
  
  customer?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  notes?: string;
  taxRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {

  constructor() { }

  generateInvoicePdf(invoice: InvoiceData): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Clean, minimal color scheme
    const black: [number, number, number] = [0, 0, 0];
    const darkGray: [number, number, number] = [102, 102, 102];
    const lightGray: [number, number, number] = [229, 229, 229];
    const bgGray: [number, number, number] = [248, 249, 250];
    const green: [number, number, number] = [16, 185, 129];
    const orange: [number, number, number] = [245, 158, 11];

    let yPosition = 25;

    // ========== HEADER SECTION ==========
    
    // Company Name - Bold Black
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...black);
    pdf.text(invoice.company?.name || 'Kvitari.ge', 20, yPosition);

    // INVOICE Label - Right Side
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...black);
    pdf.text('INVOICE', pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 10;

    // Company Details - Left
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkGray);
    
    if (invoice.company?.address) {
      pdf.text(invoice.company.address, 20, yPosition);
      yPosition += 4;
    }
    if (invoice.company?.phone) {
      pdf.text(invoice.company.phone, 20, yPosition);
      yPosition += 4;
    }
    if (invoice.company?.email) {
      pdf.text(invoice.company.email, 20, yPosition);
      yPosition += 4;
    }
    if (invoice.company?.taxId) {
      pdf.text(`Tax ID: ${invoice.company.taxId}`, 20, yPosition);
      yPosition += 4;
    }

    // Invoice Number & Date - Right
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice.id.substring(0, 8).toUpperCase()}`;
    let rightY = 35;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkGray);
    pdf.text(invoiceNum, pageWidth - 20, rightY, { align: 'right' });
    rightY += 5;
    pdf.text(this.formatDate(invoice.createdAt), pageWidth - 20, rightY, { align: 'right' });
    
    // Status Badge
    rightY += 7;
    const statusText = invoice.isPaid ? 'PAID' : 'PENDING';
    const statusColor = invoice.isPaid ? green : orange;
    
    pdf.setFillColor(...statusColor);
    pdf.roundedRect(pageWidth - 35, rightY - 4, 15, 6, 1, 1, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(statusText, pageWidth - 27.5, rightY, { align: 'center' });

    yPosition = Math.max(yPosition, rightY + 10);

    // Divider Line
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 12;

    // ========== BILL TO SECTION ==========
    
    if (invoice.customer) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...black);
      pdf.text('BILL TO', 20, yPosition);
      
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...darkGray);
      
      pdf.text(invoice.customer.name, 20, yPosition);
      yPosition += 4;
      
      if (invoice.customer.address) {
        pdf.text(invoice.customer.address, 20, yPosition);
        yPosition += 4;
      }
      if (invoice.customer.phone) {
        pdf.text(invoice.customer.phone, 20, yPosition);
        yPosition += 4;
      }
      if (invoice.customer.email) {
        pdf.text(invoice.customer.email, 20, yPosition);
        yPosition += 4;
      }
      
      yPosition += 8;
    }

    // ========== LINE ITEMS OR SIMPLE AMOUNT ==========
    
    if (invoice.items && invoice.items.length > 0) {
      // Table with line items
      const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = invoice.taxRate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      autoTable(pdf, {
        startY: yPosition,
        head: [['DESCRIPTION', 'QTY', 'PRICE', 'AMOUNT']],
        body: invoice.items.map(item => [
          item.description,
          item.quantity.toString(),
          `GEL ${item.unitPrice.toFixed(2)}`,
          `GEL ${item.total.toFixed(2)}`
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: black,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: { top: 3, bottom: 3, left: 0, right: 0 },
          lineWidth: 0,
          lineColor: lightGray
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray,
          cellPadding: { top: 5, bottom: 5, left: 0, right: 0 }
        },
        columnStyles: {
          0: { cellWidth: 90, halign: 'left' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: function(data) {
          // Add border after header
          if (data.cursor) {
            pdf.setDrawColor(...lightGray);
            pdf.setLineWidth(0.5);
            pdf.line(20, data.cursor.y, pageWidth - 20, data.cursor.y);
          }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      // Totals Section
      const totalsX = pageWidth - 75;
      const totalsWidth = 55;
      
      // Subtotal
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...darkGray);
      pdf.text('Subtotal', totalsX, yPosition);
      pdf.text(`GEL ${subtotal.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      
      // Tax
      if (taxRate > 0) {
        yPosition += 6;
        pdf.text(`Tax (${taxRate}%)`, totalsX, yPosition);
        pdf.text(`GEL ${taxAmount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      }
      
      // Divider
      yPosition += 3;
      pdf.setDrawColor(...lightGray);
      pdf.line(totalsX, yPosition, pageWidth - 20, yPosition);
      yPosition += 6;
      
      // Total
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...black);
      pdf.text('Total', totalsX, yPosition);
      pdf.text(`GEL ${total.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      
    } else {
      // Simple Amount Display
      yPosition += 10;
      
      // Clean box for amount
      pdf.setFillColor(...bgGray);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 30, 2, 2, 'F');
      
      yPosition += 12;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkGray);
      pdf.text('TOTAL AMOUNT', 30, yPosition);
      
      yPosition += 10;
      
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...black);
      const amountText = `GEL ${invoice.amount.toFixed(2)}`;
      pdf.text(amountText, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
    }

    // ========== PAYMENT INFO ==========
    
    if (!invoice.isPaid) {
      yPosition += 15;
      
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 20, 2, 2, 'FD');
      
      yPosition += 7;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...black);
      pdf.text('PAYMENT METHODS', 25, yPosition);
      
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...darkGray);
      pdf.text('• Bank of Georgia (BOG)', 25, yPosition);
      yPosition += 4;
      pdf.text('• TBC Bank', 25, yPosition);
      
      yPosition += 12;
    }

    // ========== NOTES ==========
    
    if (invoice.notes) {
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...black);
      pdf.text('NOTES', 20, yPosition);
      
      yPosition += 6;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...darkGray);
      
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40);
      pdf.text(notesLines, 20, yPosition);
    }

    // ========== FOOTER ==========
    
    const footerY = pageHeight - 20;
    
    // Top border
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkGray);
    
    pdf.text('Generated by Kvitari.ge', 20, footerY);
    pdf.text(this.formatDate(new Date()), pageWidth - 20, footerY, { align: 'right' });
    
    pdf.setFontSize(7);
    pdf.text('Secure online invoicing and payment platform', pageWidth / 2, footerY + 4, { align: 'center' });

    // ========== WATERMARK (if paid) ==========
    
    if (invoice.isPaid) {
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }));
      
      pdf.setFontSize(80);
      pdf.setTextColor(...green);
      pdf.setFont('helvetica', 'bold');
      
      // Center and rotate
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      pdf.text('PAID', centerX, centerY, {
        align: 'center',
        angle: 45
      });
      
      pdf.restoreGraphicsState();
    }

    // ========== SAVE PDF ==========
    
    const filename = `invoice-${invoiceNum}-${Date.now()}.pdf`;
    pdf.save(filename);
  }

  async generateInvoiceBlob(invoice: InvoiceData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Same generation logic would go here
    // For now, return empty blob
    return pdf.output('blob');
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}