import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {GridOptions} from "ag-grid";
import { Observable, Subscription } from 'rxjs';
import { GlobalService } from '../shared/global.service';
import { ActionComponent } from './action/action.component';
import { Message, ConfirmDialogModule, ConfirmationService  } from 'primeng/primeng'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})

export class EventComponent implements OnInit {
    
    public listener: Subscription;
    public gridOptions: GridOptions;
    private params: any;

    msgs: Message[] = [];

    //On Init
    ngOnInit() {

        // Listen for changes in the service
        this.listener = this.globalService.getChangeEmitter()
        .subscribe(paramsFromService => {
            // console.log("paramsFromService : " + JSON.stringify(paramsFromService));

            switch (paramsFromService.command) {
                case 'APPROVE':
                    this.sendEventForApproval(paramsFromService.params.EventId, paramsFromService.params.name);
                break;
                default:
                    // this.defaultMethod(paramsFromService);
                break;
            }
        });
        // console.log("ngOnInit : " + (this.listener));
    }

    constructor(private globalService : GlobalService,
                private router: Router,
                private route: ActivatedRoute,
                private confirmationService: ConfirmationService) {
        
        //To initialize Grid
        this.initializeGrid();
  }
  
    // To initialize Grid
    initializeGrid() {

        //Define gridOptions here
        this.gridOptions = <GridOptions>{};
       
        this.gridOptions = <GridOptions>{
            onGridReady: () => {
               this.onGetEvents();
            },
            icons: {
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
            },
            // rowClassRules: {
            //     // row style function
            //     'sick-days-warning': function(params) {
            //         var numSickDays = params.data.sickDays;
            //         return  numSickDays > 5 && numSickDays <= 7;
            //     },
            //     // row style expression
            //     'sick-days-breach': 'data.sickDays > 8'
            // },
            onCellClicked: (params) => {
                //console.log("onCellClicked :: " + params);
                // this.onEditEvent(params);
            }
        };

         this.gridOptions.columnDefs = this.createColumnDefs();
    }

    // Define Grid column definition
    private createColumnDefs() {
        return  [
                {
                    headerName: "Event Name",
                    field: "name",
                    width: 220,  
                    filter: 'text',
                },
                {
                    headerName: "Start Date",
                    field: "Eventstartdate",
                    width: 200,
                    filter: 'text',
                },
                {
                    headerName: "End Date",
                    field: "Eventenddate",
                    width: 200,
                    filter: 'text',
                },
                {
                    headerName: "Event Status",
                    field: "EventStatus",
                    width: 150,
                    filter: 'set',
                },
                {
                    headerName: "Action",
                    field: "edit",
                    // width: 50,
                    cellRendererFramework: ActionComponent,
                    suppressFilter: true,
                    suppressSorting: true
                }
            ];
    }

    // To Get Event
    onGetEvents() {
        
        let url = 'AkEvent/GetEventDetails';

        let myParams = new HttpParams()  
        this.globalService.Get(url, myParams)
        .subscribe((data: string[]) => {
                // console.log("data : " + data);
                this.gridOptions.api.setRowData(data);
            },
            (error) => {
                // console.log(error);
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
        );
    }

    // Add Event
    onAddEvent() {
        this.router.navigate(['new'], {relativeTo: this.route});
    }

    // Send Event For Approval
    sendEventForApproval(id:any, name:any) {
            
        //Confirmation dialogue
        this.confirmationService.confirm({
            
            message: 'Do you want to send Event for Approval?',
            header: 'Event Approval Confirmation',
            icon: 'fa-thumbs-o-up',
            accept: () => {

                let myParams:any = {EventId:id, name:name}
            
                //Server Side call
                this.globalService.post('AkEvent/sendEventForApproval', myParams)
                .subscribe((data: any) => {
                    //Display message
                    this.msgs = [];
                    this.msgs = [{severity:'success', summary:'Success', detail:'Event sent for Approval!'}];
                    
                },
                (error) => {
                    this.msgs = [];  
                    this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
                }
                );
            },
            reject: () => {
                this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected!'}];
            }
        });
    }
}
