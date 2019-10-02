import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate, CanLoad {

    constructor(private router: Router,
                private authenticationService: AuthenticationService) {}

    // tslint:disable-next-line:max-line-length
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isAuth = this.authenticationService.isLoggedIn();
        this.authenticationService.isAuthenticated.next(isAuth);
        if (isAuth) {
             return true;
         } else {
             this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
             return false;
         }
    }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        const isAuth = this.authenticationService.isLoggedIn();
        this.authenticationService.isAuthenticated.next(isAuth);
        if (isAuth) {
            return true;
        } else {
            const url = segments.reduce((path, currentSegment) => {
                return `${path}/${currentSegment.path}`;
            }, '');
            this.router.navigate(['/login'], { queryParams: { returnUrl: url }});
            return false;
        }
    }
}
