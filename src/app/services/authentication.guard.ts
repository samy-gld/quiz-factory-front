import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {QuizState, selectIsAuthenticated} from '../store/reducers/quiz.reducer';
import {Store} from '@ngrx/store';
import {map} from 'rxjs/operators';
import {AuthenticationService} from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

    constructor(private router: Router,
                private authenticationService: AuthenticationService) {}

    // tslint:disable-next-line:max-line-length
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isAuth = this.authenticationService.isLoggedIn();
        this.authenticationService.isAuthenticated.next(isAuth);
        if (isAuth) {
             return true;
         } else {
             this.router.navigate(['/login']);
             return false;
         }
    }
}
