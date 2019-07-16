import { Component, OnInit } from '@angular/core';
import { QuizService } from '../services/quiz.service';
import { Observable } from 'rxjs';
import { Quiz } from '../model/IQuiz';
import { DynamicService } from '../services/dynamic.service';
import { select, Store } from '@ngrx/store';
import * as fromQuiz from '../store/reducers/quiz.reducer';
import { DeleteQuiz, LoadQuizzes } from '../store/actions/quiz.actions';
import {selectLoading} from '../store/reducers/quiz.reducer';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {

  quizzes$: Observable<Quiz[]> = this.store.pipe(select(fromQuiz.selectQuizzes));
  wait: Observable<any>;

  constructor(private dynamicService: DynamicService,
              private quizService: QuizService,
              private store: Store<fromQuiz.QuizState>) {}

  ngOnInit() {
      this.dynamicService.emitAction('Liste de vos Quiz');
      this.dynamicService.emitInfoQuiz('Seuls les Quiz \'en cours\' peuvent être modifiés');

      this.store.dispatch(LoadQuizzes());
      this.wait = this.store.select(selectLoading);
  }

  onDelete(id: number) {
      if (confirm('Etes-vous sûr de vouloir supprimer ce quiz ?')) {
          this.store.dispatch(DeleteQuiz({id}));
      }
  }
}
