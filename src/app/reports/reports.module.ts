import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { DropdownModule, GrowlModule, ButtonModule } from 'primeng/primeng';
import { AgGridModule } from 'ag-grid-angular/main';
import { Routes, RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports-routing.module';


@NgModule({
  declarations: [   
    ReportsComponent    
  ],  
  imports: [
    CommonModule,
    DropdownModule,
    GrowlModule,
    ButtonModule,
    AgGridModule.withComponents([]),
    ReportsRoutingModule,
  ]
})
export class ReportsModule { }