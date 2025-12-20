import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css'
})
export class InvoicesComponent implements OnInit, OnDestroy {
  invoices$: Observable<any[]>;
  amount: number | null = null;

  showCreateModal = false;
  isLoading = false;
  createdInvoiceId = '';

  private statusInterval: any;

  constructor(public api: ApiService) {
    this.invoices$ = this.api.invoices$;
  }

  ngOnInit() {
    this.api.loadInvoices();
  }

  getStats(invoices: any[]) {
    if (!Array.isArray(invoices) || invoices.length === 0) return { total: 0, count: 0, paid: 0, pending: 0 };

    let total = 0, paid = 0, pending = 0;
    for (const inv of invoices) {
      const a = Number(inv?.amount ?? 0);
      total += Number.isFinite(a) ? a : 0;
      if (inv?.isPaid) paid++; else pending++;
    }
    return { total, count: invoices.length, paid, pending };
  }

  createInvoice() {
    if (!this.amount || this.amount <= 0) return;

    this.isLoading = true;
    this.api.createInvoice(this.amount).subscribe({
      next: (res: any) => {
        this.createdInvoiceId = res?.invoiceId || res?.id || '';
        this.amount = null;
        this.isLoading = false;
        this.showCreateModal = false;
        this.api.loadInvoices();
      },
      error: () => {
        this.isLoading = false;
        alert('ინვოისის შექმნა ვერ მოხერხდა ❌');
      }
    });
  }

  openPublic(id: string) {
    if (!id) return;
    window.open(`/pay/${id}`, '_blank');
  }

  copyPayLink(id: string) {
    if (!id) return;
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url).then(() => alert('ბმული დაკოპირდა ✅'));
  }

  deleteInvoice(id: string) {
    if (!id) return;
    if (!confirm('წავშალოთ ინვოისი?')) return;

    this.api.deleteInvoice(id).subscribe({
      next: () => this.api.loadInvoices(),
      error: () => alert('წაშლა ვერ მოხერხდა ❌')
    });
  }

  pay(bank: string, id: string) {
    if (!id) return;

    this.api.getPaymentLink(id, bank).subscribe({
      next: (res: any) => {
        if (res?.paymentUrl) {
          window.open(res.paymentUrl, '_blank');
          this.startStatusCheck(id);
        } else {
          alert('Payment URL ვერ მოიძებნა ❌');
        }
      },
      error: () => alert('გადახდის გენერაცია ვერ მოხერხდა ❌')
    });
  }

  startStatusCheck(id: string) {
    if (this.statusInterval) clearInterval(this.statusInterval);

    this.statusInterval = setInterval(() => {
      this.api.checkInvoiceStatus(id).subscribe((res: any) => {
        if (res?.isPaid) {
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
