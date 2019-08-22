import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { DeleteQuiz, LoadQuizzes } from '../store/actions/quiz.actions';
import { QuizState, selectQuizzes, selectLoading } from '../store/reducers/quiz.reducer';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {

  quizzes$: Observable<Quiz[]> = this.store.pipe(select(selectQuizzes));
  wait: Observable<any>;

  constructor(private store: Store<QuizState>) {}

  ngOnInit() {
      this.store.dispatch(LoadQuizzes());
      this.wait = this.store.select(selectLoading);
  }

  onDelete(id: number) {
      if (confirm('Etes-vous sûr de vouloir supprimer ce quiz ?')) {
          this.store.dispatch(DeleteQuiz({id}));
      }
  }
}
