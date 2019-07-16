import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import * as fromQuiz from './quiz.reducer';
import * as fromQuestion from './question.reducer';

export interface AppState {
  quiz: fromQuiz.QuizState;
  question: fromQuestion.QuestionState;
}

export const reducers: ActionReducerMap<AppState> = {
  quiz: fromQuiz.quizReducer,
  question: fromQuestion.questionReducer
};
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
// export const metaReducers: MetaReducer<fromQuiz.QuizState>[] = !environment.production ? [] : [];
// export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
