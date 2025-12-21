// src/app/Components/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  mobileMenuOpen = false;
  role: string | null = null;

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    // Get user role from token
    this.role = this.api.getRole();
    
    // Load user data if needed
    const userInfo = this.api.getUserFromToken();
    console.log('Dashboard loaded for:', userInfo);
  }

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    // Restore body scroll
    document.body.style.overflow = '';
  }

  logout(): void {
    this.closeMobileMenu();
    this.api.logout();
  }
}