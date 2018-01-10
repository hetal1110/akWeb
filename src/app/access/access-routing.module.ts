import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccessComponent } from './access.component';


const accessRoutes: Routes = [
    { path: '', component: AccessComponent }   
];

@NgModule({
  imports: [
    RouterModule.forChild(accessRoutes)
  ],
  exports: [RouterModule]
})
export class AccessRoutingModule {}
