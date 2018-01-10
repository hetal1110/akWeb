import { Component, OnInit, ViewChild } from '@angular/core';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogModule, Message, GrowlModule, ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { GlobalService } from '../../shared/global.service';
import {GridOptions} from "ag-grid";
import { HttpParams } from '@angular/common/http';
import { ActioninviteeComponent } from './actioninvitee.component';
import { Observable, Subscription } from 'rxjs/Rx'; 
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-addinvitee',
  templateUrl: './addinvitee.component.html',
  styleUrls: ['./addinvitee.component.css']
})
export class AddinviteeComponent implements OnInit {
 
 gridOptions: GridOptions;
 gridImportOptions: GridOptions;
 private dataList: any;
 private saveDisabled: boolean = false;
 showImportGrid: boolean = false;
 private params: any;
 msgs: Message[] = [];
 display: boolean = false;
 InviteesForm: FormGroup;
 isIcardExists: boolean = false;
 EventId;
 eventName:string
 private listener: Subscription;
 InviteOnly: boolean = false;
 showLoader: boolean = false;

  //On Init
  ngOnInit() {

    // Listen for changes in the service
    this.listener = this.globalService.getChangeEmitter()
    .subscribe(paramsFromService => {
        // console.log("paramsFromService : " + JSON.stringify(paramsFromService));

        switch (paramsFromService.command) {
            case 'DELETE':
                this.onDelete(paramsFromService.params.id);
            break;
            default:
                // this.defaultMethod(paramsFromService);
            break;
        }
    });
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
    this.route.params
      .subscribe(
        (params: Params) => {
            this.EventId = +params['id'];
            // alert(this.EventId);
            this.eventName = this.route.snapshot.queryParams['name'];

            let myParams = new HttpParams()  
            .set('TYPE', "GETINFOEVENTS")
            .set('LOV_COLUMN', this.EventId ); 
    
            //Server Side call
            this.globalService.Get('AkEvent/GetInviteeEventInfo', myParams)
            .subscribe((data: any) => {
                // console.log(JSON.stringify(data[0]));
                    if(data[0].InviteOnly) {
                        this.InviteOnly = true;     
                    }
                }
            );
        }
     );
  }

  //To initialize Grid
  initializeForm() {
      this.InviteesForm = this.fb.group({
        'IdCard': new FormControl('', Validators.required),
        'EventId': new FormControl(this.EventId)
    });
  }

  //To initialize Grid
  initializeGrid() {

      //Define gridOptions here
      this.gridOptions = <GridOptions>{};
      this.gridImportOptions = <GridOptions>{};

      this.gridOptions = <GridOptions>{
          onGridReady: () => {
              this.getInvitees();
          },
           icons: {
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
            },
      };

      // Define Grid column definition
      this.gridOptions.columnDefs = this.createColumnDefs();

      // Define Grid column definition
      this.gridImportOptions.columnDefs = this.createImportColumnDefs();
  }

  // Define Grid column definition
  private createColumnDefs() {
        return [
          {
              headerName: "Invitee Name",
              field: "name",
              filter: 'text'
          },
          {
              headerName: "Id Card",
              field: "idCard",
              filter: 'text'
          },
          {
              headerName: "Action",
              field: "delete",
              cellRendererFramework: ActioninviteeComponent,
              suppressFilter: true,
              suppressSorting: true
          }
      ];
    }
  
  //On Deletion of Member
  onDelete(id:any) {
      
    //Confirmation dialogue
    this.confirmationService.confirm({
        
        message: 'Do you want to delete this record?',
        header: 'Delete Confirmation',
        icon: 'fa fa-trash',
        accept: () => {
            
            //Send request to server
            let myParams = new HttpParams() 
            .set('id', id);  
            
            this.globalService.delete('AkEvent/DeleteMember', myParams)
            .subscribe((data: string[]) => {

                   //console.log("data : " + JSON.stringify(data));
                   //Display message
                   this.msgs = [];
                   this.msgs = [{severity:'success', summary:'Confirmed', detail:'Member deleted!'}];
                   
                   //To Reset
                   this.reset();
                },
                (error) => {
                    // console.log(error);
                    this.msgs = [];  
                    this.msgs = [{severity:'error', summary:'error', detail:'Member not deleted, Try again!'}];
                }
            );
        },
        reject: () => {
            this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected!'}];
        }
    });
  }
  
  //To Get Event Invitees
  getInvitees() {
      
      let myParams = new HttpParams() 
      .set('EventId', this.EventId);  
      
      this.globalService.Get('AkEvent/GetEventInvitations', myParams)
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
  getMemberInfo(InviteesForm : FormGroup) {

    if(InviteesForm['IdCard'].length == 0) {
        this.isIcardExists =  false;
        return;
    }

    //This is for Event City
    let params = new HttpParams()  
    .set('TYPE', "GETPERSONINFO") 
    .set('LOV_COLUMN', InviteesForm['IdCard']); 

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
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //Call on Add Member
  onAddMember(form : FormGroup) {
      
      //console.log(form);

      form['EventId'] = this.EventId;
      this.globalService.post('AkEvent/addEventInvitation/', form)
      .subscribe((data: any) => {
          
          //console.log("data : " + JSON.stringify(data));

          //If member is already added
          if(data[0].Counts) {
              this.msgs = [];
              this.msgs.push({severity:'error', summary:'error', detail:'Member already exists!'});

              setTimeout(()=>{    
                 this.msgs = [];
              },7000);
          }
          else {

              //Display message
              this.msgs = [];
              this.msgs.push({severity:'success', summary:'Success', detail:'Member added!'});
            
              //To Reset
              this.reset();
          }
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Member not added, Try again!'}];
        }
      );
  }

  //Call on Reset 
  reset() {

    //Hide dialogue
    this.display = false;
    this.isIcardExists =  false;

    //Reset the form 
    this.InviteesForm.reset();

    //Refresh the Grid
    this.getInvitees();
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
        fileName: this.eventName + '_Event_Members_' + date,
        columnKeys: ['name','idCard']
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
       this.globalService.downloadSample('AkEvent/GetDownloadSample');
    }

    // Define Grid column definition
    private createImportColumnDefs() {
        return [
            { headerName: "Invitee Name", field: "name", filter: 'text' },
            { headerName: "Id Card*", field: "Idcard No*", filter: 'text' },
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
        
        // debugger;  
        this.showLoader = true;
         
        let fileList: FileList = event.target.files;  
        this.cancelUpload();

        if (fileList.length > 0) {  
            
            let file: File = fileList[0];  
            let formData: FormData = new FormData();  
            formData.append('uploadFile', file, file.name);  
            formData.append('eventId', this.EventId);  
            this.globalService.post('AkEvent/UploadInvitee/', formData)
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
    //    window.location.reload(); 
    //    this.router.navigate(["/same/route/path?refresh=1"]);
    }

    //Insert data in DB [Import Action]
    uploadDB() {

        this.showLoader = true;
        var dtSentToServer = {};
        for (var i = 0; i < this.dataList.length; i++) {

            let postArray = this.dataList[i];

            let rowData = {EventId:0, IdCard:''};
            rowData.EventId = postArray.EventId;
            rowData.IdCard = postArray.IdCard;
            dtSentToServer[i] = rowData;
        }

        this.globalService.post('AkEvent/ImportInvitees/', dtSentToServer)
        .subscribe((data: any) => {
                //Display message
                this.msgs = [];
                this.msgs.push({severity:'success', summary:'Success', detail:'Data imported!'});
                this.getInvitees();
                this.cancelUpload();
            },
            (error) => {
                // console.log(error);
                this.msgs = [];  
                this.msgs = [{severity:'error', summary:'error', detail:'Data not imported, Try again!'}];

                this.cancelUpload();
            }
        );
    };  
}



