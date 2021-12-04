import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();
    const authRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken) // the name 'Authorization' here should match with the name declared in check-auth.js file in the line req.headers.authorization.split(' ')[1]; (The case does not matter since it is case insensitive so that Authorization = authorization) lecture 105
    }); // It is just a convention to use 'Bearer ' however you could omit it if you want. lecture 105
    return next.handle(authRequest);
  }
}
