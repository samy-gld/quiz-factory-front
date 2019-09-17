import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Question } from '../../model/IQuiz';
import {
    QuestionState,
    selectIdsFromState, selectQuestionByPosition
} from '../store/reducers/question.reducer';
import { select, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnInit {
    @Output() closePreview: EventEmitter<boolean> = new EventEmitter<boolean>();

    currentQuestion$: Observable<Question>;
    positionsTab: number[] | string[];
    positionIterator: IterableIterator<number|string>;
    nextPosition: IteratorResult<number|string>;
    responseStyle = [];
    selected = [];
    displayNextButton: any;
    buttonName = 'Question suivante >>>';
    buttonClass = 'btn-outline-info';
    answered = false;
    nbProposition: number;

    constructor(private questionStore: Store<QuestionState>) {}

    ngOnInit() {
        this.questionStore.pipe(
            select(selectIdsFromState),
            take(1),
            tap(ids => this.positionsTab = ids)
        ).subscribe();

        this.positionIterator = this.positionsTab[Symbol.iterator]();
        this.nextPosition = this.positionIterator.next();
        this.onNextQuestion();
    }

    onNextQuestion() {
        if (this.nextPosition.done) {
            this.closePreview.emit(true);
            return;
        }
        this.answered = false;
        this.displayNextButton = {display: 'none'};

        this.currentQuestion$ = this.questionStore.pipe(
            select(selectQuestionByPosition(this.nextPosition.value)),
            tap(
                question => this.nbProposition = question.propositions.length
            )
        );

        this.nextPosition = this.positionIterator.next();
        if (this.nextPosition.done) {
            this.buttonName = 'Fermer';
            this.buttonClass = 'btn-danger';
        }

        for (let i = 0; i < this.nbProposition; i++) {
            this.responseStyle[i] = {};
            this.selected[i] = false;
        }
    }

    onResponse(index = -1) {
        if (index !== -1) {
            this.selected[index] = true;
        }
        this.answered = true;
        this.displayNextButton = {display: 'block'};
        this.currentQuestion$.subscribe(
            (question: Question) => {
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
        );
    }

    onSelect(i: number) {
        this.selected[i] = !this.selected[i];
        this.responseStyle[i] = {
            'background-color': this.selected[i] ? '#ee7382' : '#bee5eb'
        };
    }
}
