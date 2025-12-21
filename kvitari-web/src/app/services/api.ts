// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

// Invoice interfaces
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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5022/api';

  // BehaviorSubject for reactive invoice list
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ---------------------------
  // AUTH
  // ---------------------------
  
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: { email: string; password: string; name?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.invoicesSubject.next([]); // Clear invoices on logout
    this.router.navigate(['/login']);
  }

  /**
   * Get role from JWT token
   */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decoded.role ||
        null
      );
    } catch {
      return null;
    }
  }

  /**
   * Get user info from JWT token
   */
  getUserFromToken(): { email?: string; name?: string; role?: string } {
    const token = this.getToken();
    if (!token) return {};
    
    try {
      const decoded: any = jwtDecode(token);

      const email =
        decoded.email ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

      const name =
        decoded.name ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

      const role =
        decoded.role ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      return { email, name, role };
    } catch {
      return {};
    }
  }

  /**
   * Get company ID from token (for multi-tenancy)
   */
  getCompanyId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.CompanyId || decoded.companyId || null;
    } catch {
      return null;
    }
  }

  /**
   * Create headers with JWT token
   */
  private safeHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized
    if (error.status === 401) {
      this.logout();
    }
    
    return throwError(() => error);
  }

  // ---------------------------
  // PUBLIC INVOICE (No Auth Required)
  // ---------------------------
  
  /**
   * Get public invoice details (for payment page)
   */
  getPublicInvoice(id: string): Observable<PublicInvoice> {
    return this.http.get<PublicInvoice>(`${this.baseUrl}/invoices/public/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate payment link for public user
   */
  getPublicPaymentLink(invoiceId: string, bank: 'tbc' | 'bog'): Observable<PaymentLinkResponse> {
    return this.http.post<PaymentLinkResponse>(
      `${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`,
      {}
    ).pipe(catchError(this.handleError));
  }

  // ---------------------------
  // INVOICES (Authenticated)
  // ---------------------------
  
  /**
   * Load all invoices for current company
   * Updates the invoices$ observable
   */
  loadInvoices(): void {
    this.http
      .get<Invoice[]>(`${this.baseUrl}/invoices/my-invoices`, { 
        headers: this.safeHeaders() 
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (data) => {
          const invoices = Array.isArray(data) ? data : [];
          this.invoicesSubject.next(invoices);
          console.log('✅ Invoices loaded:', invoices.length);
        },
        error: (err) => {
          console.error('❌ Failed to load invoices:', err);
          this.invoicesSubject.next([]);
        }
      });
  }

  /**
   * Get invoices as Observable (for component subscription)
   */
  getInvoices(): Observable<Invoice[]> {
    return this.http
      .get<Invoice[]>(`${this.baseUrl}/invoices/my-invoices`, { 
        headers: this.safeHeaders() 
      })
      .pipe(
        tap(data => {
          const invoices = Array.isArray(data) ? data : [];
          this.invoicesSubject.next(invoices);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create new invoice
   */
  createInvoice(amount: number): Observable<CreateInvoiceResponse> {
    return this.http
      .post<CreateInvoiceResponse>(
        `${this.baseUrl}/invoices`, 
        { amount }, 
        { headers: this.safeHeaders() }
      )
      .pipe(
        tap(() => {
          console.log('✅ Invoice created, reloading list...');
          this.loadInvoices(); // Auto-reload after create
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Generate payment link (TBC or BOG)
   */
  getPaymentLink(invoiceId: string, bank: 'tbc' | 'bog'): Observable<PaymentLinkResponse> {
    return this.http
      .post<PaymentLinkResponse>(
        `${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`,
        {},
        { headers: this.safeHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Check invoice payment status
   */
  checkInvoiceStatus(id: string): Observable<InvoiceStatusResponse> {
    return this.http
      .get<InvoiceStatusResponse>(
        `${this.baseUrl}/invoices/${id}/status`, 
        { headers: this.safeHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete invoice (soft delete)
   */
  deleteInvoice(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(
        `${this.baseUrl}/invoices/${id}`, 
        { headers: this.safeHeaders() }
      )
      .pipe(
        tap(() => {
          console.log('✅ Invoice deleted, reloading list...');
          this.loadInvoices(); // Auto-reload after delete
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get current invoice count
   */
  getInvoiceCount(): number {
    return this.invoicesSubject.value.length;
  }

  /**
   * Get invoice statistics
   */
  getInvoiceStats() {
    const invoices = this.invoicesSubject.value;
    return {
      total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      count: invoices.length,
      paid: invoices.filter(inv => inv.isPaid).length,
      pending: invoices.filter(inv => !inv.isPaid).length
    };
  }

  /**
   * Clear invoices cache
   */
  clearInvoices(): void {
    this.invoicesSubject.next([]);
  }
}