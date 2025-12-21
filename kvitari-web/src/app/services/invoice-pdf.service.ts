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
    
    const primaryColor: [number, number, number] = [13, 110, 253];
    const darkColor: [number, number, number] = [33, 37, 41];
    const grayColor: [number, number, number] = [108, 117, 125];
    const lightGray: [number, number, number] = [248, 249, 250];
    const greenColor: [number, number, number] = [25, 135, 84];
    const yellowColor: [number, number, number] = [255, 193, 7];

    let yPosition = 20;

    // ========== HEADER ==========
    
    if (invoice.company?.logo) {
      try {
        pdf.addImage(invoice.company.logo, 'PNG', 15, yPosition, 30, 30);
      } catch (e) {
        console.warn('Logo not added:', e);
      }
    }

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkColor);
    pdf.text(invoice.company?.name || 'Kvitari.ge', invoice.company?.logo ? 50 : 15, yPosition + 8);

    // INVOICE title in English (Georgian causes encoding issues)
    pdf.setFontSize(28);
    pdf.setTextColor(...primaryColor);
    pdf.text('INVOICE', pageWidth - 15, yPosition + 8, { align: 'right' });
    
    // Invoice Number
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice.id.substring(0, 8).toUpperCase()}`;
    pdf.text(invoiceNum, pageWidth - 15, yPosition + 15, { align: 'right' });

    yPosition += 35;

    // Company Details (using English labels)
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkColor);
    pdf.text('FROM:', 15, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    pdf.setFontSize(8);
    
    if (invoice.company?.address) {
      yPosition += 5;
      pdf.text(invoice.company.address, 15, yPosition);
    }
    if (invoice.company?.phone) {
      yPosition += 4;
      pdf.text(`Tel: ${invoice.company.phone}`, 15, yPosition);
    }
    if (invoice.company?.email) {
      yPosition += 4;
      pdf.text(`Email: ${invoice.company.email}`, 15, yPosition);
    }
    if (invoice.company?.taxId) {
      yPosition += 4;
      pdf.text(`Tax ID: ${invoice.company.taxId}`, 15, yPosition);
    }

    // Invoice Details (Right)
    let rightYPosition = yPosition - (invoice.company?.address ? 17 : 13);
    const rightX = pageWidth - 70;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...grayColor);
    
    pdf.text('Date:', rightX, rightYPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.formatDate(invoice.createdAt), rightX + 20, rightYPosition);
    
    rightYPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status:', rightX, rightYPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...(invoice.isPaid ? greenColor : yellowColor));
    pdf.text(invoice.isPaid ? 'PAID' : 'PENDING', rightX + 20, rightYPosition);
    
    if (invoice.dueDate && !invoice.isPaid) {
      rightYPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...grayColor);
      pdf.text('Due Date:', rightX, rightYPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.formatDate(invoice.dueDate), rightX + 20, rightYPosition);
    }

    yPosition += 25;

    // Customer Details
    if (invoice.customer) {
      pdf.setFillColor(...lightGray);
      pdf.rect(15, yPosition, pageWidth - 30, 25, 'F');
      
      yPosition += 7;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkColor);
      pdf.text('BILL TO:', 20, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...grayColor);
      
      yPosition += 5;
      pdf.text(invoice.customer.name, 20, yPosition);
      
      if (invoice.customer.address) {
        yPosition += 4;
        pdf.text(invoice.customer.address, 20, yPosition);
      }
      if (invoice.customer.phone || invoice.customer.email) {
        yPosition += 4;
        const contactInfo = [invoice.customer.phone, invoice.customer.email].filter(Boolean).join(' | ');
        pdf.text(contactInfo, 20, yPosition);
      }
      
      yPosition += 10;
    } else {
      yPosition += 10;
    }

    // ========== LINE ITEMS OR SIMPLE AMOUNT ==========
    
    if (invoice.items && invoice.items.length > 0) {
      const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = invoice.taxRate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      autoTable(pdf, {
        startY: yPosition,
        head: [['Description', 'Qty', 'Price', 'Total']],
        body: invoice.items.map(item => [
          item.description,
          item.quantity.toString(),
          `${item.unitPrice.toFixed(2)} GEL`,
          `${item.total.toFixed(2)} GEL`
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkColor
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      const totalsX = pageWidth - 70;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...grayColor);
      pdf.text('Subtotal:', totalsX, yPosition);
      pdf.text(`${subtotal.toFixed(2)} GEL`, pageWidth - 15, yPosition, { align: 'right' });
      
      if (taxRate > 0) {
        yPosition += 6;
        pdf.text(`VAT (${taxRate}%):`, totalsX, yPosition);
        pdf.text(`${taxAmount.toFixed(2)} GEL`, pageWidth - 15, yPosition, { align: 'right' });
      }
      
      yPosition += 8;
      pdf.setDrawColor(...primaryColor);
      pdf.line(totalsX - 5, yPosition - 3, pageWidth - 15, yPosition - 3);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.text('TOTAL:', totalsX, yPosition);
      pdf.text(`${total.toFixed(2)} GEL`, pageWidth - 15, yPosition, { align: 'right' });
      
    } else {
      // Simple amount display
      pdf.setFillColor(...lightGray);
      pdf.rect(15, yPosition, pageWidth - 30, 30, 'F');
      
      yPosition += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...grayColor);
      pdf.text('AMOUNT DUE:', 20, yPosition);
      
      pdf.setFontSize(24);
      pdf.setTextColor(...primaryColor);
      pdf.text(`${invoice.amount.toFixed(2)} GEL`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 20;
    }

    // ========== NOTES ==========
    
    if (invoice.notes) {
      yPosition += 10;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...darkColor);
      pdf.text('Notes:', 15, yPosition);
      
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...grayColor);
      
      // Convert Georgian to English for notes
      const englishNotes = this.convertGeorgianToEnglish(invoice.notes);
      const notesLines = pdf.splitTextToSize(englishNotes, pageWidth - 30);
      pdf.text(notesLines, 15, yPosition);
    }

    // ========== FOOTER ==========
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    
    const footerY = pageHeight - 15;
    pdf.text('Document generated automatically by Kvitari.ge', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, footerY + 4, { align: 'center' });

    // PAID Watermark
    if (invoice.isPaid) {
      pdf.setFontSize(60);
      pdf.setTextColor(25, 135, 84, 0.1);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PAID', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
    }

    // ========== SAVE ==========
    
    const filename = `${invoice.invoiceNumber || 'invoice'}-${Date.now()}.pdf`;
    pdf.save(filename);
  }

  /**
   * Convert Georgian text to English transliteration
   */
  private convertGeorgianToEnglish(text: string): string {
    // Simple mapping - Georgian characters that cause issues
    const georgianToEnglish: { [key: string]: string } = {
      'თ': 'T', 'ბ': 'B', 'ც': 'ts', 'ლ': 'l', 'ს': 's', 'ი': 'i',
      'ა': 'a', 'კ': 'k', 'ვ': 'v', 'რ': 'r', 'ტ': 't', 'გ': 'g',
      'ე': 'e', 'ო': 'o', 'უ': 'u', 'მ': 'm', 'ნ': 'n', 'ღ': 'gh',
      'ყ': 'q', 'შ': 'sh', 'ჩ': 'ch', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'tch',
      'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h', 'ფ': 'p', 'ქ': 'k', 'ზ': 'z', 'დ': 'd'
    };
    
    // For now, just use English template
    if (text.includes('გადახდა')) {
      return 'Payment available via TBC or BOG Bank. Thank you for your business!';
    }
    
    return text;
  }

  async generateInvoiceBlob(invoice: InvoiceData): Promise<Blob> {
    const pdf = new jsPDF();
    return pdf.output('blob');
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}