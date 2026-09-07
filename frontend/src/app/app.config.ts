import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
      license: 'eyJpZCI6IjY2MjJlNzkzLTViMDItNGQ3Ni1hMWY2LTFjNWNhNGUzNWEzYiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODg1MjQ0NjQsImV4cCI6MTgyMDA2MDQ2NH0.Dq2K0_64IWPmr-XiAyFiED5WFKUb8MjyvTiPtEPZLyLJmWrcuapQte4jOJOv9UavZnvQxansjIOvOloenwxbBg',
    }),
  ]
};
