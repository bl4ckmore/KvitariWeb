import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // დაამატეთ ngIf-ისთვის
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api'; // გზა შეამოწმეთ

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html'
})
export class FooterComponent {
  constructor(public api: ApiService) {}
}