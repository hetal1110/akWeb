import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StepsModule, MenuItem} from 'primeng/primeng';
import { HttpParams } from '@angular/common/http';
import { GlobalService } from '../../shared/global.service';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProgressbarComponent implements OnInit {

    url:string;
    eventName:string;
    display: boolean = false;
    EventId;
    items: MenuItem[];
    activeIndex: number = 0;

    constructor(private router: Router, 
                private route: ActivatedRoute,
                private globalService : GlobalService,) { 

        //Set current URL
        this.url = router.routerState.snapshot.url.split("/")[3].split("?")[0];

        //Set EventId
        this.route.params
        .subscribe(
            (params: Params) => {
                this.eventName = this.route.snapshot.queryParams['name'];
                this.EventId = +params['id'];
            }
        );
    }

    ngOnInit() {

            let myParams = new HttpParams()  
            .set('TYPE', "GETINFOEVENTS")
            .set('LOV_COLUMN', this.EventId ); 
      
            //Server Side call
            this.globalService.Get('AkEvent/GetProgressBarEventInfo', myParams)
            .subscribe((data: any) => {
                // console.log(JSON.stringify(data[0]));

                let EventStatus = false;
                if(data[0].EventStatusVal == "Pending") {
                //    EventStatus = false;     
                }

                let InviteOnly = false;
                if(data[0].InviteOnly) {
                //    InviteOnly = false;     
                }

                // this.items = [
                //     {
                //         label: 'Event Parameters',
                //         disabled: EventStatus,
                //         command: (event: any) => {
                //             // if(data[0].EventStatusVal == "Pending") {
                //                 this.router.navigate(['event', +this.EventId, 'addParams'], { queryParams: { name: this.eventName }});
                //             // }
                //         }
                //     },
                //     {
                //         label: 'Invite Members',
                //         disabled: InviteOnly,
                //         command: (event: any) => {
                //             // if(data[0].InviteOnly) {
                //                 this.router.navigate(['event', +this.EventId, 'addInvitees'], { queryParams: { name: this.eventName }});
                //             // }
                //         }
                //     },
                //     {
                //         label: 'Cancellation Charges',
                //         command: (event: any) => {
                //             this.router.navigate(['event', +this.EventId, 'cancelCharges'], { queryParams: { name: this.eventName }});
                //         }
                //     },
                //     {
                //         label: 'Event Co-Ordinators',
                //         // disabled: true,
                //         command: (event: any) => {
                //             this.router.navigate(['event', +this.EventId, 'addCoord'], { queryParams: { name: this.eventName }});
                //         }
                //     }
                // ];
                //Set activeIndex based on URL
                switch (this.url) {
                    case 'addInvitees':
                        this.activeIndex = 1;
                    break;
                    case 'cancelCharges':
                        this.activeIndex = 2;
                    break;
                    case 'addCoord':
                        this.activeIndex = 3;
                    break;
                    default:
                        this.activeIndex = 0;
                    break;
                }
            }
        );       
    }

    //Set Menu URL
    setUrl(name:any) {
        this.router.navigate(['event', +this.EventId, name], { queryParams: { name: this.eventName }});
    }
}
