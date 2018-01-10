import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { HomeComponent } from './home/home.component';
import { UpdateICardComponent } from './update-icard/update-icard.component';
import { AccessComponent } from './access/access.component';
import { DashbComponent } from './dashb/dashb.component';
import { ReportsComponent } from './reports/reports.component';
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './login/otp/otp.component';
import { NonIcardComponent } from './login/non-icard/non-icard.component';
import { NonIcardOtpComponent } from './login/non-icard/non-icard-otp.component';
import { LoginResolver } from './login/login-resolver.service';
import { NonIcardResolver } from './login/non-icard/non-icard-resolver.service';
import { AuthGaurd } from './login/auth-gaurd.service';
import { ErrorComponent } from './error/error.component';

const appRoutes: Routes = [
  // { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch : "full"},
  { path: 'login', component: LoginComponent}, 
  { path: 'login/:ICardId', component: LoginComponent},
  { path: 'login/otp/:RefId/:ICardId/:modules', component: OtpComponent, resolve: { ModuleInfo: LoginResolver} },
  { path: 'nonicard', component: NonIcardComponent}, 
  { path: 'nonicard/otp/:forminfo', component: NonIcardOtpComponent, resolve: { NonIcardInfo: NonIcardResolver} },
  { path: 'dashb', component: DashbComponent, canActivate: [AuthGaurd] },
  { path: 'event', loadChildren:'./event/events.module#EventsModule', canActivate: [AuthGaurd]},
  { path: 'updateICard', component: UpdateICardComponent, canActivate: [AuthGaurd]},
  { path: 'reports', loadChildren:'./reports/reports.module#ReportsModule', canActivate: [AuthGaurd]},
  { path: 'access', loadChildren:'./access/access.module#AccessModule', canActivate: [AuthGaurd]},
  { path: '**', component: ErrorComponent}, 
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {useHash:true})],
  exports: [RouterModule],
  providers: [LoginResolver, NonIcardResolver]
})

export class AppRoutingModule {

}