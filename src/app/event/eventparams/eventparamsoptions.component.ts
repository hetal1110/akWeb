import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { Observable } from 'rxjs';
import { GlobalService } from '../../shared/global.service';
import {GridOptions} from "ag-grid";
import {ICellRendererAngularComp} from "ag-grid-angular/main";
import { Message} from 'primeng/primeng';
import { ActionParamsComponent } from './action-params/action-params.component';

@Component({
  selector: 'app-eventparamsoptions',
  templateUrl: './eventparamsoptions.component.html',
  styleUrls: ['./eventparamsoptions.component.css']
})
export class EventparamsoptionsComponent implements OnInit {

  ngOnInit() {
  }

  msgs: Message[];
  displayOption: boolean = false;
  evFormOptions: FormGroup;
  public gridOptions: GridOptions;
  public parentRecord: any;
  SrNo:number = 0;
  EventStatus: boolean = false;

    constructor(
                private fb: FormBuilder, 
                private globalService : GlobalService) {

        this.gridOptions = <GridOptions>{
          
            icons: {
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
            }
        };
        this.gridOptions.columnDefs = this.createColumnDefs();

        //initializeForm
        this.initializeForm();
    }

    //To initialize Grid
    initializeForm() {
        
         this.evFormOptions = this.fb.group({
            'OptionName': new FormControl('', Validators.required),
            'OptionValue': new FormControl('', Validators.required),
            'OptionOrder': new FormControl('', Validators.required),
            'IsActive': new FormControl(false),
            'Rate': new FormControl(0),
            'DepositRate': new FormControl(0),
            'CancellationRate': new FormControl(false),
            'IsDefault': new FormControl(false),
            'EventId': new FormControl(0),
            'EventParametersSrNo': new FormControl(0),
            'SrNo': new FormControl(0),
            
        });
    }

    parentId:number;
    agInit(params: any): void { 
        this.parentRecord = params.node.parent.data;
        //  console.log(' parentRecord :: ' + JSON.stringify(this.parentRecord));
        this.parentId = this.parentRecord.EventParametersSrNo;

        this.EventStatus = this.parentRecord.EventStatus;
    }

    // Sometimes the gridReady event can fire before the angular component is ready to receive it, so in an angular
    // environment its safer to on you cannot safely rely on AfterViewInit instead before using the API
    ngAfterViewInit() {
        this.getEventParamsOptions(this.parentId);
    }

    addOption(parentId) {
        // this.evFormOptions.controls['EventParametersSrNo'].patchValue(parentId);
        // this.displayOption = true;

        let sendData = {};
        sendData = {command: 'ADDOPTION', params:{parentId: parentId}};
        this.globalService.setEmitter(sendData);
    }

     //To get Event Params Options
    private getEventParamsOptions(parentId) {

        let rowData: any[] = [];
        let eventParamOptions = {};

        let myParams = new HttpParams() 
        .set('EventId', this.parentRecord.EventId)
        .set('EventParametersSrNo', parentId)
        .set('type', "FETCHPARAMS");  
        
        this.globalService.Get('AkEvent/GetEventParams', myParams)
        .subscribe((childData: any[]) => {
                // console.log("childData : " + JSON.stringify(childData));

                //set Row Data
                setTimeout(()=> {
                    this.gridOptions.api.setRowData(childData);
                   //this.gridOptions.api.sizeColumnsToFit();
                 },1000);
            },
            (error) => {
                //   console.log(error);
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
        );
    }

    private createColumnDefs() {
        return [{headerName: 'Option Name', field: 'OptionName', cellClass: 'call-record-cell', filter: 'text'},
            {headerName: 'Option Order', field: 'OptionOrder', cellClass: 'call-record-cell', filter: 'number'},
            {
                headerName: "Action",
                field: "edit",
                cellRendererFramework: ActionParamsComponent,
                suppressFilter: true,
                suppressSorting: true
            }];
    }

    // if we don't do this, then the mouse wheel will be picked up by the main
    // grid and scroll the main grid and not this component. this ensures that
    // the wheel move is only picked up by the text field
    consumeMouseWheelOnDetailGrid($event) {
        $event.stopPropagation();
    }
}
