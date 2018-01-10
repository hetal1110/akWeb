import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventComponent } from './event.component';
import { EventaddComponent } from './eventadd/eventadd.component';
import { EventparamsComponent } from './eventparams/eventparams.component';
import { AddinviteeComponent } from './addinvitee/addinvitee.component';
import { CancelChargesComponent } from './cancel-charges/cancel-charges.component';
import { AddMoneycoComponent } from './add-moneyco/add-moneyco.component';

const eventsRoutes: Routes = [
    { path: '', component: EventComponent },
    { path: 'new', component: EventaddComponent},
    { path: ':id/edit', component: EventaddComponent },
    { path: ':id/addParams', component: EventparamsComponent},
    { path: ':id/addInvitees', component: AddinviteeComponent},
    { path: ':id/cancelCharges', component: CancelChargesComponent},
    { path: ':id/addCoord', component: AddMoneycoComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(eventsRoutes)
  ],
  exports: [RouterModule]
})
export class EventsRoutingModule {}
