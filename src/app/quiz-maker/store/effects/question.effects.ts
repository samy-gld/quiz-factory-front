import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { Question, Quiz } from '../../../model/IQuiz';
import {
    ActionsUnion, CreateQuestion, CreateQuestionError, CreateQuestionSuccess, UpdateQuestion, UpdateQuestionError,
    UpdateQuestionSuccess, LoadQuiz, LoadQuizError, LoadQuizSuccess, DeleteQuestion, DeleteQuestionSuccess, DeleteQuestionError
} from '../actions/question.actions';
import { of } from 'rxjs';
import { ErrorManagerService } from '../../../services/error-manager.service';

@Injectable()
export class QuestionEffects {
  ApiUrl = environment.UrlApi;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private actions$: Actions<ActionsUnion>,
              private httpClient: HttpClient,
              private errorManager: ErrorManagerService) {}

    loadQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuiz),
        map(action => action.id),
        filter((id: number) => id !== undefined),
        switchMap(
            (id: number) =>
                this.httpClient.get<Quiz>(this.ApiUrl + '/quiz/' + id)
                    .pipe(
                        map((quiz: Quiz) => LoadQuizSuccess({quiz})),
                        catchError(err => of(LoadQuizError({error: err.error.message})))
                    )
        )
    ));

    createQuestion$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuestion),
        mergeMap(({quizId, question}) =>
                this.httpClient.post<Question>(this.ApiUrl + '/quiz/' + quizId + '/question',
                    JSON.stringify(question), this.httpOptions)
                    .pipe(
                        map((result: Question) => CreateQuestionSuccess({question: result})),
                        catchError(err => of(CreateQuestionError({error: err.error.message})))
                    )
        )
    ));

    updateQuestion$ = createEffect(() => this.actions$.pipe(
        ofType(UpdateQuestion),
        mergeMap(action =>
            this.httpClient.patch<Question>(this.ApiUrl + '/question/' + action.question.id,
                JSON.stringify(action.question), this.httpOptions)
                .pipe(
                    map((question: Question) => UpdateQuestionSuccess({question: {id: question.position, changes: question}})),
                    catchError(err => of(UpdateQuestionError({error: err.error.message})))
                )
        )
    ));

    deleteQuestion$ = createEffect(() => this.actions$.pipe(
        ofType(DeleteQuestion),
        mergeMap(action => {
                if (action.id !== null) {
                    return this.httpClient.delete(this.ApiUrl + '/question/' + action.id)
                        .pipe(
                            map(() => DeleteQuestionSuccess({questionPosition: action.questionPosition})),
                            catchError(err => of(DeleteQuestionError({error: err.error.message})))
                        );
                } else {
                    return of(DeleteQuestionSuccess({questionPosition: action.questionPosition}));
                }
            }
        )
    ));

    // Api Call errors management or expired Token
    ApiCallError = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizError, CreateQuestionError, UpdateQuestionError),
        map(errorMessage => this.errorManager.manageError(errorMessage))
        ),
        { dispatch: false}
    );
}
