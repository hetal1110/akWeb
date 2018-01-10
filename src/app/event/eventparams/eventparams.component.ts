import { Component, OnInit } from '@angular/core';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {GridOptions} from "ag-grid";

import { Observable, Subscription } from 'rxjs';

import { GlobalService } from '../../shared/global.service';
import { EventparamsoptionsComponent } from './eventparamsoptions.component';
import { DialogModule, TabViewModule, Message, DropdownModule, CalendarModule, SelectItem, ConfirmationService} from 'primeng/primeng';
import { ActionParamsComponent } from './action-params/action-params.component';

import { ProgressbarComponent } from '../progressbar/progressbar.component';

@Component({
  selector: 'app-eventparams',
  templateUrl: './eventparams.component.html',
  styleUrls: ['./eventparams.component.css']
})
export class EventparamsComponent implements OnInit {

  private listener: Subscription;
  editorVal = [];
  msgs: Message[]= [];
  totalTab:number = 2;
  eventName:string;
  display: boolean = false;
  evForm: FormGroup;
  editor: SelectItem[];
  EventId;
  EventParametersSrNo:number = 0;
  TabNo:number = 0;
  parentId:number = 0;
  displayOption: boolean = false;
  evFormOptions: FormGroup;
  SrNo:number = 0;
  EventStatus: boolean = false;
  
  //On Init
  ngOnInit() {

        // Listen for changes in the service
        this.listener = this.globalService.getChangeEmitter()
        .subscribe(paramsFromService => {
            // console.log("paramsFromService : " + JSON.stringify(paramsFromService));

            switch (paramsFromService.command) {
                case 'EDIT':
                    this.editEventParams(paramsFromService.params);
                break;
                case 'DELETE':
                    this.deleteEventParams(paramsFromService.params);
                break;
                case 'ADDOPTION':
                    this.addOption(paramsFromService.params.parentId);
                break;
                case 'EDITPARAMS':
                    this.editEventParamsOptions(paramsFromService.params.params);
                break;
                case 'DELETEPARAMS':
                    this.deleteEventParamsOptions(paramsFromService.params.params);
                break;
                default:
                    // this.defaultMethod(paramsFromService);
                break;
            }
        });
  }
  
   constructor(
        private globalService : GlobalService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder) {
        
        //Set EventId
        this.route.params.subscribe((params: Params) => {
            this.eventName = this.route.snapshot.queryParams['name'];
            this.EventId = +params['id'];

            let myParams = new HttpParams()  
            .set('TYPE', "GETINFOEVENTS")
            .set('LOV_COLUMN', this.EventId ); 
    
            //Server Side call
            this.globalService.Get('AkEvent/GetParamsEventInfo', myParams)
            .subscribe((data: any) => {
                // console.log(JSON.stringify(data[0]));

                    if(data[0].EventStatusVal == "Pending") {
                         this.EventStatus = true;     
                    }
                }
            );
          }
        );

        //call editor's value
        this.editor = [];
        this.editor.push({label:'-- Select Editor --', value:{id: 'none', name: ''}});

        let editorParams = new HttpParams()  
        .set('TYPE', "LOV")
        .set('LOV_COLUMN', "EVENT_EDITOR"); 

        this.globalService.Get('AkEvent/GetEditor', editorParams)
        .subscribe((data: any) => {
            // console.log(data);
            for (let i in data) {
                this.editor.push({label:data[i]["name"], value:data[i]});
            }

            //For Tab 0 only date field would be display
            if(!this.TabNo) {
                
                //call editor's value
                this.editorVal = [];
                this.editorVal.push({label:'-- Select Editor --', value:{id: 'none', name: ''}});
                this.editorVal.push({label:'Switch', value:{id: 'SW', name: 'Switch'}});

                //Disable option value field and set value as 1 for Tab 0
                this.evFormOptions.controls["OptionValue"].setValue("1");
                this.evFormOptions.controls["OptionValue"].disable();
            }
            else {
                this.editorVal = this.editor;

                this.evFormOptions.controls["OptionValue"].setValue("");
                this.evFormOptions.controls["OptionValue"].enable();
            }
            },
            (error) => {
                console.log(error);
            }
        );


        // console.log(this.editor);

        //initializeForm
        this.initializeForm();
        
        //To initialize Grid
        this.initializeGrid();
  }

  //Initialize Grid
  public gridOptions0: GridOptions;
  public gridOptions1: GridOptions;
  public gridOptions2: GridOptions;
  public gridOptions3: GridOptions;
  public gridOptions4: GridOptions;

  //To initialize Grid
  initializeGrid() {

      //Define gridOptions here
      this.gridOptions0 = <GridOptions>{};
      this.gridOptions1 = <GridOptions>{icons: {sortAscending: '<i class="fa fa-long-arrow-down"/>',sortDescending: '<i class="fa fa-long-arrow-up"/>'}};
      this.gridOptions2 = <GridOptions>{icons: {sortAscending: '<i class="fa fa-long-arrow-down"/>',sortDescending: '<i class="fa fa-long-arrow-up"/>'}};
      this.gridOptions3 = <GridOptions>{icons: {sortAscending: '<i class="fa fa-long-arrow-down"/>',sortDescending: '<i class="fa fa-long-arrow-up"/>'}};
      this.gridOptions4 = <GridOptions>{icons: {sortAscending: '<i class="fa fa-long-arrow-down"/>',sortDescending: '<i class="fa fa-long-arrow-up"/>'}};
     
      this.gridOptions0 = <GridOptions>{
          onGridReady: () => {
              this.getEventParams(0);
          },
          onCellClicked: (params) => {
              //console.log("onCellClicked :: " + params.data.SrNo);
          },
          icons: {
              sortAscending: '<i class="fa fa-long-arrow-down"/>',
              sortDescending: '<i class="fa fa-long-arrow-up"/>',
          },
      };

      // Define Grid column definition
      this.gridOptions0.columnDefs = this.createColumnDefs();
      this.gridOptions1.columnDefs = this.createColumnDefs();
      this.gridOptions2.columnDefs = this.createColumnDefs();
      this.gridOptions3.columnDefs = this.createColumnDefs();
      this.gridOptions4.columnDefs = this.createColumnDefs();
  }

  //To initialize Form
  initializeForm() {
        this.evForm = this.fb.group({
            'ParamName': new FormControl('', Validators.required),
            'ParamDisplayName': new FormControl('', Validators.required),
            'GroupName': new FormControl('', Validators.required),
            'Editor': new FormControl('', Validators.required),
            'ParamOrder': new FormControl('', Validators.required),
            'ParamHelpText': new FormControl(),
            // 'TabNo': new FormControl({value: '1', disabled: true}),
            'TabNo': new FormControl(),
            'Chargeable': new FormControl(),
            'IsDaily': new FormControl(),
            'Cancellable': new FormControl(),
            'IsLocked': new FormControl(),
            'IsActive': new FormControl(),
            'IsMandatory': new FormControl(),
            'ShowInOptions': new FormControl(),
            'ShowInSummary': new FormControl(),
            'ShowOptionUntilDate': new FormControl({value: '', disabled: true}),
            'EventId': new FormControl(this.EventId),
            'EventParametersSrNo': new FormControl(this.EventParametersSrNo),
        });

        this.evFormOptions = this.fb.group({
            'OptionName': new FormControl('', Validators.required),
            'OptionValue': new FormControl('1', Validators.required),
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
  
  //On Tab Change  
  onTabChange(event) {
    // console.log(event.index);
    this.TabNo = event.index;
    this.getEventParams(event.index);

    //For Tab 0 only date field would be display
    if(this.TabNo > 0) {
        
      this.editorVal = this.editor;
      
      this.evFormOptions.controls["OptionValue"].setValue("");
      this.evFormOptions.controls["OptionValue"].enable();

    }
    else {
        
        //  console.log(this.TabNo);
       
        //call editor's value
        this.editorVal = [];
        this.editorVal.push({label:'-- Select Editor --', value:{id: 'none', name: ''}});
        this.editorVal.push({label:'Switch', value:{id: 'SW', name: 'Switch'}});

        //Disable option value field and set value as 1 for Tab 0
        this.evFormOptions.controls["OptionValue"].setValue("1");
        this.evFormOptions.controls["OptionValue"].disable();
    }
  }

  private createColumnDefs() {
        return [
            {
                headerName: 'Parameter Name', field: 'ParamName',
                // left column is going to act as group column, with the expand / contract controls
                cellRenderer: 'agGroupCellRenderer',
                // we don't want the child count - it would be one each time anyway as each parent
                // not has exactly one child node
                cellRendererParams: {suppressCount: true},
                filter: 'text',
            },
            // {headerName: 'Tab No', field: 'TabNo', filter: 'text'},
            {headerName: 'Param Order', field: 'ParamOrder', filter: 'text'},
            {
                headerName: "Action",
                field: "edit",
                // width: 50,
                cellRendererFramework: ActionParamsComponent,
                suppressFilter: true,
                suppressSorting: true
            }
        ];
  }

    public isFullWidthCell(rowNode) {
        return rowNode.level === 1;
    }

    // Sometimes the gridReady event can fire before the angular component is ready to receive it, so in an angular
    // environment its safer to on you cannot safely rely on AfterViewInit instead before using the API
    ngAfterViewInit() {
    }

    public getFullWidthCellRenderer() {
        return EventparamsoptionsComponent;
    }

    public getRowHeight(params) {
        var rowIsDetailRow = params.node.level === 1;
        // return 100 when detail row, otherwise return 25
        return rowIsDetailRow ? 350 : 50;
    }

    public getNodeChildDetails(record) {
        // console.log("record : " + JSON.stringify(record));
        if (record.eventParamOptions) {
            return {
                group: true,
                // the key is used by the default group cellRenderer
                key: record.ParamName,
                // provide ag-Grid with the children of this group
                children: [record.eventParamOptions],
                // for demo, expand the third row by default
                expanded: record.EventParametersSrNo === record.parentId
            };
        } else {
            return null;
        }
    }

    // To create Row Data
    private getEventParams(TabNo) {

        this.TabNo = TabNo;

        let rowData: any[] = [];
        let myParams = new HttpParams() 
        .set('EventId', this.EventId) 
        .set('TabNo', TabNo);  

        this.globalService.Get('AkEvent/GetEventParams', myParams)
        .subscribe((masterData: any[]) => {
                // console.log("masterData : " + JSON.stringify(masterData));

                //Push event Param Options
                for (var i = 0; i < masterData.length; i++) {

                    rowData.push({ 
                        "ParamName": masterData[i].ParamName, 
                        "EventParametersSrNo": masterData[i].EventParametersSrNo, 
                        "Sr": masterData[i].Sr, 
                        "EventId": masterData[i].EventId,
                        "TabNo": masterData[i].TabNo,
                        "ParamOrder": masterData[i].ParamOrder,
                        "parentId": this.parentId,
                        "EventStatus": this.EventStatus,
                        "eventParamOptions": []
                    });
                }

                //set Row Data
                setTimeout(()=> {
                    // console.log("rowData : " + JSON.stringify(rowData));

                    // this.scramble(rowData);

                    switch (TabNo) {
                        case 0:
                            this.gridOptions0.api.setRowData(rowData);
                            //this.gridOptions0.api.sizeColumnsToFit();
                        break;
                        case 1:
                            this.gridOptions1.api.setRowData(rowData);
                            //this.gridOptions1.api.sizeColumnsToFit();
                        break;
                        case 2:
                            this.gridOptions2.api.setRowData(rowData);
                            //this.gridOptions2.api.sizeColumnsToFit();
                        break;
                        case 3:
                            this.gridOptions3.api.setRowData(rowData);
                            //this.gridOptions3.api.sizeColumnsToFit();
                        break;
                        case 4:
                            this.gridOptions4.api.setRowData(rowData);
                            //this.gridOptions4.api.sizeColumnsToFit();
                        break;
                        default:
                            // this.defaultMethod(paramsFromService);
                        break;
                    }
                    
                 }, 500);
            },
            (error) => {
                //   console.log(error);
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
        );
    }

    //redirect To Event Page
    redirecTo() {
        this.router.navigate(['/event']);
    }

    //on Add Event Parameter
    onAddEventParameter(form : FormGroup) {
      form['EventId'] = this.EventId; 
      form['EventParametersSrNo'] = this.EventParametersSrNo; 
      form['TabNo'] = this.TabNo; 
        //   console.log(form);

      this.globalService.post('AkEvent/addEventParams/', form)
      .subscribe((data: any) => {
          
          //console.log("data : " + JSON.stringify(data));

           //Display message
           this.msgs = [];
           this.msgs.push({severity:'success', summary:'Success', detail:'Record saved!'});
        
           //To Reset
           this.reset();
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Record not saved, Try again!'}];
        }
      );
    }

  //Call on Reset 
  reset() {

    //Hide dialogue
    this.display = false;
    this.EventParametersSrNo = 0;

    //Reset the form 
    this.evForm.reset();

    //Refresh the Grid
    this.getEventParams(this.TabNo);
  }

  //open Event Params PopUp
  openEventParamsPopUp(tabNo) {
      this.display=true;
      this.EventParametersSrNo = 0;
    //   alert(tabNo);
  }

  //To Delete Event Params
  deleteEventParams(params) {
    // console.log("DeleteParams : " + JSON.stringify(params));

    //Confirmation dialogue
    this.confirmationService.confirm({
        
        message: 'Do you want to delete this record?',
        header: 'Delete Confirmation',
        icon: 'fa fa-trash',
        accept: () => {
            
            //Send request to server
            let myParams = new HttpParams() 
            .set('EventId', this.EventId)
            .set('EventParametersSrNo', params.EventParametersSrNo)
            .set('SrNo', params.Sr);  
            
            this.globalService.delete('AkEvent/DeleteEventParams', myParams)
            .subscribe((data: any[]) => {

                   //console.log("data : " + JSON.stringify(data));
    
                   if(data[0].Counts) {
                    //    this.msgs = [];
                       this.msgs.push({severity:'error', summary:'error', detail:'Options are exists under this Parameter.You can not delete it!'});

                       setTimeout(()=>{    
                            this.msgs = [];
                        },7000);
                    }
                    else {
                        //Display message
                        this.msgs = [];
                        this.msgs = [{severity:'success', summary:'Confirmed', detail:'Record deleted!'}];
                    }
                   
                   //To Reset
                   this.reset();
                },
                (error) => {
                    // console.log(error);
                    this.msgs = [];  
                    this.msgs = [{severity:'error', summary:'error', detail:'Record not deleted, Try again!'}];
                }
            );
        },
        reject: () => {
            this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected!'}];
        }
    });
  }

  //To Edit Event Params
  editEventParams(params) {
    // console.log("EditParams : " + JSON.stringify(params));

     let myParams = new HttpParams()  
      .set('TYPE', "GETPARAMINFO") 
      .set('EventId', this.EventId)  
      .set('EventParametersSrNo', params.EventParametersSrNo)
      .set('SrNo', params.Sr);  

      this.EventParametersSrNo = params.EventParametersSrNo;
     
      //Server Side call
      this.globalService.Get('AkEvent/GetEventParams', myParams)
      .subscribe((data: any) => {
        //   console.log(JSON.stringify(data[0]));

          //Set Control Values
          let arrData = data[0];
          for(let key in arrData) {

              //Set values
              if(this.evForm.controls[key] !== undefined) {

                //Convert Date Object
                if(key.indexOf("date") > 0 || key.indexOf("Date") > 0) {
                  if(arrData[key] != null && arrData[key] != "" && arrData[key] !== undefined) {
                      arrData[key] = new Date(arrData[key]);
                      this.evForm.controls[key].setValue(arrData[key]);
                  }
                }
                else {
                  this.evForm.controls[key].setValue(arrData[key]);
                }
              }
          }

          //Set Drop Down values 
          this.evForm.controls['Editor'].setValue({id:arrData['EditorCode'], name:arrData['Editor']});
          this.display=true;
        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //Call on cancel 
  cancelParams() {
    //Hide dialogue
    this.display = false;

    //Reset the form 
    this.evForm.reset();

    this.initializeForm();
  }
  
  //Add Parameter Option
  addOption(parentId) {
    this.evFormOptions.controls['EventParametersSrNo'].patchValue(parentId);
    this.displayOption = true;
  }

   //on Add Event Parameter
    onAddEventParameterOptions(form : FormGroup) {
      form['EventId'] = this.EventId; 
     //   console.log(form);

     if(!this.TabNo) {
        //Disable option value field and set value as 1 for Tab 0
        form["OptionValue"] = 1;
      }

      this.globalService.post('AkEvent/addEventParamsOptions/', form)
      .subscribe((data: any) => {

          //console.log("data : " + JSON.stringify(data));

          //If member is already added
          if(data[0].Counts) {
              this.msgs = [];
              this.msgs.push({severity:'error', summary:'error', detail:'No single Parameter Option should have same Option Name as ‘Yes’ or ‘No’ '});

              setTimeout(()=>{    
                 this.msgs = [];
              },7000);
          }
          else {

            //Display message
            this.msgs = [];
            this.msgs.push({severity:'success', summary:'Success', detail:'Record saved!'});

            //To Reset
            this.resetOption(form['EventParametersSrNo']);                
          }

        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Record not saved, Try again!'}];
        }
      );
    }

    //Call on Reset 
    resetOption(parentId) {

        //Hide dialogue
        this.displayOption = false;

        //Reset the form 
        this.evFormOptions.reset();

        this.initializeForm();

        this.parentId = parentId;
                    
        //Refresh the Grid
        this.getEventParams(this.TabNo);
    }

  //To Delete Event Params
  deleteEventParamsOptions(params) {
        // console.log("DeleteParamsOptions : " + JSON.stringify(params));
        // debugger;
        //Confirmation dialogue
        this.confirmationService.confirm({
            
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'fa fa-trash',
            accept: () => {
                
                //Send request to server
                let myParams = new HttpParams() 
                .set('EventId', this.EventId) 
                .set('EventParametersSrNo', params.EventParametersSrNo)
                .set('SrNo', params.Sr);  
                
                this.globalService.delete('AkEvent/DeleteEventParamsOptions', myParams)
                .subscribe((data: string[]) => {

                    //console.log("data : " + JSON.stringify(data));
                    //Display message
                    this.msgs = [];
                    this.msgs = [{severity:'success', summary:'Confirmed', detail:'Record deleted!'}];
                    
                    //To Reset
                    this.resetOption(params.EventParametersSrNo);
                    },
                    (error) => {
                        // console.log(error);
                        this.msgs = [];  
                        this.msgs = [{severity:'error', summary:'error', detail:'Record not deleted, Try again!'}];
                    }
                );
            },
            reject: () => {
                this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected!'}];
            }
        });
  }

  //To Edit Event Params
  editEventParamsOptions(params) {
    // console.log("EditParamsOptions : " + JSON.stringify(params));

     let myParams = new HttpParams()  
      .set('TYPE', "GETOPTIONINFO") 
      .set('EventId', this.EventId)  
      .set('EventParametersSrNo', params.EventParametersSrNo)
      .set('SrNo', params.Sr);  
     
      this.SrNo = params.Sr;

      //Server Side call
      this.globalService.Get('AkEvent/GetEventParams', myParams)
      .subscribe((data: any) => {
        //   console.log(JSON.stringify(data[0]));

          //Set Control Values
          let arrData = data[0];
          for(let key in arrData) {

              //Set values
              if(this.evFormOptions.controls[key] !== undefined) {

                //Convert Date Object
                if(key.indexOf("date") > 0 || key.indexOf("Date") > 0) {
                  if(arrData[key] != null && arrData[key] != "" && arrData[key] !== undefined) {
                      arrData[key] = new Date(arrData[key]);
                      this.evFormOptions.controls[key].setValue(arrData[key]);
                  }
                }
                else {
                  this.evFormOptions.controls[key].setValue(arrData[key]);
                }
              }
          }
          this.displayOption=true;

        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //Call on cancel 
  cancelOptions() {
    //Hide dialogue
    this.displayOption = false;

    //Reset the form 
    this.evFormOptions.reset();

    this.initializeForm();
  }
}


//Push event Param Options
// for (var i = 0; i < childData.length; i++) {

//     //Push master >> Child
//     if(eventParamOptions[childData[i].EventParametersSrNo] == undefined) {
//         eventParamOptions[childData[i].EventParametersSrNo] = [];
//     }
//     eventParamOptions[childData[i].EventParametersSrNo].push(childData[i]);
// }
// // console.log("eventParamOptions : " + JSON.stringify(eventParamOptions));

// //Push event Param Options
// for (var i = 0; i < masterData.length; i++) {

//     //assign null if no child option
//     if(eventParamOptions[masterData[i].EventParametersSrNo] == undefined) {
//         eventParamOptions[masterData[i].EventParametersSrNo] = [];
//     }
//     rowData.push({ 
//         "ParamName": masterData[i].ParamName, 
//         "EventParametersSrNo": masterData[i].EventParametersSrNo, 
//         "Sr": masterData[i].Sr, 
//         "EventId": masterData[i].EventId,
//         "eventParamOptions": eventParamOptions[masterData[i].EventParametersSrNo]
//     });
// }