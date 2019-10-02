import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { isQuizStateLoaded, QuizState } from '../../quiz-maker/store/reducers/quiz.reducer';
import { isQuestionStateLoaded, QuestionState } from '../../quiz-maker/store/reducers/question.reducer';
import { isExecutionStateLoaded, ExecutionState } from '../../quiz-execution/store/reducers/execution.reducer';
import { isStatisticsStateLoaded, StatisticsState } from '../../statistics/store/reducers/statistics.reducer';
import { ClearQuizState } from '../../quiz-maker/store/actions/quiz.actions';
import { ClearQuestionState } from '../../quiz-maker/store/actions/question.actions';
import { ClearExecutionState } from '../../quiz-execution/store/actions/execution.actions';
import { ClearStatisticsState } from '../../statistics/store/actions/statistics.actions';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private quizStore: Store<QuizState>,
                private questionStore: Store<QuestionState>,
                private executionStore: Store<ExecutionState>,
                private statisticStore: Store<StatisticsState>) { }

    ngOnInit() {
        this.authenticationService.logout();

        this.quizStore.pipe(
            select(isQuizStateLoaded),
            take(1)
        ).subscribe(
            isQStateLoaded => {
                if (isQStateLoaded) {
                    this.quizStore.dispatch(ClearQuizState());
                }
            }
        );

        this.questionStore.pipe(
            select(isQuestionStateLoaded),
            take(1)
        ).subscribe(
            isQStateLoaded => {
                if (isQStateLoaded) {
                    this.questionStore.dispatch(ClearQuestionState());
                }
            }
        );

        this.executionStore.pipe(
            select(isExecutionStateLoaded),
            take(1)
        ).subscribe(
            isEStateLoaded => {
                if (isEStateLoaded) {
                    this.executionStore.dispatch(ClearExecutionState());
                }
            }
        );

        this.statisticStore.pipe(
            select(isStatisticsStateLoaded),
            take(1)
        ).subscribe(
            isSStateLoaded => {
                if (isSStateLoaded) {
                    this.executionStore.dispatch(ClearStatisticsState());
                }
            }
        );

        this.router.navigate(['/']);
    }

}
