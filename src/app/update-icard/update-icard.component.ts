import { Component, OnInit } from '@angular/core';
import {GridOptions} from "ag-grid";
import { AgGridModule} from "ag-grid-angular/main";
import {Validators,FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { GlobalService } from '../shared/global.service';

import {SelectItem, 
  AutoCompleteModule,
  Message, GrowlModule
} from 'primeng/primeng'

@Component({
  selector: 'app-update-icard',
  templateUrl: './update-icard.component.html',
  styleUrls: ['./update-icard.component.css']
})
export class UpdateICardComponent implements OnInit {

  public gridOptions: GridOptions;
  public personid: any;
  evForm: FormGroup;
  msgs: Message[] = [];
  arrSubCenter: any[];
  subcenter: any;
  public selectedParams:any;

  constructor(private globalService : GlobalService,
              private fb: FormBuilder) { 
  }

  ngOnInit() {
     //To Initialize forms
      this.toInitializeForm();

      //To initialize Grid
      this.initializeGrid();
  }

  // To Initialize form
  toInitializeForm() {

    this.evForm = this.fb.group({
          'icard': new FormControl('', Validators.required),
          'fname': new FormControl('', Validators.required),
          'mname': new FormControl('', Validators.required),
          'lname': new FormControl('', Validators.required),
          'oldsubcenter': new FormControl({value: '', disabled: true}),
          'subcenter': new FormControl('', Validators.required),
          'mobile': new FormControl(null, [Validators.required, Validators.minLength(10)]),
          'email': new FormControl(null, Validators.email),
          'oldmobile': new FormControl({value: '', disabled: true}),
          'oldemail': new FormControl({value: '', disabled: true}),
      });
      this.evForm.controls['subcenter'].setValue({id: 0, name: ''});
  }

  //Check Type
  isObject(val) { 

    let ret = typeof val.value === 'object' && val.value.id > 0; 
    //  console.log(val.value);
    return !ret;
  }

  // To initialize Grid
  initializeGrid() {

      //Define gridOptions here
      this.gridOptions = <GridOptions>{};

      this.gridOptions = <GridOptions>{
          rowSelection: 'single',
          onGridReady: () => {
              this.gridOptions.api.setRowData(null);
          },
          icons: {
              sortAscending: '<i class="fa fa-long-arrow-down"/>',
              sortDescending: '<i class="fa fa-long-arrow-up"/>',
          },
      };
      
      this.gridOptions.columnDefs = this.createColumnDefs();
  }

  //Call on Row selection
  onSelectionChanged(params) {
      var object = params.api.getSelectedRows();
      this.selectedParams = params;
      // console.log(JSON.stringify(object));

      //Set Values for email and mobileno
      this.evForm.controls['oldmobile'].setValue(object[0].Mobile);
      this.evForm.controls['oldemail'].setValue(object[0].Email);
      this.evForm.controls['oldsubcenter'].setValue(object[0].SubCenterName);

      //Assign personid
      this.personid = object[0].PersonId;

      //Set blank values
      this.evForm.controls['mobile'].setValue("");
      this.evForm.controls['email'].setValue("");
      this.evForm.controls['subcenter'].setValue({id: 0, name: ''});
  }

  // Define Grid column definition
  private createColumnDefs() {
    return  [
        { headerName: "ICard", field: "PersonId", filter: 'text',width:110},
        { headerName: "F Name", field: "FName", filter: 'text'},
        { headerName: "M Name", field: "MName", filter: 'text'},
        { headerName: "L Name", field: "LName", filter: 'text'},
        { headerName: "Age", field: "Age", filter: 'text',width:50},
        { headerName: "[M/F]", field: "Gender", filter: 'set',width:50},
        { headerName: "Mobile", field: "Mobile", filter: 'text'},
        { headerName: "Email", field: "Email", filter: 'text'},
        { headerName: "Center", field: "CenterName", filter: 'set'},
        { headerName: "Address", field: "Address", filter: 'text',width:780}
      ];
  }
  
  // on Search of Filter get Icard Data
  onSearch(form : FormGroup) {

    // console.log(form);
    let myParams = new HttpParams()  
    .set('icard', form['icard'])
    .set('fname', form['fname'])
    .set('mname', form['mname'])
    .set('lname', form['lname'])
    //.set('memberid', "620");
   .set('memberid', localStorage.getItem("Id") ? localStorage.getItem("Id") : "0");

    this.globalService.Get('AkICard/GetICardData', myParams)
    .subscribe((data: string[]) => {
            // console.log("data : " + data);
            this.gridOptions.api.setRowData(data);

            // this.evForm.controls['mobile'].setValue("");
            // this.evForm.controls['email'].setValue("");
        },
        (error) => {
            // console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
  }

  // This is for Auto completion of city
  fetchSubCenter(event) {

    //This is for Event City
    let evCityParams = new HttpParams()  
    .set('TYPE', "SUBCENTERS")
    .set('LOV_COLUMN', event.query) 
    // evCityParams.set('memberId', '620'); 
    evCityParams.set('memberId', localStorage.getItem("Id") ? localStorage.getItem("Id") : "0"); 

    this.globalService.Get('AkEvent/GetLOVDetails', evCityParams)
      .subscribe((data: any) => {
          this.arrSubCenter =  data;
        },
        (error) => {
            //   console.log(error);
           this.msgs = [];  
           this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  // onSubmit Update ICard
  onSubmitUpdateICard(form : FormGroup) {

    // form["memberid"] = 620;
    form["personid"] = this.personid;
    form["memberid"] = localStorage.getItem("Id") ? localStorage.getItem("Id") : "0";

    // console.log(form);
     //post to server
    this.globalService.post('AkICard/UpdatePerson/', form)
    .subscribe((data: any) => {
        // console.log(data);
        
        //Display message
        this.msgs = [];
        this.msgs = [{severity:'success', summary:'Success', detail:'Record updated!'}];

         //Reset the form 
        this.evForm.reset();
        this.toInitializeForm();
        this.evForm.controls['subcenter'].setValue({id: 0, name: ''});
        this.gridOptions.api.setRowData(null);        
      },
      (error) => {
        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Record not updated, Try again!'}];

        //Reset the form 
        this.evForm.reset();
        this.toInitializeForm();
        this.evForm.controls['subcenter'].setValue({id: 0, name: ''});
        this.gridOptions.api.setRowData(null);
      }
    );
  }
}
