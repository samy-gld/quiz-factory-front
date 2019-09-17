import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proposition, Question } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import {
    QuestionState, selectCountQuestions, selectIdsFromState, selectQuestionByPosition, selectQuestionForm, selectQuestionsFromState
} from '../store/reducers/question.reducer';
import {
    CreateProposition,
    CreateQuestion,
    DeleteProposition,
    UpdateProposition,
    UpdateQuestion } from '../store/actions/question.actions';
import { skipWhile, take, tap, withLatestFrom } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

    modifDone = false;

  constructor(private httpClient: HttpClient,
              private questionStore: Store<QuestionState>,
              private toastr: ToastrService) {}

    validate(): any[] {
        const violations = [];
        let positionsTab: number[] | string[];
        let positionIterator: IterableIterator<number|string>;
        let nextPosition: IteratorResult<number|string>;

        this.questionStore.pipe(select(selectCountQuestions))
            .subscribe(
                count => {
                    if (count === 0) {
                        violations.push('Le quiz ne comporte aucune question, vous ne pouvez pas le valider');
                    }
                }
            );

        if (violations.length !== 0) {
            return violations;
        }

        this.questionStore.pipe(
            select(selectIdsFromState),
            take(1),
            tap(ids => positionsTab = ids)
        ).subscribe();

        positionIterator = positionsTab[Symbol.iterator]();
        nextPosition = positionIterator.next();
        while (!nextPosition.done) {
             this.questionStore.pipe(
                select(selectQuestionByPosition(nextPosition.value)),
                take(1)
            ).subscribe(
                 question => {
                     if (question.label === null || question.label.trim() === '') {
                         violations.push({position: question.position, error: 'vous devez saisir un libellé pour cette question'});
                     }

                     const existWrightAnswer = question.propositions.findIndex(p => !!p.wrightAnswer);
                     if (existWrightAnswer === -1) {
                         violations.push({position: question.position, error: 'aucune réponse correcte n\'a été indiquée'});
                     }

                     const allPropFilled = question.propositions.findIndex(p => p.label === null || p.label.trim() === '' );
                     if (allPropFilled !== -1) {
                         violations.push({position: question.position, error: 'toutes les propositions doivent être saisies'});
                     }
                 }
             );
             nextPosition = positionIterator.next();
        }

        return violations;
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
                                    this.modifDone = true;
                                    this.onSavePropositions(propositions, question.position, q.id);
                                }
                            );

                     } else {
                        const qState = questionsState[question.position];
                        question = {id: question.id, position: question.position, label: question.label, type: question.type};
                        if (qState.label !== question.label || qState.type !== question.type) {
                            this.questionStore.dispatch(UpdateQuestion({question}));
                            this.modifDone = true;
                        }
                        this.onSavePropositions(propositions, question.position, question.id, qState.propositions);
                    }
                }
                /*
                if (this.modifDone) {
                    this.toastr.success('Sauvegarde du Quiz !!');
                    this.modifDone = false;
                }
                */
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
                    this.modifDone = true;
                    this.questionStore.dispatch(UpdateProposition({questionPosition, id, proposition, index: matchingIndex}));
                }
            } else {
                this.modifDone = true;
                this.questionStore.dispatch(CreateProposition({questionId, questionPosition, proposition, index}));
                }
        }

        /* Delete unused propositions (for example: if switched from 'carre' to 'duo' */
        if (propositionState !== null) {
            const diffNbProposition = propositionState.length - propositions.length;
            if (diffNbProposition > 0) {
                this.modifDone = true;
                for (let i = propositions.length; i < propositionState.length; i++) {
                    this.questionStore.dispatch(DeleteProposition({questionPosition, propositionId: propositionState[i].id}));
                }
            }
        }
    }
}
