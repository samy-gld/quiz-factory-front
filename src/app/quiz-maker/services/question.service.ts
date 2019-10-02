import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proposition, Question } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import {
    QuestionState, selectIdsFromState, selectQuestionByPosition, selectQuestionForm, selectQuestionsFromState
} from '../store/reducers/question.reducer';
import {
    CreateQuestion,
    UpdateQuestion } from '../store/actions/question.actions';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

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

    disableForm(questionForm$: Observable<FormGroup>, propositions: Observable<any[]>): void {
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
                    const questionUpdateTab: Question[] = [];
                    Object.assign(questionUpdateTab, questionForm as Array<Question>);
                    for (const question of questionUpdateTab) {
                        if (questionsState[question.position] === undefined) {
                            this.questionStore.dispatch(CreateQuestion({question, quizId}));
                        } else {
                            const qState = questionsState[question.position];
                            if (qState.label.trim() !== question.label.trim() || qState.type !== question.type ||
                                !this.equalPropositionsTabs(qState.propositions, question.propositions)) {
                                    this.questionStore.dispatch(UpdateQuestion({question}));
                                }
                            }
                        }
                }
            );
    }

    private equalPropositions(p1: Proposition, p2: Proposition) {
        return (p1.label.trim() === p2.label.trim() && p1.wrightAnswer === p2.wrightAnswer && p1.id === p2.id);
    }

    private equalPropositionsTabs(propsTab1: Proposition[], propsTab2: Proposition[]): boolean {
        return propsTab1.length === propsTab2.length &&
            propsTab1.every(p1 => {
                const index = propsTab2.findIndex(p2 => p2.position === p1.position);
                if (index >= 0) {
                    return this.equalPropositions(p1, propsTab2[index]);
                } else {
                    return false;
                }
            });
    }
}
