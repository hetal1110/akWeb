import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GlobalService } from '../shared/global.service';
import { Router,  RouterLinkActive  } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public Menu: any;
  public Event: any;
  public MemberId: any;
  private listener: Subscription;
  showlogOut:boolean = false;

 SlideMenu:boolean = false;
 EventActive: boolean = false;


  constructor(private router: Router, private globalService : GlobalService) { 
    this.onGetMenuItem();
  }

  ngOnInit() {

    // Listen for changes in the service
        this.listener = this.globalService.getChangeEmitter()
        .subscribe(paramsFromService => {
            // console.log("paramsFromService : " + JSON.stringify(paramsFromService));

            switch (paramsFromService.command) {
                case 'SETMENU':
                   this.onGetMenuItem();
                break;
            }
        });
  }

  //call on Logout
  onLogout(){

    //Clear localstorage
    localStorage.clear();
    this.showlogOut = false;

    //Instantiate menu
    let sendData = {};
    sendData = {command: 'SETMENU', params:{}};
    this.globalService.setEmitter(sendData);
    
    //Redirect to login
    this.router.navigate(['/login']);

    // console.log('log out ');
  }

  // To Get Dashboard Data
  onGetMenuItem() {
      
      this.MemberId = localStorage.getItem("Id") ? + localStorage.getItem("Id") : 0;
      let url = 'Auth/GetMenuItem';

      // If user is logged in
      if(this.MemberId > 0) {
        let myParams = new HttpParams()
        .set('MemberId', this.MemberId);   
        this.globalService.Get(url, myParams)
        .subscribe((data: any) => {
            this.Menu = data.Menu;
            this.Event = data.Event;
            // console.log(data.Menu);
            // console.log(data.Event);
          },
          (error) => {
          }
        );
      }
  }

  toggleMenu(){
    let sendData = {};
    this.SlideMenu = !this.SlideMenu; 
    sendData = {toggle: this.SlideMenu};
    this.globalService.setEmitter(sendData);    
  }

  toggleSubMenu(){
    this.EventActive = !this.EventActive; ;
  }
}
