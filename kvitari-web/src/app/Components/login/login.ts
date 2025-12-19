import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ეს საჭიროა *ngIf-ისთვის
import { FormsModule } from '@angular/forms';   // ეს საჭიროა input-ებისთვის
import { ApiService } from '../../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // <--- არ დაგავიწყდეს იმპორტები!
  templateUrl: './login.html'
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
        alert(`Login Success! Role: ${role}`); // დროებით, რომ გავიგოთ მუშაობს თუ არა
        
        // აქ მერე გადავამისამართებთ Dashboard-ზე
         this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'არასწორი მეილი ან პაროლი!';
      }
    });
  }
}