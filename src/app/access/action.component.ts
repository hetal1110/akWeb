import { Component, OnDestroy } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular/main";

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})

export class ActionComponent implements ICellRendererAngularComp, OnDestroy {

  public params: any;

  constructor() { }

  agInit(params: any): void {
        this.params = params;
  }


  Edit() {
        this.params.context.componentParent.onEdit(this.params.data);
    }
  
   refresh(): boolean {
        return false;
    }

   ngOnDestroy() {
        
    }

}
