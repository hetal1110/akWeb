import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared/global.service';

@Component({
  selector: 'app-action-params',
  templateUrl: './action-params.component.html',
  styleUrls: ['./action-params.component.css']
})
export class ActionParamsComponent implements OnInit {

  constructor(private globalService : GlobalService) { }

  ngOnInit() {
  }

  private params: any;
  private EventParametersSrNo:number;
  private Sr:number;

  agInit(params: any): void {
      // console.log("params : " + JSON.stringify(params.data));
      this.params = params.data;
      this.EventParametersSrNo = this.params.EventParametersSrNo;
      this.Sr = this.params.Sr;
  }

  Edit() {

    let sendData = {};
    if(this.Sr > 0) {
      //Emit an EventParametersSrNo
      sendData = {command: 'EDITPARAMS', params:{params: this.params}};
    }
    else {
       //Event Parameter
       sendData = {command: 'EDIT', params:{EventParametersSrNo: this.EventParametersSrNo, Sr: this.Sr}};
    }
    this.globalService.setEmitter(sendData);
  }

  //Delete Event Params, Options
  Delete() {
    // alert(this.EventParametersSrNo);
    // alert(this.Sr);
    //Event Parameter Option
    
    let sendData = {};
    if(this.Sr > 0) {
      //Emit an EventParametersSrNo
      sendData = {command: 'DELETEPARAMS', params:{params: this.params}};
    }
    else {
       //Event Parameter
       sendData = {command: 'DELETE', params:{EventParametersSrNo: this.EventParametersSrNo, Sr: this.Sr}};
    }
    this.globalService.setEmitter(sendData);
  }

}
