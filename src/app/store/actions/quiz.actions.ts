import { createAction, props, union } from '@ngrx/store';
import { Quiz } from '../../model/IQuiz';

export const LoadQuizzes = createAction(
    '[Quiz] Load Quizzes',
);

export const LoadQuizzesSuccess = createAction(
    '[Quiz] Load Quizzes Success',
    props<{quizzes: Quiz[]}>()
);

export const LoadQuizzesError = createAction(
    '[Quiz] Load Quizzes Error',
    props<{error: any}>()
);

export const DeleteQuiz = createAction(
    '[Quiz] Delete a Quiz',
    props<{id: number}>()
);

export const DeleteQuizSuccess = createAction(
    '[Quiz] Delete a Quiz Success',
    props<{id: number}>()
);

export const DeleteQuizError = createAction(
    '[Quiz] Delete Quiz Error',
    props<{error: any}>()
);

export const CreateQuiz = createAction(
    '[Quiz] Create a Quiz',
    props<{quiz: Quiz}>()
);

export const CreateQuizSuccess = createAction(
    '[Quiz] Create a Quiz Success',
    props<{quiz: Quiz}>()
);

export const CreateQuizError = createAction(
    '[Quiz] Create a Quiz Error',
    props<{error: any}>()
);

export const UpdateQuiz = createAction(
    '[Quiz] Update a Quiz',
    props<{quiz: Quiz}>()
);

export const UpdateQuizSuccess = createAction(
    '[Quiz] Update a Quiz Success',
    props<{quiz: Quiz}>()
);

export const UpdateQuizError = createAction(
    '[Quiz] Update a Quiz Error',
    props<{error: any}>()
);


export const FinalizeQuiz = createAction(
    '[Quiz] Finalize Quiz (status = finalized)',
    props<{id: number}>()
);

export const FinalizeQuizSuccess = createAction(
    '[Quiz] Finalize Quiz Success',
    props<{quiz: Quiz}>()
);

export const FinalizeQuizError = createAction(
    '[Quiz] Finalize Quiz Error',
    props<{error: any}>()
);

export const Login = createAction(
    '[Authentication] Authenticate user'
);

export const Logout = createAction(
    '[Authentication] Disconnect user'
);

const actions = union({
    LoadQuizzes, LoadQuizzesSuccess, LoadQuizzesError,
    CreateQuiz, CreateQuizSuccess, CreateQuizError,
    UpdateQuiz, UpdateQuizSuccess, UpdateQuizError,
    DeleteQuiz, DeleteQuizSuccess, DeleteQuizError,
    FinalizeQuiz, FinalizeQuizSuccess, FinalizeQuizError,
    Login, Logout
});

export type ActionsUnion = typeof actions;
