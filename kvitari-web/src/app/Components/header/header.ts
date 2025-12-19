import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../../app/services/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] // აუცილებლად დავამატოთ ცალკე CSS ფაილი
})
export class HeaderComponent {
  isMenuOpen = false; // მენიუს სტატუსი

  constructor(public api: ApiService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onLogout() {
    this.api.logout();
    this.closeMenu();
  }
}