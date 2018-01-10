import { Component, OnInit, OnDestroy } from '@angular/core';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogModule, Message, GrowlModule, ConfirmDialogModule, ConfirmationService, SelectItem, FileUploadModule } from 'primeng/primeng';
import { Observable, Subscription } from 'rxjs';
import { GlobalService } from '../../shared/global.service';
import {GridOptions} from "ag-grid";
import { HttpParams } from '@angular/common/http';
import { ActionMoneyComponent } from './action-money.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-moneyco',
  templateUrl: './add-moneyco.component.html',
  styleUrls: ['./add-moneyco.component.css']
})
export class AddMoneycoComponent implements OnInit, OnDestroy {

  public listener: Subscription;
  public routeParams: Subscription;
  public gridOptions: GridOptions;
  public gridImportOptions: GridOptions;
  public cpygridOptions: GridOptions;
  public params: any;
  public dataList: any;
  public saveDisabled: boolean = false;
  public showImportGrid: boolean = false;
  msgs: Message[] = [];
  display: boolean = false;
  displayCopy: boolean = false;
  form: FormGroup;
  cpform: FormGroup;
  isIcardExists: boolean = false;
  showCoOrd: boolean = false;
  editMode: boolean = false;
  IdCard;
  EventId;
  eventName:string
  eventList: SelectItem[];
  showLoader: boolean = false;

  //On Init
  ngOnInit() {

    // Listen for changes in the service
    this.listener = this.globalService.getChangeEmitter()
    .subscribe(paramsFromService => {
        // console.log("paramsFromService : " + JSON.stringify(paramsFromService));

        switch (paramsFromService.command) {
            case 'DELETE':
                this.onDelete(paramsFromService.params.idCard);
            break;
            case 'EDIT':
                this.editEventCoOrd(paramsFromService.params);
            break;
            default:
                // this.defaultMethod(paramsFromService);
            break;
        }
    });

    // console.log("ngOnInit : " + (this.listener));
  }

  constructor( private route: ActivatedRoute,
               private globalService : GlobalService,
               private fb: FormBuilder,
               private router: Router,
               private confirmationService: ConfirmationService) {

    //To initialize Grid
    this.initializeGrid();
    this.initializeForm();

    //Set EventId
    this.routeParams = this.route.params
      .subscribe(
        (params: Params) => {
            this.EventId = +params['id'];
            // alert(this.EventId);
            this.eventName = this.route.snapshot.queryParams['name'];
        }
     );
  }

  //To initialize form
  initializeForm() {
      this.form = this.fb.group({
        'IdCard': new FormControl('', Validators.required),
        'EventId': new FormControl(this.EventId),
        'IsMoneyCo': new FormControl(),
        'ClientIPAddress': new FormControl('1'),
        
    });

    this.cpform = this.fb.group({
        'event': new FormControl({id: 'none', name: '-- Select Event --'}, Validators.required)
    });
  }

  //To initialize Grid
  initializeGrid() {

      //Define gridOptions here
      this.gridOptions = <GridOptions>{};
      this.gridImportOptions = <GridOptions>{};
      this.gridOptions = <GridOptions>{
          onGridReady: () => {
              this.GetEventMoneyCo();
          },
        icons: {
            sortAscending: '<i class="fa fa-long-arrow-down"/>',
            sortDescending: '<i class="fa fa-long-arrow-up"/>',
        },
          onCellClicked: (params) => {
              // console.log("onCellClicked :: " + JSON.stringify(params.data);

              //On Deletion of Member
            //   if(params.colDef.field == "delete") {
            //     this.onDelete(params.data.idCard);
            //   }
          }
      };

      // Define Grid column definition
      this.gridOptions.columnDefs = this.createColumnDefs();

      // Define Grid column definition
      this.gridImportOptions.columnDefs = this.createImportColumnDefs();

      this.showCoOrd = true; 
      this.cpygridOptions = <GridOptions>{
        onGridReady: () => {
            this.cpygridOptions.api.setRowData(null);
            // this.cpygridOptions.api.sizeColumnsToFit();
        },
        icons: {
              sortAscending: '<i class="fa fa-long-arrow-down"/>',
              sortDescending: '<i class="fa fa-long-arrow-up"/>',
        },
      }; 
      this.cpygridOptions.columnDefs = this.createCpyColumnDefs();
  }

  // Define Grid column definition
  private createColumnDefs() {
        return [
          {
              headerName: "Co-Ordinator Name",
              field: "name",
              filter: 'text'
          },
          {
              headerName: "Id Card",
              field: "idCard",
              filter: 'text'
          },
          {
              headerName: "Is Money Co-Ordinator?",
              field: "IsMoneyCo",
              filter: 'set'
          },
          {
              headerName: "Action",
              field: "delete",
              cellRendererFramework: ActionMoneyComponent,
              suppressFilter: true,
              suppressSorting: true
          }
          
      ];

    }

    // Define Grid column definition
    private createCpyColumnDefs() {
        return [
            {
                headerName: "Co-Ordinator Name",
                field: "name",
                filter: 'text',
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
            },
            {
                headerName: "Id Card",
                field: "idCard",
                filter: 'text'
            },
            {
              headerName: "Is Money Co-Ordinator?",
              field: "IsMoneyCo",
              filter: 'set'
           },
        ];

  }

  //This is Delete Action cell renderer
//   actionCellRenderer(params) {
//     let html = '<img title="Delete" alt="Delete" src="assets/Images/icon_delete.png" style="cursor:pointer;"/>';
//     return html;
//   }
  
  //On Deletion of Member
  onDelete(ICardId:any) {

    //Confirmation dialogue
    this.confirmationService.confirm({
        
        message: 'Do you want to delete this record?',
        header: 'Delete Confirmation',
        icon: 'fa fa-trash',
        accept: () => {
            
            //Send request to server
            let myParams = new HttpParams() 
            .set('EventId', this.EventId) 
            .set('ICardId', ICardId);  
            
            this.globalService.delete('AkEvent/DeleteEventMoneyCo', myParams)
            .subscribe((data: string[]) => {

                   //console.log("data : " + JSON.stringify(data));
                   //Display message
                   this.msgs = [];
                   this.msgs = [{severity:'success', summary:'Confirmed', detail:'Record deleted!'}];
                   
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
  
  //To Get Event Co Ordinator
  GetEventMoneyCo() {
      
      let myParams = new HttpParams() 
      .set('EventId', this.EventId);  
      
      this.globalService.Get('AkEvent/GetEventMoneyCo', myParams)
      .subscribe((data: string[]) => {
              //console.log("data : " + JSON.stringify(data));

              this.gridOptions.api.setRowData(data);
              this.showLoader = false;
          },
          (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
          }
      );
  }

  //On Blur of Id Card number
  personInfo : string[];
  getMemberInfo(form : FormGroup) {

    if(form['IdCard'].length == 0) {
        this.isIcardExists =  false;
        return;
    }

    //This is for Event City
    let params = new HttpParams()  
    .set('TYPE', "GETPERSONINFO") 
    .set('LOV_COLUMN', form['IdCard']); 

    //Get person Info
    this.globalService.Get('AkEvent/GetPersonInfo', params)
      .subscribe((data: any) => {
            // console.log(data[0]);

            //Icard is not exists
            this.isIcardExists =  false;
            if(data[0] !== undefined) {
                this.personInfo = data[0];
                this.isIcardExists =  true;
            }
            else {
                // alert("IdCard not exists!");
                this.msgs = [];
                this.msgs.push({severity:'error', summary:'error', detail:'This Id Card is not linked to Akonnect!'});

                setTimeout(()=>{    
                    this.msgs = [];
                },7000);
            }
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //Call on Add Event Money Co
  onAddEventMoneyCo(form : FormGroup) {
      
      //console.log(form);
      form['EventId'] = this.EventId;

      //Get Ip address of the machine
      this.globalService.GetIp('http://ipv4.myexternalip.com/json', null)
      .subscribe((data: any) => {
            // console.log("data : " + JSON.stringify(data));

            //Send data to server
            form['ClientIPAddress'] = data.ip;
            this.postDataToServer(form);
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //copy Co-Ordinators from Previous Event
  openCopyOverlay() {
    this.cpform.controls['event'].setValue({id: '', name: '-- Select Event --'});
    
    this.displayCopy = true;
    this.showCoOrd = false; 

    //This is for Event Type
    this.eventList = [];
    this.eventList.push({label:'-- Select Event --', value:{id: 'none', name: ''}});
    
    //This is for Event City
    let params = new HttpParams()  
    .set('TYPE', "COPYEVENTS")
    .set('LOV_COLUMN', this.EventId); 

    //Get person Info
    this.globalService.Get('AkEvent/copyEvents', params)
    .subscribe((data: string[]) => {
            // console.log("data : " + JSON.stringify(data));
            for (let i in data) {
               this.eventList.push({label:data[i]["name"], value:data[i]});
            }
        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
  }

  //On selection of Event
  getSelectedEventCoOrd(form : FormGroup) {

    // console.log(form);
    
    //If Event Id is not set
    if(form['event'].id && form['event'].id != 'none') {

        // this.showLoader = true;
        
        let myParams = new HttpParams() 
        .set('PastEventId', form['event'].id)
        .set('PresentEventId', this.EventId);
      
        this.globalService.Get('AkEvent/toCopyEventMoneyCo', myParams)
        .subscribe((data: string[]) => {
                // console.log("data : " + JSON.stringify(data));
                
                 this.showCoOrd = true; 
                 
                 setTimeout(()=> {
                    this.showLoader = false;
                    this.cpygridOptions.api.setRowData(data);
                    this.cpygridOptions.api.sizeColumnsToFit();
                 },500);
            },
            (error) => {
                //   console.log(error);
                this.showLoader = false;
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
        );
    }
    else {
        this.showCoOrd = true; 

        setTimeout(()=> {
            this.cpygridOptions.api.setRowData(null);
            this.cpygridOptions.api.sizeColumnsToFit();
        },500);
    }
  }

  //Copy selected Event MoneyCo
  toCopyEventMoneyCo(form : FormGroup) {

    // console.log("toCopyEventMoneyCo : " + JSON.stringify(this.cpygridOptions.api.getSelectedRows()));

    let SelectedRows = this.cpygridOptions.api.getSelectedRows();

    if(!SelectedRows.length) {

        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Please select Co-Ordinator!'}];
        return false;
    }

    //Get Ip address of the machine
    this.globalService.GetIp('http://ipv4.myexternalip.com/json', null)
    .subscribe((data: any) => {
            // console.log("toCopyEventMoneyCo : " + JSON.stringify(data));

            //Prepare Data to send Server
            var dtSentToServer = {};
            for (var i = 0; i < SelectedRows.length; i++) {

                let postArray = SelectedRows[i];

                let rowData = {EventId:0, IdCard:'', ClientIPAddress: '', type: 'A', IsMoneyCo: false};
                rowData.EventId = this.EventId;
                rowData.IdCard = postArray.idCard;
                rowData.ClientIPAddress = data.ip;
                rowData.IsMoneyCo = postArray.IsMoneyCo == "Yes" ? true : false;
                dtSentToServer[i] = rowData;
            }

            // console.log("dtSentToServer : " + JSON.stringify(dtSentToServer));

            this.globalService.post('AkEvent/ImportMoneyCO/', dtSentToServer)
            .subscribe((data: any) => {
                    //Display message
                    this.msgs = [];
                    this.msgs.push({severity:'success', summary:'Success', detail:'Co-Ordinator(s) added!!'});

                    //To Reset
                    this.reset();

                    //To Get Event Money Co
                    this.GetEventMoneyCo();
                    
                },
                (error) => {
                    // console.log(error);
                    this.msgs = [];  
                    this.msgs = [{severity:'error', summary:'error', detail:'Co-Ordinator(s) not added, Try again!'}];
                }
            );
        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
  }

  //Send data to server
  postDataToServer(form: FormGroup) {
      
    //    console.log("form : " + JSON.stringify(form));

        //Set Type
       let url = 'AkEvent/addEventMoneyCo/'; 
       form['type'] = 'A';
       if(this.editMode) {
           form['IdCard'] = this.IdCard;
           form['type'] = 'U';
       }
            
       this.globalService.post(url, form)
      .subscribe((data: any) => {
          
        //   console.log("data : " + JSON.stringify(data));

          //If Co-Ordinator is already added
          if(data[0].Counts) {
              this.msgs = [];
              this.msgs.push({severity:'error', summary:'error', detail:'Co-Ordinator already exists!'});
          }
          else {

              //Display message
              this.msgs = [];
              this.msgs.push({severity:'success', summary:'Success', detail:'Record saved!'});
            
              //To Reset
              this.reset();
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
  reset() {

    //Hide dialogue
    this.display = false;
    this.displayCopy =  false;
    this.isIcardExists =  false;
    this.editMode =  false;
    this.IdCard = 0;

    //Reset the form 
    this.form.reset();
    this.cpform.reset();

    this.form.controls['IdCard'].enable();

    this.initializeForm();

    //Refresh the Grid
    this.GetEventMoneyCo();
  } 

  //Call on Export
  onExport() {
    
    // this.gridOptions.api.exportDataAsExcel(null);
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

    let day=dd.toString(); let month=mm.toString(); let date;

    if(dd<10) {
        day = '0'+ dd;
    } 

    if(mm<10) {
        month = '0'+ mm;
    } 

    date = day + '/' + month + '/' + yyyy;

    var params = {
        fileName: this.eventName + '_Money_Co-Ordinator_' + date,
        columnKeys: ['name','idCard','IsMoneyCo']
    };
    
    var content = this.gridOptions.api.getDataAsExcel(params);
    var workbook = XLSX.read(content, {type: 'binary'});
    var xlsxContent = XLSX.write(workbook, {bookType: 'xlsx', type: 'base64'});
    this.globalService.download(params, xlsxContent);
    
  }

  //redirect To Event Page
  redirecTo() {
     this.router.navigate(['/event']);
  }

  //To download sample file
  download() {
      this.globalService.downloadSample('AkEvent/GetDownloadSampleMoneyCo');
  }

  // Define Grid column definition
    private createImportColumnDefs() {
        return [
            { headerName: "Co-Ordinator Name", field: "name", filter: 'text' },
            { headerName: "Id Card*", field: "Idcard No*", filter: 'text' },
            { headerName: "Is Money Co-Ordinator?*", field: "Is Money Co-Ordinator?*", filter: 'text' },
            { headerName: "Error", field: "Error", cellStyle: this.cellStyle }
        ];
    }  

    //Error style for cell
    cellStyle(params) {
        if (params.data.Error != " -") {
           return { 'background-color': 'pink'};
        }
    };
    
    //file upload event  
    uploadData(event) {  

        // alert("uploadData");
        
        //cancel Upload
        this.showLoader = true;
        this.cancelUpload();

        let fileList: FileList = event.target.files; 

        if (fileList.length > 0) {  
            
            let file: File = fileList[0];  
            let formData: FormData = new FormData();  
            formData.append('uploadFile', file, file.name);  
            formData.append('eventId', this.EventId);  
            formData.append('TYPE', 'EVENTINVITATIONS');
            this.globalService.post('AkEvent/UploadMoneyCo/', formData)
            .subscribe((data: any) => {
                
                // console.log("data : " + JSON.stringify(data));
                this.dataList = data;

                this.showImportGrid = true;
                setTimeout(()=> {

                    this.gridImportOptions.api.setRowData(data);
                    this.gridImportOptions.api.sizeColumnsToFit();
                    
                    //Disabled the save button if any error
                    for(let i=0; i<data.length; i++) {

                        if(data[i].Error != " -") {
                            this.saveDisabled = true;
                        }
                    }
                 },500);
                 this.showLoader = false;
              },
              (error) => {
                    // console.log(error);
                    // this.msgs = [];  
                    this.msgs = [{severity:'error', summary:'error', detail:'File not uploaded, Verify with sample file and Try again!'}];
                    this.showLoader = false;
                    setTimeout(()=>{    
                        this.msgs = [];
                    },7000);
              }
            );
        }   
    }

    //To call while cancel the upload
    cancelUpload() {
       this.dataList = {};
       this.showImportGrid = false;
       this.saveDisabled = false;
    }

    //Insert data in DB [Import Action]
    uploadDB() {

        this.showLoader = true;
        
        //Get Ip address of the machine
        this.globalService.GetIp('http://ipv4.myexternalip.com/json', null)
        .subscribe((data: any) => {
                // console.log("data : " + JSON.stringify(data));

                // console.log("dataList : " + JSON.stringify(this.dataList));

                //Send data to server
                var dtSentToServer = {};
                for (var i = 0; i < this.dataList.length; i++) {

                    let postArray = this.dataList[i];

                    let rowData = {EventId:0, IdCard:'', ClientIPAddress: '', type: 'A', IsMoneyCo: false};
                    rowData.EventId = postArray.EventId;
                    rowData.IdCard = postArray.IdCard;
                    rowData.ClientIPAddress = data.ip;
                    rowData.IsMoneyCo = postArray.IsMoneyCo == "Yes" ? true : false;
                    dtSentToServer[i] = rowData;
                }

                // console.log("dtSentToServer : " + JSON.stringify(dtSentToServer));

                this.globalService.post('AkEvent/ImportMoneyCO/', dtSentToServer)
                .subscribe((data: any) => {
                        //Display message
                        this.msgs = [];
                        this.msgs.push({severity:'success', summary:'Success', detail:'Data imported!'});
                        this.GetEventMoneyCo();
                        this.cancelUpload();
                    },
                    (error) => {
                        // console.log(error);
                        this.msgs = [];  
                        this.msgs = [{severity:'error', summary:'error', detail:'Data not imported, Try again!'}];

                        this.cancelUpload();
                    }
                );
            },
            (error) => {
                //   console.log(error);
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
        );
    };  

   //To Edit Event Params
  editEventCoOrd(params) {
    // console.log("EditParams : " + JSON.stringify(params));

     let myParams = new HttpParams()  
      .set('type', "FETCHINFO")
      .set('EventId', this.EventId)
      .set('IdCard', params.idCard);  
     
      //Server Side call
      this.globalService.Get('AkEvent/GetEventMoneyCo', myParams)
      .subscribe((data: any) => {
        //   console.log('editParams : ' + JSON.stringify(data[0]));

          //Set Control Values
          let arrData = data[0];
          for(let key in arrData) {

              //Set values
              if(this.form.controls[key] !== undefined) {

                //Convert Date Object
                this.form.controls[key].setValue(arrData[key]);
              }
          }
          
          //Set IDCard field disabled
          this.personInfo = data[0];
          this.isIcardExists =  true;
          this.form.controls['IdCard'].patchValue(arrData['IdCard'], {disabled: true});
          this.form.controls['IdCard'].disable();
            this.editMode = true;
            this.IdCard = arrData['IdCard'];
            this.display = true;
        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  ngOnDestroy() {
    this.listener.unsubscribe();
    this.routeParams.unsubscribe();

    // console.log("ngOnDestroy : " + (this.listener));
  }

}
