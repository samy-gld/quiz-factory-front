import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Quiz } from '../../../model/IQuiz';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { Store, select } from '@ngrx/store';
import {
    ActionsUnion, CreateQuiz, CreateQuizError, CreateQuizSuccess, DeleteQuiz, DeleteQuizError,
    DeleteQuizSuccess, FinalizeQuiz, FinalizeQuizError, FinalizeQuizSuccess, InviteParticipant,
    InviteParticipantError, InviteParticipantSuccess, LoadInvitations, LoadInvitationsError, LoadInvitationsSuccess,
    LoadQuizzes, LoadQuizzesError, LoadQuizzesSuccess, UpdateQuiz, UpdateQuizError, UpdateQuizSuccess
} from '../actions/quiz.actions';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ErrorManagerService } from '../../../services/error-manager.service';
import { QuizState, selectQuizzes } from '../reducers/quiz.reducer';
import { Invitation } from '../../../model/IInvitation';

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
                private store: Store<QuizState>,
                private router: Router,
                private errorManager: ErrorManagerService) {}

    loadQuizzes$ = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizzes),
        withLatestFrom(
            // Check for data in the store
            this.store.pipe(select(selectQuizzes)),
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

    createQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuiz),
        mergeMap(action =>
            this.httpClient.post<Quiz>(this.ApiUrl + '/quiz', JSON.stringify(action.quiz), this.httpOptions)
            .pipe(
                map((quiz: Quiz) => CreateQuizSuccess({quiz})),
                catchError(err => of(CreateQuizError({error: err.error.message})))
            )
        )
    ));

    // Redirect to edit question page
    createSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(CreateQuizSuccess, UpdateQuizSuccess),
        map(action => this.router.navigate(['/quiz/generate/', action.quiz.id]))
        ),
        { dispatch: false}
    );

    updateQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(UpdateQuiz),
        mergeMap(action =>
            this.httpClient.patch<Quiz>(this.ApiUrl + '/quiz/' + action.quiz.id, JSON.stringify(action.quiz), this.httpOptions)
                .pipe(
                    map((quiz: Quiz) => UpdateQuizSuccess({quiz})),
                    catchError(err => of(UpdateQuizError({error: err.error.message})))
                )
        )
    ));

    deleteQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(DeleteQuiz),
        map(action => action.id),
        mergeMap(
            (id: number) => this.httpClient.delete(this.ApiUrl + '/quiz/' + id)
            .pipe(
                map(() => DeleteQuizSuccess({id})),
                catchError(err => of(DeleteQuizError({error: err.error.message})))
            )
        )
    ));

    finalizeQuiz$ = createEffect(() => this.actions$.pipe(
        ofType(FinalizeQuiz),
        mergeMap(action =>
            this.httpClient.patch<Quiz>(this.ApiUrl + '/quiz/' + action.id, {status: 'finalized'}, this.httpOptions)
                .pipe(
                    map((quiz: Quiz) => FinalizeQuizSuccess({quiz})),
                    catchError(err => of(FinalizeQuizError({error: err.error.message})))
                )
        )
    ));

    loadInvitations = createEffect(() => this.actions$.pipe(
        ofType(LoadInvitations),
        switchMap(action => {
                const params = new HttpParams().set('origin', 'maker');
                return this.httpClient.get<Invitation[]>(this.ApiUrl + '/quiz/' + action.id + '/invitations', {params}).pipe(
                    map(invitations => LoadInvitationsSuccess({invitations})),
                    catchError(err => of(LoadInvitationsError({error: err.error.message})))
                );
            }
        )
    ));

    inviteParticipant$ = createEffect(() => this.actions$.pipe(
        ofType(InviteParticipant),
        mergeMap(action =>
            this.httpClient.post<Invitation>(this.ApiUrl + '/invitation', JSON.stringify(action.invitation), this.httpOptions)
                .pipe(
                    map((invitation: Invitation) => InviteParticipantSuccess({invitation})),
                    catchError(err => of(InviteParticipantError({error: err.error.message})))
                )
        )
    ));

    // Api Call errors management or expired Token
    ApiCallError = createEffect(() => this.actions$.pipe(
        ofType(LoadQuizzesError, CreateQuizError, UpdateQuizError, DeleteQuizError, FinalizeQuizError),
        map(errorMessage => this.errorManager.manageError(errorMessage))
        ),
        { dispatch: false}
    );
}
