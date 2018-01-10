import { Component, OnInit, NgModule } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Http, Response, Headers } from '@angular/http';
import { Message, InputTextModule } from 'primeng/primeng';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {GlobalService} from '../shared/global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  msgs: Message[] = [];
  constructor(private router: Router, private route: ActivatedRoute, private globalService: GlobalService) {
    // already logged in then clear local storage to make login compulsory again
    localStorage.clear();

    //Instantiate menu
    let sendData = {};
    sendData = {command: 'SETMENU', params:{}};
    this.globalService.setEmitter(sendData);

    //Set Footer
    let sendFooterData = {};
    sendFooterData = {command: 'SETFOOTER', params:{}};
    this.globalService.setEmitter(sendFooterData);
    
    let sendLoginData = {};
    sendLoginData = {command: 'SETLOGINFOOTER', params:{}};
    this.globalService.setEmitter(sendLoginData);

   }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'loginData': new FormGroup({
        'IcardId': new FormControl(null,[Validators.required]),
        'EmMobile': new FormControl(null, [Validators.required])
      })
    });  

    this.route.params.subscribe(
      (params: Params)=>{
        if(params['ICardId']){
          this.loginForm.patchValue({
            'loginData': {
              'IcardId':params['ICardId'],
              'EmMobile': ''
            }
          });
         // this.loginForm.controls['IcardId'].patchValue(params['ICardId']);
        }
      }
    );
  }

  onSubmit(){
    const verifyDetails = { "IcardId": this.loginForm.value.loginData.IcardId, "EmMobile": this.loginForm.value.loginData.EmMobile };
    this.globalService.post('Auth/GetOtpAkonnectWebLogin/', verifyDetails)
    .subscribe(
      (result: any)=>{

        var verification = result.verification!=null ? result.verification : null;
        var modules = result.modules!=null ? result.modules : null; 

        if(verification==null){
          console.log('verification failed'); 
        }
        else{
        if (verification[0].DataMatched==1) {
            this.msgs.push({severity:'success', summary:'', detail:'Successfully logged in'});
            setTimeout(()=>{    
                  this.msgs = [];
            },3000);
            // process of sending verification code on mobile or email will come here  
            this.SendVerificationCode(verification[0]);
            
            this.router.navigate(['/login/otp', verification[0].RefId, verification[0].ICardId, JSON.stringify(modules) ],  { skipLocationChange: true } );                         
          } 

          if (verification[0].NotLinked == 1){                      
              this.msgs.push({severity:'error', summary:'Error', detail:'Your I-Card is Not Linked , To Use this you need to first Link your I-Card on Akonnect'});                       
              setTimeout(()=>{    
                  this.msgs = [];
              },7000);
          }

          if (verification[0].WrongCredentials == 1){
            this.msgs.push({severity:'error', summary:'Error', detail:'The Mobile Number / Email you entered should be as in your I-Card Data'});                                                       
            setTimeout(()=>{    
                  this.msgs = [];
              },7000);
          }
        }                  
                  
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );  
  }
  
  SendVerificationCode(verification) {

    var msg = "Dear Mahatma, " + verification.VerificationCode + " is the Akonnect Web Verification Code for the Mobile Number " + verification .MobileNo;
    // console.log(msg);
    let obj = Object.assign({},verification, { msg: msg });

    // if mobile is null then return
    if (!obj.MobileNo) {}
    else{    
    // else if mobile is not null send SMS  
      let qs =  {
            method: 'sms',
            //api_key: config.SINFINI_API_KEY,
            api_key: 'A6890d82f7c99e00517221e53b06649ae',
            sender: "AKNECT",
            to: obj.MobileNo,
            message: obj.msg,
            format: "json",
            flash: 0
        };

    this.globalService.post('Auth/SendSMSWithOtp/',qs)
    .subscribe(
      (result: any)=>{
      },
      (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'SMS Sending failed!'}];
        }
    )
    }
    
    // if EmailId is null then return
    if (!obj.EmailId) {}
    else { // if EmailId is not null send email
      this.globalService.post('Auth/SendEmailWithOtp/',obj)
      .subscribe(
        (result: any)=>{
        },
        (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Email Sending failed!'}];
        }
      )
    }
  }

 
}
