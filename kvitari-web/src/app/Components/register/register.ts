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

  constructor(private api: ApiService, private router: Router) {}

  onRegister() {
    if (!this.registerData.email || !this.registerData.password || !this.registerData.companyName) {
      this.errorMsg = 'გთხოვთ შეავსოთ ყველა ველი!';
      return;
    }

    this.api.register(this.registerData).subscribe({
      next: (res: any) => {
        alert('რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ შეხვიდეთ.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.error?.message || err.error || 'რეგისტრაცია ვერ მოხერხდა.';
      },
    });
  }
}