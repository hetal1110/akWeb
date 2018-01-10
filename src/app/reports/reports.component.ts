import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GridOptions } from 'ag-grid';
import  { AgGridModule } from 'ag-grid-angular/main';
import { AuthGaurd } from '../login/auth-gaurd.service';
import { GlobalService } from '../shared/global.service';
import { HttpParams } from '@angular/common/http';
import { Message } from 'primeng/primeng';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  msgs: Message[] = [];
  reports = [];
  events = [];
  selectedEvent: number;
  selectedReport: string;
  private gridOptions:GridOptions;
  private columnDefs: any[];
  private rowData: any[];
  private memberid: number;
  private EMSModuleId: number;
  showGrid:boolean = false;
  showLoader: boolean = false;
  constructor(private authGaurd: AuthGaurd, private globalService: GlobalService) {

    this.memberid= localStorage.getItem("Id") ? +localStorage.getItem("Id") : 0;
    this.EMSModuleId = 1001;

      this.gridOptions = <GridOptions>{
          
          icons: {
              sortAscending: '<i class="fa fa-long-arrow-down"/>',
              sortDescending: '<i class="fa fa-long-arrow-up"/>',
          }
      };
      this.gridOptions.paginationPageSize = 10;
      this.gridOptions.pagination=true;

      // let myParams1 = new URLSearchParams(); 
      // myParams1.append('ModuleId', this.EMSModuleId.toString());  
      // myParams1.append('MemberId', this.memberid.toString());  

      const myParams = new HttpParams()
      .set('ModuleId',this.EMSModuleId.toString())
      .set('MemberId',this.memberid.toString());

      this.globalService.Get('Reports/getReportListForMember/',myParams)
      .subscribe((result: any) => {
        for (let i in result.eventList) {
          this.events.push({label:result.eventList[i]["Eventname"], value:result.eventList[i]["Eventid"]});
        }
        for (let i in result.reportList) {
          this.reports.push({label:result.reportList[i]["ReportName"], value:result.reportList[i]["Value"]});
        }
      },
      (error) => {
          this.msgs = [];  
          this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
       }
      );

  }

  ngOnInit() {    
  }

  // grid related functions
  private onReady() {
    this.gridOptions.api.setRowData([]);  
    // this.showGrid = false;
  }

  onEventChange(eventVal){
    this.selectedEvent=eventVal.value;
  } 

  onReportChange(reportVal){
    this.showLoader = true;
    this.selectedReport = reportVal.value;    
    if(this.selectedEvent){ // if event not selected then show error
      const params = { ReportType: "Web", Report:this.selectedReport, ModuleId: this.EMSModuleId, MemberId: this.memberid, EventId: this.selectedEvent };
      this.globalService.post('Reports/getReportOutput/',params)
      .subscribe((result) => {
          if(result.report.output.length>1){
            this.showGrid = true;
            setTimeout(()=> {
                this.gridOptions.api.setColumnDefs(result.report.output.length > 1 && result.report.columndef.length > 1 ? result.report.columndef : []);
                this.gridOptions.api.setRowData(result.report.output.length > 1 ? result.report.output : []);   
              },500); 
          }
          else{
            this.showGrid = true;
            if(result.report.output.length=1){       
              this.showLoader = false;   
              if(this.gridOptions.api != undefined){
               this.gridOptions.api.setColumnDefs([]);
               this.gridOptions.api.setRowData([]);             
              }
            }
          }  
          this.showLoader = false;   
        },
        (error) => {
            this.msgs = [];  
            this.msgs = [{severity:'error', summary:'error', detail:'Server error, Try again!'}];
            this.showLoader = false;
          }
        );
    }
    else{
      this.msgs = [];  
        this.msgs = [{ severity: 'error', summary: 'error', detail:'Select an Event first to proceed furthur!'}];
    }
  }

  // on export of report
  onExport() {
    // this.gridOptions.api.exportDataAsExcel(null);

    let today =  new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

    let day=dd.toString(); let month=mm.toString(); let date;

    if(+dd<10) {
        day = '0'+ dd;
    } 

    if(+mm<10) {
        month = '0'+ mm;
    } 

    date = day + '/' + month + '/' + yyyy;

    var params = {
        fileName:  'Report_' + date
      //  columnKeys: ['name','idCard']
    };
    
    var content = this.gridOptions.api.getDataAsExcel(params);
    var workbook = XLSX.read(content, {type: 'binary'});
    var xlsxContent = XLSX.write(workbook, {bookType: 'xlsx', type: 'base64'});
    this.globalService.download(params, xlsxContent);
    
   }
  
}
