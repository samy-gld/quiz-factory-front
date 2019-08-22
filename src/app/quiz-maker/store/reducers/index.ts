import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import * as fromQuiz from './quiz.reducer';
import * as fromQuestion from './question.reducer';
import { storeFreeze } from 'ngrx-store-freeze';

export interface AppState {
  quiz: fromQuiz.QuizState;
  question: fromQuestion.QuestionState;
}

export const reducers: ActionReducerMap<AppState> = {
  quiz: fromQuiz.quizReducer,
  question: fromQuestion.questionReducer
};
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];
