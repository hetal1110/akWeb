import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';


interface NonIcardInfo{
    FName: string;
    MName: string;
    LName: string;
    MobileNo: string;
    EmailId: string;
    Gender: string;
    DOB: string;
    CityId: number;
    CenterId: number;
    SubCenterId: number;
    RequestId: string;
    ChildMemberId: string;
};
export class NonIcardResolver implements Resolve<NonIcardInfo>{
 resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<NonIcardInfo> | Promise<NonIcardInfo> | NonIcardInfo {
    return route.params['forminfo'];
 }
} 