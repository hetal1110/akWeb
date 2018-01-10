import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule} from "ag-grid-angular/main";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { ErrorComponent } from './error/error.component';

import { AutoCompleteModule, GrowlModule, Message, DropdownModule, InputTextModule, DialogModule, ButtonModule } from 'primeng/primeng';

import { ReactiveFormsModule } from '@angular/forms';

import { GlobalService } from './shared/global.service';

//UpdateICardComponent
import { UpdateICardComponent } from './update-icard/update-icard.component';

//login related
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './login/otp/otp.component';
import { AuthGaurd } from './login/auth-gaurd.service';
import { DashbComponent } from './dashb/dashb.component';
import { NonIcardComponent } from './login/non-icard/non-icard.component';
import { NonIcardOtpComponent } from './login/non-icard/non-icard-otp.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './login/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ErrorComponent,
    LoginComponent,
    OtpComponent,
    DashbComponent,

    NonIcardComponent,
    NonIcardOtpComponent,
    UpdateICardComponent

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    GrowlModule,
    DropdownModule,
    InputTextModule,
    AutoCompleteModule,
    DialogModule,
    ButtonModule,    
    AgGridModule.withComponents([])

  ],
  providers: [GlobalService, AuthGaurd, 
  {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
