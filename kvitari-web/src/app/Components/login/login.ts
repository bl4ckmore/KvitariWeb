import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  isLoading = false;
  showToast = false;
  toastType: 'success' | 'error' = 'success';
  toastTitle = '';
  toastMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.showErrorToast('შეცდომა', 'გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.api.saveToken(res.token);
        this.isLoading = false;
        this.showSuccessToast('წარმატებით!', 'თქვენ წარმატებით შეხვედით სისტემაში');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMsg = 'არასწორი მეილი ან პაროლი!';
        this.showErrorToast('შეცდომა', 'არასწორი მეილი ან პაროლი');
      }
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