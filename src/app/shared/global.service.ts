import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import { Router } from '@angular/router';
import 'rxjs/Rx';

@Injectable()
export class GlobalService {

    constructor(private http: HttpClient, private router: Router, private Http: Http) { }

    //API URL
    //private APIURL = 'http://localhost:52861/api/';
    private APIURL = 'http://192.168.100.26/AsimService/api/';
    //private APIURL = 'http://api.dadabhagwan.org/AsimServices/api/';    

    /*
    * http Get
    */
    Get(url:string, myParams:any) {
        let URL = this.APIURL + url;        
        return this.http.get(URL, {params: myParams})
        .map( 
            (res: HttpResponse<any>) => 
            { 
                const data = res;
                return data; 
            })
        .catch(this.handleError.bind(this));    
    }

    /*
    * http Get
    */
    GetIp(url:string, myParams:any) {

        // let myHeaders = new Headers();

        // return this.Http.get(url, myParams)
        // .map(
        //     (response: any) => {
        //         // const data = response.json();
        //         // console.log("response : " + data);
        //         const data = response;
        //         return data;
        //     }
        // )
        // .catch(this.handleError);

         return this.http.get(url, {params: myParams})
        .map( 
            (res: HttpResponse<any>) => 
            { 
                const data = res;
                return data; 
            })
        .catch(this.handleError.bind(this));   
    }

    /*
    * http Post
    */
    post(url:string, data): Observable<any> {
        // console.log(data);
        //Construct URL
        let URL = this.APIURL + url;                      
        return this.http.post(URL, data)               
                .map(
                    (response: HttpResponse<any>) => {                       
                            const data = response;
                            return data;                        
                    }                   
                )
                .catch(this.handleError.bind(this));                
        }
    
    /*
    * upload File
    */
    uploadFile(url:string, data: FormData): Observable<any> {

        //Construct URL
        let URL = this.APIURL + url;
        return this.Http.post(URL, data)
               .map(
                    (response: Response) => {
                        const data = response.json();
                        // console.log("response : " + data);
                        return data;
                    }
                )
                .catch(this.handleError);
    }

    /*
    * http Delete
    */
    delete(url:string, myParams:any) {  

        let URL = this.APIURL + url;        
        return this.http.delete(URL, {params: myParams})
        .map( 
            (res: HttpResponse<any>) => 
            { 
                const data = res;
                return data; 
            })
        .catch(this.handleError.bind(this)); 
    }

    /*
    * To Extract Response
    */
    private extractData(res: Response) {
	    let body = res.json();
        return body.data || {};
    }

    /*
    * To Handle Error
    */
    private handleError (error: any) {
        // console.log("Something went wrong");
        console.log(error);

        if (error.status === 403) {
            console.log(error.status + ":" + error.statusText || ' Server error');
                this.router.navigate(['/login']);
                return Observable.empty();
        }
        return Observable.throw(error);
    }

    /*
    * Export To Excel functions
    */
   //http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   b64toBlob(b64Data, contentType) {
        var sliceSize = 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    download (params, content){
        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        var fileName = fileNamePresent ? params.fileName : 'noWarning.xlsx';

        var blobObject = this.b64toBlob(content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        } else {
            // Chrome
            var downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blobObject);
            downloadLink.download = fileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

   //To download sample file
  downloadSample(url:string) {

      let URL = this.APIURL + url;
      window.location.href = URL;
  }

   // Set Emitters
   private emitter: Subject<any> = new Subject<any>();

    setEmitter(sendData) {
        // this.emitter.next({command: 'set', params:{a:1, b:2}});
        this.emitter.next(sendData);
    }

    getChangeEmitter() {
       return this.emitter;
    }

}