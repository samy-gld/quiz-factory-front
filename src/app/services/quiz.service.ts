import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz } from '../model/IQuiz';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

    url = environment.UrlApi;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };
    private quizzes: Quiz[] = [];

  constructor(private httpClient: HttpClient) { }

    getQuiz(idQuiz: number): Observable<Quiz> {
        return this.httpClient.get<Quiz>(this.url + '/quiz/' + idQuiz);
    }

    getQuizzes() {
        this.httpClient.get<Quiz[]>(this.url + '/quiz').subscribe(
            (response) => {
                this.quizzes = response;
            },
            (error) =>  { console.log('Erreur lors de la récupération des données : ' + error); }
        );
    }

  postQuiz(quiz): Observable<Quiz> {
    return this.httpClient.post<Quiz>(this.url + '/quiz', JSON.stringify(quiz), this.httpOptions);
  }

    updateQuiz(quiz) {
        this.httpClient.patch<Quiz>(this.url + '/quiz/' + quiz.id, JSON.stringify(quiz), this.httpOptions)
            .subscribe(
                () => {},
                (error) => {
                    console.log('Erreur lors de la mise à jour du Quiz');
                }
            );
    }

  deleteQuiz(id: number) {
    const idQuizToDelete = this.quizzes[id].id;
    this.httpClient.delete(this.url + '/quiz/' + idQuizToDelete)
            .subscribe(
              () => {
                this.quizzes.splice(id, 1);
              },
              (error) =>  { console.log('Erreur lors de l\'enregistrement : ' + error); }
            );
  }
}
