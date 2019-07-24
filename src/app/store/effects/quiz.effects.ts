import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, map, withLatestFrom} from 'rxjs/operators';
import { Quiz } from '../../model/IQuiz';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import {Store, select, createReducer} from '@ngrx/store';
import * as fromRoot from '../reducers/quiz.reducer';
import {
    ActionsUnion, CreateQuiz, CreateQuizError, CreateQuizSuccess,
    DeleteQuiz, DeleteQuizError, DeleteQuizSuccess, LoadQuizzes, LoadQuizzesError,
    LoadQuizzesSuccess
} from '../actions/quiz.actions';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ErrorManagerService } from '../../services/error-manager.service';

@Injectable()
export class QuizEffects {
    ApiUrl = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };
    constructor(private actions$: Actions<ActionsUnion>,
                private httpClient: HttpClient,
                private store: Store<fromRoot.QuizState>,
                private router: Router,
                private errorManager: ErrorManagerService) {}

    loadQuizzes$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizzes),
        withLatestFrom(
            // Check for data in the store
            this.store.pipe(select(fromRoot.selectQuizzes)),
                (action, quizzes: Quiz[]) => quizzes
        ),
        mergeMap(
            (quizzes: Quiz[]) => {
                // If quizzes are the store, we launch a LoadQuizSuccess Action
                if (quizzes.length) {
                    return of(quizzes).pipe(map(() => LoadQuizzesSuccess({quizzes})));
                }

                // If not, we send the request
                return this.httpClient.get<Quiz[]>(this.ApiUrl + '/quiz').pipe(
                    map((q: Quiz[]) => LoadQuizzesSuccess({quizzes: q})),
                    catchError(err => of(LoadQuizzesError(err)))
                );
            }
        )
    ));

    createQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuiz),
        mergeMap(action =>
            this.httpClient.post(this.ApiUrl + '/quiz', action.quiz, this.httpOptions)
            .pipe(
                map((quiz: Quiz) => CreateQuizSuccess({quiz})),
                catchError(err => of(CreateQuizError(err)))
            )
        )
    ));

    // Redirect to edit question page
    createSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuizSuccess),
        map(action => this.router.navigate(['/question/edit/', action.quiz.id]))
        ),
        { dispatch: false}
    );

    deleteQuiz$ = createReducer(() => this.actions$.pipe(
        ofType(DeleteQuiz),
        map(action => action.id),
        mergeMap(
            (id: number) => this.httpClient.delete(this.ApiUrl + '/quiz/' + id)
            .pipe(
                map(() => DeleteQuizSuccess({id})),
                catchError(err => of(DeleteQuizError(err)))
            )
        )
    ));

    // Api Call errors management or expired Token
    ApiCallError = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizzesError, CreateQuizError, DeleteQuizError),
        map(error => this.errorManager.manageError(error))
        ),
        { dispatch: false}
    );
}
