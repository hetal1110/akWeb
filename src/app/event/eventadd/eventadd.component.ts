import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {Validators, FormControl, FormGroup, FormBuilder, ValidatorFn} from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { GlobalService } from '../../shared/global.service';

import {SelectItem, 
  DropdownModule, 
  CalendarModule, 
  EditorModule, 
  CheckboxModule, 
  AutoCompleteModule,
  Message, GrowlModule
} from 'primeng/primeng'

@Component({
  selector: 'app-eventadd',
  templateUrl: './eventadd.component.html',
  styleUrls: ['./eventadd.component.css']
})
export class EventaddComponent implements OnInit {

  //initialize class variables

  msgs: Message[] = [];
  gender: SelectItem[];
  eventStatus: SelectItem[];
  eventForVal: SelectItem[];
  evCurrency: SelectItem[];
  evCenter: SelectItem[];
  activity: SelectItem[];
  evType: SelectItem[];
  arrCity: any[];
  CityId: any;
  arrAutoCompleteData: any[];
  formSentToServer : FormGroup;
  MinRegistrantAge:number;
  Eventstartdate:any;
  Eventenddate:any;
  RegistrationStartDate:any;
  ConfirmationReminderdate:any;
  id: number;
  editMode = false;
  evForm: FormGroup;

  public constructor(private globalService : GlobalService,
                    private route: ActivatedRoute,
                    private router: Router,
                    private fb: FormBuilder) {

    //To Get LOV Values
    this.onGetLOVData();

  }
  
  //ngOnInit
  ngOnInit() {

    //To Initialize forms
    this.toInitializeForm();

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          
          //Get Event Info
          if(this.editMode) {
            this.getEventInfo(params['id']);
          }
          else {
            //Set default dropdown values for Add Case
            this.evForm.controls['ForGender'].setValue({id: 'A', name: 'All'}); 
            this.evForm.controls['ForCenter'].setValue({id: '-1', name: ''});
            this.evForm.controls['Activity'].setValue({id: '', name: ''});
          }
        }
      );
  }

  //  To get Event Info
  getEventInfo(id:any) {
      let myParams = new HttpParams()  
      .set('TYPE', "GETINFOEVENTS")
      .set('LOV_COLUMN', id); 
     
      //Server Side call
      this.globalService.Get('AkEvent/GetEventInfo', myParams)
      .subscribe((data: any) => {
          // console.log(JSON.stringify(data[0]));

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

           //Redirect to Listing Page
          setTimeout(()=> {   
            
            //Set Drop Down values

            // console.log(arrData['CityId']+ " : " +arrData['CityIdVal']);
            // console.log(arrData['EventType']+ " : " +arrData['EventTypeVal']);
            // console.log(arrData['EventStatus']+ " : " +arrData['EventStatusVal']);
            // console.log(arrData['ForGender']+ " : " +arrData['ForGenderVal']);
            // console.log(arrData['Currency']+ " : " +arrData['Currency']);
            // console.log(arrData['ForCenter']+ " : " +arrData['ForCenterVal']);
            // console.log(arrData['Activity']+ " : " +arrData['ActivityVal']);

            this.evForm.controls['CityId'].setValue({id:arrData['CityId'], name:arrData['CityIdVal']});
            this.evForm.controls['EventType'].setValue({id:arrData['EventType'], name:arrData['EventTypeVal']});
            this.evForm.controls['EventStatus'].setValue({id:arrData['EventStatus'], name:arrData['EventStatusVal']});
            this.evForm.controls['ForGender'].setValue({id:arrData['ForGender'], name:arrData['ForGenderVal']}); 
            this.evForm.controls['Currency'].setValue({id:arrData['Currency'], name:arrData['Currency']});
            this.evForm.controls['ForCenter'].setValue({id:arrData['ForCenter'], name:arrData['ForCenterVal']});
            this.evForm.controls['Activity'].setValue({id:arrData['Activity'], name:arrData['ActivityVal']});
          },1200);


          //Set Event for city, State, country
          if(arrData['ForCity'] != -1) {
             let Ids = arrData['ForCountry'] + "," + arrData['ForState'] + "," + arrData['ForCity'];
            this.evForm.controls['eventForId'].setValue({id:Ids, name: arrData['eventForId']});
            this.evForm.controls['eventFor'].setValue({id:'C', name: 'CITY'});
          }
          
          //For State
          else if(arrData['ForState'] != -1) {
              let Ids = arrData['ForCountry'] + "," + arrData['ForState'];
              this.evForm.controls['eventForId'].setValue({id:Ids, name: arrData['eventForId']});
              this.evForm.controls['eventFor'].setValue({id:'S', name: 'STATE'});
          }

          //For COUNTRY
          else if(arrData['ForCountry'] != -1) {
             let Ids = arrData['ForCountry'];
             this.evForm.controls['eventForId'].setValue({id:Ids, name: arrData['eventForId']});
             this.evForm.controls['eventFor'].setValue({id:'CO', name: 'COUNTRY'});
          }

        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  // To Initialize form
  toInitializeForm() {

    this.evForm = this.fb.group({
          'Eventname': new FormControl('', Validators.required),
          'EventAlias': new FormControl('', Validators.required),
          'EventNameGuj': new FormControl(''),
          'CityId': new FormControl('', Validators.required),
          'EventType': new FormControl('', Validators.required),
          'EventStatus': new FormControl('', Validators.required),
          'GeoLocation': new FormControl({value: '', disabled: true}),
          'ForGender': new FormControl(''),
          'MinRegistrantAge': new FormControl(''),
          'MaxRegistrantAge': [null, Validators.compose([, this.ageValidations])],
          'Eventstartdate': new FormControl('', Validators.required),
          'Eventenddate': [null, Validators.compose([Validators.required, this.eventEndDateValidations])],
          'RegistrationStartDate': [null, Validators.compose([Validators.required, this.regStartDateValidations])],
          'RegistrationEndDate': [null, Validators.compose([Validators.required, this.regEndDateValidations])],
          'ConfirmationReminderdate': [null, Validators.compose([Validators.required, this.conStartDateValidations])],
          'ConfirmationEndDate': [null, Validators.compose([Validators.required, this.conEndDateValidations])],
          'EventOfflineDate': [null, Validators.compose([Validators.required, this.eventOfflineDateValidations])],
          'CancellationEndDate': [null, Validators.compose([Validators.required, this.canStartDateValidations])],
          'Currency': new FormControl('', Validators.required),
          'ForCenter': new FormControl(''),
          'eventFor': new FormControl(''),
          'eventForId': new FormControl(''),
          'InviteOnly': new FormControl(''),
          'AllowPartialDays': new FormControl(''),
          'IsFullPaymentRequired': new FormControl(''),
          'IsDepositRequired': new FormControl(''),
          'EventStartHelpText': new FormControl(''),
          'EventEndHelpText': new FormControl(''),
          'Location': new FormControl(''),
          'Remarks': new FormControl(''),
          'AttendanceStartDate': new FormControl(''),
          'AttendanceEndDate': new FormControl(''),
          'Activity': new FormControl(''),
          'ForCountry': new FormControl(''),
          'ForState': new FormControl(''),
          'ForCity': new FormControl(''),
          'Eventid': new FormControl(0)
      });
  }

  // ageValidations
  ageValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value))

    if(group && parseInt(control.value) > 0 && (parseInt(control.value) < parseInt(group.controls['MinRegistrantAge'].value))) {
      // console.log(" MinRegistrantAge : " + group.controls['MinRegistrantAge'].value)
      // console.log(" control : " + control.value)
      return  { error: true };
    }
    return null;
  }

  // regStartDateValidations
  regStartDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let evStartDate = new Date(group.controls['Eventstartdate'].value);
      let regStartDate = new Date(control.value);

      // console.log(" evStartDate : " + evStartDate);
      // console.log(" regStartDate : " + regStartDate);

      if(evStartDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

  // regEndDateValidations
  regEndDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let regStartDate = new Date(group.controls['RegistrationStartDate'].value);
      let regEndDate = new Date(control.value);

      // console.log(" regStartDate : " + regStartDate);
      // console.log(" regEndDate : " + regEndDate);

      if(regEndDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

  // conStartDateValidations
  conStartDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let evStartDate = new Date(group.controls['Eventstartdate'].value);
      let regStartDate = new Date(control.value);

      // console.log(" evStartDate : " + evStartDate);
      // console.log(" regStartDate : " + regStartDate);

      if(evStartDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

  // regEndDateValidations
  conEndDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let regStartDate = new Date(group.controls['ConfirmationReminderdate'].value);
      let regEndDate = new Date(control.value);

      // console.log(" regStartDate : " + regStartDate);
      // console.log(" regEndDate : " + regEndDate);

      if(regEndDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

  // canStartDateValidations
  canStartDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let evStartDate = new Date(group.controls['Eventstartdate'].value);
      let regStartDate = new Date(control.value);

      // console.log(" evStartDate : " + evStartDate);
      // console.log(" regStartDate : " + regStartDate);

      if(evStartDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

   // eventEndDateValidations
  eventEndDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let regStartDate = new Date(group.controls['Eventstartdate'].value);
      let regEndDate = new Date(control.value);

      // console.log(" regStartDate : " + regStartDate);
      // console.log(" regEndDate : " + regEndDate);

      if(regEndDate.getTime() < regStartDate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }

   // eventOfflineDateValidations
  eventOfflineDateValidations(control: FormControl) {

    const group = control.parent;
    // console.log(" control : " + (control.value));
    
    if(group) {
      let Eventenddate = new Date(group.controls['Eventenddate'].value);
      let Eventofflinedate = new Date(control.value);

      // console.log(" Eventenddate : " + Eventenddate);
      // console.log(" Eventofflinedate : " + Eventofflinedate);

      if(Eventofflinedate.getTime() < Eventenddate.getTime()) {
        return  { error: true };
      }
    }
    return null;
  }
  
   //To Get Dropdown Data
  onGetLOVData() {

    //Initialize values

    //Event for
    this.eventForVal = [];
    this.eventForVal.push({label:'City', value:{id:'C', name: 'CITY'}});
    this.eventForVal.push({label:'State', value:{id:'S', name: 'STATE'}});
    this.eventForVal.push({label:'Country', value:{id:'CO', name: 'COUNTRY'}});

    //Get All LOV Data
    let data;
    this.globalService.Get('AkEvent/GetLOVData', null)
    .subscribe((LOVdata: any) => {
        // console.log(LOVdata);
        data = LOVdata;

        //This is for to Fetch Event Status
        this.eventStatus = [];
        this.eventStatus.push({label:'-- Select Event Status --', value:{id: 'none', name: ''}});
        
        let dt = data["EVENT_STATUS"];
        for (let i in dt) {
          this.eventStatus.push({label:dt[i]["name"], value:dt[i]});
        }

        // This is for to Fetch Gender
        this.gender = [];
        this.gender.push({label:'All', value:{id: 'A', name: 'All'}});

        dt = data["GENDER"];
        for (let i in dt) {
          this.gender.push({label:dt[i]["name"], value:dt[i]});
        }

        //This is for Currency
        this.evCurrency = [];
        this.evCurrency.push({label:'-- Select Currency --', value:{id: 'none', name: ''}});

        dt = data["CURRENCY_CODE"];
        for (let i in dt) {
          this.evCurrency.push({label:dt[i]["name"], value:{id: dt[i]["name"], name: dt[i]["name"]}});
        }

        //This is for Center
        this.evCenter = [];
        this.evCenter.push({label:'-- Select Event Center --', value:{id: '-1', name: ''}});

        dt = data["CENTER"];
        for (let i in dt) {
          this.evCenter.push({label:dt[i]["name"], value:dt[i]});
        }

        //Activity
        this.activity = [];
        this.activity.push({label:'-- Select Activity --', value:{id: '', name: ''}});

        dt = data["ACTIVITY"];
        for (let i in dt) {
          this.activity.push({label:dt[i]["name"], value:dt[i]});
        }

        //This is for Event Type
        this.evType = [];
        this.evType.push({label:'-- Select Event Type --', value:{id: 'none', name: ''}});

        dt = data["EVENT_TYPE"];
        for (let i in dt) {
          this.evType.push({label:dt[i]["name"], value:dt[i]});
        }
        
      },
      (error) => {
          //   console.log(error);
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
      }
    );
  }

  // This is for Auto completion of city
  fetchCity(event) {

    //This is for Event City
    let evCityParams = new HttpParams()  
    .set('TYPE', "CITY")
    .set('LOV_COLUMN', event.query); 

    this.globalService.Get('AkEvent/getCity', evCityParams)
      .subscribe((data: any) => {
          this.arrCity =  data;
        },
        (error) => {
            //   console.log(error);
           this.msgs = [];  
           this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  //Reset textbox value
  onChange() {
     this.evForm.controls['eventForId'].setValue("");
  }

  // This is for Auto completion of city/state/country
  getEventFor(event, form : FormGroup) {

    // console.log(form['eventFor']);

    let type = 'CITY';
    if(form['eventFor'] !== undefined && form['eventFor'] !== "") {
      type = form['eventFor'].name;
    }

    //This is for Event City
    let evCityParams = new HttpParams()  
    .set('TYPE', type)
    .set('LOV_COLUMN', event.query); 

    this.globalService.Get('AkEvent/getEventFor', evCityParams)
      .subscribe((data: any) => {
          this.arrAutoCompleteData =  data;
          // console.log(this.arrAutoCompleteData);
        },
        (error) => {
            //   console.log(error);
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
      );
  }

  // Call On onSubmit
  onSubmit(form : FormGroup, el) {
    
      //set dropdown & date values
      this.convertValues(form);

      // console.log(this.formSentToServer);
      // console.log(Date.parse(this.formSentToServer["CancellationEndDate"]));

      //Event city checks
      if(typeof (this.formSentToServer["CityId"]) != 'object') {
        // this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Please select valid Event City (Type text to search (min 3 chars))'}];
        this.evForm.controls['CityId'].setValue("");

        el.scrollIntoView();

        setTimeout(()=>{    
            this.msgs = [];
        },7000);
        return false;
      }
      else {

         // Event Start Date should not be less than Event End Date
         if(Date.parse(this.formSentToServer["Eventenddate"]) < Date.parse(this.formSentToServer["Eventstartdate"])) {

            // this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Event End Date should not be less than Event Start Date'}];
            el.scrollIntoView();

            setTimeout(()=>{    
                this.msgs = [];
            },7000);
            return false;
        }
        // Registration Start Date should not be less than Registration End Date
        else if(Date.parse(this.formSentToServer["RegistrationEndDate"]) < Date.parse(this.formSentToServer["RegistrationStartDate"])) {

            // this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Registration End Date should not be less than Registration Start Date'}];
            el.scrollIntoView();

            setTimeout(()=>{    
                this.msgs = [];
            },7000);
            return false;
        }
        // Confirmation Start Date should not be less than Confirmation End Date
        else if(Date.parse(this.formSentToServer["ConfirmationEndDate"]) < Date.parse(this.formSentToServer["ConfirmationReminderdate"])) {

            // this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Confirmation End Date should not be less than Confirmation Start Date'}];
            el.scrollIntoView();

            setTimeout(()=>{    
                this.msgs = [];
            },7000);
            return false;
        }
        else {
          // post data to Server
          this.postDataToServer(el);
        }
      }
  }

  // post data to Server
  postDataToServer(el:any) {
    //post to server
    this.globalService.post('AkEvent/addEvent/', this.formSentToServer)
    .subscribe((data: any) => {
        // console.log(data);

        el.scrollIntoView();
        
        //Display message
        this.msgs = [];
        this.msgs = [{severity:'success', summary:'Success', detail:'Record saved!'}];

        //Add Event params statically for Tab 0 and Tab 1 in add case
        if(!this.editMode) {
          this.addEventParamsStaticallyTab0(this.formSentToServer, data[0].ID);
        }
        else {
           //Redirect to Listing Page
            setTimeout(()=> {   
              this.redirecTo();
            },1200);
        }
      },
      (error) => {
        this.msgs = [];  
        this.msgs = [{severity:'error', summary:'error', detail:'Record not saved, Try again!'}];
      }
    );
  }

    // add Event Params Statically for Tab0
    addEventParamsStaticallyTab0(form : FormGroup, eventId:any) {

      //  console.log(form);
      let startDate = form['Eventstartdate'];
      let endDate = form['Eventenddate'];

      let params:any = {startDate:'', endDate:'', GroupName:'', Editor:'',TabNo:'', EventId:'', Chargeable:'', IsDaily:'', IsLocked:'', IsActive:'', Cancellable:'', IsMandatory:'', ShowInSummary:'', ShowInOptions:'', EventParametersSrNo:'',OptionName:'', OptionValue:'', OptionOrder:'', Rate:'', DepositRate:'', CancellationRate:'', IsDefault:'', SrNo:''}

      //Set required params
      params['startDate'] = form['Eventstartdate'];
      params['endDate'] = form['Eventenddate'];

      params['GroupName'] = "Date";
      params['Editor'] = {id : "SW", name : "Switch" };
      params['TabNo'] = 0;
      params['Chargeable'] = false;
      params['IsDaily'] = false;
      params['IsLocked'] = false;
      params['IsActive'] = true;
      params['Cancellable'] = true;
      params['IsMandatory'] = true;
      params['ShowInSummary'] = true;
      params['ShowInOptions'] = false;
      params['EventParametersSrNo'] = 0;
      
      params['OptionName'] = "";
      params['OptionValue'] = 1;
      params['OptionOrder'] = 1;
      params['Rate'] = 0;
      params['DepositRate'] = 0;
      params['IsActive'] = true;
      params['CancellationRate'] = false;
      params['IsDefault'] = false;
      params['SrNo'] = 0;
      params['EventId'] = eventId;

       this.globalService.post('AkEvent/addEventParamsStaticallyTab0/', params)
        .subscribe((data: any) => {
            
            //console.log("data : " + JSON.stringify(data));
            this.addEventParamsStaticallyTab1(form, eventId);
          },
          (error) => {
              // console.log(error);
              this.msgs = [];  
              this.msgs = [{severity:'error', summary:'error', detail:'Record not saved, Try again!'}];
          }
        );
    }

   // add Event Params Statically for Tab0
    addEventParamsStaticallyTab1(form : FormGroup, eventId:any) {

      //  console.log(form);
      let startDate = form['Eventstartdate'];
      let endDate = form['Eventenddate'];

      let params:any = {ParamName:'', ParamDisplayName:'', ParamHelpText:'', ParamOrder:'', GroupName:'', Editor:'',TabNo:'', EventId:'', Chargeable:'', IsDaily:'', IsLocked:'', IsActive:'', Cancellable:'', IsMandatory:'', ShowInSummary:'', ShowInOptions:'', EventParametersSrNo:'',OptionName:'', OptionValue:'', OptionOrder:'', Rate:'', DepositRate:'', CancellationRate:'', IsDefault:'', SrNo:''}

      params['ParamName'] = "Utara & Food";
      params['ParamDisplayName'] = "Utara & Food";
      params['ParamHelpText'] = "Utara & Food";
      params['ParamOrder'] = 1;
      params['GroupName'] = "Registration Options";
      params['Editor'] = {id : "DD", name : "DropDown"};
      params['TabNo'] = 1;
      params['Chargeable'] = true;
      params['IsDaily'] = false;
      params['IsLocked'] = false;
      params['IsActive'] = true;
      params['Cancellable'] = true;
      params['IsMandatory'] = true;
      params['ShowInSummary'] = true;
      params['ShowInOptions'] = false;
      params['EventParametersSrNo'] = 0;
      
      params['OptionName'] = "Blank Registration";
      params['OptionValue'] = 0;
      params['OptionOrder'] = 0;
      params['Rate'] = 0;
      params['DepositRate'] = 0;
      params['IsActive'] = true;
      params['CancellationRate'] = false;
      params['IsDefault'] = false;
      params['SrNo'] = 0;
      params['EventId'] = eventId;
      
       this.globalService.post('AkEvent/addEventParamsStaticallyTab1/', params)
        .subscribe((data: any) => {
            
            //console.log("data : " + JSON.stringify(data));

            //Display message
            // this.msgs = [];
            // this.msgs.push({severity:'success', summary:'Success', detail:'Event Parameters added!'});

            //Redirect to Listing Page
            setTimeout(()=> {   
              this.redirecTo();
            },1200);

          },
          (error) => {
              // console.log(error);
              this.msgs = [];  
              this.msgs = [{severity:'error', summary:'error', detail:'Record not saved, Try again!'}];
          }
        );
    }

  //To Convert Values
  convertValues(form) {

      // console.log("form : " + JSON.stringify(form));

      //Set Event city
      // debugger;
      if(form['CityId'].id !== undefined && form['CityId'].id.toString().indexOf(",") > 0) {
        let arrIds = form['CityId'].id.split(",");
        form['CityId'].id = arrIds[2];
      }

      //Set Event For City, State, Country
      form['GeoLocation'] = "";
      form['ForCity']= -1;
      form['ForState']= -1;
      form['ForCountry']= -1;

      let type = 'CITY';
      if(form['eventFor'] !== undefined && form['eventFor'] !== "") {
        type = form['eventFor'].name;
      }
      
      //If any value is selected from auto complete list
      if(form['eventForId'] !== null && form['eventForId'].id !== undefined && form['eventForId'].id !== "") {
        
        let id = form['eventForId'].id;

        //For City
        if(type == "CITY") {
          let arrIds = form['eventForId'].id.split(",");

          form['ForCity'] = arrIds[2];
          form['ForState'] = arrIds[1];
          form['ForCountry'] = arrIds[0];
        }
        
        //For State
        if(type == "STATE") {
          let arrIds = form['eventForId'].id.split(",");

          form['ForState'] = arrIds[1];
          form['ForCountry'] = arrIds[0];
        }

        //For COUNTRY
        if(type == "COUNTRY") {
          form['ForCountry'] = form['eventForId'].id;
        }
      }
     
      // console.log("eventForId : " + form['eventForId'].id);
      // console.log("ForCity : " + form['ForCity']);
      // console.log("ForState : " + form['ForState']);
      // console.log("ForCountry : " + form['ForCountry']);

      //Convert dates to UTC and DB format
      form['Eventstartdate'] = new Date(form['Eventstartdate']);
      form['Eventenddate'] = new Date(form['Eventenddate']);
      form['RegistrationStartDate'] = new Date(form['RegistrationStartDate']);
      form['RegistrationEndDate'] = new Date(form['RegistrationEndDate']);
      form['ConfirmationReminderdate'] = new Date(form['ConfirmationReminderdate']);
      form['ConfirmationEndDate'] = new Date(form['ConfirmationEndDate']);
      form['EventOfflineDate'] = new Date(form['EventOfflineDate']);
      form['CancellationEndDate'] = new Date(form['CancellationEndDate']);
 
      form['Eventstartdate'] = form['Eventstartdate'].getFullYear() + "-" + (form['Eventstartdate'].getMonth() + 1) + "-" + form['Eventstartdate'].getDate();
      form['Eventenddate'] = form['Eventenddate'].getFullYear() + "-" + (form['Eventenddate'].getMonth() + 1) + "-" + form['Eventenddate'].getDate();
      form['RegistrationStartDate'] = form['RegistrationStartDate'].getFullYear() + "-" + (form['RegistrationStartDate'].getMonth() + 1) + "-" + form['RegistrationStartDate'].getDate();
      form['RegistrationEndDate'] = form['RegistrationEndDate'].getFullYear() + "-" + (form['RegistrationEndDate'].getMonth() + 1) + "-" + form['RegistrationEndDate'].getDate();
      form['ConfirmationReminderdate'] = form['ConfirmationReminderdate'].getFullYear() + "-" + (form['ConfirmationReminderdate'].getMonth() + 1) + "-" + form['ConfirmationReminderdate'].getDate();
      form['ConfirmationEndDate'] = form['ConfirmationEndDate'].getFullYear() + "-" + (form['ConfirmationEndDate'].getMonth() + 1) + "-" + form['ConfirmationEndDate'].getDate();
      form['EventOfflineDate'] = form['EventOfflineDate'].getFullYear() + "-" + (form['EventOfflineDate'].getMonth() + 1) + "-" + form['EventOfflineDate'].getDate();
      form['CancellationEndDate'] = form['CancellationEndDate'].getFullYear() + "-" + (form['CancellationEndDate'].getMonth() + 1) + "-" + form['CancellationEndDate'].getDate();

      //This is for non mandatory fields
      if(form['AttendanceStartDate'] != null && form['AttendanceStartDate'] != "") {
         form['AttendanceStartDate'] = new Date(form['AttendanceStartDate']);

          form['AttendanceStartDate'] = form['AttendanceStartDate'].getFullYear() + "-" + (form['AttendanceStartDate'].getMonth() + 1) + "-" + form['AttendanceStartDate'].getDate();
      }
      else {
        form['AttendanceStartDate'] = "";
      }

      //
      if(form['AttendanceEndDate'] != null && form['AttendanceEndDate'] != "") {
         form['AttendanceEndDate'] = new Date(form['AttendanceEndDate']);

          form['AttendanceEndDate'] = form['AttendanceEndDate'].getFullYear() + "-" + (form['AttendanceEndDate'].getMonth() + 1) + "-" + form['AttendanceEndDate'].getDate();
      }
      else {
        form['AttendanceEndDate'] = "";
      }

      //For Textarea fields
      if(form['EventNameGuj'] == null) {
        form['EventNameGuj'] = "";
      }
      if(form['EventStartHelpText'] == null) {
        form['EventStartHelpText'] = "";
      }
      if(form['EventEndHelpText'] == null) {
        form['EventEndHelpText'] = "";
      }
      if(form['MinRegistrantAge'] == null) {
        form['MinRegistrantAge'] = "";
      }
      if(form['MaxRegistrantAge'] == null) {
        form['MaxRegistrantAge'] = "";
      }
      if(form['Remarks'] == null) {
        form['Remarks'] = "";
      }

      //Assign values to final form
      this.formSentToServer = form;
  }

  //redirect To Event Page
  redirecTo() {
     this.router.navigate(['/event']);
  }

  //Check Type
  isObject(val) { 
    let ret = typeof val === 'object'; 
    // console.log(ret);
    return !ret;
  }

}