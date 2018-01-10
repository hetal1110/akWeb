import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import {GlobalService} from '../shared/global.service';

@Injectable()
export class AccessService {
    constructor(private globalService: GlobalService){        
    }

    getRoles (memberid: number) {

       return this.globalService.Get('AkRoleAccess/GetUserRoles/',memberid).map((res: any) => {
          return res.json();
        })
        .catch(this.handleError);
    }
  
  private handleError (error: Response) {
    console.error("error: "+error);
    return Observable.throw(error.json().error || 'Server error');
  }

  getMemberShortDetail (value: string) {
       return this.globalService.Get('AkRoleAccess/GetMemberShortDetail/',value).map((res: any) => {
          return res.json();
        })
        .catch(this.handleError);
  }

  // to get rows for grid
  getUserRoleAccess(){
    return this.globalService.Get('AkRoleAccess/EMS_GetMemberModuleRole/',localStorage.getItem('Id')).map((res: any) => {
          return res.json();
        })
        .catch(this.handleError);
  }
  
  //to add new user role access
  addUserRoleAccess(IcardId: string, RoleId: string){
    const newRole = { "IcardId": IcardId, "RoleId": RoleId };     
    return this.globalService.post('AkRoleAccess/EMS_AddEditMemberModuleRole/', newRole)
                      .map((res)=>{})
                      .catch(this.handleError);
  }

  private serializeObj(obj) {
    var result = [];
    for (var property in obj)
        result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

    return result.join("&");
}

  //To update user role access
  updateUserRoleAccess(IcardId: string, RoleId: string){
   const newRole = { "IcardId": IcardId, "RoleId": RoleId };
   return this.globalService.post('AkRoleAccess/EMS_AddEditMemberModuleRole/',newRole);    
  }
} 