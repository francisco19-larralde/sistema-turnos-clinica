import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
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
