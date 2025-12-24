import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // 1. Check Local Storage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    // 2. Check System Preference if no local storage
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }

    // 3. Apply theme changes whenever the signal updates
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
      }
    });
  }

  toggleTheme() {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme.set(theme);
  }
}