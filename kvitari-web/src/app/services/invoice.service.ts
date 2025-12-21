// src/app/services/invoice.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invoice {
  id: string;
  amount: number;
  createdAt: string;
  invoiceNumber: string;
  isPaid: boolean;
}

export interface PublicInvoice {
  id: string;
  amount: number;
  createdAt: string;
  companyName: string;
}

export interface CreateInvoiceRequest {
  amount: number;
}

export interface CreateInvoiceResponse {
  message: string;
  invoiceId: string;
}

export interface PaymentLinkResponse {
  paymentUrl: string;
}

export interface InvoiceStatusResponse {
  id: string;
  status: number;
  isPaid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = '/api/invoices'; // Adjust based on your API base URL

  constructor(private http: HttpClient) { }

  /**
   * Get all invoices for the logged-in company
   */
  getMyInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/my-invoices`);
  }

  /**
   * Create a new invoice
   */
  createInvoice(request: CreateInvoiceRequest): Observable<CreateInvoiceResponse> {
    return this.http.post<CreateInvoiceResponse>(this.apiUrl, request);
  }

  /**
   * Generate payment link for an invoice
   */
  generatePaymentLink(invoiceId: string, bank: 'tbc' | 'bog'): Observable<PaymentLinkResponse> {
    return this.http.post<PaymentLinkResponse>(
      `${this.apiUrl}/${invoiceId}/pay?bank=${bank}`,
      {}
    );
  }

  /**
   * Delete an invoice (soft delete)
   */
  deleteInvoice(invoiceId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${invoiceId}`);
  }

  /**
   * Get invoice status
   */
  getInvoiceStatus(invoiceId: string): Observable<InvoiceStatusResponse> {
    return this.http.get<InvoiceStatusResponse>(`${this.apiUrl}/${invoiceId}/status`);
  }

  /**
   * Get public invoice (no auth required)
   */
  getPublicInvoice(invoiceId: string): Observable<PublicInvoice> {
    return this.http.get<PublicInvoice>(`${this.apiUrl}/public/${invoiceId}`);
  }
}