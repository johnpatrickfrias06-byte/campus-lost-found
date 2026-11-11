import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Gives the Camera plugin a browser UI so the app can also be tested with `ng serve`.
defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding()),
  ],
}).catch((err) => console.error(err));
