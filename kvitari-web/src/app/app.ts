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
      <app-header></app-header>
      
      <div class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
      
      <app-footer *ngIf="showFooter"></app-footer>
    </div>
  `,
  styles: [`
    .flex-grow-1 { flex: 1; }
  `]
})
export class AppComponent implements OnInit {
  showFooter = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide footer on dashboard, but HEADER STAYS
        this.showFooter = !event.url.startsWith('/dashboard');
      });

    this.showFooter = !this.router.url.startsWith('/dashboard');
  }
}