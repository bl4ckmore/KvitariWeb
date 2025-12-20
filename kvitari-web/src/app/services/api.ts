import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5022/api';

  private invoicesSubject = new BehaviorSubject<any[]>([]);
  invoices$ = this.invoicesSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ---------------------------
  // AUTH
  // ---------------------------
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // ✅ role from token
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

  // ✅ profile helper (token-ში რაც არის)
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

  private safeHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // ---------------------------
  // PUBLIC INVOICE
  // ---------------------------
  getPublicInvoice(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/public/${id}`);
  }

  getPublicPaymentLink(invoiceId: string, bank: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`, {});
  }

  // ---------------------------
  // INVOICES (AUTH)
  // ---------------------------
  loadInvoices(): void {
    this.http
      .get<any[]>(`${this.baseUrl}/invoices/my-invoices`, { headers: this.safeHeaders() })
      .subscribe((data) => this.invoicesSubject.next(Array.isArray(data) ? data : []));
  }

  createInvoice(amount: number): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/invoices`, { amount }, { headers: this.safeHeaders() })
      .pipe(tap(() => this.loadInvoices()));
  }

  getPaymentLink(invoiceId: string, bank: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`,
      {},
      { headers: this.safeHeaders() }
    );
  }

  checkInvoiceStatus(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/${id}/status`, { headers: this.safeHeaders() });
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/invoices/${id}`, { headers: this.safeHeaders() });
  }
}
