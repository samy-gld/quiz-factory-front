import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Question, Proposition, QuestionType } from '../model/IQuiz';
import { DynamicService } from '../services/dynamic.service';
import * as questionAction from '../store/actions/question.actions';
import { select, Store } from '@ngrx/store';
import { filter, map, skipWhile, take } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import * as fromQuiz from '../store/reducers/quiz.reducer';
import * as fromQuestion from '../store/reducers/question.reducer';
import { LoadQuiz } from '../store/actions/quiz.actions';
import {
    CreateProposition,
    CreateQuestion,
    DeleteProposition,
    LoadQuestions, UnsetAll,
    UpdateProposition,
    UpdateQuestion
} from '../store/actions/question.actions';

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
    typeLength = {
        duo: 2,
        carre: 4,
        qcm: 6
    };
    newQuestion = {label: '', type: 'duo' as QuestionType, position: 0, propositions: []} as Question;
    newProposition = {label: '', wrightAnswer: false} as Proposition;
    loadingQuestion = this.questionStore.select(fromQuestion.selectLoading);
    questionForm$: Observable<FormGroup>;
    validation: string;
    navigationSubscription;
    selectQuizSubscription: Subscription;
    loadingQuestionsSubscription: Subscription;

    constructor(private questionService: QuestionService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private dynamicService: DynamicService,
                private quizStore: Store<fromQuiz.QuizState>,
                private questionStore: Store<fromQuestion.QuestionState>) {

        this.navigationSubscription = router.events.subscribe(
            (e: any) => {
                if (e instanceof NavigationEnd) {
                    this.onValidation();
                }
            }
        );
    }

    ngOnInit() {
        this.currentQuizId = this.activatedRoute.snapshot.params.id as number;
        this.dynamicService.emitAction('Construisez votre quiz, question par question...');
        this.initFirstQuestion();
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        this.selectQuizSubscription.unsubscribe();
        this.loadingQuestionsSubscription.unsubscribe();
        this.questionStore.dispatch(UnsetAll());
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
        this.quizStore.dispatch(LoadQuiz({id: this.currentQuizId}));
        this.questionStore.dispatch(LoadQuestions({id: this.activatedRoute.snapshot.params.id as number}));

        this.loadingQuestionsSubscription = this.loadingQuestion.pipe(
            skipWhile(loading => loading === true)
        ).subscribe(
            () => {
                this.selectQuizSubscription = this.quizStore.pipe(
                    select(fromQuiz.selectCurrentQuiz),
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
            (question) => this.currentQuestion = question
        );

        const propFormArray = new FormArray([]);
        let type: string;
        let label: string;
        let propTab: Proposition[];
        if (this.currentQuestion === null
            || this.currentQuestion.position !== this.questionPosition) {
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
                const wrightAnswer = propTab[i] !== undefined ? propTab[i].wrightAnswer : false;
                const propLabel = propTab[i] !== undefined ? propTab[i].label : '';
                propFormArray.push(
                    new FormGroup(
                        {
                            wrightAnswer: new FormControl(wrightAnswer),
                            labelProp: new FormControl(propLabel)
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
                        let wrightAnswer = false;
                        let label = '';
                        if (this.currentQuestion !== null && this.currentQuestion.propositions !== undefined) {
                            const proposition = this.currentQuestion.propositions[i + currentPropFormLength];
                            if (proposition !== undefined) {
                                wrightAnswer = proposition.wrightAnswer;
                                label = proposition.label;
                            }
                        }
                        propArray.push(new FormGroup(
                            {
                                wrightAnswer: new FormControl(wrightAnswer),
                                labelProp: new FormControl(label)
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
                        propArray.controls[i].get('labelProp').setValue('');
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

    onSubmitQuestion() {
        this.questionForm$.subscribe(
            (questionFormGroup: FormGroup) => {
                const question = this.newQuestion;
                question.label = questionFormGroup.get('questionLabel').value.trim();
                question.type = questionFormGroup.get('questionType').value;
                question.position = this.questionPosition;

                if (question.label !== '') {
                    // Check if some modification has been done on the current question
                    const propArray = (questionFormGroup.get('propositions') as FormArray).controls;
                    if (this.currentQuestion === null || isNaN(this.currentQuestion.id)) {
                        this.questionStore.dispatch(CreateQuestion({question, quizId: this.currentQuizId}));
                        this.questionStore.select(fromQuestion.selectQuestionByPosition(question.position))
                            .pipe(
                                skipWhile(q => q === null),
                                take(1),
                            )
                        .subscribe(
                            (q) => this.onSubmitPropositions(propArray, question.position, q.id)
                        );
                    } else {
                        if (this.currentQuestion.label !== question.label || this.currentQuestion.type !== question.type) {
                            question.id = this.currentQuestion.id;
                            this.questionStore.dispatch(UpdateQuestion({question}));
                        }
                        this.onSubmitPropositions(propArray, question.position, this.currentQuestion.id);
                    }
                }
            }
        );
    }

    onSubmitPropositions(propFormArray = [], questionPosition, questionId) {
        const propFormLength = propFormArray.length;

        let position = 1;
        for (let index = 0; index < propFormLength; index++) {
            let proposition = this.newProposition;
            proposition.label = propFormArray[index].get('labelProp').value;
            proposition.wrightAnswer = propFormArray[index].get('wrightAnswer').value;
            proposition.position = position;
            position++;
            if (this.currentQuestion !== null && this.currentQuestion.propositions[index] !== undefined) {
                if (this.currentQuestion.propositions[index].wrightAnswer !== proposition.wrightAnswer
                    || this.currentQuestion.propositions[index].label !== proposition.label) {
                    const id = this.currentQuestion.propositions[index].id;
                    this.questionStore.dispatch(UpdateProposition(
                        {questionPosition, id, proposition, index}));
                }
            } else {
                this.questionStore.dispatch(CreateProposition(
                    {questionId, questionPosition, proposition}));
            }
            proposition = undefined;
        }

        /* Delete unused propositions (for example: if switched from 'carre' to 'duo' */
        if (this.currentQuestion !== null) {
            const currentPropositionsLength = this.currentQuestion.propositions.length;
            const diffNbProposition = currentPropositionsLength - propFormLength;
            if (diffNbProposition > 0) {
                for (let i = propFormLength; i < currentPropositionsLength; i++) {
                    this.questionStore.dispatch(DeleteProposition(
                        {questionPosition, propositionId: this.currentQuestion.propositions[i].id}));
                }
            }
        }
    }

    switchQuestion(e: Event) {
        this.onSubmitQuestion();

        // @ts-ignore
        const id = e.currentTarget.id;
        if (id === 'prev') {
            this.quizStore.dispatch(questionAction.DecrementPosition());
        } else if (id === 'next') {
            this.quizStore.dispatch(questionAction.IncrementPosition());
        }

        this.initFormQuestion();
    }
}
