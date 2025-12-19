import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-public-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-payment.html',
  styleUrl: './public-payment.css'
})
export class PublicPaymentComponent implements OnInit {
  invoice: any = null;
  invoiceId: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute, 
    private api: ApiService,
    private cdr: ChangeDetectorRef // ამატებს აიძულებს ფრონტს განახლებას
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.invoiceId = params.get('id') || '';
      if (this.invoiceId) {
        this.loadInvoice();
      } else {
        this.error = 'ინვოისის ID ვერ მოიძებნა';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadInvoice() {
    this.loading = true;
    this.api.getPublicInvoice(this.invoiceId).subscribe({
      next: (data: any) => {
        this.invoice = data;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges(); // აიძულებს HTML-ს გამოჩენას
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'ინვოისი ვერ მოიძებნა ან სერვერი არ პასუხობს';
        this.cdr.detectChanges();
      }
    });
  }

  pay(bank: string) {
    this.api.getPublicPaymentLink(this.invoiceId, bank).subscribe({
      next: (res: any) => {
        if (res.paymentUrl) window.location.href = res.paymentUrl;
      }
    });
  }
}