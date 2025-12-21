// src/app/components/invoices/invoices.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Invoice, InvoiceStatusResponse } from '../../services/api';
import { InvoicePdfService, InvoiceData } from '../../services/invoice-pdf.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.css']
})
export class InvoicesComponent implements OnInit, OnDestroy {
  
  invoices$!: Observable<Invoice[]>;
  invoices: Invoice[] = [];
  
  showCreateModal = false;
  amount: number = 0;
  isLoading = false;
  createdInvoiceId: string = '';

  private subscription?: Subscription;

  constructor(
    public api: ApiService,
    private pdfService: InvoicePdfService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadInvoices(): void {
    this.invoices$ = this.api.invoices$;
    this.subscription = this.api.invoices$.subscribe(data => {
      this.invoices = data;
    });
    this.api.loadInvoices();
  }

  createInvoice(): void {
    if (!this.amount || this.amount <= 0) {
      alert('გთხოვთ შეიყვანოთ თანხა');
      return;
    }

    this.isLoading = true;
    
    this.api.createInvoice(this.amount).subscribe({
      next: (response) => {
        console.log('✅ Invoice created:', response);
        this.createdInvoiceId = response.invoiceId;
        this.amount = 0;
        this.isLoading = false;
        
        setTimeout(() => {
          this.showCreateModal = false;
          this.createdInvoiceId = '';
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ Error creating invoice:', err);
        alert('ინვოისის შექმნა ვერ მოხერხდა');
        this.isLoading = false;
      }
    });
  }

  deleteInvoice(id: string): void {
    if (!confirm('ნამდვილად გსურთ ინვოისის წაშლა?')) {
      return;
    }

    this.api.deleteInvoice(id).subscribe({
      next: (response) => {
        console.log('✅ Invoice deleted:', response.message);
      },
      error: (err: any) => {
        console.error('❌ Error deleting invoice:', err);
        alert('ინვოისის წაშლა ვერ მოხერხდა');
      }
    });
  }

  pay(bank: 'tbc' | 'bog', invoiceId: string): void {
    this.api.getPaymentLink(invoiceId, bank).subscribe({
      next: (response) => {
        console.log('🔗 Payment URL:', response.paymentUrl);
        window.location.href = response.paymentUrl;
      },
      error: (err: any) => {
        console.error('❌ Error generating payment link:', err);
        alert('გადახდის ლინკის გენერაცია ვერ მოხერხდა');
      }
    });
  }

  copyPayLink(invoiceId: string): void {
    const publicUrl = `${window.location.origin}/public-payment/${invoiceId}`;
    
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('✅ ლინკი დაკოპირდა!');
      console.log('Copied:', publicUrl);
    }).catch(err => {
      console.error('Failed to copy:', err);
      const textarea = document.createElement('textarea');
      textarea.value = publicUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ ლინკი დაკოპირდა!');
    });
  }

  openPublic(invoiceId: string): void {
    const publicUrl = `/public-payment/${invoiceId}`;
    window.open(publicUrl, '_blank');
  }

  /**
   * Export invoice to PDF (English version to avoid font issues)
   */
  exportInvoicePdf(invoice: Invoice): void {
    try {
      const userInfo = this.api.getUserFromToken();
      
      const invoiceData: InvoiceData = {
        id: invoice.id,
        amount: invoice.amount,
        isPaid: invoice.isPaid,
        createdAt: invoice.createdAt,
        invoiceNumber: invoice.invoiceNumber,
        
        company: {
          name: 'Kvitari.ge',
          address: 'Tbilisi, Georgia',
          phone: '+995 555 123 456',
          email: userInfo.email || 'info@kvitari.ge',
          taxId: '123456789'
        },
        
        // English notes to avoid Georgian font issues
        notes: 'Payment available via TBC or BOG Bank. Thank you for your business!',
        taxRate: 18
      };

      this.pdfService.generateInvoicePdf(invoiceData);
      console.log('✅ PDF created successfully');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      alert('PDF-ის შექმნა ვერ მოხერხდა');
    }
  }

  exportAllInvoices(): void {
    if (!this.invoices || this.invoices.length === 0) {
      alert('ინვოისები არ მოიძებნა');
      return;
    }

    const confirmed = confirm(`${this.invoices.length} ინვოისის ჩამოტვირთვა?`);
    if (!confirmed) return;

    console.log(`📄 Exporting ${this.invoices.length} invoices...`);
    
    this.invoices.forEach((invoice, index) => {
      setTimeout(() => {
        this.exportInvoicePdf(invoice);
      }, index * 500);
    });
  }

  checkStatus(invoiceId: string): void {
    this.api.checkInvoiceStatus(invoiceId).subscribe({
      next: (status: InvoiceStatusResponse) => {
        console.log('📊 Invoice status:', status);
        
        if (status.isPaid) {
          alert('✅ ინვოისი გადახდილია!');
          this.api.loadInvoices();
        } else {
          alert('⏳ ინვოისი ჯერ არ არის გადახდილი');
        }
      },
      error: (err: any) => {
        console.error('❌ Error checking status:', err);
        alert('სტატუსის შემოწმება ვერ მოხერხდა');
      }
    });
  }

  getStats(invoices: Invoice[]) {
    if (!invoices || invoices.length === 0) {
      return { total: 0, count: 0, paid: 0, pending: 0 };
    }

    return {
      total: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      count: invoices.length,
      paid: invoices.filter(inv => inv.isPaid).length,
      pending: invoices.filter(inv => !inv.isPaid).length
    };
  }

  refresh(): void {
    console.log('🔄 Refreshing invoices...');
    this.api.loadInvoices();
  }
}