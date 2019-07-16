import { Injectable } from '@angular/core';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import { Quiz } from '../../model/IQuiz';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import {Store, select, createReducer} from '@ngrx/store';
import * as fromRoot from '../reducers/quiz.reducer';
import {
    ActionsUnion, CreateQuiz, CreateQuizSuccess,
    DeleteQuiz,
    DeleteQuizSuccess,
    LoadQuiz,
    LoadQuizSuccess,
    LoadQuizzes,
    LoadQuizzesSuccess
} from '../actions/quiz.actions';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../../environments/environment';
import {Router} from '@angular/router';


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
                private router: Router) {}

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
                    return of(quizzes).pipe(
                        map(() => LoadQuizzesSuccess({quizzes})));
                }

                // If not, we send the request
                return this.httpClient.get<Quiz[]>(this.ApiUrl + '/quiz').pipe(
                    // tslint:disable-next-line:no-shadowed-variable
                    map((quizzes: Quiz[]) => LoadQuizzesSuccess({quizzes}))
                );
            }
        )
    ));

    loadQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuiz),
        map(action => action.id),
        switchMap(
            (id: number) =>
                this.httpClient.get<Quiz>(this.ApiUrl + '/quiz/' + id)
                    .pipe(
                        map(
                            (quiz: Quiz) => LoadQuizSuccess({quiz})
                        )
                    )
        )
    ));

    createQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuiz),
        mergeMap(action =>
            this.httpClient.post(this.ApiUrl + '/quiz', action.quiz, this.httpOptions)),
            map((quiz: Quiz) => CreateQuizSuccess({quiz})
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
                map(
                    () => DeleteQuizSuccess({id})
                )
            )
        )
    ));
}
