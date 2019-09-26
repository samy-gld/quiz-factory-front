import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proposition, Question } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import {
    QuestionState, selectIdsFromState, selectQuestionByPosition, selectQuestionForm, selectQuestionsFromState
} from '../store/reducers/question.reducer';
import {
    CreateProposition,
    CreateQuestion,
    DeleteProposition,
    UpdateProposition,
    UpdateQuestion } from '../store/actions/question.actions';
import {map, skipWhile, take, withLatestFrom} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private httpClient: HttpClient,
              private questionStore: Store<QuestionState>) {}

    validate(): Observable<any[]> {
        const violations = [];
        let positionsTab: number[]|string[];
        let positionIterator: IterableIterator<number|string>;
        let nextPosition: IteratorResult<number|string>;

        return this.questionStore.pipe(
            select(selectIdsFromState),
            take(1),
            map(
            ids => {
                positionsTab = ids;
                positionIterator = positionsTab[Symbol.iterator]();
                nextPosition = positionIterator.next();

                while (!nextPosition.done) {
                    this.questionStore.pipe(
                        select(selectQuestionByPosition(nextPosition.value)),
                        take(1)
                    ).subscribe(
                        question => {
                            if (question.label === null || question.label.trim() === '') {
                                violations.push({
                                    position: question.position,
                                    error: 'vous devez saisir un libellé pour cette question'
                                });
                            }

                            const existWrightAnswer = question.propositions.findIndex(p => !!p.wrightAnswer);
                            if (existWrightAnswer === -1) {
                                violations.push({
                                    position: question.position,
                                    error: 'aucune réponse correcte n\'a été indiquée'
                                });
                            }

                            const allPropFilled = question.propositions.findIndex(p => p.label === null || p.label.trim() === '' );
                            if (allPropFilled !== -1) {
                                violations.push({
                                    position: question.position,
                                    error: 'toutes les propositions doivent être saisies'
                                });
                            }
                        }
                    );
                    nextPosition = positionIterator.next();
                }

                return violations;
            }
        ));
    }

    onSaveQuestions(quizId: number) {
        this.questionStore.pipe(
            select(selectQuestionForm),
            take(1)
        ).pipe(
            withLatestFrom(
                this.questionStore.select(selectQuestionsFromState)
            ),
            take(1)
        )
            .subscribe(
            ([questionForm, questionsState]) => {
                const questionUpdateTab = [];
                Object.assign(questionUpdateTab, questionForm as Array<Question>);
                for (let question of questionUpdateTab) {
                    const propositions = question.propositions;
                    if (questionsState[question.position] === undefined) {
                        question = {position: question.position, label: question.label, type: question.type};
                        this.questionStore.dispatch(CreateQuestion({question, quizId}));
                        this.questionStore.select(selectQuestionByPosition(question.position))
                            .pipe(
                                skipWhile(q => q === null),
                                take(1),
                            )
                            .subscribe(
                                (q) => {
                                    this.onSavePropositions(propositions, question.position, q.id);
                                }
                            );

                     } else {
                        const qState = questionsState[question.position];
                        question = {id: question.id, position: question.position, label: question.label, type: question.type};
                        if (qState.label !== question.label || qState.type !== question.type) {
                            this.questionStore.dispatch(UpdateQuestion({question}));
                        }
                        this.onSavePropositions(propositions, question.position, question.id, qState.propositions);
                    }
                }
            }
        );
    }

    onSavePropositions(propositions: Proposition[], questionPosition: number, questionId: number, propositionState: Proposition[] = null) {
        for (let index = 0; index < propositions.length; index++) {
            let proposition = propositions[index];
            let matchingIndex = -1;
            if (propositionState !== null) {
                matchingIndex = propositionState.findIndex(p => p.id === proposition.id && p.position === proposition.position);
            }
            proposition = {label: proposition.label, wrightAnswer: proposition.wrightAnswer, position: proposition.position}; // delete id
            if (matchingIndex >= 0) {
                if (propositionState[matchingIndex].wrightAnswer !== proposition.wrightAnswer
                    || propositionState[matchingIndex].label !== proposition.label) {
                    const id = propositionState[matchingIndex].id;
                    this.questionStore.dispatch(UpdateProposition({questionPosition, id, proposition, index: matchingIndex}));
                }
            } else {
                this.questionStore.dispatch(CreateProposition({questionId, questionPosition, proposition, index}));
                }
        }

        /* Delete unused propositions (for example: if switched from 'carre' to 'duo' */
        if (propositionState !== null) {
            const diffNbProposition = propositionState.length - propositions.length;
            if (diffNbProposition > 0) {
                for (let i = propositions.length; i < propositionState.length; i++) {
                    this.questionStore.dispatch(DeleteProposition({questionPosition, propositionId: propositionState[i].id}));
                }
            }
        }
    }

    disable(questionForm$: Observable<FormGroup>, propositions: Observable<any[]>): void {
        questionForm$.pipe(
            take(1),
            map(
                qf => {
                    qf.controls.questionLabel.disable();
                    qf.controls.questionType.disable();
                    propositions.pipe(
                        take(1),
                        map(
                            prop => {
                                prop.map(
                                    p => p.disable()
                                );
                            }
                        )
                    ).subscribe();
                }
            )
        ).subscribe();
    }
}
