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

  getPublicInvoice(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/public/${id}`);
  }

  getPublicPaymentLink(invoiceId: string, bank: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`, {});
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  saveToken(token: string) { localStorage.setItem('token', token); }
  getToken() { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  
  logout() { 
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']); 
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || null;
    } catch { return null; }
  }

  private getAuthHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
  }

  loadInvoices(): void {
    this.http.get<any[]>(`${this.baseUrl}/invoices/my-invoices`, { headers: this.getAuthHeaders() })
      .subscribe((data) => this.invoicesSubject.next(data));
  }

  createInvoice(amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices`, { amount }, { headers: this.getAuthHeaders() })
      .pipe(tap(() => this.loadInvoices()));
  }

  getPaymentLink(invoiceId: string, bank: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices/${invoiceId}/pay?bank=${bank}`, {}, { headers: this.getAuthHeaders() });
  }

  checkInvoiceStatus(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/${id}/status`, { headers: this.getAuthHeaders() });
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/invoices/${id}`, { headers: this.getAuthHeaders() });
  }
}