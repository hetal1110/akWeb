import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../shared/global.service';

@Component({
  selector: 'app-actioncharges',
  templateUrl: './actioncharges.component.html'
})
export class ActionchargesComponent implements OnInit {

  constructor(private globalService : GlobalService) { }

  ngOnInit() {
  }

  private params: any;
  agInit(params: any): void {
      // console.log("params : " + JSON.stringify(params.data));
      this.params = params.data;
  }

  //Delete Event Params, Options
  Delete() {
    //Event Parameter Option
    let sendData = {};
    
    //Event Parameter
    sendData = {command: 'DELETE', params:{id: this.params.SrNo}};
    this.globalService.setEmitter(sendData);
  }

}
