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
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.invoiceId = params['id'];
      
      if (this.invoiceId) {
        this.loadInvoice();
      } else {
        this.error = 'ინვოისის ID არ არის მითითებული';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadInvoice(): void {
    this.loading = true;
    this.error = '';
    
    this.api.getPublicInvoice(this.invoiceId).subscribe({
      next: (data: PublicInvoice) => {
        this.invoice = data;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || err.message || 'ინვოისი ვერ მოიძებნა';
        this.loading = false;
        this.invoice = null;
        this.cdr.detectChanges();
      }
    });
  }

  pay(bankName: string): void {
    const bank = bankName.toLowerCase();
    
    if (bank !== 'tbc' && bank !== 'bog') {
      alert('არასწორი ბანკი');
      return;
    }

    const bankType: 'tbc' | 'bog' = bank as 'tbc' | 'bog';
    
    this.api.getPublicPaymentLink(this.invoiceId, bankType).subscribe({
      next: (response) => {
        window.location.href = response.paymentUrl;
      },
      error: (err: any) => {
        console.error('Payment link error:', err);
        alert('გადახდის ლინკის გენერაცია ვერ მოხერხდა');
      }
    });
  }
}