import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api'; 
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css' // დარწმუნდი რომ CSS ფაილი შექმნილია
})
export class DashboardComponent implements OnInit, OnDestroy {
  role: string | null = '';
  amount: number | null = null;
  createdInvoiceId: string = '';
  showCreateModal = false;
  isLoading: boolean = false;
  invoices$: Observable<any[]>;
  private statusInterval: any;

  constructor(public api: ApiService, private router: Router) {
    this.invoices$ = this.api.invoices$;
  }

  ngOnInit() {
    if (!this.api.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.role = this.api.getRole();
    this.api.loadInvoices();
  }

  // სტატისტიკის ფუნქცია
 getStats(invoices: any[]) {
  if (!invoices) return { total: 0, count: 0 };
  const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  return { 
    total, 
    count: invoices.length 
  };
}
  createInvoice() {
    if (!this.amount || this.amount <= 0) return;
    this.isLoading = true;
    this.api.createInvoice(this.amount).subscribe({
      next: (res: any) => {
        this.createdInvoiceId = res.invoiceId || res.id;
        this.amount = null;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // აი ეს ფუნქცია აკლდა:
  copyPayLink(id: string) {
    const publicUrl = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('ბმული დაკოპირდა!');
    });
  }

  deleteInvoice(id: string) {
    if (confirm('დარწმუნებული ხართ, რომ გსურთ ინვოისის წაშლა?')) {
      this.api.deleteInvoice(id).subscribe({
        next: () => this.api.loadInvoices(),
        error: () => alert('წაშლა ვერ მოხერხდა')
      });
    }
  }

  pay(bank: string, id?: string) {
    const targetId = id || this.createdInvoiceId;
    this.api.getPaymentLink(targetId, bank).subscribe({
      next: (res: any) => {
        if (res.paymentUrl) {
          window.open(res.paymentUrl, '_blank');
          this.startStatusCheck(targetId);
        }
      }
    });
  }

  startStatusCheck(id: string) {
    if (this.statusInterval) clearInterval(this.statusInterval);
    this.statusInterval = setInterval(() => {
      this.api.checkInvoiceStatus(id).subscribe((res: any) => {
        if (res.isPaid) {
          this.api.loadInvoices();
          clearInterval(this.statusInterval);
        }
      });
    }, 5000);
  }

  
  ngOnDestroy() {
    if (this.statusInterval) clearInterval(this.statusInterval);
  }
  
}

