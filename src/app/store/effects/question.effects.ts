import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType} from '@ngrx/effects';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, distinctUntilChanged, exhaustMap, filter, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import { Proposition, Question, Quiz } from '../../model/IQuiz';
import {
    ActionsUnion, CreateProposition, CreatePropositionError, CreatePropositionSuccess, CreateQuestion, CreateQuestionError,
    CreateQuestionSuccess, DeleteProposition, DeletePropositionError, DeletePropositionSuccess, LoadQuestionError,
    LoadQuestions, LoadQuestionsSuccess, UpdateProposition, UpdatePropositionError, UpdatePropositionSuccess,
    UpdateQuestion, UpdateQuestionError, UpdateQuestionSuccess, LoadQuiz, LoadQuizError, LoadQuizSuccess
} from '../actions/question.actions';
import { of } from 'rxjs';
import { ErrorManagerService } from '../../services/error-manager.service';

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
                        catchError(error => of(LoadQuizError(error)))
                    )
        )
    ));

    loadQuestions$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuestions),
        distinctUntilChanged(),
        exhaustMap(
            (action) =>
                this.httpClient.get<Question[]>(this.ApiUrl + '/quiz/' + action.id + '/questions')
                    .pipe(
                        map((questions: Question[]) => LoadQuestionsSuccess({questions})),
                        catchError(
                            err => {
                                console.log('Load questions error :', err);
                                return of(LoadQuestionError(err));
                            }
                        )
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
                        catchError(
                            err => {
                                console.log('Create question error :', err);
                                return of(CreateQuestionError(err));
                            }
                        )
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
                    catchError(err => {
                        console.log('Update question error :', err);
                        return of(UpdateQuestionError(err));
                    })
                )
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
                    catchError(err => {
                        console.log('Proposition creation error :', err);
                        return of(CreatePropositionError(err));
                        }
                    )
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
                    catchError(err => {
                            console.log('Proposition update error :', err);
                            return of(UpdatePropositionError(err));
                        }
                    )
                )
        )
    ));

    deleteProposition$ = createEffect(() => this.actions$.pipe(
        ofType(DeleteProposition),
        mergeMap(({questionPosition, propositionId}) =>
            this.httpClient.delete(this.ApiUrl + '/proposition/' + propositionId)
                .pipe(
                    map(() => DeletePropositionSuccess({questionPosition, propositionId})),
                    catchError(err => {
                            console.log('Proposition delete error :', err);
                            return of(DeletePropositionError(err));
                        }
                    )
                )
        )
    ));

    // Api Call errors management or expired Token
    ApiCallError = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizError, LoadQuestionError, CreateQuestionError, UpdateQuestionError, CreatePropositionError,
            UpdatePropositionError, DeletePropositionError),
        map(error => this.errorManager.manageError(error))
        ),
        { dispatch: false}
    );
}
