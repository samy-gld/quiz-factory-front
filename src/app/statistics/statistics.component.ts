import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { selectFinalizedQuizzes, StatisticsState } from './store/reducers/statistics.reducer';
import { LoadQuizzes } from './store/actions/statistics.actions';
import {delay, startWith} from 'rxjs/operators';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

    quizzes$: Observable<Quiz[]>;
    quizId: number;

    constructor(private statisticsStore: Store<StatisticsState>) { }

    ngOnInit() {
        this.statisticsStore.dispatch(LoadQuizzes());
        this.quizzes$ = this.statisticsStore.pipe(
            select(selectFinalizedQuizzes),
            startWith([]),
            delay(0)
        );
    }

    onSelect(quizId: any) {
        this.quizId = Number(quizId);
    }
}
