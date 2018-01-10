import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../shared/global.service';

@Component({
  selector: 'app-money-action-params',
  templateUrl: './action-money.component.html',
  // styleUrls: ['./action-params.component.css']
})
export class ActionMoneyComponent implements OnInit {

  constructor(private globalService : GlobalService) { }

  ngOnInit() {
  }

  private params: any;

  agInit(params: any): void {
      // console.log("params : " + JSON.stringify(params.data));
      this.params = params.data;
  }

  Edit() {

    let sendData = {};
    //Event Parameter
    sendData = {command: 'EDIT', params:{idCard: this.params.idCard}};
    this.globalService.setEmitter(sendData);
  }

  //Delete Event Params, Options
  Delete() {
    //Event Parameter Option
    let sendData = {};
    
    //Event Parameter
    sendData = {command: 'DELETE', params:{idCard: this.params.idCard}};
    this.globalService.setEmitter(sendData);
  }

}
