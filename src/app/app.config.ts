// import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';
// import { provideHttpClient, withFetch } from '@angular/common/http';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes), provideClientHydration() , provideHttpClient(withFetch()) ],
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations'}

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes), provideClientHydration(),importProvidersFrom(BrowserAnimationsModule)]
// };
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })), 
    provideClientHydration(), 
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), 
    importProvidersFrom(BrowserAnimationsModule)
  ]
};