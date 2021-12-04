import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string; // it is used only in interceptor
  private tokenTimer: any; // lecture 111
  private userId: string; // lecture 118 - 1
  // private isAuthenticated = false;
  // private authStatusListener = new Subject<boolean>(); // lecture 106
  private authStatusListener = new BehaviorSubject<boolean>(false); // I used this approach, whereas Max used another approach. refer to lecture 107

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatusListener() { // lecture 106
    return this.authStatusListener.asObservable();
  }

  // This is how to use observable with Guard
  getIsAuth() { // I got this method from Q&A section in lecture 110. I used it only in AuthGuard
    // return this.isAuthenticated;
    return this.authStatusListener.value;
  }

  getUserId() { // lecture 118
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post( BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false); // It is useful only in lgoin and signup components to set the spinner value to false whenever have an error during login or signup lecture 122
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + '/login', authData)
      .subscribe((response) => {
        // console.log(response);
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.userId = response.userId; // lecture 118 - 2
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000); // lecture 112
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId); // lecture 112 // (this.userId) value is set in this line (this.userId = response.userId;) lecture 118 - 8
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false); // It is useful only in lgoin and signup components to set the spinner value to false whenever have an error during login or signup lecture 122
      });
  }

  autoAuthUser() { // lecture 112
    const authInformation = this.getAuthData();
    if (!authInformation) { // we check here to avoind (TypeError: Cannot read properties of undefined (reading 'expirationDate'))
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId; // lecture 118 - 7
      this.setAuthTimer(expiresIn / 1000); // since setAuthTimer() works with seconds, we divided by 1000 milliseconds
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.authStatusListener.next(false);
    this.userId = null; // lecture 118 - 3
    clearTimeout(this.tokenTimer); // lecture 111
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) { // lecture 112
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => { // lecture 111
      this.logout();
    }, duration * 1000); // since setTimeout() works with  milliseconds, we seconds in expiresInDuration to milliseconds by multiply 1000
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) { // lecture 112
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId); // lecture 118 - 4
  }

  private clearAuthData() { // lecture 112
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId'); // lecture 118 - 5
  }

  private getAuthData() { // lecture 112
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId') // lecture 118 - 6
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }

}
