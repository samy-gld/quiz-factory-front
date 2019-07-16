import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType} from '@ngrx/effects';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    catchError, concatAll, concatMap, distinct,
    distinctUntilChanged, distinctUntilKeyChanged, flatMap,
    map,
    mergeMap,
    switchMap,
} from 'rxjs/operators';
import {Proposition, Question} from '../../model/IQuiz';
import {
    ActionsUnion, CreateProposition, CreatePropositionCancelled, CreatePropositionSuccess,
    CreateQuestion,
    CreateQuestionSuccess, DeleteProposition, DeletePropositionCancelled, DeletePropositionSuccess,
    LoadQuestions,
    LoadQuestionsSuccess, UpdateProposition, UpdatePropositionCancelled, UpdatePropositionSuccess,
    UpdateQuestion, UpdateQuestionSuccess
} from '../actions/question.actions';
import { Store } from '@ngrx/store';
import {QuestionState, selectCurrentQuestion} from '../reducers/question.reducer';
import { of } from 'rxjs';

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
              private store: Store<QuestionState>) {}

    loadQuestions$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuestions),
        switchMap(
            (action) =>
                this.httpClient.get<Question[]>(this.ApiUrl + '/quiz/' + action.id + '/questions')
                    .pipe(
                        map(
                            (questions: Question[]) => LoadQuestionsSuccess({questions})
                        )
                    )
        )
    ));

    createQuestion$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuestion),
        switchMap(({quizId, question}) =>
                this.httpClient.post<Question>(this.ApiUrl + '/quiz/' + quizId + '/question',
                    JSON.stringify(question), this.httpOptions)
        ),
        map((question: Question) => CreateQuestionSuccess({question}))
    ));

    updateQuestion$ = createEffect(() => this.actions$.pipe(
        ofType(UpdateQuestion),
        switchMap(action =>
            this.httpClient.patch<Question>(this.ApiUrl + '/question/' + action.question.id,
                JSON.stringify(action.question), this.httpOptions)
        ),
        map((question: Question) =>
            UpdateQuestionSuccess({question: {id: question.position, changes: question}}))
    ));


    createProposition$ = createEffect(() => this.actions$.pipe(
        ofType(CreateProposition),
        mergeMap(
            ({questionId, questionPosition, proposition}) =>
                this.httpClient.post<Proposition>(this.ApiUrl + '/question/' + questionId + '/proposition',
                    JSON.stringify(proposition), this.httpOptions)
                .pipe(
                    catchError(err => {
                        console.log('Proposition creation error :', err);
                        return of(CreatePropositionCancelled());
                        }
                    )
                )
                .pipe(
                    map(
                    (prop: Proposition) => CreatePropositionSuccess({questionPosition, proposition: prop})
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
                    catchError(err => {
                            console.log('Proposition update error :', err);
                            return of(UpdatePropositionCancelled());
                        }
                    )
                )
                .pipe(
                    map(
                    (prop: Proposition) => UpdatePropositionSuccess({questionPosition, id, proposition: prop, index})
                    )
                )
        )
    ));

    deleteProposition$ = createEffect(() => this.actions$.pipe(
        ofType(DeleteProposition),
        mergeMap(({questionPosition, propositionId}) =>
            this.httpClient.delete(this.ApiUrl + '/proposition/' + propositionId)
                .pipe(
                    catchError(err => {
                            console.log('Proposition delete error :', err);
                            return of(DeletePropositionCancelled());
                        }
                    )
                )
                .pipe(
                    map(() =>
                        DeletePropositionSuccess({questionPosition, propositionId}))
                ))
    ));
}
