import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CpLayoutComponent } from './layout/cp-layout/cp-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CpRoutingModule } from './cp/cp-routing.module';
import { CommonModule } from '@angular/common';
import { MnoLayoutComponent } from './layout/mno-layout/mno-layout.component';
import { ArtistLayoutComponent } from './layout/artist-layout/artist-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { ArtistRoutingModule } from './artist/artist-routing.module';
import { AdminRoutingModule } from './admin/admin-routing.module';
import { MnoRoutingModule } from './mno/mno-routing.module';
import { HomeComponent } from './shared/components/home/home.component';
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';
import { HomeRouteModule } from './home/home-routing-module';
import { LoginComponent } from './auth/login/login.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { ToastrModule } from 'ngx-toastr';
import { LoginPopupComponent } from './shared/components/login-popup/login-popup.component';
import { QrPopupComponent } from './shared/components/qr-popup-component/qr-popup-component.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserLayoutComponent } from './layout/user-layout/user-layout/user-layout.component';
import { UserModule } from './user/user.module';
import { UserRoutingModule } from './user/user-routing.module';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { OtpModalComponent } from './shared/components/otp-modal/otp-modal.component';
import { environment } from 'src/environments/environment';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CpLayoutComponent,
    MnoLayoutComponent,
    ArtistLayoutComponent,
    AdminLayoutComponent,
    HomeComponent,
    HomeLayoutComponent,
    LoginComponent,
    QrPopupComponent,
    UserLayoutComponent,
    UserLoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    CpRoutingModule,
    ArtistRoutingModule,
    AdminRoutingModule,
    MnoRoutingModule,
    HomeRouteModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    MatDialogModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    UserModule,
    UserRoutingModule,
    TranslateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en'
    }),
     LoggerModule.forRoot({
      level: environment.logging.level,              // console logs
      serverLogLevel: environment.logging.serverLogLevel, // sent to backend based on env
      serverLoggingUrl: environment.apiUrl + environment.logging.serverLoggingUrl,   // full backend API
      enableSourceMaps: true,
      httpResponseType: 'json'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
