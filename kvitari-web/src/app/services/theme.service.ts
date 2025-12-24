import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // 1. Check Local Storage FIRST (Persistence)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    // 2. Check DOM attribute (set by index.html script)
    const domTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    
    // 3. Check System Preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine startup theme
    let startTheme: 'light' | 'dark' = 'light';
    
    if (savedTheme) {
      startTheme = savedTheme;
    } else if (domTheme) {
      startTheme = domTheme;
    } else if (systemDark) {
      startTheme = 'dark';
    }

    // Set the signal
    this.currentTheme.set(startTheme);

    // Apply side effects (Save to storage + Update DOM)
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        // Force background colors to prevent white flashes during transitions
        document.documentElement.style.backgroundColor = '#0f172a';
        document.body.style.backgroundColor = '#0f172a';
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.style.backgroundColor = '#fafbfc';
        document.body.style.backgroundColor = '#fafbfc';
      }
    });
  }

  toggleTheme() {
    this.currentTheme.update(t => t === 'light' ? 'dark' : 'light');
  }
}