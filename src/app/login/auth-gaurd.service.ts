import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GlobalService } from '../shared/global.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthGaurd implements CanActivate {

    EmsModuleId: number;

    constructor( private router:Router, private globalService: GlobalService){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        let token=localStorage.getItem("token");
                if(!token){
                    localStorage.clear();
                    this.router.navigate(['/login']);
                    //console.log('not logged in');
                    return false;
                }
            
            const params = { token: token };
                return this.globalService.post('Auth/IsAuthenticated/', params).map((res: any) => {   
                if(res.isAuthenticated){
                    this.EmsModuleId = +res.EmsModuleId;           
                    return true;
                }
                else{
                localStorage.clear();
                this.router.navigate(['/login']);
               //console.log('not authenticated');
                
                return false; 
                }
                })
                
    }

   
}