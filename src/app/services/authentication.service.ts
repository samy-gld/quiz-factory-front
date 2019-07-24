import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IUser } from '../model/IUser';
import { shareReplay, tap } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    url = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };
    isAuthenticated = new BehaviorSubject<boolean>(false);

    constructor(private httpClient: HttpClient) {}


    login(user: IUser) {
        return this.httpClient.post(this.url + '/login_check', user, this.httpOptions)
            .pipe(
                tap(token => this.setSession(token)),
                shareReplay()
            );
    }

    register(user: IUser) {
        return this.httpClient.post(this.url + '/register', user, this.httpOptions);
    }

    private setSession(authResult) {
        const decodeToken = jwt_decode(authResult.token);
        localStorage.setItem('id_token', authResult.token);
        localStorage.setItem('expire_at', decodeToken.exp);
        this.isAuthenticated.next(true);
    }

    logout() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expire_at');
        this.isAuthenticated.next(false);
    }

    isLoggedIn(): boolean {
        const token = localStorage.getItem('id_token')
        const expireAt = localStorage.getItem('expire_at');
        if (token && Number(expireAt) - Date.now() / 1000 > 0) {
            return true;
        } else {
            return false;
        }
    }
}
