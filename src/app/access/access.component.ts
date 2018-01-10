import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { GridOptions } from 'ag-grid';
import  { AgGridModule } from 'ag-grid-angular/main';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActionComponent } from '../access/action.component';
import { EventManager } from '@angular/platform-browser'
import { GlobalService } from '../shared/global.service';
import { Message } from 'primeng/primeng';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.css']
})
export class AccessComponent implements OnInit {

  displayDialog: boolean = false;   
  msgs: Message[] = [];

  gridOptions:GridOptions;
  columnDefs: any[];
  rowData: any[];
  memberid: any;

  sortState;
  filterState;  
  public editMode: boolean = false; 
  SrNo: string ="0";
  ModuleId: string ="0";
  fullName: string ="";
  city: string ="";
  center: string ="";
  subCenter: string ="";
  headerTitle: string ="";
  searchStr: string;
  completerData: any;
  role: string;
  prevRole: string;

  accessForm: FormGroup;
  public notLinked: boolean = false; 
  
  constructor(private globalService: GlobalService) { 
    //get data for autocomplete
     this.memberid= localStorage.getItem("Id") ? + localStorage.getItem("Id") : 0;
      // let myParams = new URLSearchParams(); 
      // myParams.append('ParentMemberId', this.memberid);  

      const myParams = new HttpParams()
      .set('ParentMemberId',this.memberid.toString());
      
      this.globalService.Get('RoleAccess/GetUserRoles',myParams)
      .subscribe(
      (result: any) => {
        this.completerData = result;
      },
      (error) =>{
        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'Error', detail:'Server error, Try again!'}];
      }
      );

      this.initializeGrid();    
}

// To initialize Grid
initializeGrid() {

    //Define gridOptions here
    this.gridOptions = <GridOptions>{};
    
    
    
    this.gridOptions = <GridOptions>{
        onGridReady: () => {
            this.onGetAccessGrid();
        }, 
        icons: {
              sortAscending: '<i class="fa fa-long-arrow-down"/>',
              sortDescending: '<i class="fa fa-long-arrow-up"/>',
          },       
    };

    this.gridOptions.columnDefs = this.createColumnDefs();
    this.gridOptions.paginationPageSize = 10;
    this.gridOptions.pagination=true;
    this.gridOptions.context = {componentParent: this};
}

onGetAccessGrid() {
    const myParams = new HttpParams()
    .set('MId',this.memberid.toString());

    this.globalService.Get('RoleAccess/GetMemberModuleRole',myParams)
    .subscribe(
          (res: any)=>{
            this.rowData = res;                       
            this.gridOptions.api.setRowData(this.rowData);
          },
          (error) => {
              this.msgs = [];  
              this.msgs = [{severity:'error', summary:'Error', detail:'Server error, Try again!'}];               
          }
      );

}

private createColumnDefs() {
       return  [
              {headerName: "Sr No", field: "SrNo", hide: true },
              {headerName: "Module Id", field: "ModuleId", hide: true },
              {headerName: "Icard Id", field: "IcardId", filter: 'text', width: 100},
              {headerName: "Full Name", field: "FullName", filter: 'text', width: 280 },
              {headerName: "Center", field: "Center", filter: 'text'},
              {headerName: "Sub Center", field: "SubCenter", filter: 'text'},
              {headerName: "Role", field: "UserRoleName"},
              {headerName: "Action", field: "actionValue", suppressFilter: true, 
              sortingOrder: [null],editable: false, cellRendererFramework: ActionComponent, colId: "params", width: 100, height: 30 },
              {headerName: "RoleId", field: "RoleId", hide: true},
          ];

}

ngOnInit() {
  this.accessForm = new FormGroup({
    'accessData': new FormGroup({
      'IcardId': new FormControl({value:null, disabled: false},[Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
      'roleName': new FormControl(this.completerData, [Validators.required])
    })
  });    

  
}
// other functions

onAdd(){
  this.editMode = false;
  this.displayDialog = true;
  this.headerTitle ="Add Role";
}

onEdit(data){
 this.editMode=true;
 this.displayDialog = true;
 this.headerTitle ="Edit Role";
  
  this.accessForm.patchValue({
       'accessData': {
         'IcardId':data.IcardId,
         'roleName': data.RoleId
       }
     });
    this.SrNo = data.SrNo;
    this.prevRole = data.RoleId;
    this.fullName =data.FullName;
    this.city = data.City ? "City: "+data.City : "";
    this.center = data.Center ? "Center: " + data.Center : "";
    this.subCenter = data.SubCenter ? "Sub Center: "+ data.SubCenter : "";

}

  onSubmit(){

    this.sortState = this.gridOptions.api.getSortModel();
    this.filterState = this.gridOptions.api.getFilterModel();
    if(this.editMode){  // edit role
      if(this.accessForm.value.accessData.roleName==this.prevRole){
        return;
      }
      const newRole = { "IcardId": this.accessForm.value.accessData.IcardId, "RoleId": this.role, "CreatedBy":localStorage.getItem("Id"), "mode": "edit", "SrNo": this.SrNo, "ModuleId": this.ModuleId };
      this.globalService.post('RoleAccess/AddEditMemberModuleRole/',newRole)
          .subscribe(
                     (res: any)=>{                                     
                       this.displayDialog = false;
                       const myParams = new HttpParams()
                      .set('MId',this.memberid.toString());

                        this.globalService.Get('RoleAccess/GetMemberModuleRole/',myParams)
                        .subscribe(
                        (res: any)=>{
                            this.rowData = res;                             
                            this.gridOptions.api.setRowData(this.rowData);
                            this.gridOptions.api.refreshCells();
                            this.gridOptions.api.setSortModel(this.sortState);
                            this.gridOptions.api.setFilterModel(this.filterState);
                            
                            this.gridOptions.api.refreshCells();
                        
                          },
                          (error) =>{
                            this.msgs = [];  
                            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
                          }
                          );    
                          this.msgs.push({severity:'success', summary:'Success', detail:'Role for member edited successfully.'});                                                     
                          setTimeout(()=>{    
                                this.msgs = [];
                            },3000);  
                      },      
                      (error)=>{
                        this.msgs = [];  
                        this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
                      }                   
                    );
                    
    }
    else{
      const newRole = { "IcardId": this.accessForm.value.accessData.IcardId, "RoleId": this.role, "CreatedBy":localStorage.getItem("Id"), "mode": "add", "SrNo": this.SrNo, "ModuleId": this.ModuleId };
      this.globalService.post('RoleAccess/AddEditMemberModuleRole/',newRole)
          .subscribe(
            (res: any)=>{
              //  if role for person exists then don't allow to edit    
              if(res.result.length!=0){
                  if(res.result[0].edit==1){

                   this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:res.result[0].UserRoleName +' role already exits for this member, so you need to edit the role.'}];

                  // this.msgs.push({severity:'error', summary:'Error', detail:res.result[0].UserRoleName +' role already exits for this member, so you need to edit the role.'});                                                     
                  setTimeout(()=>{    
                        this.displayDialog = true;
                        this.msgs = [];
                        
                    },7000);
                 }  
              }
              else{
                const myParams = new HttpParams()
                .set('MId',this.memberid.toString());

                this.globalService.Get('RoleAccess/GetMemberModuleRole/',myParams)
                .subscribe(
                (res: any)=>{
                    this.rowData = res;                             
                    this.gridOptions.api.setRowData(this.rowData);
                    this.gridOptions.api.refreshCells();
                    this.gridOptions.api.setSortModel(this.sortState);
                    this.gridOptions.api.setFilterModel(this.filterState);

                    this.gridOptions.api.refreshCells();                         
                    }
                  ); 
                  this.displayDialog = false;
                  this.msgs.push({severity:'success', summary:'Success', detail:'Role for member added successfully.'});                                                     
                          setTimeout(()=>{    
                                this.msgs = [];
                            },3000); 
              } 
            },
            (error) => { 
              this.msgs = [];  
              this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            }
          );
         
    } 

    this.accessForm.reset();
    this.fullName = null;
    this.city = null;
    this.center = null;
    this.subCenter =null;
   //this.displayDialog = false;

  } 
 
 onCancel(){
   this.displayDialog = false;
   this.fullName = null;
    this.city = null;
    this.center = null; 
    this.subCenter = null;
    this.accessForm.reset();
 }

  onIcardIdBlur(value){
      this.notLinked = false;
      if(value==""){
        return;
      }

      const myParams = new HttpParams()
      .set('IcardId',value.toString());

      this.globalService.Get('RoleAccess/GetMemberShortDetail/',myParams)
      .subscribe((result:any) => {
        if(result.IsMember){
          this.fullName =result.FullName;
          this.city = result.City ? "City: "+result.City : "";
          this.center = result.Center ? "Center: " + result.Center : "";
          this.subCenter = result.SubCenter ? "Sub Center: "+ result.SubCenter : "";
        }
        else{
          this.fullName = "";
          this.city = "";
          this.center = "";
          this.subCenter = "";
          this.accessForm.setErrors({
            'accessData': {
            'IcardId': false
            }
          }); 
          this.notLinked = true;
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'This Id Card is not linked to Akonnect!'}];
        }
      },
      (error) => {
        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
      }
      );  
  }

  onRoleSelected(selected): void{
    // if card is not linked then dont'allow to proceed
    if(this.notLinked==true){
      this.accessForm.setErrors({
            'accessData': {
            'IcardId': false
            }
          }); 
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'This Id Card is not linked to Akonnect!'}];
    } // if card is linked
    else {
    this.role= selected ? selected.value : 0;
    
    // to not allow IDC role in add mode
    if(selected.value==50 || selected.value==51 || selected.value==52 || selected.value==21 ){
      this.ModuleId = "4";
      // add new role not allowed with IDC_Role only edit allowed
      if(!this.editMode){
            this.accessForm.setErrors({
            'accessData': {
            'roleName': false
            }
          });
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'You can not add IDC role, you can only edit it.'}];
      }   
      
    }
    else{
      this.ModuleId = "1001";
    }
    
    // to allow anyting in edit
    if(this.editMode){
      // check for not edting IDC role on EMS role and vice-versa
      if(selected.value==50 || selected.value==51 || selected.value==52 || selected.value==21 ){
        if(+this.prevRole!=50 && +this.prevRole!=51 && +this.prevRole!=52 && +this.prevRole!=21){   
          this.accessForm.setErrors({
              'accessData': {
              'roleName': false
              }
            }); 
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'You can not add IDC role, you can only edit it!'}];     
        }
        else{        
        }
      }
      // check for not edting EMS role on IDC role and vice-versa
      if(selected.value!=50 && selected.value!=51 && selected.value!=52 && selected.value!=21 ){
         if(+this.prevRole==50 || +this.prevRole==51 || +this.prevRole==52 || +this.prevRole==21){   
          this.accessForm.setErrors({
              'accessData': {
              'roleName': false
              }
            }); 
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'You can only assign IDC role!'}];     
          }
          else{        
          }
        } 
    } // if edit mode

    } // if not linked
  }
 
}
