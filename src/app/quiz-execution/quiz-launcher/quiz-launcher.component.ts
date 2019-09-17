import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {Observable, of, Subscription, timer} from 'rxjs';
import { Question } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { ExecutionState, selectCurrentExecution, selectQuestionsTab} from '../store/reducers/execution.reducer';
import {delay, first, map, share, shareReplay, skipWhile, take, takeWhile, tap} from 'rxjs/operators';
import { PostAnswer, PostExecution } from '../store/actions/execution.actions';
import { Execution } from '../../model/IExecution';
import { Answer } from '../../model/IAnswer';

@Component({
    selector: 'app-quiz-launcher',
    templateUrl: './quiz-launcher.component.html',
    styleUrls: ['./quiz-launcher.component.css']
})
export class QuizLauncherComponent implements OnInit {

    @Output() closeLauncher: EventEmitter<boolean> = new EventEmitter<boolean>();
    token: string;
    executionId: number;
    currentQuestion$: Observable<Question>;
    questionTab: Question[];
    keysIterator: IterableIterator<number>;
    currentKey: IteratorResult<number>;
    responseStyle = [];
    selected = [];
    displayNextButton: any;
    buttonName = 'Question suivante >>>';
    buttonClass = 'btn-outline-info';
    answered = false;
    nbProposition: number;
    loading = true;
    widthProgressBar: number;
    typeProgressBar: any[];
    timerSubscription: Subscription;

    constructor(private executionStore: Store<ExecutionState>) { }

    ngOnInit() {
        const execution: Execution = {
            invitation: this.token,
            started: true,
            finished: false,
            currentPosition: 0
        };

        this.executionStore.pipe(
            select(selectQuestionsTab),
            take(1)
        ).subscribe(
        qTab => {
                this.questionTab = qTab;
                this.keysIterator = this.questionTab.keys();
                this.currentKey = this.keysIterator.next();
            }
        );

        this.executionStore.dispatch(PostExecution({execution}));
        this.executionStore.pipe(
            select(selectCurrentExecution),
            skipWhile(exec => exec === null),
            take(1)
        ).subscribe(
            exec => {
                this.executionId = exec.id;
                this.loading = false;
                this.onNextQuestion();
            }
        );
    }

    onNextQuestion() {
        if (!this.currentKey.done) {
            const question = this.questionTab[this.currentKey.value];
            this.nbProposition = question.propositions.length;
            this.selected = [];
            for (let i = 0; i < this.nbProposition; i++) {
                this.responseStyle[i] = {};
                this.selected[i] = false;
            }
            this.currentQuestion$ = of(question);
        } else {
            this.currentQuestion$ = of(null);
        }

        this.currentKey = this.keysIterator.next();
        if (this.currentKey.done) {
            this.buttonName = 'Résultats';
            this.buttonClass = 'btn-danger';
        }

        this.answered = false;
        this.displayNextButton = {display: 'none'};

        this.timerSubscription = timer(0, 100).pipe(
            takeWhile(
                t => t <= 100
            )
        ).subscribe(
            t => {
                const valueDanger = t < 80 ? 20 : (100 - t) * 100 / 100;
                const valueSuccess = t < 80 ? (100 - t) * 100 / 100 - 20 : 0;
                this.typeProgressBar = [
                    {value: valueDanger, type: 'danger'},
                    {value: valueSuccess, type: 'success'}
                ];
                if (t === 100) {
                    this.onResponse();
                }
                this.widthProgressBar = (100 - t) * 100 / 100;
            }
        );
    }

    onResponse(index = -1) {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        this.answered = true;
        this.displayNextButton = {display: 'block'};

        if (index !== -1) {
            // question type = 'duo' or 'carre' || end timer before response
            this.selected[index] = true;
        }

        this.currentQuestion$.pipe(first()).subscribe(
            question => {
                if (question) {
                    const answerPropTab: number[] = this.selected
                        .map((value, i) => !!value ? question.propositions[i].id : -1)
                        .filter((value) => value !== -1);
                    const answer: Answer = {
                        questionPosition: question.position,
                        propositions: answerPropTab
                    };
                    this.executionStore.dispatch(PostAnswer({
                        executionId: this.executionId,
                        answer
                    }));
                    const borderRadius = question.type === 'qcm' ? '5px' : '25px';
                    for (let i = 0; i < question.propositions.length; i++) {
                        if (question.propositions[i].wrightAnswer) {
                            if (this.selected[i]) {
                                this.responseStyle[i] = {
                                    'background-color': '#00ff00',
                                    'border-radius': borderRadius
                                };
                            } else {
                                this.responseStyle[i] = {
                                    animation: 'blinking 0.8s infinite',
                                    'border-radius': borderRadius
                                };
                            }
                        } else {
                            if (this.selected[i]) {
                                this.responseStyle[i] = {
                                    'background-color': 'red',
                                    'border-radius': borderRadius
                                };
                            } else {
                                this.responseStyle[i] = {
                                    opacity: '0.5',
                                    'border-radius': borderRadius
                                };
                            }
                        }
                    }
                }
            }
        );
    }

    onSelect(i: number) {
        this.selected[i] = !this.selected[i];
        this.responseStyle[i] = {
            'background-color': this.selected[i] ? '#ee7382' : '#bee5eb'
        };
    }
}
