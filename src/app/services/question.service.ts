import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Proposition, Question, Quiz } from '../model/IQuiz';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import {QuestionState, selectCurrentQuestionPosition} from '../store/reducers/question.reducer';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
    currentQuiz: Quiz;
    url = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json'
        })
    };

  constructor(private httpClient: HttpClient,
              private questionStore: Store<QuestionState>) {}

  getQuiz(idQuiz: number): Promise<Quiz> {
    return this.httpClient.get<Quiz>(this.url + '/quiz/' + idQuiz).toPromise();
}

  postQuestion(question): Observable<Question> {
      return this.httpClient.post<Question>(this.url + '/quiz/' + this.currentQuiz.id + '/question',
          JSON.stringify(question), this.httpOptions);
  }

    updateQuestion(question) {
        const questionIndex = question.position - 1;
        const questionId = this.currentQuiz.questions[questionIndex].id;

        this.httpClient.patch(this.url + '/question/' + questionId,
                JSON.stringify(question), this.httpOptions)
            .subscribe(
                () => { console.log('UPDATE QUESTION'); },
                (error) =>  { console.log('Erreur lors de la mise à jour de la question : ' + error); }
            );
    }

    postProposition(proposition, questionIndex: number) {
        const question = this.currentQuiz.questions[questionIndex];
        const questionId = question.id;

        this.httpClient.post(this.url + '/question/' + questionId + '/proposition',
                JSON.stringify(proposition), this.httpOptions)
            .subscribe(
          (response) => {
              this.currentQuiz.questions[questionIndex].propositions[proposition.position - 1] = response as Proposition;
              console.log('POST PROPOSITION');
          },
          (error) =>  { console.log('Erreur lors de l\'enregistrement de la proposition : ' + error); }
        );
  }

    updateProposition(proposition, questionIndex: number) {
        const propositions = this.currentQuiz.questions[questionIndex].propositions;
        const propositionId = propositions[proposition.position - 1].id;

        this.httpClient.patch(this.url + '/proposition/' + propositionId,
                JSON.stringify(proposition), this.httpOptions)
            .subscribe(
                (response) => {
                    propositions[proposition.position - 1] = response as Proposition;
                    console.log('UPDATE PROPOSITION');
                },
                (error) =>  { console.log('Erreur lors de la mise à jour de la proposition : ' + error); }
            );
    }

    deleteProposition(indexCurrentQuestion, indexTabPropositions: number) {
        const propositions = this.currentQuiz.questions[indexCurrentQuestion].propositions;

        this.httpClient.delete(this.url + '/proposition/' + propositions[indexTabPropositions].id)
            .subscribe(
                () => { console.log('Proposition supprimée'); },
                (error) =>  { console.log('Erreur lors de la suppression de la proposition : ' + error); }
            );
    }

    validate(id: number) {
        this.httpClient.patch(this.url + '/quiz/' + id, JSON.stringify({status: 'finalized'}), this.httpOptions)
            .subscribe(
                (response) => { console.log(response); }
            );
    }
}
