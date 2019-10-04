import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Question, Proposition, Quiz } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { debounceTime, filter, map, shareReplay, skipWhile, take, takeWhile, withLatestFrom } from 'rxjs/operators';
import { combineLatest, Observable, of, Subscription, timer } from 'rxjs';
import {
    DecrementPosition, DeleteQuestion, GoToPosition, IncrementPosition, LoadQuiz, ResetErrorSaving, UnsetAll
} from '../store/actions/question.actions';
import { UpdateQuestionForm } from '../store/actions/question.actions';
import { ToastrService } from 'ngx-toastr';
import {
    QuestionState, selectCountQuestions, selectCurrentQuestion, selectCurrentQuestionPosition, selectCurrentQuiz,
    selectErrorSaving, selectLoading, selectModifiedQuestionsPos, selectSavePendingQuestions
} from '../store/reducers/question.reducer';
import { FinalizeQuiz, LoadInvitations } from '../store/actions/quiz.actions';
import { QuizState } from '../store/reducers/quiz.reducer';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PreviewComponent } from '../preview/preview.component';
import { InviteParticipantsComponent } from '../invite-partcipants/invite-participants.component';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.css']
})
export class QuestionFormComponent implements OnInit, OnDestroy {

    currentQuiz$: Observable<Quiz>;
    currentQuizId: number;
    quizFinalized: boolean;
    currentQuestion$: Observable<Question>;
    questionPosition$: Observable<number>;
    typeLength = {duo: 2, carre: 4, qcm: 6};
    loadingQuestion$: Observable<boolean>;
    questionForm$: Observable<FormGroup>;
    regularSaveLauncher: Subscription;
    deleteQuestionSubscription: Subscription;
    questionStatus$: Observable<string>;
    alive = true;
    bsModalRef: BsModalRef;
    violations: any[];
    @ViewChild('errorTemplate', {read: TemplateRef, static: true}) errorTpl: TemplateRef<any>;
    @ViewChild('validationTemplate', {read: TemplateRef, static: true}) validationTpl: TemplateRef<any>;
    @ViewChild('violationTemplate', {read: TemplateRef, static: true}) violationTpl: TemplateRef<any>;
    @ViewChild('deleteQuestionTemplate', {read: TemplateRef, static: true}) deleteQuestionTpl: TemplateRef<any>;

    constructor(private questionService: QuestionService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private questionStore: Store<QuestionState>,
                private quizStore: Store<QuizState>,
                private toastr: ToastrService,
                private modalService: BsModalService) {}

    ngOnInit(): void {
        this.loadingQuestion$ = this.questionStore.select(selectLoading);
        this.questionPosition$ = of(1);
        this.currentQuizId = this.activatedRoute.snapshot.params.id as number;
        this.initFirstQuestion();
        this.regularSaveLauncher = timer(15000, 15000).subscribe(
            () => {
                this.questionService.onSaveQuestions(this.currentQuizId);
                this.questionStore.pipe(
                    select(selectErrorSaving),
                    filter(error => !!error),
                    take(1),
                ).subscribe(
                    () => {
                        this.toastr.warning('Attention, erreur lors de la sauvegarde');
                        this.questionStore.dispatch(ResetErrorSaving());
                    }
                );
            }
        );
    }

    ngOnDestroy(): void {
        if (this.regularSaveLauncher) {
            this.regularSaveLauncher.unsubscribe();
        }
        if (this.deleteQuestionSubscription) {
            this.deleteQuestionSubscription.unsubscribe();
        }
        this.questionStore.dispatch(UnsetAll());
        this.alive = false;
    }

    initFirstQuestion(): void {
        this.questionStore.dispatch(LoadQuiz({id: this.currentQuizId}));
        this.currentQuiz$ = this.questionStore.pipe(
            select(selectCurrentQuiz),
            skipWhile(quiz => quiz === null),
            map(quiz => {
                this.quizFinalized = quiz && quiz.status === 'finalized';
                if (this.quizFinalized) {
                    this.quizStore.dispatch(LoadInvitations({id: quiz.id}));
                }
                this.initFormQuestion();
                return quiz;
            })
        );
    }

    initFormQuestion(): void {
        this.questionPosition$ = this.questionStore.pipe(
            select(selectCurrentQuestionPosition),
            take(1)
        );

        this.currentQuestion$ = this.questionStore.pipe(
            select(selectCurrentQuestion),
            take(1)
        );

        this.questionStatus$ =
            combineLatest([
                this.currentQuestion$,
                this.questionPosition$,
                this.questionStore.select(selectSavePendingQuestions),
                this.questionStore.select(selectModifiedQuestionsPos)
            ]).pipe(
                map(([currentQuestion, questionPosition, savePendingQuestions, modifiedQuestionPos]) => {
                    const indexSaving = savePendingQuestions.findIndex(p => p.position === questionPosition);
                    const indexModified = modifiedQuestionPos.findIndex(p => p === questionPosition);
                    switch (true) {
                        case this.quizFinalized:
                            return 'finalized';
                        case indexModified >= 0:
                            return 'modified';
                        case indexSaving >= 0:
                            return savePendingQuestions[indexSaving].action; // 'saving' or 'deleting'
                        case currentQuestion !== null:
                            this.currentQuestion$ = of(currentQuestion);
                            return 'saved';
                        default:
                            return 'unsaved';
                    }
                })
            );

        this.questionForm$ = this.currentQuestion$.pipe(
            withLatestFrom(
                this.questionPosition$
            ),
            map(
                ([currentQuestion, questionPosition]) => {
                    const propFormArray = new FormArray([]);
                    let type: string;
                    let label: string;
                    let propTab: Proposition[];
                    if (currentQuestion === null || currentQuestion.position !== questionPosition) {
                        type    = 'duo';
                        label   = '';
                        propTab = [];
                    } else {
                        type    = currentQuestion.type;
                        label   = currentQuestion.label;
                        propTab = currentQuestion.propositions;
                    }

                    const propTabLength = propTab.length >= this.typeLength[type] ? propTab.length : this.typeLength[type];

                    if (propTabLength !== 0) {
                        // propTab.sort((a, b) => a.position - b.position);
                        for (let i = 0; i < propTabLength; i++) {
                            let id: number;
                            let position: number;
                            let wrightAnswer: boolean;
                            let propLabel: string;
                            if (propTab[i] !== undefined) {
                                id              = propTab[i].id;
                                position        = propTab[i].position;
                                wrightAnswer    = propTab[i].wrightAnswer;
                                propLabel       = propTab[i].label;
                            } else {
                                id              = null;
                                position        = i + 1;
                                wrightAnswer    = false;
                                propLabel       = '';
                            }

                            propFormArray.push(
                                new FormGroup(
                                    {
                                        id:             new FormControl(id),
                                        position:       new FormControl(position),
                                        wrightAnswer:   new FormControl({value: wrightAnswer, disabled: this.quizFinalized}),
                                        label:          new FormControl({value: propLabel, disabled: this.quizFinalized})
                                    }
                                )
                            );
                        }
                    }

                    return new FormGroup(
                        {
                            questionLabel:  new FormControl({value: label, disabled: this.quizFinalized}, Validators.required),
                            questionType:   new FormControl({value: type, disabled: this.quizFinalized}, Validators.required),
                            propositions:   propFormArray
                        }
                    );
                }
            ),
            shareReplay({ refCount: true, bufferSize: 1 })
        );

        this.questionForm$.pipe(
            takeWhile(() => this.alive),
            withLatestFrom(
                this.currentQuestion$,
                this.questionPosition$
            ),
            map(
                ([form, currentQuestion, questionPosition]) => form.valueChanges.pipe(
                    debounceTime(500),
                    takeWhile(() => this.alive)
                ).subscribe(
                    change => {
                        this.questionStore.dispatch(UpdateQuestionForm(
                            {
                                question: {
                                    id:             currentQuestion ? currentQuestion.id : null,
                                    position:       questionPosition,
                                    label:          change.questionLabel,
                                    type:           change.questionType,
                                    propositions:   change.propositions
                                }
                            }
                        ));
                    }
                )
            )
        ).subscribe();
    }

    get propositions() {
        return this.questionForm$.pipe(
            filter(formGroup => formGroup !== null),
            take(1),
            map(
                (questionFormGroup: FormGroup) =>
                    Array.of(questionFormGroup.get('propositions') as FormArray)[0].controls
            ));
    }

    onSwitchQuestion(e: Event): void {
        if (this.deleteQuestionSubscription) {
            this.deleteQuestionSubscription.unsubscribe();
        }
        // @ts-ignore
        const id = e.currentTarget.id;
        if (id === 'prev') {
            this.questionStore.dispatch(DecrementPosition());
        } else if (id === 'next') {
            this.questionStore.dispatch(IncrementPosition());
        }

        this.initFormQuestion();
    }

    onGoToQuestion(position: number): void {
        this.bsModalRef.hide();
        this.questionStore.dispatch(GoToPosition({position}));

        this.initFormQuestion();
    }

    onPreview(): void {
        this.questionStore.pipe(
            select(selectCountQuestions),
            take(1)
        ).subscribe(
            count => {
                if (count > 0) {
                    const initialConfig = {
                        animated: true,
                        class: 'custom-modal'
                    };
                    this.bsModalRef = this.modalService.show(PreviewComponent, initialConfig);
                    this.bsModalRef.content.name = 'Preview';
                    this.bsModalRef.content.closePreview.subscribe(
                        () => this.bsModalRef.hide()
                    );
                } else {
                    this.bsModalRef = this.modalService.show(this.errorTpl, {animated: true});
                }
            }
        );
    }

    onValidation(): void {
        this.questionStore.pipe(
            select(selectCountQuestions),
            take(1)
        ).subscribe(
            count => {
                if (count > 0) {
                    this.bsModalRef = this.modalService.show(this.validationTpl, {animated: true});
                } else {
                    this.bsModalRef = this.modalService.show(this.errorTpl, {animated: true});
                }
            }
        );
    }

    onConfirmValidation(): void {
        this.bsModalRef.hide();
        this.questionService.validate().pipe(
            take(1)
        ).subscribe(
            violations => {
                if (violations.length !== 0) {
                    this.violations = violations;
                    this.bsModalRef = this.modalService.show(this.violationTpl, {animated: true});
                } else {
                    if (this.regularSaveLauncher) {
                        this.regularSaveLauncher.unsubscribe();
                    }
                    this.quizStore.dispatch(FinalizeQuiz({id: this.currentQuizId}));
                    this.quizFinalized = true;
                    this.questionStatus$ = of('finalized');
                    this.questionService.disableForm(this.questionForm$, this.propositions);
                }
            }
        );
    }

    onInvite(): void {
        const initialConfig = {
            animated: true,
            class: 'custom-modal'
        };
        this.bsModalRef = this.modalService.show(InviteParticipantsComponent, initialConfig);
        this.bsModalRef.content.name = 'Invite Participants';
        this.bsModalRef.content.closeInvite.pipe(
            take(1)
        ).subscribe(
            () => this.bsModalRef.hide()
        );
    }

    onDeleteQuestion() {
        this.bsModalRef = this.modalService.show(this.deleteQuestionTpl, {animated: true});
    }

    onConfirmDeleteQuestion() {
        this.bsModalRef.hide();
        this.currentQuestion$.pipe(
            withLatestFrom(
                this.questionPosition$
            )
        ).subscribe(
            ([currentQuestion, questionPosition]) => this.questionStore.dispatch(DeleteQuestion({
                id: currentQuestion.id,
                questionPosition
            }))
        );
        this.questionStatus$ = of('deleting');
        this.currentQuestion$ = of(null);
        this.deleteQuestionSubscription =
            this.questionStore.pipe(
                select(selectSavePendingQuestions),
                withLatestFrom(
                    this.questionPosition$
                ),
                skipWhile(([spq, questionPosition]) => spq.findIndex(
                    p => p.position === questionPosition && p.action === 'deleting') !== -1),
                take(1)
            ).subscribe(
                () => this.initFormQuestion()
            );
    }
}
