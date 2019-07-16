import { createAction, props, union } from '@ngrx/store';
import { Quiz } from '../../model/IQuiz';

export const LoadQuizzes = createAction(
    '[Quiz] Load Quizzes',
);

export const LoadQuizzesSuccess = createAction(
    '[Quiz] Load Quizzes Success',
    props<{quizzes: Quiz[]}>()
);

export const LoadQuiz = createAction(
    '[Quiz] Load a Quiz',
    props<{id: number}>()
);

export const LoadQuizSuccess = createAction(
    '[Quiz] Load a Quiz Success',
    props<{quiz: Quiz}>()
);

export const DeleteQuiz = createAction(
    '[Quiz] Delete a Quiz',
    props<{id: number}>()
);

export const DeleteQuizSuccess = createAction(
    '[Quiz] Delete a Quiz Success',
    props<{id: number}>()
);

export const CreateQuiz = createAction(
    '[Quiz] Create a Quiz',
    props<{quiz: Quiz}>()
);

export const CreateQuizSuccess = createAction(
    '[Quiz] Create a Quiz Success',
    props<{quiz: Quiz}>()
);

const actions = union({
  LoadQuizzes, LoadQuizzesSuccess, LoadQuiz, LoadQuizSuccess,
  CreateQuiz, CreateQuizSuccess, DeleteQuiz, DeleteQuizSuccess
});

export type ActionsUnion = typeof actions;
