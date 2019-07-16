import {Component, Input, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import { DynamicService } from './services/dynamic.service';
import {Observable, Subscription} from 'rxjs';
import {QuizState, selectCurrentQuiz} from './store/reducers/quiz.reducer';
import {select, Store} from '@ngrx/store';
import {Quiz} from './model/IQuiz';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    actionSubscription: Subscription;

    title = 'Quiz Factory';
    action = '';
    currentQuiz: Observable<Quiz>;

    constructor(private router: Router,
                private dynamicService: DynamicService,
                private store: Store<QuizState>) {}

    ngOnInit(): void {
        this.actionSubscription = this.dynamicService.actionSubject.subscribe(
            (action) => this.action = action
        );
        this.currentQuiz = this.store.pipe(
            select(selectCurrentQuiz),
            filter(quiz => quiz !== null)
            );
    }
}
