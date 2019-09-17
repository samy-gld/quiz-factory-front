import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ErrorManagerService } from '../../../services/error-manager.service';
import {catchError, concatMap, map, mergeMap, switchMap} from 'rxjs/operators';
import { Quiz } from '../../../model/IQuiz';
import {
    ActionsUnion,
    LoadExecution,
    LoadExecutionError,
    LoadExecutionSuccess,
    LoadInvitation, LoadInvitationError,
    LoadInvitationSuccess, PostAnswer, PostAnswerError, PostAnswerSuccess, PostExecution, PostExecutionError, PostExecutionSuccess
} from '../actions/execution.actions';
import { of } from 'rxjs';
import {Answer} from '../../../model/IAnswer';
import {Execution} from '../../../model/IExecution';

@Injectable()
export class ExecutionEffects {
    ApiUrl = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private actions$: Actions<ActionsUnion>,
                private httpClient: HttpClient,
                private errorManager: ErrorManagerService) {
    }

    loadQuizToExecute = createEffect(() => this.actions$.pipe(
        ofType(LoadExecution),
        switchMap(
            action => this.httpClient.get<Quiz>(this.ApiUrl + '/execution/' + action.token).pipe(
                map(execution => LoadExecutionSuccess({execution})),
                catchError(err => of(LoadExecutionError({err: err.error.message})))
            )
        )
    ));

    postExecution = createEffect(() => this.actions$.pipe(
        ofType(PostExecution),
        switchMap(
            action => this.httpClient.post<Execution>(this.ApiUrl + '/execution', action.execution, this.httpOptions).pipe(
                map(execution => PostExecutionSuccess({execution})),
                catchError(err => of(PostExecutionError({err: err.error.message})))
            )
        )
    ));

    loadInvitation = createEffect(() => this.actions$.pipe(
        ofType(LoadInvitation),
        switchMap(
            action => this.httpClient.get<Quiz>(this.ApiUrl + '/invitation/' + action.token).pipe(
                map(invitation => LoadInvitationSuccess({invitation})),
                catchError(err => of(LoadInvitationError({err: err.error.message})))
            )
        )
    ));

    postAnswer = createEffect(() => this.actions$.pipe(
        ofType(PostAnswer),
        mergeMap(
            action => this.httpClient.post<Answer>(this.ApiUrl + '/execution/' + action.executionId + '/answer',
                action.answer, this.httpOptions).pipe(
                    map(answer => PostAnswerSuccess({answer})),
                    catchError(err => of(PostAnswerError({err: err.error.message})))
                )
        )
    ));
}
