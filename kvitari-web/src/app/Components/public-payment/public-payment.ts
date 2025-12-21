// src/app/components/public-payment/public-payment.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, PublicInvoice } from '../../services/api';

@Component({
  selector: 'app-public-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-payment.html',
  styleUrls: ['./public-payment.css']
})
export class PublicPaymentComponent implements OnInit {
  
  invoiceId: string = '';
  invoice: PublicInvoice | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public api: ApiService
  ) {
    console.log('🔷 PublicPaymentComponent constructed');
  }

  ngOnInit(): void {
    console.log('🔷 ngOnInit called');
    
    // Get invoice ID from route
    this.route.params.subscribe(params => {
      console.log('🔷 Route params:', params);
      this.invoiceId = params['id'];
      console.log('🔷 Invoice ID extracted:', this.invoiceId);
      
      if (this.invoiceId) {
        this.loadInvoice();
      } else {
        console.error('❌ No invoice ID in route');
        this.error = 'ინვოისის ID არ არის მითითებული';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load public invoice details
   */
  loadInvoice(): void {
    console.log('📄 Starting to load invoice...');
    this.loading = true;
    this.error = '';
    
    console.log('📄 Loading invoice:', this.invoiceId);
    console.log('📄 Loading state:', this.loading);
    
    this.api.getPublicInvoice(this.invoiceId).subscribe({
      next: (data: PublicInvoice) => {
        console.log('✅ Invoice loaded successfully:', data);
        console.log('✅ Setting invoice data...');
        
        this.invoice = data;
        this.loading = false;
        this.error = '';
        
        console.log('✅ Loading state after:', this.loading);
        console.log('✅ Invoice:', this.invoice);
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('✅ Change detection triggered');
      },
      error: (err: any) => {
        console.error('❌ Error loading invoice:', err);
        
        this.error = err.error?.message || err.message || 'ინვოისი ვერ მოიძებნა';
        this.loading = false;
        this.invoice = null;
        
        console.log('❌ Error state:', this.error);
        console.log('❌ Loading state:', this.loading);
        
        // Force change detection
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('🏁 Invoice loading observable complete');
      }
    });
    
    console.log('📄 Subscribe initiated, waiting for response...');
  }

  /**
   * Generate payment link and redirect to bank
   */
  pay(bankName: string): void {
    const bank = bankName.toLowerCase();
    
    if (bank !== 'tbc' && bank !== 'bog') {
      alert('არასწორი ბანკი');
      return;
    }

    console.log(`💳 Processing payment with ${bank.toUpperCase()}...`);
    
    const bankType: 'tbc' | 'bog' = bank as 'tbc' | 'bog';
    
    this.api.getPublicPaymentLink(this.invoiceId, bankType).subscribe({
      next: (response) => {
        console.log('🔗 Payment URL received:', response.paymentUrl);
        window.location.href = response.paymentUrl;
      },
      error: (err: any) => {
        console.error('❌ Payment link error:', err);
        alert('გადახდის ლინკის გენერაცია ვერ მოხერხდა');
      }
    });
  }
}