import { Component, OnInit } from '@angular/core';
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogModule, Message, GrowlModule, ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { GlobalService } from '../../shared/global.service';
import {GridOptions} from "ag-grid";
import { ActionchargesComponent } from './actioncharges.component';
import { HttpParams } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs/Rx'; 

@Component({
  selector: 'app-cancel-charges',
  templateUrl: './cancel-charges.component.html',
  styleUrls: ['./cancel-charges.component.css']
})
export class CancelChargesComponent implements OnInit {

  public gridOptions: GridOptions;
  private params: any;
  msgs: Message[] = [];
  display: boolean = false;
  form: FormGroup;
  EventId;
  eventName:string
  private listener: Subscription;

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
        }
     );
  }

  //To initialize Grid
  initializeForm() {
      this.form = this.fb.group({
        'WefDate': new FormControl('', Validators.required),
        'CancellationPercentage': new FormControl('', Validators.required),
        'EventId': new FormControl(this.EventId)
    });
  }

  //To initialize Grid
  initializeGrid() {

      //Define gridOptions here
      this.gridOptions = <GridOptions>{};
      this.gridOptions = <GridOptions>{
          onGridReady: () => {
              this.getEventCharges();
          },
           icons: {
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
            },
      };

      // Define Grid column definition
      this.gridOptions.columnDefs = this.createColumnDefs();
  }

  // Define Grid column definition
  private createColumnDefs() {
        return [
          {
              headerName: "With effective Date",
              field: "WefDate",
              filter: 'text'
          },
          {
              headerName: "Cancellation Charges(%)",
              field: "CancellationPercentage",
              filter: 'text'
          },
          {
              headerName: "Action",
              field: "delete",
              cellRendererFramework: ActionchargesComponent,
              suppressFilter: true,
              suppressSorting: true
          }
      ];

    }
  
  //On Deletion of Charges
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
            
            this.globalService.delete('AkEvent/DeleteCharges', myParams)
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
  
  //To Get Event Charges
  getEventCharges() {
      
      let myParams = new HttpParams() 
      .set('EventId', this.EventId);  
      
      this.globalService.Get('AkEvent/GetEventCharges', myParams)
      .subscribe((data: string[]) => {
              //console.log("data : " + JSON.stringify(data));
              this.gridOptions.api.setRowData(data);
          },
          (error) => {
              //   console.log(error);
              this.msgs = [];  
              this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
          }
      );
  }

  //Call on Add Charges
  onAddCharges(form : FormGroup) {
      
      //console.log(form);

      form['EventId'] = this.EventId;
      this.globalService.post('AkEvent/addEventCharges/', form)
      .subscribe((data: any) => {
          
          //console.log("data : " + JSON.stringify(data));

          //Display message
          this.msgs = [];
          this.msgs.push({severity:'success', summary:'Success', detail:'Record added!'});
        
          //To Reset
          this.reset();
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Record not added, Try again!'}];
        }
      );
  }

  //Call on Reset 
  reset() {

    //Hide dialogue
    this.display = false;

    //Reset the form 
    this.form.reset();

    //Refresh the Grid
    this.getEventCharges();
  }

  //redirect To Event Page
  redirecTo() {
     this.router.navigate(['/event']);
  }

}
