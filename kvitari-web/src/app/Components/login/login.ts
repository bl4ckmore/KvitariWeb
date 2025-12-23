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

  constructor(private api: ApiService, private router: Router) {}

  onLogin() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.api.saveToken(res.token);
        const role = this.api.getRole();
        alert(`Login Success! Role: ${role}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'არასწორი მეილი ან პაროლი!';
      }
    });
  }
}