import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {Proposition, Question, Quiz} from '../model/IQuiz';
import { environment } from '../../environments/environment';
import {select, Store} from '@ngrx/store';
import {QuestionState, selectQuestionByPosition, selectTabsForUpdate} from '../store/reducers/question.reducer';
import {CreateProposition, CreateQuestion, DeleteProposition, UpdateProposition, UpdateQuestion} from '../store/actions/question.actions';
import {skipWhile, take} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
    url = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json'
        })
    };
    modifDone = false;

  constructor(private httpClient: HttpClient,
              private questionStore: Store<QuestionState>,
              private toastr: ToastrService) {}

    validate(id: number) {
        this.httpClient.patch(this.url + '/quiz/' + id, JSON.stringify({status: 'finalized'}), this.httpOptions)
            .subscribe(
                (response) => { console.log(response); }
            );
    }

    onSaveQuestions(quizId: number) {
        this.questionStore.pipe(
            select(selectTabsForUpdate),
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
                if (this.modifDone) {
                    this.toastr.success('Sauvegarde du Quiz !!');
                    this.modifDone = false;
                }
            }
        );
    }

    onSavePropositions(propositions: Proposition[], questionPosition: number, questionId: number, propositionState: Proposition[] = null) {
        let position = 1;
        for (let index = 0; index < propositions.length; index++) {
            let proposition = propositions[index];
            proposition = {label: proposition.label, wrightAnswer: proposition.wrightAnswer, position: proposition.position};
            position++;
            if (propositionState !== null && propositionState[index] !== undefined) {
                if (propositionState[index].wrightAnswer !== proposition.wrightAnswer
                    || propositionState[index].label !== proposition.label) {
                    const id = propositionState[index].id;
                    this.modifDone = true;
                    this.questionStore.dispatch(UpdateProposition({questionPosition, id, proposition, index}));
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
