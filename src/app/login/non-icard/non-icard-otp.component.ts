import { Component, OnInit } from '@angular/core';
import { NonIcardResolver } from '../../login/non-icard/non-icard-resolver.service';
import { GlobalService } from '../../shared/global.service';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { ActivatedRoute, Data, Router} from '@angular/router';
import { GrowlModule, Message } from 'primeng/primeng';

@Component({
  selector: 'app-non-icard-otp',
  templateUrl: './non-icard-otp.component.html',
  styleUrls: ['./non-icard-otp.component.css']
})
export class NonIcardOtpComponent implements OnInit {
otpForm: FormGroup;
NonIcardInfo={};
msgs: Message[] = [];

 constructor(private route:ActivatedRoute, private globalService: GlobalService, private router: Router) { }
 
 ngOnInit() {

    // get route data
    this.route.data.subscribe(
      (data: Data)=>{
        let result: any[];
        result= JSON.parse(data['NonIcardInfo']);
        this.NonIcardInfo = result;
      }
    );

    // initialize the form
    this.initForm();
 }

// to initialize the form
 initForm(){
    this.otpForm = new FormGroup({
      'otpData': new FormGroup({    
        'VerificationCode': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9][0-9][0-9][0-9][0-9]$/)])
       })
    }); 
 }

// when form is submitted
 onSubmit(){  
   let obj ={};
   obj = Object.assign(obj, this.NonIcardInfo, {ParentMemberId: -999, VerificationCode: this.otpForm.value.otpData.VerificationCode});

   this.globalService.post('Member/MemberVerify/',obj)
    .subscribe((res: any)=>{
        if(res.result[0] && res.result[0].IsVerified){
            this.msgs = [];   
            this.msgs = [{severity:'success', summary:'Verified', detail:'Please login with below ICardId - ' + this.NonIcardInfo["ChildICardId"] + ' and keep it with you for your future reference.'}];  

             setTimeout(()=> {
              this.router.navigate(['/login', this.NonIcardInfo["ChildICardId"]]); 
              },6000);          
            
        }
        else{
          this.msgs = [];    
          this.msgs = [{severity:'error', summary:'error', detail:'Verification Code Does not Match. Please check the Verification Code and Try again.'}];  
        }
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );
 }

 //
 goToLogin(){
  this.router.navigate(['/login']); 
 }
}