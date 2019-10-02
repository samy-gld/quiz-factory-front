import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Quiz } from '../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { selectFinalizedQuizzes, selectLoadingQuizzes, StatisticsState } from './store/reducers/statistics.reducer';
import { LoadQuizzes } from './store/actions/statistics.actions';
import {delay, map, skipWhile, startWith, tap, withLatestFrom} from 'rxjs/operators';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

    quizzes$: Observable<Quiz[]>;
    quizId: number;
    defaultSelectedValue$: Observable<string> = of('Chargement de vos quizzes...');

    constructor(private statisticsStore: Store<StatisticsState>) { }

    ngOnInit() {
        this.statisticsStore.dispatch(LoadQuizzes());
        this.quizzes$ = this.statisticsStore.pipe(
            select(selectFinalizedQuizzes),
            startWith([]),
            delay(0),
            withLatestFrom(
                this.statisticsStore.pipe(
                    select(selectLoadingQuizzes),
                    skipWhile(loading => !!loading)
                )
            ),
            tap(
                ([quizzes, _]) => {
                    if (quizzes.length !== 0) {
                        this.defaultSelectedValue$ = of('Sélectionnez votre quiz...');
                    } else {
                        this.defaultSelectedValue$ = of('Vous n\'avez pas encore finalisé de quiz...');
                    }
                }
            ),
            map(
                ([quizzes, _]) => quizzes
            )
        );
    }

    onSelect(quizId: any) {
        this.quizId = Number(quizId);
    }
}
