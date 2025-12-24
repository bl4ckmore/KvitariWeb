import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerData = {
    companyName: '',
    identificationNumber: '',
    email: '',
    password: '',
  };

  errorMsg = '';
  isLoading = false;
  showToast = false;
  toastType: 'success' | 'error' = 'success';
  toastTitle = '';
  toastMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onRegister() {
    if (!this.registerData.email || !this.registerData.password || !this.registerData.companyName) {
      this.showErrorToast('შეცდომა', 'გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.api.register(this.registerData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccessToast('წარმატება!', 'რეგისტრაცია წარმატებით დასრულდა');
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = err.error?.message || err.error || 'რეგისტრაცია ვერ მოხერხდა.';
        this.showErrorToast('შეცდომა', this.errorMsg);
      },
    });
  }

  showSuccessToast(title: string, message: string) {
    this.toastType = 'success';
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  showErrorToast(title: string, message: string) {
    this.toastType = 'error';
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  closeToast() {
    this.showToast = false;
  }
}