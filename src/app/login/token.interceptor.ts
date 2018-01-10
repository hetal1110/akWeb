import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let t = localStorage.getItem('token');
    if(t==null){
      t="";
    }
    // console.log(request.url);
    
    //Append Headers for all outgoing request other than third party /** Specific for Angular 5 **/
    if(request.url != "http://ipv4.myexternalip.com/json") {

      //.set('Content-Type','application/json')
      let headers = new HttpHeaders()
      .set('Authorization','token '+t);

      request = request.clone({
        headers     
      });
    }

    return next.handle(request);
  }
}