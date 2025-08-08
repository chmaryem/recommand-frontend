import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Function to load Google API script
function loadGoogleApiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
}

// Bootstrap the application after loading the Google API script
loadGoogleApiScript()
  .then(() => {
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        importProvidersFrom(FormsModule, SocialLoginModule),
        {
          provide: 'SocialAuthServiceConfig',
          useValue: {
            autoLogin: false,
            providers: [
              {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider('384686821498-u3bd0cl2qjj3cl3q1cqugjj0pjf98u70.apps.googleusercontent.com')
              },
              {
                id: FacebookLoginProvider.PROVIDER_ID,
                provider: new FacebookLoginProvider('YOUR_FACEBOOK_APP_ID') // Replace with your Facebook App ID
              }
            ]
          } as SocialAuthServiceConfig
        }
      ]
    }).catch(err => console.error('Bootstrap error:', err));
  })
  .catch(err => console.error('Failed to load Google API script:', err));
