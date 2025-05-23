import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, GoogleInitOptions } from '@abacritt/angularx-social-login';
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
            provider: new GoogleLoginProvider(environment.googleClientId, {
              oneTapEnabled: false,
              prompt: 'select_account',
              scopes: 'email profile',
              use_fedcm_for_prompt: false,
              ux_mode: 'popup',
              revoke_on_logout: true,
              plugin_name: 'CineReserve'
            } as GoogleInitOptions)
          }
        ],
        onError: (err) => {
          if (err && err.error !== 'popup_closed_by_user') {
            console.warn('Google OAuth warning:', err.error || err);
          }
        }
      } as SocialAuthServiceConfig
    }
  ]
})
export class SocialAuthModule { } 