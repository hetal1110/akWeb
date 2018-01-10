import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Data, RouterStateSnapshot, Router } from '@angular/router';
//import { AuthService } from '../../login/auth.service';
import { GlobalService } from '../../shared/global.service';
import { LoginResolver } from '../../login/login-resolver.service';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import {SelectItem } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})

export class OtpComponent implements OnInit {
otpForm: FormGroup;
Module: any;

RefId: number;
ICardId: string;

Modules: SelectItem[] = [];
msgs: Message[] = [];

selectedMod: string;

constructor(private route:ActivatedRoute, private router: Router, private globalService: GlobalService) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params)=>{
        this.RefId = params['RefId'];
        this.ICardId = params['ICardId'];
      }
    );
    this.route.data.subscribe(
      (data: Data)=>{
        let result: any[];
        result= JSON.parse(data['ModuleInfo']);
        result.forEach(el=>{
            this.Modules.push({label:el.name, value:{desc:el.desc, state: el.state, href: el.href}});
        });
      },
      (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    );

    this.otpForm = new FormGroup({
      'otpData': new FormGroup({
        'selectedModule': new FormControl(this.Modules),
        'VerificationCode': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9][0-9][0-9][0-9][0-9]$/)])
      })
    }); 

    this.Module = this.Modules[0].value;    
  }

  onModuleSelected(selected): void{ 
    this.Module = selected ? selected.value : 0;
  }

  onSubmit(){   
   const verifyDetails = {"RefId": this.RefId, "VerificationCode": this.otpForm.value.otpData.VerificationCode, "IcardId": this.ICardId }; 
   this.globalService.post('Auth/MatchOtpAkonnectWebLogin/',verifyDetails)
    .subscribe((result: any)=>{
        if(result){
        if(result.IsVerified=="1"){
          //store token       
          localStorage.setItem('ICardId', result.ICardId);
          localStorage.setItem('Id', result.Id);
          localStorage.setItem('IsCoordinator', result.IsCoordinator);
          localStorage.setItem('IsICardCoordinator', result.IsICardCoordinator);
          localStorage.setItem('token', result.token);

          if (this.Module.state) {
            this.router.navigate(['/'+this.Module.state]);
          } else {
            //redirect to m/ if not coordinator
            window.location.href =  this.Module.href; 
          }
        }
        else {
          this.msgs.push({severity:'error', summary:'Error', detail:'Invalid OTP or Expired OTP'});                       
                        setTimeout(()=>{    
                              this.msgs = [];
                          },7000);
        }
      } 
      else{
        this.msgs.push({severity:'error', summary:'Error', detail:'Something is wrong , Try Again'});                       
                        setTimeout(()=>{    
                              this.msgs = [];
                          },7000);
      }
    },
    (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
        }
    )
  }
}
