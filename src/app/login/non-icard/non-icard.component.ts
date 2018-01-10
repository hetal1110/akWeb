import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GlobalService } from '../../shared/global.service';
//import { URLSearchParams } from '@angular/http';
import { HttpParams } from '@angular/common/http';
import { ButtonModule, InputTextModule } from 'primeng/primeng';
import { Router, ActivatedRoute } from '@angular/router';
import { Message } from 'primeng/primeng';

@Component({
  selector: 'app-non-icard',
  templateUrl: './non-icard.component.html',
  styleUrls: ['./non-icard.component.css']
})
export class NonIcardComponent implements OnInit {
 msgs: Message[] = []; 
nonIcardForm: FormGroup;
countryData = [];
stateData = [];
cityData = [];
centerData = [];
subCenterData = [];

genders: Array<{value: string, label: string}> = [
  {value: 'M', label: "MALE"},
  {value: 'F', label: "FEMALE"}
  ];

displayDialog: boolean = false;  
modalMsg: string = ""  ;
tempicard: string = "";

  constructor(private globalService: GlobalService, private route: ActivatedRoute, private router: Router) { 

    localStorage.clear();
    
    // to get country list
    this.globalService.Get('Member/GetCountries',null)
      .subscribe(
        (result) => {
          for (let i in result) {
            this.countryData.push({label:result[i]["CountryName"], value:result[i]["CountryId"]});
          }
        },
        (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

ngOnInit() {
    this.initForm();
}

 initForm(){
  this.nonIcardForm = new FormGroup({
    'nonIcardData': new FormGroup({
      'FName': new FormControl(null, Validators.required),
      'MName': new FormControl(null, Validators.required),
      'LName': new FormControl(null, Validators.required),
      'MobileNo': new FormControl(null, [Validators.required, Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]),
      'EmailId': new FormControl(null, [Validators.required, Validators.email]),
      'DateOfBirth': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9][0-9][0-9]$/)]),
      'Gender': new FormControl(this.genders, [Validators.required, Validators.pattern(/^(?:M|F)$/)]),
      'country': new FormControl(this.countryData, Validators.required),
      'state': new FormControl(null, Validators.required),
      'CityId': new FormControl(null, Validators.required),
      'CenterId': new FormControl(null, Validators.required),
      'SubCenterId': new FormControl(null, Validators.required)
      })
    }); 
 }
  
  onCountrySelected(selected): void{
    const myParams = new HttpParams()
      .set('Country',selected.value);
      this.stateData = [];
      this.cityData = [];
      this.centerData = [];
      this.subCenterData = [];
    this.globalService.Get('Member/GetStates',myParams)
      .subscribe(
        (result) => {
        for (let i in result) {
          this.stateData.push({label:result[i]["StateName"], value:result[i]["StateId"]});
        }
      },
      (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  onStateSelected(selected): void{
    this.cityData = [];
    this.centerData = [];
    this.subCenterData = [];
    const myParams = new HttpParams()
      .set('State',selected.value);  

    this.globalService.Get('Member/GetCities',myParams)
      .subscribe((result) => {
        for (let i in result) {
          this.cityData.push({label:result[i]["CityName"], value:result[i]["CityId"]});
        }       
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );

  }

  onCitySelected(selected): void{
    this.centerData=[];
    this.subCenterData = [];
    const myParams = new HttpParams()
      .set('City',selected.value);  

    this.globalService.Get('Member/GetCenters',myParams)
      .subscribe((result) => {
        for (let i in result) {
          this.centerData.push({label:result[i]["CenterName"], value:result[i]["CenterId"]});
        }       
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
  }

  onCenterSelected(selected): void{
    this.subCenterData =[];
    const myParams = new HttpParams()
      .set('Center',selected.value);  

    this.globalService.Get('Member/GetSubCenters',myParams)
      .subscribe((result) => {
        for (let i in result) {
          this.subCenterData.push({label:result[i]["SubCenterName"], value:result[i]["SubCenterId"]});
        }        
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
  }

  onSubmit(form : FormGroup){
    //let url = 'http://api.dadabhagwan.org/AsimServices/api/Member/CheckNonICardMember';
    form['nonIcardData'].DateOfBirth = form['nonIcardData'].DateOfBirth+'/01/01';
    
    this.globalService.post('Member/CheckNonICardMember',form['nonIcardData'])
    .subscribe(
      (res: any)=>{
        // if such person already exists
        if(res && res.result[0].TempICardIdExists){
          //open modal
          let mob = ""; let email ="";
          this.modalMsg = 'ICardId - ' + res.result[0].ICardId + ' with';
          //if(res.result[0].MobileNo.length>=10)
          if("9924341100".length>=10)
          {
            mob = res.result[0].MobileNo.substring(0, 2)+'******'+res.result[0].MobileNo.substring(8);
            this.modalMsg = this.modalMsg + ' Mobile No: '+ mob;
          }
          //if(res.result[0].EmailId.length>0)  
          if("hetal.gala@dadabhagwan.org".length>0)
          {
            let i = res.result[0].EmailId.indexOf('@');
            let l = res.result[0].EmailId.length;
            let strToReplace = res.result[0].EmailId.substring(2,i);
            let emailstar ="";
            for (let j = 0; j < strToReplace.length; j++) {
              emailstar = emailstar + "*";
            }
            email = res.result[0].EmailId.substring(0, 2)+" "+emailstar+" "+res.result[0].EmailId.substring(i);

            if(mob!=""){
              this.modalMsg = this.modalMsg + ' and';
            }
            this.modalMsg = this.modalMsg +' Email Id: '+ email;
          }
          
          this.modalMsg = this.modalMsg + ' already exists. Please login with it.';

          this.tempicard = res.result[0].ICardId;
          this.displayDialog = true;
          
        }
        else{ // if actually a new person then add and send otp          
          this.createNewZMember(form);
        } // else end
      },
      (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
    
    
  }

// on cancel of popup, close it
  onCancel(){
   this.displayDialog = false;
   this.tempicard = null;
   this.modalMsg = null;

 }

// even if person exists but want to create new 
 createNew(form : FormGroup){
  this.displayDialog = false; // close popup
  this.createNewZMember(form);
 }

 createNewZMember(form : FormGroup){
  let formData = {};
  formData = Object.assign(formData,form['nonIcardData'],{ ParentMemberId: -999 });
  
  this.globalService.post('Member/AddNonICardMemberWeb', formData )
  .subscribe(
    (res: any)=>{
     
      if(res && res.obj.VerificationSent){
        // go to otp page
        let obj ={};
        obj = Object.assign(obj,form['nonIcardData'], {RequestId: res.obj.RequestId, ChildMemberId: res.obj.ChildMemberId, ChildICardId: res.obj.ChildICardId});
        
        this.router.navigate(['./otp', JSON.stringify(obj)],  {relativeTo: this.route, skipLocationChange: true });      
      }        
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
  );
 }

 gotoLogin(){
   this.router.navigate(['/login', this.tempicard]);
 }
 
}
