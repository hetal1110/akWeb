import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccessComponent } from './access.component';
import { DropdownModule, DialogModule, ButtonModule, GrowlModule, InputTextModule } from 'primeng/primeng';
import { AgGridModule } from 'ag-grid-angular/main';
import { ActionComponent } from './action.component';
import { AccessRoutingModule } from './access-routing.module';
@NgModule({
  declarations: [
    AccessComponent,
    ActionComponent    
  ],  
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DialogModule,
    ButtonModule,
    GrowlModule,
    InputTextModule,
    AgGridModule.withComponents([ActionComponent]),
    AccessRoutingModule
  ]
})
export class AccessModule { }