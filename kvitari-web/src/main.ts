import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // შეცვალე App -> AppComponent

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));