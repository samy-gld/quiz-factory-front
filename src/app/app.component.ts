import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { QuestionState } from './quiz-maker/store/reducers/question.reducer';
import { delay, startWith, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication/services/authentication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    title = 'Quiz Factory';
    isAuthenticated: Observable<boolean>;
    home: boolean;
    isCollapsed = true;

    constructor(private questionStore: Store<QuestionState>,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        this.isAuthenticated = this.authenticationService.isAuthenticated.asObservable()
            .pipe(
                startWith(false),
                delay(0)
            );

        this.router.events.pipe(
            startWith(true),
            delay(0),
            tap(event => {
                    if (event instanceof NavigationStart) {
                        this.home = event.url === '/';
                    }
           })).subscribe();
    }
}
