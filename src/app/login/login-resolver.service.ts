import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

interface ModuleInfo {
name: string;
desc: string;
state: string;
href: string;
};
export class LoginResolver implements Resolve<ModuleInfo>{
 resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ModuleInfo> | Promise<ModuleInfo> | ModuleInfo {
    return route.params['modules'];
 }
} 