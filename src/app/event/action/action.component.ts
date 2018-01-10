import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {SplitButtonModule, MenuItem} from 'primeng/primeng';
import { HttpParams } from '@angular/common/http';
import { GlobalService } from '../../shared/global.service';
import { Message } from 'primeng/primeng'

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private globalService : GlobalService) { }
    
  items: MenuItem[];
  msgs: Message[] = [];

  ngOnInit() {

      let EventStatus:boolean = false;
      if(this.params.data.EventStatus != "Pending") {
        EventStatus = true;
      }

      //Items
      this.items = [
          {label: 'Add Event Params', 
          command: () => { this.actionLink('addParams'); }
          //disabled: EventStatus, 
          },
          {label: 'Invite Member', 
           command: () => { this.actionLink('addInvitees'); }
           //disabled: !this.params.data.InviteOnly,
          },
          {label: 'Cancellation Charges', command: () => { this.actionLink('cancelCharges'); }},
          {label: 'Add Event Co-ordinator', command: () => { this.actionLink('addCoord'); }},
          {label: 'Send Event for Approval', command: () => { this.sendEventForApproval(); }},
          
      ];
  }

  private params: any;
  agInit(params: any): void {
      // console.log("params : " + JSON.stringify(params.data));
      this.params = params;
  }

  // Send Event For Approval
  sendEventForApproval() {
      let sendData = {};
      sendData = {command: 'APPROVE', params:{EventId:this.params.data.id, name:this.params.data.name}};
      this.globalService.setEmitter(sendData);
  }

  // Edit Event
  actionLink(url:string) {
      // This is for Edit

      if(url == "edit") {
        this.router.navigate(['/event', +this.params.data.id, url]);
      }
      else if(url == "addInvitees") {
        // Disable link for Invite Only
        // if(this.params.data.InviteOnly) {
          this.router.navigate(['/event', +this.params.data.id, url], { queryParams: { name: this.params.data.name }});
        // }
      }
      else if(url == "addParams") {
        // Disable link for Event Status, Params can be changed until Event is Pending
        // if(this.params.data.EventStatus == "Pending") {
          this.router.navigate(['/event', +this.params.data.id, url], { queryParams: { name: this.params.data.name }});
        // }
      }
      else {
        this.router.navigate(['/event', +this.params.data.id, url], { queryParams: { name: this.params.data.name }});
      }
  }

}
