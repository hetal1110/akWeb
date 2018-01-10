import { Component, OnInit  } from '@angular/core';
import {AgGridModule} from "ag-grid-angular/main";
import { LicenseManager } from 'ag-grid-enterprise/main';
import { DatePipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs/Rx'; 
import { GlobalService } from './shared/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  today = Date.now();
  SlideMenu: boolean = false;
  private listener: Subscription;
  public MemberId: any;

  constructor(private globalService : GlobalService) {
    LicenseManager.setLicenseKey('Dada_Bhagwan_Foundation_Dada_Bhagwan_Foundation_1Devs28_September_2018__MTUzODA4OTIwMDAwMA==e40c526c93cbe82aaa30b417ac60a42b');
    this.MemberId = localStorage.getItem("Id") ? true : false;
  
  }

  ngOnInit(){
    this.listener = this.globalService.getChangeEmitter()
    .subscribe(paramsFromService => {
      if(paramsFromService.toggle== true || paramsFromService.toggle == false){ 
          this.SlideMenu = paramsFromService.toggle;
      }
    });
    
  }

  changeOfRoutes(){
    this.MemberId = localStorage.getItem("Id")===null ? false : true;    
  }

  
}
