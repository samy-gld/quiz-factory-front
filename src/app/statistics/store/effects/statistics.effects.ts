import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ErrorManagerService } from '../../../services/error-manager.service';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import {Question, Quiz} from '../../../model/IQuiz';
import {
    ActionsUnion,
    LoadQuestions,
    LoadQuestionsError,
    LoadQuestionsSuccess, LoadQuiz, LoadQuizError,
    LoadQuizInvitations,
    LoadQuizInvitationsError,
    LoadQuizInvitationsSuccess, LoadQuizSuccess,
    LoadQuizzes,
    LoadQuizzesError,
    LoadQuizzesSuccess
} from '../actions/statistics.actions';
import { of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectFinalizedQuizzes, StatisticsState } from '../reducers/statistics.reducer';
import { Invitation } from '../../../model/IInvitation';

@Injectable()
export class StatisticsEffects {

    ApiUrl = environment.UrlApi;

    constructor(private actions$: Actions<ActionsUnion>,
                private httpClient: HttpClient,
                private statisticsStore: Store<StatisticsState>,
                private errorManager: ErrorManagerService) {
    }

    loadQuizzes$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizzes),
        withLatestFrom(
            // Check for data in the store
            this.statisticsStore.pipe(select(selectFinalizedQuizzes)),
            (action, quizzes: Quiz[]) => quizzes
        ),
        mergeMap(
            (quizzes: Quiz[]) => {
                if (quizzes.length) {
                    return of(quizzes).pipe(map(() => LoadQuizzesSuccess({quizzes})));
                }

                return this.httpClient.get<Quiz[]>(this.ApiUrl + '/quiz').pipe(
                    map((q: Quiz[]) => LoadQuizzesSuccess({quizzes: q})),
                    catchError(err => of(LoadQuizzesError({error: err.error.message})))
                );
            }
        )
    ));

    loadInvitations$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizInvitations),
        mergeMap(
            ({quizId}) => {
                const params = new HttpParams().set('origin', 'stats');
                return this.httpClient.get<Invitation[]>(this.ApiUrl + '/quiz/' + quizId + '/invitations', {params}).pipe(
                    map((invits: Invitation[]) => LoadQuizInvitationsSuccess({invitations: invits})),
                    catchError(err => of(LoadQuizInvitationsError({error: err.error.message})))
                );
            }
        )
    ));

    loadQuestions$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuestions),
        mergeMap(
            ({quizId}) =>
                this.httpClient.get<Question[]>(this.ApiUrl + '/quiz/' + quizId + '/questions').pipe(
                    map((q: Question[]) => LoadQuestionsSuccess({questions: q})),
                    catchError(err => of(LoadQuestionsError({error: err.error.message})))
                )
        )
    ));

    loadQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuiz),
        mergeMap(
            ({id}) =>
                this.httpClient.get<Quiz>(this.ApiUrl + '/quiz/' + id).pipe(
                    map((q: Quiz) => LoadQuizSuccess({quiz: q})),
                    catchError(err => of(LoadQuizError({error: err.error.message})))
                )
        )
    ));
}
