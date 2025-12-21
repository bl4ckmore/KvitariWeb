import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './Components/header/header';
import { FooterComponent } from './Components/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-header *ngIf="showHeader"></app-header>
      <router-outlet></router-outlet>
      <app-footer *ngIf="showHeader"></app-footer>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  showHeader = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Hide header on dashboard routes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide header if URL starts with /dashboard
        this.showHeader = !event.url.startsWith('/dashboard');
      });

    // Check initial route
    this.showHeader = !this.router.url.startsWith('/dashboard');
  }
}