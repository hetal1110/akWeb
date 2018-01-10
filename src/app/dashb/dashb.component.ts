import { Component, OnInit } from '@angular/core';
import { AuthGaurd } from '../login/auth-gaurd.service';
import {GlobalService} from '../shared/global.service';
import { Message } from 'primeng/primeng';

@Component({
  selector: 'app-dashb',
  templateUrl: './dashb.component.html',
  styleUrls: ['./dashb.component.css']
})
export class DashbComponent implements OnInit {
events: Array<any> = [];
msgs: Message[] = [];
showLoader: boolean = false;

private memberid: number;
private EMSModuleId: number;

  constructor(private authGaurd: AuthGaurd, private globalService: GlobalService) {
    this.memberid= localStorage.getItem("Id") ? +localStorage.getItem("Id") : 0;
    this.EMSModuleId = 1001;
   }

  ngOnInit() {

    ///// Set Menu
    let sendData = {};
    sendData = {command: 'SETMENU', params:{}};
    this.globalService.setEmitter(sendData);
    /////

    ///// Set Footer
    let sendFooterData = {};
    sendFooterData = {command: 'SETFOOTER', params:{}};
    this.globalService.setEmitter(sendFooterData);

    let sendLoginData = {};
    sendData = {command: 'SETLOGINFOOTER', params:{}};
    this.globalService.setEmitter(sendLoginData);
    
    /////
   this.showLoader = true; 

   const params = { ModuleId: this.EMSModuleId, MemberId: this.memberid, EventId: 0 };
    
   this.globalService.post('Reports/getDashBoard/',params)
    .subscribe(
      (res)=>{     
          res.result.forEach((e)=>{
              var event = { "name": e.EventName, 'UserRoleName': e.UserRoleName, charts: [] }
             
              Object.keys(e).forEach((k) => {
                if (k == 'EventName' || k == 'UserRoleName') {
                 return;
                }
                event.charts.push({
                  description: k,
                  stats: e[k] || 0,
                  icon: (e[k].toString().toUpperCase()== 'AMT') ? 'money' : 'person'
                });
              })
              this.events.push(event);
          })
          this.showLoader = false; 
      },
      (error) => {
        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
      }
    );
  }

}
