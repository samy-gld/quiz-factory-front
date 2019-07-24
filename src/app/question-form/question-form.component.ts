import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Question, Proposition } from '../model/IQuiz';
import { DynamicService } from '../services/dynamic.service';
import { select, Store } from '@ngrx/store';
import { debounceTime, filter, map, skipWhile, takeWhile, tap } from 'rxjs/operators';
import { Observable, of, Subscription, timer } from 'rxjs';
import * as fromQuestion from '../store/reducers/question.reducer';
import {
    DecrementPosition, IncrementPosition, LoadQuestions,
    LoadQuiz, ResetErrorSaving, UnsetAll } from '../store/actions/question.actions';
import { UpdateQuestionForm } from '../store/actions/question.actions';
import { ToastrService } from 'ngx-toastr';
import {selectCurrentQuiz} from '../store/reducers/question.reducer';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.css']
})
export class QuestionFormComponent implements OnInit, OnDestroy {

    currentQuizId: number;
    quizFinalized: boolean;
    currentQuestion: Question;
    questionPosition = 1;
    typeLength = {duo: 2, carre: 4, qcm: 6};
    loadingQuestion = this.questionStore.select(fromQuestion.selectLoading);
    questionForm$: Observable<FormGroup>;
    validation: string;
    navigationSubscription: Subscription;
    selectQuizSubscription: Subscription;
    loadingQuestionsSubscription: Subscription;
    regularSaveLauncher: Subscription;
    alive = true;

    constructor(private questionService: QuestionService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private dynamicService: DynamicService,
                private questionStore: Store<fromQuestion.QuestionState>,
                private toastr: ToastrService) {

        this.navigationSubscription = router.events.subscribe(
            (e: any) => {
                if (e instanceof NavigationEnd) {
                    this.onValidation();
                }
            }
        );
    }

    ngOnInit(): void {
        this.currentQuizId = this.activatedRoute.snapshot.params.id as number;
        this.dynamicService.emitAction('Construisez votre quiz, question par question...');
        this.initFirstQuestion();
        this.regularSaveLauncher = timer(30000, 30000).subscribe(
            () => {
                this.questionService.onSaveQuestions(this.currentQuizId);
                this.questionStore.pipe(
                    select(fromQuestion.selectErrorSaving),
                    filter(error => !!error)
                ).subscribe(
                    () => {
                        this.toastr.warning('Attention, erreur lors de la sauvegarde');
                        this.questionStore.dispatch(ResetErrorSaving());
                    }
                ).unsubscribe();
            }
        );
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        if (this.selectQuizSubscription) {
            this.selectQuizSubscription.unsubscribe();
        }
        if (this.loadingQuestionsSubscription) {
            this.loadingQuestionsSubscription.unsubscribe();
        }
        if (this.regularSaveLauncher) {
            this.regularSaveLauncher.unsubscribe();
        }
        this.questionStore.dispatch(UnsetAll());
        this.alive = false;
    }

    onValidation() {
        this.validation = this.activatedRoute.snapshot.queryParamMap.get('validation');
        if (this.validation === 'true') {
            this.router.navigate([], { queryParams: { validation: null }});
            if (confirm('Un quiz validé ne peut plus être modifié, êtes-vous sûr ?')) {
                this.questionService.validate(this.activatedRoute.snapshot.params.id);
            }
        } else {
            this.initFirstQuestion();
        }
    }

    initFirstQuestion() {
        this.questionStore.dispatch(LoadQuiz({id: this.currentQuizId}));
        this.questionStore.dispatch(LoadQuestions({id: this.activatedRoute.snapshot.params.id as number}));

        this.loadingQuestionsSubscription = this.loadingQuestion.pipe(
            skipWhile(loading => loading === true)
        ).subscribe(
            () => {
                this.selectQuizSubscription = this.questionStore.pipe(
                    select(selectCurrentQuiz),
                    skipWhile(quiz => quiz === null)
                ).subscribe(
                    (quiz) => {
                        if (quiz && quiz.status === 'finalized') {
                            this.quizFinalized = true;
                        } else {
                            this.dynamicService.emitValidationDisplay(true);
                        }
                        this.initFormQuestion();
                    }
                );
            }
        );
    }

    initFormQuestion() {
        this.questionStore.select(fromQuestion.selectCurrentQuestionPosition).subscribe(
            (currentPosition) => this.questionPosition = currentPosition
        );
        this.questionStore.select(fromQuestion.selectCurrentQuestion).subscribe(
            (q) => this.currentQuestion = q
        );

        const propFormArray = new FormArray([]);
        let type: string;
        let label: string;
        let propTab: Proposition[];
        if (this.currentQuestion === null || this.currentQuestion.position !== this.questionPosition) {
            type = 'duo';
            label = '';
            propTab = [];
        } else {
            type = this.currentQuestion.type;
            label = this.currentQuestion.label;
            propTab = this.currentQuestion.propositions;
        }
        const propTabLength = propTab.length >= this.typeLength[type] ? propTab.length : this.typeLength[type];

        if (propTabLength !== 0) {
            for (let i = 0; i < propTabLength; i++) {
                let id: number;
                let position: number;
                let wrightAnswer: boolean;
                let propLabel: string;
                if (propTab[i] !== undefined) {
                    id = propTab[i].id;
                    position = propTab[i].position;
                    wrightAnswer = propTab[i].wrightAnswer;
                    propLabel = propTab[i].label;
                } else {
                    id = null;
                    position = i + 1;
                    wrightAnswer = false;
                    propLabel = '';
                }
                propFormArray.push(
                    new FormGroup(
                        {
                            id: new FormControl(id),
                            position: new FormControl(position),
                            wrightAnswer: new FormControl({value: wrightAnswer, disabled: this.quizFinalized}),
                            label: new FormControl({value: propLabel, disabled: this.quizFinalized})
                        }
                    )
                );
            }
        } else {
            this.updateQuestionType('duo', true);
        }

        this.questionForm$ = of(
            new FormGroup(
                {
                    questionLabel: new FormControl({value: label, disabled: this.quizFinalized}, Validators.required),
                    questionType: new FormControl({value: type, disabled: this.quizFinalized}, Validators.required),
                    propositions: propFormArray
                }
            )
        );

        this.questionForm$.pipe(
            tap(
                (form) => form.valueChanges.pipe(
                    debounceTime(500),
                    takeWhile(() => this.alive)
                )
                .subscribe(
                    change => this.questionStore.dispatch(UpdateQuestionForm(
                        {
                            question: {
                                id: this.currentQuestion ? this.currentQuestion.id : null,
                                position: this.questionPosition,
                                label: change.questionLabel,
                                type: change.questionType,
                                propositions: change.propositions
                            }
                        }
                    ))
                )
            )
        ).subscribe().unsubscribe();
    }

    updateQuestionType(event: any, reset = false) {
        const type = event.target.value;
        this.questionForm$.pipe(
            map(
            (questionFormGroup) => {
                const propArray = questionFormGroup.get('propositions') as FormArray;
                const currentPropFormLength = propArray.length;
                const typeLength = this.typeLength[type];
                const diffFields = typeLength - currentPropFormLength;

                if (diffFields > 0) {
                    for (let i = 0; i < diffFields; i++) {
                        let id: number;
                        let position = i + diffFields + 1;
                        let wrightAnswer = false;
                        let label = '';
                        if (this.currentQuestion !== null && this.currentQuestion.propositions !== undefined) {
                            const proposition = this.currentQuestion.propositions[i + currentPropFormLength];
                            if (proposition !== undefined) {
                                id = proposition.id;
                                position = proposition.position;
                                wrightAnswer = proposition.wrightAnswer;
                                label = proposition.label;
                            }
                        }
                        propArray.push(new FormGroup(
                            {
                                id: new FormControl(id),
                                position: new FormControl(position),
                                wrightAnswer: new FormControl(wrightAnswer),
                                label: new FormControl(label)
                            }
                        ));
                    }
                } else if (diffFields < 0) {
                    for (let i = 0; i > diffFields; i--) {
                        propArray.controls.pop();
                    }
                }

                const newPropFormLength = propArray.length;
                for (let i = 0; i < newPropFormLength; i++) {
                    propArray.controls[i].get('wrightAnswer').setValue(false);
                    if (reset) {
                        propArray.controls[i].get('label').setValue('');
                    }
                }
                questionFormGroup.get('questionType').setValue(type);
                return questionFormGroup;
            }
            )
        ).subscribe(
            (qfg: FormGroup) => this.questionForm$ = of(qfg)
        );
    }

    uncheckOthers(event: any) {
        const eventTarget = event.currentTarget as HTMLInputElement;
        const checkId = eventTarget.id;
        const id = Number(checkId.slice(6, checkId.length)); // checkbox id = 'check_' + index

        this.questionForm$.pipe(
            map((questionForm: FormGroup) => {
                const propFormArray = questionForm.get('propositions') as FormArray;
                const propFormLength = propFormArray.length;
                const val = propFormArray.controls[id].get('wrightAnswer').value;
                if (questionForm.get('questionType').value !== 'qcm') {
                    for (let i = 0; i < propFormLength; i++) {
                        if (id === i) {
                            propFormArray.controls[i].get('wrightAnswer').setValue(val);
                        } else {
                            propFormArray.controls[i].get('wrightAnswer').setValue(false);
                        }
                    }
                }
                return questionForm as FormGroup;
            }
        )).subscribe(
            (qfg: FormGroup) => this.questionForm$ = of(qfg)
        );
    }

    get propositions() {
        return this.questionForm$.pipe(
            filter(formGroup => formGroup !== null),
            map(
            (propositionFormGroup: FormGroup) =>
                Array.of(propositionFormGroup.get('propositions') as FormArray)[0].controls
        ));
    }

    switchQuestion(e: Event) {
        // this.onSubmitQuestion();

        // @ts-ignore
        const id = e.currentTarget.id;
        if (id === 'prev') {
            this.questionStore.dispatch(DecrementPosition());
        } else if (id === 'next') {
            this.questionStore.dispatch(IncrementPosition());
        }

        this.initFormQuestion();
    }
}
