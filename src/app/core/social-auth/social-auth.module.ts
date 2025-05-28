import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { environment } from '../../../environments/environment';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SocialLoginModule
  ],
  exports: [
    SocialLoginModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.googleClientId,
              {
                prompt: 'select_account',
                oneTapEnabled: false // Disable One Tap to avoid potential issues
              }
            )
          }
        ],
        onError: (err) => {
          console.error('Google OAuth error:', err);
        }
      } as SocialAuthServiceConfig
    }
  ]
})
export class SocialAuthModule { } 