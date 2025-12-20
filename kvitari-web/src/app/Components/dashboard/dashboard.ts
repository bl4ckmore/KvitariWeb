import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  role: string | null = null;

  constructor(public api: ApiService) {}

  ngOnInit() {
    this.role = this.api.getRole();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.mobileMenuOpen) this.closeMobileMenu();
  }

  openMobileMenu() {
    this.mobileMenuOpen = true;
    document.body.classList.add('no-scroll');
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.classList.remove('no-scroll');
  }

  logout() {
    this.closeMobileMenu();
    this.api.logout();
  }

  ngOnDestroy() {
    document.body.classList.remove('no-scroll');
  }
}
