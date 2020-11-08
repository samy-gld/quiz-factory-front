import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import {ExecutionState, selectCurrentInvitation, selectCurrentQuiz, selectError, selectLoading} from '../store/reducers/execution.reducer';
import {ClearExecutionState, LoadInvitation, ResetError} from '../store/actions/execution.actions';
import {map, skipWhile, take, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import { Quiz } from '../../model/IQuiz';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { QuizLauncherComponent } from '../quiz-launcher/quiz-launcher.component';

@Component({
    selector: 'app-quiz-execution',
    templateUrl: './quiz-execution.component.html',
    styleUrls: ['./quiz-execution.component.css']
})
export class QuizExecutionComponent implements OnInit {

    token: string;
    noToken: boolean;
    notFound$: Observable<boolean>;
    loading$: Observable<boolean> = this.executionStore.select(selectLoading);
    currentQuiz$: Observable<Quiz>;
    existExecution$: Observable<boolean>;
    bsModalRef: BsModalRef;
    @ViewChild('manualInput', {static: false}) manualInput: ElementRef;
    @ViewChild('validationLaunchQuizTemplate', {read: TemplateRef, static: true}) validationLaunchQuizTpl: TemplateRef<any>;
    quizAdministrator$: Observable<string>;
    quizPassed$: Observable<boolean> = of(false);

    constructor(private activatedRoute: ActivatedRoute,
                private executionStore: Store<ExecutionState>,
                private modalService: BsModalService) { }

    ngOnInit() {

        this.token = this.activatedRoute.snapshot.params.token;
        if (this.token !== undefined) {
            this.noToken = false;
            this.executionStore.dispatch(LoadInvitation({token: this.token}));
        } else {
            this.noToken = true;
        }

        this.checkToken();
    }

    checkToken() {
        this.notFound$ = this.executionStore.select(selectError).pipe(
            skipWhile(err => err === ''),
            take(1),
            map(err => !!err),
            tap(_ => this.executionStore.dispatch(ResetError()))
        );

        this.existExecution$ = this.executionStore.select(selectCurrentInvitation).pipe(
            skipWhile(invitation => invitation === null),
            take(1),
            map(invitation => invitation.execution !== undefined && invitation.execution !== null)
        );

        this.currentQuiz$ = this.executionStore.pipe(
            select(selectCurrentQuiz),
            skipWhile(quiz => quiz === null),
            take(1)
        );

        this.quizAdministrator$ = this.executionStore.pipe(
            select(selectCurrentInvitation),
            skipWhile(invitation => invitation === null),
            take(1),
            map(
                invitation => ((invitation.quiz) as Quiz).user.username
            )
        );
    }

    onLaunchQuiz() {
        this.bsModalRef = this.modalService.show(this.validationLaunchQuizTpl, {animated: true});
    }

    onConfirmLaunchQuiz() {
        this.bsModalRef.hide();
        const initialConfig = {
            animated: true,
            ignoreBackdropClick: true,
            keyboard: false,
            class: 'custom-modal'
        };
        const initialState = {
            token: this.token
        };
        this.bsModalRef = this.modalService.show(QuizLauncherComponent,  Object.assign({}, initialConfig, { initialState }));
        this.bsModalRef.content.name = 'QuizLauncher';
        this.bsModalRef.content.closeLauncher.subscribe(
            () => {
                console.log('Quiz finished !!!');
                this.quizPassed$ = of(true);
                this.executionStore.dispatch(ClearExecutionState());
                this.bsModalRef.hide();
            }
        );
    }

    onSearchInvitation() {
        this.token = this.manualInput.nativeElement.value.trim();
        if (this.token !== '') {
            this.noToken = false;
            this.executionStore.dispatch(LoadInvitation({token: this.token}));
            this.checkToken();
        }
    }
}
