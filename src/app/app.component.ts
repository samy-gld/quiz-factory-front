import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DynamicService } from './services/dynamic.service';
import { Observable, of, Subscription } from 'rxjs';
import { selectIsAuthenticated } from './store/reducers/quiz.reducer';
import { select, Store } from '@ngrx/store';
import { Quiz } from './model/IQuiz';
import { Login } from './store/actions/quiz.actions';
import {QuestionState, selectCurrentQuiz} from './store/reducers/question.reducer';
import {AuthenticationService} from './services/authentication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    actionSubscription: Subscription;
    title = 'Quiz Factory';
    action = '';
    currentQuiz: Observable<Quiz> = of({id: null, name: '', description: ''} as Quiz);
    isAuthenticated: boolean;
    home: Observable<boolean>;

    constructor(private dynamicService: DynamicService,
                private questionStore: Store<QuestionState>,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        const isAuth: boolean = this.authenticationService.isLoggedIn();
        this.authenticationService.isAuthenticated.next(isAuth);
        this.authenticationService.isAuthenticated.subscribe(
            value => this.isAuthenticated = value
        );
        this.actionSubscription = this.dynamicService.actionSubject.subscribe(
            (action) => this.action = action
        );
        this.currentQuiz = this.questionStore.pipe(select(selectCurrentQuiz));
        this.router.events.subscribe(
            event => {
                    if (event instanceof NavigationStart) {
                        this.home = of(event.url === '/');
                    }
            });
    }
}
