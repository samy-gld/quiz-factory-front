import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { Proposition, Question, Quiz } from '../../../model/IQuiz';
import {
    ActionsUnion, CreateProposition, CreatePropositionError, CreatePropositionSuccess, CreateQuestion,
    CreateQuestionError, CreateQuestionSuccess, DeleteProposition, DeletePropositionError, DeletePropositionSuccess,
    UpdateProposition, UpdatePropositionError, UpdatePropositionSuccess, UpdateQuestion, UpdateQuestionError,
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

    createProposition$ = createEffect(() => this.actions$.pipe(
        ofType(CreateProposition),
        mergeMap(
            ({questionId, questionPosition, proposition, index}) =>
                this.httpClient.post<Proposition>(this.ApiUrl + '/question/' + questionId + '/proposition',
                    JSON.stringify(proposition), this.httpOptions)
                .pipe(
                    map((result: Proposition) => CreatePropositionSuccess({questionPosition, proposition: result, index})
                    ),
                    catchError(err => of(CreatePropositionError({error: err.error.message})))
                )
        )
    ));

    updateProposition$ = createEffect(() => this.actions$.pipe(
        ofType(UpdateProposition),
        mergeMap(
            ({questionPosition, id, proposition, index}) =>
                this.httpClient.patch<Proposition>(this.ApiUrl + '/proposition/' + id,
                    JSON.stringify(proposition), this.httpOptions)
                .pipe(
                    map((result: Proposition) => UpdatePropositionSuccess({questionPosition, id, proposition: result, index})),
                    catchError(err => of(UpdatePropositionError({error: err.error.message})))
                )
        )
    ));

    deleteProposition$ = createEffect(() => this.actions$.pipe(
        ofType(DeleteProposition),
        mergeMap(({questionPosition, propositionId}) =>
            this.httpClient.delete(this.ApiUrl + '/proposition/' + propositionId)
                .pipe(
                    map(() => DeletePropositionSuccess({questionPosition, propositionId})),
                    catchError(err => of(DeletePropositionError({error: err.error.message})))
                )
        )
    ));

    // Api Call errors management or expired Token
    ApiCallError = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizError, CreateQuestionError, UpdateQuestionError, CreatePropositionError,
            UpdatePropositionError, DeletePropositionError),
        map(errorMessage => this.errorManager.manageError(errorMessage))
        ),
        { dispatch: false}
    );
}
