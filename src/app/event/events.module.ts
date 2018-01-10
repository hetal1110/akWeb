import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AgGridModule} from "ag-grid-angular/main";

import { EventsRoutingModule } from './events-routing.module';

// Event Components
import { EventComponent } from './event.component';
import { ActionComponent } from './action/action.component';

import { EventaddComponent } from './eventadd/eventadd.component';

import { EventparamsComponent } from './eventparams/eventparams.component';
import { EventparamsoptionsComponent } from './eventparams/eventparamsoptions.component';
import { ActionParamsComponent } from './eventparams/action-params/action-params.component';

import { AddinviteeComponent } from './addinvitee/addinvitee.component';
import { ActioninviteeComponent } from './addinvitee/actioninvitee.component';

import { CancelChargesComponent } from './cancel-charges/cancel-charges.component';
import { ActionchargesComponent } from './cancel-charges/actioncharges.component';

import { AddMoneycoComponent } from './add-moneyco/add-moneyco.component';
import { ActionMoneyComponent } from './add-moneyco/action-money.component';

import { ProgressbarComponent } from './progressbar/progressbar.component';

import {SelectItem, DropdownModule, CalendarModule, EditorModule, CheckboxModule, AutoCompleteModule, SplitButtonModule,
MenuModule, MenuItem, GrowlModule, Message, TabViewModule, DialogModule, ConfirmDialogModule, ConfirmationService, FileUploadModule, StepsModule } 
from 'primeng/primeng';

@NgModule({
   declarations:[
    EventComponent,
    EventaddComponent,
    EventparamsComponent,
    EventparamsoptionsComponent,
    AddinviteeComponent,
    ActionComponent,
    CancelChargesComponent,
    AddMoneycoComponent,
    ActionParamsComponent,
    ActionMoneyComponent,
    ProgressbarComponent,
    ActioninviteeComponent,
    ActionchargesComponent,
   ],
   imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EventsRoutingModule,
    DropdownModule,
    CalendarModule,
    EditorModule,
    CheckboxModule,
    AutoCompleteModule,
    SplitButtonModule,
    MenuModule,
    GrowlModule,
    TabViewModule,
    DialogModule,
    ConfirmDialogModule,
    FileUploadModule,
    StepsModule,
    AgGridModule.withComponents([ActionComponent, EventparamsoptionsComponent, ActionParamsComponent, ActionMoneyComponent, ActioninviteeComponent, ActionchargesComponent])
  ],
  providers: [ConfirmationService],
})

export class EventsModule {}